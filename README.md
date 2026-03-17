# AI Avatar Starter Repo

Starter repository for an autonomous AI chatbot with:

- **Backend:** FastAPI
- **Frontend:** Next.js 14 App Router
- **AI:** OpenAI
- **Avatar:** HeyGen stub integration
- **Memory:** Postgres + pgvector placeholders
- **Realtime:** room left for LiveKit integration

## Project Structure

```text
ai-avatar-starter-repo/
  backend/
    app/
      main.py
      config.py
      models.py
      routes/
      services/
    requirements.txt
  frontend/
    app/
    components/
    lib/
    package.json
  infra/
    docker-compose.yml
```

## What works now

- FastAPI health check
- FastAPI chat endpoint wired to OpenAI
- STT endpoint scaffold
- TTS endpoint scaffold
- HeyGen avatar endpoint scaffold
- Next.js chat UI
- Basic API client helpers
- Docker Compose for local Postgres + Redis

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\\Scripts\\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 3. Open the app

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## Environment Variables

### Backend

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_STT_MODEL`
- `OPENAI_TTS_MODEL`
- `OPENAI_TTS_VOICE`
- `HEYGEN_API_KEY`
- `HEYGEN_AVATAR_ID`
- `DATABASE_URL`
- `REDIS_URL`
- `CORS_ORIGINS`

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`

## Suggested Next Steps

- Add database persistence for sessions and messages
- Replace local file TTS output with object storage or streaming
- Add LiveKit for realtime voice sessions
- Add pgvector-backed memory retrieval
- Add auth and per-user sessions
- Add server-side logging and metrics
