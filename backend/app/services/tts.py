from pathlib import Path
from uuid import uuid4
from app.config import get_settings
from app.services.openai_client import get_openai_client


def synthesize_speech(text: str, output_dir: Path) -> Path:
    settings = get_settings()
    client = get_openai_client()

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{uuid4()}.mp3"

    with client.audio.speech.with_streaming_response.create(
        model=settings.openai_tts_model,
        voice=settings.openai_tts_voice,
        input=text,
    ) as response:
        response.stream_to_file(output_path)

    return output_path
