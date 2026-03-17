from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes.avatar import router as avatar_router
from app.routes.chat import router as chat_router
from app.routes.health import router as health_router
from app.routes.stt import router as stt_router
from app.routes.tts import router as tts_router

settings = get_settings()
app = FastAPI(title="AI Avatar Starter API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(stt_router)
app.include_router(tts_router)
app.include_router(avatar_router)
