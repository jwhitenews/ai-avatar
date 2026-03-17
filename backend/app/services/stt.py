from pathlib import Path
from app.config import get_settings
from app.services.openai_client import get_openai_client


def transcribe_audio(file_path: Path) -> str:
    settings = get_settings()
    client = get_openai_client()

    with file_path.open("rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model=settings.openai_stt_model,
            file=audio_file,
        )

    return transcript.text
