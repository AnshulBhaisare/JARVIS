from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import voice, history, notes, tools
from app.models.database import init_db

app = FastAPI(
    title="JARVIS AI Backend",
    description="Backend API for JARVIS AI Voice Assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


app.include_router(voice.router,   prefix="/api/voice",   tags=["Voice"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(notes.router,   prefix="/api/notes",   tags=["Notes"])
app.include_router(tools.router,   prefix="/api/tools",   tags=["Tools"])


@app.get("/")
async def root():
    return {"message": "JARVIS AI Backend is online", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "online", "service": "JARVIS AI Backend"}
