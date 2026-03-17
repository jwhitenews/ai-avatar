from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    system_prompt: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    reply: str


class AvatarRequest(BaseModel):
    text: str = Field(..., min_length=1)


class AvatarResponse(BaseModel):
    status: str
    provider: str
    data: dict
