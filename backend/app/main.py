from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import tempfile

load_dotenv()

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

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
def chat(req: ChatRequest):
    response = client.responses.create(
        model="gpt-4.1",
        input=req.message
    )
    return {"reply": response.output_text}

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