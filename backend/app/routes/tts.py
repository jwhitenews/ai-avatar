from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from app.services.tts import synthesize_speech

router = APIRouter(tags=["text-to-speech"])
AUDIO_DIR = Path("generated_audio")


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)


@router.post("/tts")
def tts(request: TTSRequest):
    try:
        output_path = synthesize_speech(request.text, AUDIO_DIR)
        return FileResponse(output_path, media_type="audio/mpeg", filename=output_path.name)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc
