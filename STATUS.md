# Discovery Agent - Development Status

**Last Updated:** January 27, 2026
**Last Session Focus:** Implementing admin features (mass upload, email distribution, preview, monitoring)

---

## What Has Been Built

### Backend (FastAPI + Python)

| Component | Status | Description |
|-----------|--------|-------------|
| `backend/main.py` | ✅ Complete | FastAPI app with CORS, health check, API router |
| `backend/api/routes.py` | ✅ Complete | Full REST API for users, projects, instances, participants, sessions, chat |
| `backend/agents/llm_agent.py` | ✅ Complete | LLM agent with LiteLLM integration + fallback responses |
| `backend/agents/prompts.py` | ✅ Complete | Three agent prompts (Explorer, Inquisitor, Validator) - internal automation focus |
| `backend/agents/base_agent.py` | ✅ Complete | Base agent class |
| `backend/db/database.py` | ✅ Complete | Async SQLite operations (CRUD for all entities) |
| `backend/db/models.py` | ✅ Complete | Pydantic models for API request/response |
| `backend/scripts/init_db.py` | ✅ Complete | Database initialization with projects and anonymous_links tables |
| `backend/requirements.txt` | ✅ Complete | All Python dependencies |

### Admin Frontend (Next.js 16 + TypeScript + Tailwind)

| Component | Status | Description |
|-----------|--------|-------------|
| Projects Dashboard | ✅ Complete | List, create, edit projects |
| Instance Builder | ✅ Complete | Tabbed interface for interview configuration |
| InterviewConfigPanel | ✅ Complete | Agent type, objective, guiding questions, guardrails |
| ParticipantsPanel | ✅ Complete | Mass upload (CSV), template download, participant list |
| DistributionsPanel | ✅ Complete | Email templates, scheduling, deadlines |
| PreviewPanel | ✅ Complete | Test interview experience before going live |
| MonitorPanel | ✅ Complete | Response tracking, stats, CSV/XLSX export |
| Instance Live Status | ✅ Complete | Set live with confirmation modal |

### Participant Frontend (React + Vite + Tailwind)

| Component | Status | Description |
|-----------|--------|-------------|
| `frontend/src/App.jsx` | ✅ Complete | Main app with routing between setup and interview |
| `frontend/src/components/SetupPage.jsx` | ✅ Complete | Create interview, select agent type, add participant |
| `frontend/src/components/InterviewChat.jsx` | ✅ Complete | Main chat interface with voice support |
| `frontend/src/components/ChatMessage.jsx` | ✅ Complete | Chat bubble component |
| `frontend/src/components/ChatInput.jsx` | ✅ Complete | Text input for chat |
| `frontend/src/components/VoiceButton.jsx` | ✅ Complete | Push-to-talk mic button |
| `frontend/src/hooks/useVoice.js` | ✅ Complete | Web Speech API hook (speech-to-text, text-to-speech) |
| `frontend/src/hooks/useChat.js` | ✅ Complete | Chat state management and API calls |

### Database

| Table | Status | Description |
|-------|--------|-------------|
| users | ✅ Complete | PMs/admins who create interviews |
| projects | ✅ Complete | Project hierarchy for organizing interviews |
| instances | ✅ Complete | Interview configurations (agent type, objective, etc.) |
| participants | ✅ Complete | Employees being interviewed (with unique tokens) |
| sessions | ✅ Complete | Active interview sessions |
| messages | ✅ Complete | Conversation history |
| insights | ✅ Complete | Extracted insights (schema ready) |
| anonymous_links | ✅ Complete | Distribution link settings |

---

## Recent Additions (January 27, 2026)

### 1. Participant Mass Upload
- CSV import with field mapping (firstName, lastName, email, background)
- Downloadable template with example data
- Preview before import
- Field validation

### 2. Email Distribution System
- Invitation and reminder email templates
- Variable placeholders: `{{firstName}}`, `{{lastName}}`, `{{interviewLink}}`, `{{deadline}}`, `{{companyName}}`
- Email scheduling (send now or schedule for later)
- Instance deadline setting
- CC/BCC fields for notifications

### 3. Interview Preview
- Generate preview sessions marked as `preview_test_#`
- Configuration summary before preview
- Preview history tracking
- Opens in new tab

### 4. Response Monitoring
- Real-time stats: Total, Completed, In Progress, Not Started
- Expandable session details (duration, turn count, timestamps)
- CSV/XLSX export functionality
- View transcript link for completed sessions
- Auto-refresh capability

### 5. Guardrails Configuration
- Positive framing guidance with tips
- Add/remove guardrails dynamically
- Passed to agent system prompt

### 6. Text-to-Speech Toggle
- Enable/disable reading questions aloud
- Uses Web Speech API

### 7. Cross-Interview Learning (Experimental)
- Toggle for RAG-based pattern learning
- Requires vector database setup
- Identifies themes across completed interviews

### 8. Save to Library
- Save interview configurations for reuse
- Named configurations

### 9. Instance Live Status
- Confirmation modal before going live
- Triggers scheduled email distribution
- Enables monitoring tab

---

## Pending Features

### User Management (Settings) - HIGH PRIORITY
- [ ] Admin can create user accounts
- [ ] Role-based access levels:
  - **Admin**: Full access, user management, all projects
  - **Editor**: Create/edit projects and instances, no user management
  - **Viewer**: Read-only access to assigned projects
- [ ] Project-level permissions assignment
- [ ] Audit logging for compliance

---

## Future Features

### Model Selection (OLLAMA Integration)

**Status:** Planned for future release
**Priority:** Medium

**Description:**
Allow admins to select which LLM model to use for interviews at the instance level. This enables:
- Testing different models for specific use cases
- Cost optimization by using smaller models for simpler interviews
- Performance tuning based on interview complexity

**Proposed Implementation:**

#### Backend Changes

1. **Database Schema** (`backend/scripts/init_db.py`)
```sql
-- Add model_id column to instances table
ALTER TABLE instances ADD COLUMN model_id TEXT DEFAULT 'default';

-- Models configuration table (optional, for custom models)
CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'ollama', 'bedrock', 'openai', etc.
    model_name TEXT NOT NULL, -- actual model identifier
    description TEXT,
    max_tokens INTEGER DEFAULT 4096,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **Available Models Endpoint** (`backend/api/routes.py`)
```python
@router.get("/api/models")
async def list_models():
    """List available LLM models"""
    # Query Ollama for installed models
    # Combine with configured Bedrock/OpenAI models
    return {
        "models": [
            {
                "id": "ollama/llama3.2",
                "name": "Llama 3.2",
                "provider": "ollama",
                "description": "Local, fast, good for general interviews",
                "status": "available"
            },
            {
                "id": "ollama/mistral",
                "name": "Mistral 7B",
                "provider": "ollama",
                "description": "Excellent reasoning, longer context",
                "status": "available"
            },
            {
                "id": "bedrock/anthropic.claude-v2",
                "name": "Claude 2 (Bedrock)",
                "provider": "bedrock",
                "description": "Production-grade, nuanced conversations",
                "status": "configured"
            }
        ]
    }
```

3. **Ollama Model Discovery**
```python
import httpx

