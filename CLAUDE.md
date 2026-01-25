# Continuous Discovery Interview Platform

## Project Overview
AI-powered interview platform for conducting structured discovery conversations with **internal employees** to identify workflow automation opportunities. Implements three specialized agent types based on Teresa Torres' continuous discovery framework, adapted for internal process improvement.

## Key Context
- **Target users**: Internal employees (colleagues, not external customers)
- **Goal**: Identify repetitive tasks, manual processes, and automation opportunities
- **Focus**: Workflow discovery, process improvement, reducing manual work

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
│   ├── db/              # Database models and utilities
│   ├── scripts/         # Utility scripts (init_db.py, etc.)
│   └── main.py          # FastAPI application entry point
├── frontend/
│   └── src/
│       ├── components/  # React components
│       └── hooks/       # Custom React hooks (voice, chat, etc.)
└── interviews.db        # SQLite database (created at runtime)
```

## Agent Types (Internal Automation Focus)

1. **Explorer** - Generative discovery to uncover repetitive tasks, manual processes, and workflow pain points
2. **Inquisitor** - Assumption testing to validate whether a proposed automation would actually help
3. **Validator** - Solution testing to walk through how an automation would fit into real workflows

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
- Fallback responses when LLM unavailable
- Guardrails to keep conversations on-topic
- Focus on concrete examples and step-by-step workflow walkthroughs

## Database
SQLite with tables: users, instances, participants, sessions, messages, insights

## Environment Variables
- `LLM_MODEL`: ollama/llama3.2 (dev) or bedrock/anthropic.claude-v2 (prod)
- `OLLAMA_BASE_URL`: http://localhost:11434
- `USE_MOCK_LLM`: true/false - use fallback responses instead of LLM
- `SENDGRID_API_KEY`: For email invitations (optional)
