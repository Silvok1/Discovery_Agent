# Continuous Discovery Interview Platform

## Project Overview
AI-powered interview platform for conducting structured product discovery conversations. Implements three specialized agent types based on Teresa Torres' continuous discovery framework.

## Tech Stack
- **Backend:** FastAPI, SQLite, LiteLLM, LangChain
- **Frontend:** React, Vite, Tailwind CSS, Web Speech API
- **LLM:** Local (Ollama with Llama 3.2) for dev, AWS Bedrock for production

## Project Structure
```
Discovery_Agent/
├── backend/
│   ├── agents/          # Agent implementations (Explorer, Inquisitor, Validator)
│   ├── api/             # FastAPI routes
│   ├── db/              # Database models and migrations
│   ├── scripts/         # Utility scripts (init_db.py, etc.)
│   └── main.py          # FastAPI application entry point
├── frontend/
│   └── src/
│       ├── components/  # React components
│       └── hooks/       # Custom React hooks (voice, chat, etc.)
└── interviews.db        # SQLite database (created at runtime)
```

## Agent Types
1. **Explorer** - Generative discovery to identify opportunities and pain points
2. **Inquisitor** - Assumption testing through behavioral questioning
3. **Validator** - Solution testing via task-based simulation

## Development Commands
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# Local LLM (requires Ollama)
ollama pull llama3.2:latest
ollama serve
```

## Key Patterns
- Voice-first interface with text fallback
- Conversation memory via LangChain
- Guardrails to prevent leading questions and off-topic discussion
- Structured insight extraction for synthesis

## Database
SQLite with tables: users, instances, participants, sessions, messages, insights

## Environment Variables
- `LLM_PROVIDER`: "ollama" (dev) or "bedrock" (prod)
- `OLLAMA_BASE_URL`: http://localhost:11434
- `SENDGRID_API_KEY`: For email invitations
