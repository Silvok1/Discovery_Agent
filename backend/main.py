from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Continuous Discovery Interview Platform",
    description="AI-powered interview agents for product discovery",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/")
def root():
    return {
        "message": "Continuous Discovery Interview Platform",
        "docs": "/docs",
        "agents": ["explorer", "inquisitor", "validator"]
    }
