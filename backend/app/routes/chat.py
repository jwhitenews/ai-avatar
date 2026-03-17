from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse
from app.services.llm import generate_chat_reply

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        reply = generate_chat_reply(
            message=request.message,
            system_prompt=request.system_prompt,
        )
        return ChatResponse(session_id=request.session_id, reply=reply)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc
