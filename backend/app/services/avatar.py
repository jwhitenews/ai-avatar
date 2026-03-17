import httpx
from app.config import get_settings


async def create_avatar_video(text: str) -> dict:
    settings = get_settings()

    if not settings.heygen_api_key or not settings.heygen_avatar_id:
        return {
            "message": "HeyGen is not configured yet.",
            "text": text,
            "next_step": "Set HEYGEN_API_KEY and HEYGEN_AVATAR_ID in backend/.env",
        }

    url = "https://api.heygen.com/v2/video/generate"
    headers = {
        "X-Api-Key": settings.heygen_api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "video_inputs": [
            {
                "character": {
                    "type": "avatar",
                    "avatar_id": settings.heygen_avatar_id,
                },
                "voice": {
                    "type": "text",
                    "input_text": text,
                },
            }
        ]
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