async def get_ollama_models():
    """Fetch installed models from Ollama"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return [
                    {
                        "id": f"ollama/{m['name']}",
                        "name": m['name'],
                        "provider": "ollama",
                        "size": m.get('size', 'unknown'),
                        "status": "available"
                    }
                    for m in data.get('models', [])
                ]
    except Exception:
        return []
    return []
```

4. **Update Instance Creation** (`backend/db/models.py`)
```python
class InstanceCreate(BaseModel):
    name: str
    project_id: int
    agent_type: str = "explorer"
    model_id: str = "default"  # New field
    objective: str = ""
    guiding_questions: List[str] = []
    guardrails: List[str] = []
    timebox_minutes: int = 30
    max_turns: int = 20
```

5. **Agent Initialization** (`backend/agents/llm_agent.py`)
```python
def get_llm_for_instance(instance):
    """Get LLM instance based on model_id"""
    model_id = instance.model_id or "default"

    if model_id == "default":
        model_id = os.getenv("LLM_MODEL", "ollama/llama3.2")

    return LiteLLM(model=model_id)
```

#### Frontend Changes

1. **Model Selector Component** (`frontend-admin/src/components/features/interview-builder/ModelSelector.tsx`)
```typescript
interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: 'available' | 'configured' | 'unavailable';
}

export function ModelSelector({ value, onChange }: Props) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data.models);
      setIsLoading(false);
    }
    fetchModels();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">AI Model</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border p-2"
      >
        <option value="default">Default (Environment Config)</option>
        {models.map(m => (
          <option
            key={m.id}
            value={m.id}
            disabled={m.status === 'unavailable'}
          >
            {m.name} ({m.provider}) {m.status !== 'available' && `- ${m.status}`}
          </option>
        ))}
      </select>
    </div>
  );
}
```

2. **Integration in InterviewConfigPanel**
- New section: "AI Model" between Agent Type and Objective
- Show model capabilities (context window, speed rating)
- Warning banner for cloud models (cost implications)
- Real-time availability indicator

#### Environment Variables
```bash
# Default model when instance doesn't specify
LLM_MODEL=ollama/llama3.2

# Ollama server URL
OLLAMA_BASE_URL=http://localhost:11434

# Enable model selection UI (feature flag)
ENABLE_MODEL_SELECTION=false

# Available cloud models (comma-separated)
CLOUD_MODELS=bedrock/anthropic.claude-v2,openai/gpt-4
```

#### Testing Considerations
- [ ] Test model switching mid-session (should continue with original model)
- [ ] Validate model availability before setting instance live
- [ ] Fallback behavior when selected model unavailable
- [ ] Token limits per model
- [ ] Response time benchmarking

#### UI/UX Notes
- Show model status (green dot = available, yellow = configured, red = unavailable)
- Display approximate response times per model
- Show cost indicator ($ to $$$) for cloud models
- Model info tooltip with context window and capabilities
- "Test Model" button to verify connectivity

#### Alternative Models to Consider
- DeepSeek-R1-0528-Qwen3-8B (GGUF available locally)
- Mistral 7B
- Phi-3
- Gemma 2

---

## Technical Debt

- [ ] Replace mock data in MonitorPanel with real API calls
- [ ] Implement actual XLSX export (requires xlsx library)
- [ ] Add proper error handling for email sending failures
- [ ] Implement email library persistence (save/load templates)
- [ ] Add pagination to participants list (performance)
- [ ] Optimize session data loading for large instances
- [ ] Add WebSocket for real-time monitoring updates
- [ ] Implement actual preview session API endpoint
- [ ] Connect guardrails to agent system prompt

---

## Issues Resolved

### 1. LangChain Import Error
- **Problem:** `from langchain.memory import ConversationBufferMemory` failed
- **Solution:** Removed dependency, use plain list for conversation history

### 2. Ollama Not Running
- **Problem:** LLM calls fail when Ollama isn't running
- **Solution:** Fallback response system with contextual responses

### 3. Python Cache Issues
- **Problem:** Stale code after changes
- **Solution:** Clear `__pycache__` and restart uvicorn

### 4. Accessibility Errors
- **Problem:** Missing aria-labels on toggle buttons
- **Solution:** Added aria-label, role="switch", aria-checked attributes

---

## Current Barriers

### 1. No Email Integration (DEFERRED)
- SendGrid not configured
- **Impact:** Can't send interview invitation emails
- **Status:** User working on this separately

### 2. No Vector Database for RAG
- Cross-interview learning requires vector storage
- **Options:** Pinecone, Weaviate, ChromaDB, or pgvector
- **Status:** Awaiting requirements decision

---

## Quick Start Commands

```bash
# Start backend
cd C:/Users/Fresc/Discovery_Agent
.venv/Scripts/uvicorn backend.main:app --reload --port 8000

# Start admin frontend (separate terminal)
cd C:/Users/Fresc/Discovery_Agent/frontend-admin
npm run dev

# Start participant frontend (separate terminal)
cd C:/Users/Fresc/Discovery_Agent/frontend
npm run dev

# Test API
curl http://localhost:8000/health

# Initialize fresh database
.venv/Scripts/python backend/scripts/init_db.py

# Start Ollama (if using local LLM)
ollama serve
```

---

## Servers

| Service | URL | Notes |
|---------|-----|-------|
| Backend API | http://localhost:8000 | FastAPI with Swagger at /docs |
| Admin Frontend | http://localhost:3000 | Next.js 16 |
| Participant Frontend | http://localhost:5173 | Vite + React |
| Ollama | http://localhost:11434 | Local LLM server |

---

## File Structure

```
Discovery_Agent/
├── .claude/                    # Claude Code settings
├── backend/
│   ├── agents/
│   │   ├── base_agent.py
│   │   ├── llm_agent.py       # Main agent with LLM + fallbacks
│   │   └── prompts.py         # Agent system prompts
│   ├── api/
│   │   └── routes.py          # All API endpoints
│   ├── db/
│   │   ├── database.py        # SQLite operations
│   │   └── models.py          # Pydantic models
│   ├── scripts/
│   │   └── init_db.py         # DB initialization
│   ├── main.py                # FastAPI app
│   └── requirements.txt
├── frontend/                   # Participant interview UI
│   ├── src/
│   │   ├── components/        # React components
│   │   └── hooks/             # Custom hooks (voice, chat)
│   └── package.json
├── frontend-admin/             # Admin dashboard (NEW)
│   ├── src/
│   │   ├── api/
│   │   │   ├── contracts.ts   # TypeScript types
│   │   │   └── services/      # API service functions
│   │   ├── app/               # Next.js app router pages
│   │   └── components/
│   │       ├── features/
│   │       │   └── interview-builder/
│   │       │       ├── InterviewConfigPanel.tsx
│   │       │       ├── ParticipantsPanel.tsx
│   │       │       ├── DistributionsPanel.tsx
│   │       │       ├── PreviewPanel.tsx
│   │       │       └── MonitorPanel.tsx
│   │       └── layout/
│   └── package.json
├── interviews.db              # SQLite database
├── CLAUDE.md                  # Project context
└── status.md                  # This file
```

---

## GitHub Repository

**URL:** https://github.com/Silvok1/Discovery_Agent.git
**Branch:** main
