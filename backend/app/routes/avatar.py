from fastapi import APIRouter, HTTPException
from app.models import AvatarRequest, AvatarResponse
from app.services.avatar import create_avatar_video

router = APIRouter(tags=["avatar"])


@router.post("/avatar", response_model=AvatarResponse)
async def avatar(request: AvatarRequest) -> AvatarResponse:
    try:
        data = await create_avatar_video(request.text)
        return AvatarResponse(status="ok", provider="heygen", data=data)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc
