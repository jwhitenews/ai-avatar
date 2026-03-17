from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.services.stt import transcribe_audio

router = APIRouter(tags=["speech-to-text"])
UPLOAD_DIR = Path("generated_uploads")


@router.post("/stt")
async def stt(file: UploadFile = File(...)) -> dict[str, str]:
    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        suffix = Path(file.filename or "audio.webm").suffix or ".webm"
        saved_path = UPLOAD_DIR / f"{uuid4()}{suffix}"
        content = await file.read()
        saved_path.write_bytes(content)
        transcript = transcribe_audio(saved_path)
        return {"transcript": transcript}
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc
