from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import tempfile

from app.db import SessionLocal, engine, Base
from app.models import Message

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set")

client = OpenAI(api_key=api_key)

class ChatRequest(BaseModel):
    session_id: str
    message: str

class TTSRequest(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/history/{session_id}")
def get_history(session_id: str):
    db = SessionLocal()
    try:
        messages = (
            db.query(Message)
            .filter(Message.session_id == session_id)
            .order_by(Message.id.asc())
            .all()
        )
        return {
            "messages": [
                {"role": m.role, "content": m.content}
                for m in messages
            ]
        }
    finally:
        db.close()

@app.post("/chat")
def chat(req: ChatRequest):
    db = SessionLocal()

    try:
        user_message = Message(
            session_id=req.session_id,
            role="user",
            content=req.message,
        )
        db.add(user_message)
        db.commit()

        recent_messages = (
            db.query(Message)
            .filter(Message.session_id == req.session_id)
            .order_by(Message.id.asc())
            .all()
        )

        model_input = [
            {
                "role": "system",
                "content": "You are a helpful voice-enabled AI assistant."
            }
        ]

        for msg in recent_messages[-10:]:
            model_input.append({
                "role": msg.role,
                "content": msg.content
            })

        response = client.responses.create(
            model="gpt-4.1",
            input=model_input
        )

        reply = response.output_text

        assistant_message = Message(
            session_id=req.session_id,
            role="assistant",
            content=reply,
        )
        db.add(assistant_message)
        db.commit()

        return {"reply": reply}
    finally:
        db.close()

@app.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=audio_file,
            )
        return {"transcript": transcript.text}
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

@app.post("/tts")
def text_to_speech(req: TTSRequest):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp_path = tmp.name

    try:
        with client.audio.speech.with_streaming_response.create(
            model="gpt-4o-mini-tts",
            voice="alloy",
            input=req.text,
        ) as response:
            response.stream_to_file(tmp_path)

        return FileResponse(
            tmp_path,
            media_type="audio/mpeg",
            filename="reply.mp3",
        )
    except Exception:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
        raise