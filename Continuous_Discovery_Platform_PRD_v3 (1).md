# Continuous Discovery Interview Platform
## Product Requirements Document v3.0
**Internal Research Tool for [Company Name]**

---

## Executive Summary

An internal AI-powered interview platform for conducting structured product discovery conversations. Built for weekend deployment on personal hardware, then transferred to work environment. Implements three specialized agent types (Explorer, Inquisitor, Validator) based on Teresa Torres' continuous discovery framework.

**Target User:** Your boss and product team  
**Deployment:** Local development → transfer to work laptop  
**Primary Interface:** Voice-first (with text fallback)  
**Timeline:** Weekend project  

---

## Product Vision & Philosophy

Enable the product team to conduct continuous discovery interviews without scheduling overhead. By automating interview execution with AI agents, PMs can focus on synthesis and decision-making rather than logistics.

### Continuous Discovery Principles

- **Weekly touchpoints:** Consistent customer engagement without calendar overhead
- **Structured discovery:** Each agent type targets a specific stage of the opportunity-solution tree
- **Natural conversation:** Voice-first interface maintains interview quality
- **Evidence over opinion:** Focus on specific past behaviors and concrete examples

---

## Core Framework: The Three Agent Types

The platform's intelligence is structured around three specialized agents, each designed for a specific discovery conversation type.

### Agent 1: The Explorer (Generative Discovery)

**Torres Goal:** Identify Opportunities - Populate the Opportunity Solution Tree with customer pains

**Core Logic:** Open-ended probing that redirects generalizations into specific past stories

**Use Cases:**
- Initial opportunity discovery interviews
- Understanding pain points in a workflow or domain
- Exploring unmet needs and frustrations

**Conversational Pattern:**
- Ask broad, open-ended questions about experiences
- When user generalizes ("I always...", "usually..."), redirect: "Tell me about the last time that happened"
- Probe for emotions, context, and consequences
- Follow interesting threads with "Tell me more about..."

**Example Questions:**
- "Walk me through the last time you tried to [complete task X]"
- "What happened when you encountered [obstacle]?"
- "How did that make you feel?" / "What did you do next?"

**Key Guardrails:** Avoid leading questions, don't suggest solutions, focus on past behavior not hypotheticals, redirect away from opinions to stories

---

### Agent 2: The Inquisitor (Assumption Testing)

**Torres Goal:** De-risk the Roadmap - Validate 'leap of faith' assumptions before building

**Core Logic:** Hypothesis testing through behavioral questioning ("If X were true, would Y happen?") - focuses on behavior, not opinion

**Use Cases:**
- Testing whether users actually have the problem you think they have
- Validating whether a proposed solution addresses real needs
- Checking if users would actually adopt/pay for a solution

**Conversational Pattern:**
- Present the assumption as a hypothesis to test
- Ask about past behaviors that would validate/invalidate the assumption
- Look for disconfirming evidence: "Have you ever NOT done [expected behavior]?"
- Quantify when possible: frequency, recency, intensity

**Example Questions:**
- "If you had a tool that [solved problem X], what would you use it for first?"
- "Have you tried to solve this problem before? What did you try?"
- "When was the last time you encountered this issue?"

**Key Guardrails:** Don't ask "would you use this?" (unreliable), instead ask about current workarounds and past attempts, distinguish between stated preferences and revealed preferences

---

### Agent 3: The Validator (Solution Testing)

**Torres Goal:** Test Solutions - Ensure the feature actually solves the opportunity identified

**Core Logic:** Task-based simulation - Ask the user to walk through solving a specific past pain point using your proposed solution

**Use Cases:**
- Prototype testing without building the feature
- Concept validation for new features
- Usability evaluation through scenario walkthroughs

**Conversational Pattern:**
- Anchor on a specific past pain point the user experienced
- Describe the proposed solution in concrete terms
- Ask user to mentally walk through using the solution for that scenario
- Probe for gaps, confusion, missing functionality

**Example Questions:**
- "You mentioned last time you struggled with [X]. Imagine you had [proposed solution]. Walk me through how you'd use it."
- "What would you do first?"
- "What information would you need at this step?"
- "Where would you expect to find [feature Y]?"

**Key Guardrails:** Keep scenarios concrete and grounded in real past experiences, watch for user confusion or hesitation, don't explain away problems, note when user expects different behavior than designed

---

## Agent Framework Comparison

| Agent Type | The "Logic" (Anthropic Framework) | The "Torres" Goal |
|------------|-----------------------------------|-------------------|
| **The Explorer** (Generative) | **Open-ended probing.** Redirects generalizations into specific past stories. | **Identify Opportunities.** Populates the Opportunity Solution Tree (OST) with "pains." |
| **The Inquisitor** (Assumption) | **Hypothesis testing.** Asks "If X was true, would Y happen?" Focuses on behavior, not opinion. | **De-risk the Roadmap.** Validates if your "leap of faith" assumptions are actually true. |
| **The Validator** (Evaluation) | **Task-based simulation.** Asks the user to walk through a solution to solve a specific past pain point. | **Test Solutions.** Ensures the feature you built actually solves the opportunity identified. |

---

## Technical Architecture

### Technology Stack

**Backend:**
- **FastAPI** - Python web framework with auto-generated docs
- **SQLite** - Built into Python, single-file database (interviews.db)
- **LiteLLM** - Unified interface for local and cloud LLMs
- **LangChain** - Conversation chains, memory management, prompt templates

**Frontend:**
- **React** - Component-based UI
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast dev server
- **Web Speech API** - Browser-native voice input/output

**LLM Strategy:**
- **Local (Development):** Run on your RTX 3060 (12GB VRAM) using Ollama or LocalAI
- **Production (Work):** Company's AWS Bedrock endpoint via LiteLLM

**Email:**
- **SendGrid** - Transactional email for interview invites

**Deployment:**
- **Development:** Run locally on your laptop
- **Transfer:** Zip folder → work computer (SQLite database included)
- **Production:** Simple Python server, no Docker needed initially

---

## Agent Implementation Architecture

### Core Components per Agent

Each agent is implemented as a LangChain conversation chain with:

1. **System Prompt Template** - Defines agent personality, conversational rules, objectives
2. **Context Variables** - Participant background, research objectives, questions to cover
3. **Memory Buffer** - Maintains conversation history, tracks question coverage
4. **Guardrail Evaluator** - Monitors for prohibited topics, leading questions, off-script behavior
5. **Structured Output Parser** - Extracts themes, pain points, quotes for synthesis

### LLM Configuration with LiteLLM

```python
# Development (Local Models)
from litellm import completion

response = completion(
    model="ollama/llama3.2",  # or mistral, deepseek-coder
    messages=[{"role": "system", "content": agent_prompt},
              {"role": "user", "content": user_message}],
    api_base="http://localhost:11434"
)

# Production (Work AWS Endpoint)
response = completion(
    model="bedrock/anthropic.claude-v2",
    messages=[...],
    api_base="https://your-company-aws-endpoint.com",
    api_key="YOUR_AWS_API_KEY"
)
```

**Local Model Recommendations (RTX 3060 12GB):**
- **Llama 3.2 8B** - Good general conversational ability
- **Mistral 7B** - Strong instruction following
- **Deepseek-Coder 6.7B** - If you need technical interviews
- **Phi-3 Medium** - Fast, efficient for structured conversations

---

## Voice Interface Architecture

### Web Speech API Implementation

**Voice Input (Speech-to-Text):**
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  sendMessageToAgent(transcript);
};
```

**Voice Output (Text-to-Speech):**
```javascript
const utterance = new SpeechSynthesisUtterance(agentResponse);
utterance.rate = 1.0;
utterance.pitch = 1.0;
speechSynthesis.speak(utterance);
```

**Interface Features:**
- Push-to-talk button for voice input
- Auto-play agent responses
- Text fallback for typing if preferred
- Visual indicators for recording/processing/speaking states

---

## Database Schema (SQLite)

```sql
-- Users (PMs at your company)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Instances
CREATE TABLE instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    agent_type TEXT CHECK(agent_type IN ('explorer', 'inquisitor', 'validator')),
    objective TEXT,
    questions JSON,
    timebox_minutes INTEGER DEFAULT 30,
    max_turns INTEGER DEFAULT 20,
    status TEXT CHECK(status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Participants
CREATE TABLE participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id INTEGER,
    email TEXT NOT NULL,
    name TEXT,
    background TEXT,
    unique_token TEXT UNIQUE NOT NULL,
    status TEXT CHECK(status IN ('invited', 'started', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Interview Sessions
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    turn_count INTEGER DEFAULT 0,
    metadata JSON,
    FOREIGN KEY (participant_id) REFERENCES participants(id)
);

-- Conversation Messages
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    role TEXT CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    audio_input BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Extracted Insights (for synthesis)
CREATE TABLE insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    insight_type TEXT,  -- 'pain_point', 'quote', 'assumption_result', 'usability_issue'
    content TEXT,
    confidence REAL,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

---

## Build Plan: Step-by-Step Implementation

### Step 1: Foundation Setup (2-3 hours)

**Database Setup:**
```bash
# Create SQLite database with schema
python scripts/init_db.py
```

**FastAPI Backend Skeleton:**
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**React Frontend Skeleton:**
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Test:** Backend running on :8000, frontend on :5173, can communicate

---

### Step 2: Local LLM Setup (1-2 hours)

**Install Ollama:**
```bash
# Download from ollama.ai
curl https://ollama.ai/install.sh | sh

# Pull a model for testing
ollama pull llama3.2:latest
```

**Test LiteLLM Integration:**
```python
# test_llm.py
from litellm import completion

response = completion(
    model="ollama/llama3.2",
    messages=[
        {"role": "system", "content": "You are a helpful interviewer."},
        {"role": "user", "content": "Hello!"}
    ],
    api_base="http://localhost:11434"
)

print(response.choices[0].message.content)
```

**Test:** Local LLM responds to prompts

---

### Step 3: Agent System Prompts & LangChain Setup (3-4 hours)

**Create Agent Prompt Templates:**
```python
# agents/prompts.py

EXPLORER_PROMPT = """You are conducting a discovery interview to understand user pain points.

Your goal is to collect specific, concrete stories about past experiences.

Key rules:
1. When the user makes a generalization ("I usually...", "We always..."), immediately redirect:
   "Tell me about the last time that happened."
2. Ask follow-up questions about emotions, context, what they tried, what went wrong.
3. Never suggest solutions or lead the user toward a particular answer.
4. Focus on past behavior, not hypotheticals.
5. Probe for specific details: who, what, when, where, why, how.

Current participant background: {participant_background}
Research objective: {objective}
Questions to cover: {questions}

Stay conversational and natural. You're having a conversation, not interrogating.
"""

INQUISITOR_PROMPT = """You are testing a specific assumption about user behavior.

Hypothesis to test: {assumption}

Your goal is to find evidence that validates OR invalidates this assumption.

Key rules:
1. Ask about specific past behaviors that would validate/invalidate the assumption.
2. Look for disconfirming evidence. Ask: "Have you ever NOT done [expected behavior]?"
3. When user says "I would do X", redirect to "Have you ever done X before? When?"
4. Focus on revealed preferences (what they actually did) not stated intentions (what they say they'd do).
5. Quantify when possible: frequency, recency, intensity.

Don't ask "would you use this?" - it's unreliable. Ask about current workarounds and past attempts.

Current participant background: {participant_background}
"""

VALIDATOR_PROMPT = """You are testing a proposed solution with a user.

Solution being tested: {solution_description}

Your goal is to walk the user through using this solution to solve a past pain point.

Key rules:
1. Anchor on a specific past pain point the user described: {past_pain_point}
2. Describe the solution in concrete terms.
3. Ask the user to walk through how they would use it step-by-step.
4. Probe for confusion, hesitation, missing functionality.
5. Note when user expects different behavior than designed.

Questions to ask:
- "What would you do first?"
- "What information would you need at this step?"
- "Where would you expect to find [feature]?"

Keep scenarios concrete and grounded in real past experiences.
Don't explain away problems - note them for the PM.
"""
```

**Build Agent Classes:**
```python
# agents/base_agent.py
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import Ollama

class BaseAgent:
    def __init__(self, agent_type: str, context: dict):
        self.agent_type = agent_type
        self.context = context
        self.memory = ConversationBufferMemory()
        
        # LLM setup (local for dev)
        self.llm = Ollama(
            model="llama3.2",
            base_url="http://localhost:11434"
        )
        
        # Get appropriate prompt
        self.system_prompt = self._get_system_prompt()
        
    def _get_system_prompt(self):
        if self.agent_type == "explorer":
            return EXPLORER_PROMPT.format(**self.context)
        elif self.agent_type == "inquisitor":
            return INQUISITOR_PROMPT.format(**self.context)
        elif self.agent_type == "validator":
            return VALIDATOR_PROMPT.format(**self.context)
    
    def chat(self, user_message: str) -> str:
        # Add guardrails here
        if self._check_guardrails(user_message):
            return self._generate_response(user_message)
        else:
            return "I can't discuss that topic. Let's move on."
    
    def _check_guardrails(self, message: str) -> bool:
        # Implement guardrail logic
        # Check for prohibited topics, session time limits, turn counts
        return True
    
    def _generate_response(self, user_message: str) -> str:
        # Use LangChain to generate response
        chain = ConversationChain(
            llm=self.llm,
            memory=self.memory,
            verbose=True
        )
        
        # Inject system prompt into first message if needed
        response = chain.predict(input=user_message)
        return response
```

**Test:** Each agent type can hold a conversation

---

### Step 4: Interview Instance Builder (2-3 hours)

**Backend API Endpoints:**
```python
# routers/instances.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sqlite3

router = APIRouter()

class CreateInstanceRequest(BaseModel):
    name: str
    agent_type: str
    objective: str
    questions: List[str]
    timebox_minutes: int = 30

@router.post("/instances")
def create_instance(req: CreateInstanceRequest):
    conn = sqlite3.connect('interviews.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO instances (name, agent_type, objective, questions, timebox_minutes, status)
        VALUES (?, ?, ?, ?, ?, 'draft')
    """, (req.name, req.agent_type, req.objective, json.dumps(req.questions), req.timebox_minutes))
    
    instance_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"instance_id": instance_id}

@router.get("/instances")
def list_instances():
    conn = sqlite3.connect('interviews.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM instances")
    instances = cursor.fetchall()
    conn.close()
    return {"instances": instances}
```

**Frontend Form Component:**
```jsx
// components/CreateInstance.jsx
import { useState } from 'react';

function CreateInstance() {
  const [formData, setFormData] = useState({
    name: '',
    agent_type: 'explorer',
    objective: '',
    questions: [''],
    timebox_minutes: 30
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    console.log('Created instance:', data.instance_id);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create Interview Instance</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Interview Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Agent Type</label>
        <select
          value={formData.agent_type}
          onChange={(e) => setFormData({...formData, agent_type: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="explorer">Explorer (Opportunity Discovery)</option>
          <option value="inquisitor">Inquisitor (Assumption Testing)</option>
          <option value="validator">Validator (Solution Testing)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Research Objective</label>
        <textarea
          value={formData.objective}
          onChange={(e) => setFormData({...formData, objective: e.target.value})}
          className="w-full px-3 py-2 border rounded"
          rows="3"
        />
      </div>

      {/* Add questions dynamically */}
      
      <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded">
        Create Instance
      </button>
    </form>
  );
}
```

**Test:** Can create interview instance via UI

---

### Step 5: Participant Management & CSV Upload (2 hours)

**CSV Upload Endpoint:**
```python
# routers/participants.py
import csv
import secrets
from fastapi import APIRouter, File, UploadFile

router = APIRouter()

@router.post("/instances/{instance_id}/participants/upload")
async def upload_participants(instance_id: int, file: UploadFile = File(...)):
    content = await file.read()
    csv_reader = csv.DictReader(content.decode().splitlines())
    
    conn = sqlite3.connect('interviews.db')
    cursor = conn.cursor()
    
    participants = []
    for row in csv_reader:
        token = secrets.token_urlsafe(32)
        cursor.execute("""
            INSERT INTO participants (instance_id, email, name, background, unique_token, status)
            VALUES (?, ?, ?, ?, ?, 'invited')
        """, (instance_id, row['email'], row['name'], row.get('background', ''), token))
        
        participants.append({
            'email': row['email'],
            'name': row['name'],
            'link': f"http://localhost:5173/interview/{token}"
        })
    
    conn.commit()
    conn.close()
    
    return {"participants": participants}
```

**Frontend Upload Component:**
```jsx
function ParticipantUpload({ instanceId }) {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `http://localhost:8000/instances/${instanceId}/participants/upload`,
      { method: 'POST', body: formData }
    );
    
    const data = await response.json();
    console.log('Uploaded participants:', data.participants);
  };

  return (
    <div>
      <h3>Upload Participants (CSV)</h3>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <p className="text-sm text-gray-600 mt-2">
        CSV format: email, name, background (optional)
      </p>
    </div>
  );
}
```

**Test:** Upload CSV, participants created with unique tokens

---

### Step 6: Voice-Enabled Interview Interface (4-5 hours)

**Interview Page with Voice:**
```jsx
// pages/Interview.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

function Interview() {
  const { token } = useParams();
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsRecording(false);
      };
    }

    // Initialize speech synthesis
    synthesisRef.current = window.speechSynthesis;
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const handleSendMessage = async (messageText) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);

    // Send to backend
    const response = await fetch(`http://localhost:8000/interview/${token}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText })
    });

    const data = await response.json();
    
    // Add agent response
    setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    
    // Speak the response
    speakResponse(data.response);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Interview Session</h2>
        
        {/* Message History */}
        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded ${
                msg.role === 'user' 
                  ? 'bg-blue-100 ml-12' 
                  : 'bg-gray-100 mr-12'
              }`}
            >
              <p className="font-semibold mb-1">
                {msg.role === 'user' ? 'You' : 'Interviewer'}
              </p>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input Controls */}
        <div className="flex gap-4">
          {/* Voice Button */}
          <button
            onClick={startRecording}
            disabled={isRecording || isSpeaking}
            className={`px-6 py-3 rounded font-semibold ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isRecording ? '🎤 Recording...' : '🎤 Push to Talk'}
          </button>

          {/* Text Input (fallback) */}
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(textInput);
                setTextInput('');
              }
            }}
            placeholder="Or type your response..."
            className="flex-1 px-4 py-3 border rounded"
            disabled={isSpeaking}
          />
        </div>

        {/* Status Indicators */}
        <div className="mt-4 flex gap-4 text-sm">
          {isSpeaking && (
            <span className="text-blue-600">🔊 Agent is speaking...</span>
          )}
          {isRecording && (
            <span className="text-red-600">⏺️ Listening...</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Backend Interview Endpoint:**
```python
# routers/interview.py
from agents.base_agent import BaseAgent

@router.post("/interview/{token}/message")
async def process_message(token: str, request: dict):
    message = request.get('message')
    
    # Get participant and instance info
    conn = sqlite3.connect('interviews.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT p.id, p.background, i.agent_type, i.objective, i.questions
        FROM participants p
        JOIN instances i ON p.instance_id = i.id
        WHERE p.unique_token = ?
    """, (token,))
    
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    participant_id, background, agent_type, objective, questions = result
    
    # Get or create session
    cursor.execute("""
        SELECT id FROM sessions 
        WHERE participant_id = ? AND completed_at IS NULL
    """, (participant_id,))
    
    session = cursor.fetchone()
    if not session:
        cursor.execute("""
            INSERT INTO sessions (participant_id) VALUES (?)
        """, (participant_id,))
        session_id = cursor.lastrowid
    else:
        session_id = session[0]
    
    # Save user message
    cursor.execute("""
        INSERT INTO messages (session_id, role, content, audio_input)
        VALUES (?, 'user', ?, TRUE)
    """, (session_id, message))
    
    conn.commit()
    
    # Generate agent response
    agent = BaseAgent(
        agent_type=agent_type,
        context={
            'participant_background': background,
            'objective': objective,
            'questions': json.loads(questions)
        }
    )
    
    response = agent.chat(message)
    
    # Save agent response
    cursor.execute("""
        INSERT INTO messages (session_id, role, content)
        VALUES (?, 'assistant', ?)
    """, (session_id, response))
    
    # Update session turn count
    cursor.execute("""
        UPDATE sessions SET turn_count = turn_count + 1
        WHERE id = ?
    """, (session_id,))
    
    conn.commit()
    conn.close()
    
    return {"response": response}
```

**Test:** Voice recording works, agent responds, text fallback works

---

### Step 7: Email Integration (1-2 hours)

**SendGrid Setup:**
```python
# utils/email.py
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_interview_invite(participant_email: str, participant_name: str, interview_link: str):
    message = Mail(
        from_email=os.environ.get('SENDGRID_FROM_EMAIL'),
        to_emails=participant_email,
        subject='Your Interview Invitation',
        html_content=f"""
        <p>Hi {participant_name},</p>
        
        <p>We'd love to hear your thoughts in a brief research interview.</p>
        
        <p>This will take about 15 minutes. You'll have a conversation with an AI interviewer.</p>
        
        <p><a href="{interview_link}">Click here to start your interview</a></p>
        
        <p>Thanks!<br>The Product Team</p>
        """
    )
    
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        print(f"Error sending email: {e}")
        return None
```

**Bulk Send Endpoint:**
```python
@router.post("/instances/{instance_id}/send-invites")
def send_invites(instance_id: int):
    conn = sqlite3.connect('interviews.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT email, name, unique_token FROM participants
        WHERE instance_id = ? AND status = 'invited'
    """, (instance_id,))
    
    participants = cursor.fetchall()
    
    sent_count = 0
    for email, name, token in participants:
        link = f"http://your-domain.com/interview/{token}"
        status = send_interview_invite(email, name, link)
        if status == 202:
            sent_count += 1
    
    conn.close()
    
    return {"sent": sent_count, "total": len(participants)}
```

**Test:** Emails send successfully with working links

---

### Step 8: Transcript Export (2 hours)

**PDF Generation:**
```python
# utils/export.py
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def export_transcript_pdf(session_id: int, output_path: str):
    conn = sqlite3.connect('interviews.db')
    cursor = conn.cursor()
    
    # Get session info
    cursor.execute("""
        SELECT p.name, p.email, i.name, i.agent_type, s.started_at
        FROM sessions s
        JOIN participants p ON s.participant_id = p.id
        JOIN instances i ON p.instance_id = i.id
        WHERE s.id = ?
    """, (session_id,))
    
    participant_name, email, instance_name, agent_type, started_at = cursor.fetchone()
    
    # Get messages
    cursor.execute("""
        SELECT role, content, timestamp FROM messages
        WHERE session_id = ?
        ORDER BY timestamp
    """, (session_id,))
    
    messages = cursor.fetchall()
    conn.close()
    
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Header
    story.append(Paragraph(f"<b>Interview Transcript</b>", styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Instance: {instance_name}", styles['Normal']))
    story.append(Paragraph(f"Agent Type: {agent_type.title()}", styles['Normal']))
    story.append(Paragraph(f"Participant: {participant_name} ({email})", styles['Normal']))
    story.append(Paragraph(f"Date: {started_at}", styles['Normal']))
    story.append(Spacer(1, 24))
    
    # Messages
    for role, content, timestamp in messages:
        speaker = "Participant" if role == "user" else "Interviewer"
        story.append(Paragraph(f"<b>{speaker}:</b> {content}", styles['Normal']))
        story.append(Spacer(1, 12))
    
    doc.build(story)
    return output_path

@router.get("/sessions/{session_id}/export/pdf")
def export_session_pdf(session_id: int):
    output_path = f"/tmp/transcript_{session_id}.pdf"
    export_transcript_pdf(session_id, output_path)
    return FileResponse(output_path, filename=f"transcript_{session_id}.pdf")
```

**Test:** Can download PDF transcript of completed interview

---

### Step 9: Dashboard & Monitoring (2 hours)

**Completion Status Dashboard:**
```jsx
// components/Dashboard.jsx
function Dashboard({ instanceId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/instances/${instanceId}/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [instanceId]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-blue-100 p-4 rounded">
        <h3 className="text-lg font-semibold">Invited</h3>
        <p className="text-3xl">{stats.invited}</p>
      </div>
      <div className="bg-yellow-100 p-4 rounded">
        <h3 className="text-lg font-semibold">Started</h3>
        <p className="text-3xl">{stats.started}</p>
      </div>
      <div className="bg-green-100 p-4 rounded">
        <h3 className="text-lg font-semibold">Completed</h3>
        <p className="text-3xl">{stats.completed}</p>
      </div>
      <div className="bg-red-100 p-4 rounded">
        <h3 className="text-lg font-semibold">Abandoned</h3>
        <p className="text-3xl">{stats.abandoned}</p>
      </div>

      {/* List of participants with status */}
      <div className="col-span-4 mt-6">
        <h3 className="text-xl font-bold mb-4">Participants</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.participants.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.email}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    p.status === 'completed' ? 'bg-green-200' :
                    p.status === 'started' ? 'bg-yellow-200' :
                    'bg-gray-200'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-2">
                  {p.status === 'completed' && (
                    <a href={`/export/${p.session_id}`} className="text-blue-600">
                      Download Transcript
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Stats Endpoint:**
```python
@router.get("/instances/{instance_id}/stats")
def get_instance_stats(instance_id: int):
    conn = sqlite3.connect('interviews.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT status, COUNT(*) FROM participants
        WHERE instance_id = ?
        GROUP BY status
    """, (instance_id,))
    
    status_counts = dict(cursor.fetchall())
    
    cursor.execute("""
        SELECT p.id, p.name, p.email, p.status, s.id as session_id
        FROM participants p
        LEFT JOIN sessions s ON p.id = s.participant_id
        WHERE p.instance_id = ?
    """, (instance_id,))
    
    participants = cursor.fetchall()
    conn.close()
    
    return {
        "invited": status_counts.get('invited', 0),
        "started": status_counts.get('started', 0),
        "completed": status_counts.get('completed', 0),
        "abandoned": status_counts.get('abandoned', 0),
        "participants": [
            {
                "id": p[0],
                "name": p[1],
                "email": p[2],
                "status": p[3],
                "session_id": p[4]
            } for p in participants
        ]
    }
```

**Test:** Dashboard shows real-time completion status

---

## Transfer to Work Computer

### Step 1: Package Everything

```bash
# On your personal laptop
cd interview-platform

# Stop any running servers
# Zip the entire project
zip -r interview-platform.zip . -x "node_modules/*" -x "__pycache__/*" -x "*.pyc"

# The interviews.db file is included automatically
```

### Step 2: Setup on Work Computer

```bash
# On work computer
unzip interview-platform.zip
cd interview-platform

# Backend setup
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install

# Update LiteLLM config to use company AWS endpoint
# Edit backend/config.py or .env file
```

### Step 3: Switch to Company LLM

```python
# config.py (work environment)
import os

LLM_CONFIG = {
    "model": "bedrock/anthropic.claude-v2",
    "api_base": os.environ.get("COMPANY_AWS_ENDPOINT"),
    "api_key": os.environ.get("COMPANY_AWS_API_KEY")
}

# agents/base_agent.py - update LLM initialization
from litellm import completion

class BaseAgent:
    def __init__(self, agent_type: str, context: dict):
        self.agent_type = agent_type
        self.context = context
        self.config = LLM_CONFIG  # Use company config
        
    def _generate_response(self, user_message: str) -> str:
        response = completion(
            model=self.config["model"],
            api_base=self.config["api_base"],
            api_key=self.config["api_key"],
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_message}
            ]
        )
        return response.choices[0].message.content
```

**Test:** Backend connects to company AWS, interviews work

---

## Authentication Strategy

### For MVP (Personal Computer)

**Simple hardcoded auth:**
```python
# No real auth needed for local testing
# Just hardcode your email in config
ADMIN_EMAIL = "your.email@company.com"

@app.get("/auth/current-user")
def get_current_user():
    return {"email": ADMIN_EMAIL, "name": "You"}
```

### For Work Environment (Future)

**Option 1: Skip Auth Initially**
- Run on internal network only
- Everyone with access is trusted
- Add auth later if needed

**Option 2: OKTA Integration (When Required)**
```python
# This is complex - only add if boss requires it
# Use okta-jwt-verifier library
from okta_jwt_verifier import JWTVerifier

okta_verifier = JWTVerifier(
    issuer=os.environ.get('OKTA_ISSUER'),
    client_id=os.environ.get('OKTA_CLIENT_ID'),
    audience='api://default'
)

@app.get("/protected")
async def protected_route(token: str = Depends(oauth2_scheme)):
    await okta_verifier.verify_access_token(token)
    return {"message": "Authenticated!"}
```

**Recommendation:** Skip OKTA for MVP. Add it later if security team requires it.

---

## What We're NOT Building (Scope Cuts)

To ship this weekend, explicitly cut:

- ❌ **Advanced RBAC** - Everyone is admin
- ❌ **Question Library** - Copy/paste questions directly
- ❌ **OST Integration** - Tag manually in spreadsheet after
- ❌ **AI Synthesis** - PM reads transcripts themselves
- ❌ **Email Scheduling** - Send all invites at once
- ❌ **Reminder Emails** - One invite only
- ❌ **Multi-tenancy** - Single instance for your company
- ❌ **Advanced Analytics** - Basic completion stats only
- ❌ **OKTA Integration** - Skip auth initially

Add these later based on boss's feedback.

---

## Ship Criteria

The platform is "done" when:

1. ✅ You can create an interview instance in < 2 minutes
2. ✅ Participants receive email with working voice interview link
3. ✅ All three agent types conduct coherent 10-15 minute interviews
4. ✅ Voice input/output works, text fallback available
5. ✅ You can see completion dashboard
6. ✅ You can download PDF transcripts
7. ✅ The system handles 5-10 concurrent interviews without crashing
8. ✅ Database transfers cleanly between laptops

---

## Agent Architecture Deep Dive

### Agent State Management

Each agent maintains:
```python
class AgentState:
    turn_count: int = 0
    time_elapsed: float = 0.0
    questions_covered: List[str] = []
    current_topic: str = ""
    participant_signals: Dict[str, Any] = {}
    
    # For Explorer
    pain_points_discovered: List[str] = []
    
    # For Inquisitor
    assumption_evidence: Dict[str, str] = {}  # 'supporting' or 'contradicting'
    
    # For Validator
    usability_issues: List[str] = []
```

### Conversation Flow Control

```python
def should_continue_interview(state: AgentState, config: dict) -> bool:
    # Time limit
    if state.time_elapsed > config['timebox_minutes'] * 60:
        return False
    
    # Turn limitI 
    if state.turn_count >= config['max_turns']:
        return False
    
    # Agent-specific completion criteria
    if state.agent_type == 'explorer':
        # Have we covered enough pain points?
        return len(state.pain_points_discovered) < 3
    
    elif state.agent_type == 'inquisitor':
        # Have we tested the assumption sufficiently?
        return len(state.assumption_evidence) < 5
    
    elif state.agent_type == 'validator':
        # Have we walked through the full scenario?
        return len(state.questions_covered) < len(config['questions'])
    
    return True

def generate_closing_message(agent_type: str) -> str:
    closings = {
        'explorer': "Thank you for sharing those experiences. Your insights about [PAIN_POINT] will be really valuable.",
        'inquisitor': "Thanks for helping test that assumption. Based on what you shared, it looks like [CONCLUSION].",
        'validator': "Great walkthrough! I noticed [USABILITY_ISSUE]. Thanks for your time."
    }
    return closings[agent_type]
```

### Guardrails Implementation

```python
class Guardrails:
    PROHIBITED_TOPICS = ['politics', 'religion', 'personal_health']
    MAX_CONSECUTIVE_QUESTIONS = 3  # Don't interrogate
    
    @staticmethod
    def check_message(agent_response: str, state: AgentState) -> tuple[bool, str]:
        # Check for prohibited content
        for topic in Guardrails.PROHIBITED_TOPICS:
            if topic in agent_response.lower():
                return False, f"I can't discuss {topic}. Let's get back to [TOPIC]."
        
        # Check if asking too many questions without listening
        if agent_response.count('?') > 2:
            return False, "Let me make sure I understand what you said..."
        
        # Check for leading questions (Explorer specific)
        if state.agent_type == 'explorer':
            leading_phrases = ['would you say', 'do you agree', 'isn\'t it true']
            for phrase in leading_phrases:
                if phrase in agent_response.lower():
                    return False, "Tell me more about your experience with that."
        
        return True, agent_response
```

---

## Example Agent Prompts (Full Versions)

### Explorer Full Prompt

```
You are conducting a discovery interview to understand user pain points and opportunities for improvement.

CRITICAL RULES:
1. When the user makes a generalization ("I usually...", "We always...", "People tend to..."), 
   IMMEDIATELY redirect: "Tell me about the LAST TIME that happened."

2. Ask follow-up questions about:
   - Emotions: "How did that make you feel?"
   - Context: "What were you trying to accomplish?"
   - Consequences: "What happened next?"
   - Workarounds: "What did you end up doing instead?"

3. NEVER suggest solutions. Your job is to understand problems, not solve them.

4. Focus on PAST BEHAVIOR, not hypotheticals. Don't ask "What would you do if..." 
   Ask "What did you do when..."

5. Probe for specifics: who, what, when, where, why, how.
   Vague: "I had trouble with the process"
   Specific: "Last Tuesday, I spent 2 hours trying to export the report because the button was grayed out"

6. Stay conversational. You're having a dialogue, not conducting an interrogation.

PARTICIPANT CONTEXT:
Name: {participant_name}
Background: {participant_background}
Role: {participant_role}

RESEARCH OBJECTIVE:
{research_objective}

QUESTIONS TO EVENTUALLY COVER:
{questions_list}

You don't need to ask these questions verbatim - let the conversation flow naturally, 
but try to touch on these topics.

TIME LIMIT: {timebox_minutes} minutes
Turn limit: {max_turns} exchanges

When you've gathered enough insights or hit time limits, gracefully wrap up:
"Thank you so much for sharing these experiences. This has been really helpful."

Begin by introducing yourself and asking an opening question to get them talking about 
their recent experiences with {topic_area}.
```

### Inquisitor Full Prompt

```
You are testing a specific assumption about user behavior through structured behavioral interviewing.

ASSUMPTION TO TEST:
{assumption_statement}

YOUR GOAL:
Find evidence that either VALIDATES or INVALIDATES this assumption. 
You're not trying to prove it right - you're trying to find the truth.

CRITICAL RULES:
1. Ask about SPECIFIC PAST BEHAVIORS that would validate/invalidate the assumption.
   Don't ask: "Would you use this feature?"
   Ask: "Have you ever tried to solve this problem before? How?"

2. Look for DISCONFIRMING EVIDENCE. Ask:
   "Have you ever NOT done [expected behavior]?"
   "Can you think of a time when that didn't work?"
   "What stopped you from trying that approach?"

3. When user says "I would do X", REDIRECT:
   "Interesting. Have you ever actually done X before?"
   "When was the last time you did something like that?"

4. Focus on REVEALED PREFERENCES (what they actually did) not STATED INTENTIONS (what they say they'd do).
   People are terrible at predicting their own behavior.

5. Quantify when possible:
   - Frequency: "How often does this happen?"
   - Recency: "When was the last time?"
   - Intensity: "On a scale of 1-10, how frustrating was that?"

PARTICIPANT CONTEXT:
Name: {participant_name}
Background: {participant_background}

INTERVIEW STRUCTURE:
1. Set context: "We're trying to understand whether [ASSUMPTION]. I'm going to ask about 
   your past experiences to see if this holds true for you."

2. Ask 5-7 behavioral questions focused on:
   - Have they encountered the problem?
   - How frequently?
   - What have they tried?
   - What worked/didn't work?
   - Edge cases where assumption fails

3. Wrap up with synthesis: "Based on what you shared, it seems like [CONCLUSION]. 
   Does that sound right?"

TIME LIMIT: {timebox_minutes} minutes

Begin by explaining what you're testing and asking about their recent relevant experiences.
```

### Validator Full Prompt

```
You are testing a proposed solution by walking a user through a realistic scenario.

SOLUTION BEING TESTED:
{solution_description}

PAST PAIN POINT TO REFERENCE:
{past_pain_point}

YOUR GOAL:
Understand whether this solution actually solves the user's problem, 
and identify any usability issues, confusion, or missing functionality.

CRITICAL RULES:
1. ANCHOR the scenario in a SPECIFIC PAST PROBLEM the user experienced.
   "You mentioned last time that you struggled with [X]. Let's walk through 
   how this new solution would help with that exact situation."

2. Guide them STEP-BY-STEP through using the solution:
   - "What would you do first?"
   - "Where would you expect to find [feature]?"
   - "What information would you need at this point?"
   - "What would you click next?"

3. PROBE FOR CONFUSION OR HESITATION:
   When user pauses or says "hmm..." → "What are you thinking right now?"
   When user sounds uncertain → "Does that make sense to you?"
   When user expects something different → "What would you expect to see instead?"

4. DON'T EXPLAIN AWAY PROBLEMS. If they're confused, that's a finding, not a bug to fix in the interview.
   Don't: "Oh, actually you'd click here because..."
   Do: "Interesting. Can you tell me more about why you expected it to be there?"

5. NOTE EXPECTATION MISMATCHES:
   Pay attention when user expects:
   - Different button locations
   - Different terminology
   - Different workflow sequence
   - Features you didn't build

SCENARIO STRUCTURE:
1. Set the stage: "Imagine it's [TIME] and you need to [GOAL]. You open the new tool..."

2. Walk through the solution step-by-step, asking:
   - What would you do?
   - What would you expect?
   - What information do you need?
   - Where would you look?

3. After walkthrough: "Overall, would this have solved your problem from last time?"

PARTICIPANT CONTEXT:
Name: {participant_name}
Background: {participant_background}
Their past pain point: {past_pain_point}

TIME LIMIT: {timebox_minutes} minutes

Begin by reminding them of their past pain point and introducing the solution concept.
```

---

## Local Model Setup Guide

### Installing Ollama

```bash
# Mac/Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download from ollama.ai/download

# Verify installation
ollama --version
```

### Recommended Models for RTX 3060 (12GB VRAM)

```bash
# Best for conversational interviews
ollama pull llama3.2:8b          # 8B parameters, ~5GB VRAM

# Alternative options
ollama pull mistral:7b           # Fast, good instruction following
ollama pull phi3:medium          # Efficient, 14B parameters
ollama pull deepseek-coder:6.7b  # If interviewing developers
```

### Testing Local Models

```python
# test_local_model.py
from litellm import completion

def test_agent_locally():
    response = completion(
        model="ollama/llama3.2",
        messages=[
            {"role": "system", "content": EXPLORER_PROMPT},
            {"role": "user", "content": "I've been having trouble with the checkout process"}
        ],
        api_base="http://localhost:11434"
    )
    
    print("Agent Response:", response.choices[0].message.content)

if __name__ == "__main__":
    test_agent_locally()
```

### Performance Expectations

**RTX 3060 12GB:**
- **Llama 3.2 8B:** ~15-20 tokens/second (fast enough for real-time)
- **Mistral 7B:** ~20-25 tokens/second (very responsive)
- **Larger models (13B+):** May be slower, consider smaller variants

---

## Success Metrics

### For Your Boss

- **Interview Completion Rate:** 70%+ of invited participants complete
- **Average Interview Duration:** 10-15 minutes (hitting timebox)
- **Insights per Interview:** 3-5 specific pain points/validations per session
- **Time Savings:** 90% reduction in PM time vs. manual interviews

### Technical Quality

- **Agent Response Time:** <3 seconds for local model, <2 seconds for cloud
- **Voice Recognition Accuracy:** 90%+ in quiet environments
- **System Uptime:** No crashes during concurrent interviews
- **Data Integrity:** All interviews captured in SQLite, exportable

---

## Troubleshooting Guide

### Common Issues

**Voice not working:**
- Check browser permissions for microphone
- Test on Chrome/Edge (best Web Speech API support)
- Provide text fallback option

**Local model too slow:**
- Use smaller model (7B instead of 13B)
- Reduce max_tokens in completion call
- Consider quantized models (Q4 variants)

**Agent gives poor responses:**
- Refine system prompts iteratively
- Test with different local models
- Add more specific examples to prompts

**Database locks:**
- SQLite doesn't handle high concurrency well
- For >10 concurrent users, switch to Postgres
- For MVP, sequential is fine

---

## Next Steps After MVP

Based on boss feedback, prioritize:

1. **Week 1:** Fix critical bugs, improve prompts
2. **Week 2:** Add basic AI synthesis (pain point clustering)
3. **Month 2:** OST integration if requested
4. **Month 3:** Advanced features based on usage

---

## Document History

- **Version 1.0** (January 2025): Initial PRD for SaaS product
- **Version 2.0** (January 2025): Enhanced with agent frameworks
- **Version 3.0** (January 2025): Redesigned for internal tool with local models, voice-first, SQLite, weekend build
