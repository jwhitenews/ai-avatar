from app.config import get_settings
from app.services.openai_client import get_openai_client


def generate_chat_reply(message: str, system_prompt: str | None = None) -> str:
    settings = get_settings()
    client = get_openai_client()

    system_message = system_prompt or (
        "You are a helpful AI assistant for a voice-and-avatar chatbot product. "
        "Be concise, clear, and friendly."
    )

    response = client.responses.create(
        model=settings.openai_model,
        input=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": message},
        ],
    )

    if getattr(response, "output_text", None):
        return response.output_text

    return "I generated a response, but the text output was empty."
