# JARVIS AI — Open-Ended Voice Assistant

A Windows desktop AI assistant that listens for the wake word **"Jarvis"**, understands Indian English voice commands, maps natural language to tools using **Gemini AI**, and executes system/browser/media tasks — all with a stunning Iron Man HUD interface.

## 🏗️ Architecture

```
Electron Desktop App (.exe)
        ↓
React Frontend (UI + Voice Layer)
        ↓
FastAPI Backend (Hosted on Render)
        ↓
Gemini AI + PostgreSQL
```

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Desktop | Electron + electron-builder |
| Frontend | React + Vite |
| Backend | FastAPI + Python |
| AI | Google Gemini API |
| Voice | Web Speech API (en-IN) + Picovoice Porcupine |
| Database | PostgreSQL (Render) |
| Deployment | Render (backend) + Vercel (frontend) |

## 🚀 Getting Started

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
# Fill in .env with GEMINI_API_KEY and DATABASE_URL
uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
# Set VITE_API_URL in .env
npm run dev
```

### 3. Electron (Desktop)
```bash
cd electron
npm install
npm run dev      # Dev mode (loads Vite dev server)
npm run build    # Build .exe
```

## ⚙️ Environment Variables

### `backend/.env`
```
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgresql://...
PICOVOICE_ACCESS_KEY=your_key_here
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:8000
```

## 🎤 Voice Commands (Examples)

| You say | JARVIS does |
|---------|-------------|
| "Jarvis, play Arijit Singh" | Opens YouTube search |
| "Jarvis, take a picture" | Opens Windows Camera |
| "Jarvis, what's the weather in Mumbai" | Fetches live weather |
| "Jarvis, open my downloads" | Opens Downloads folder |
| "Jarvis, write an email about leave" | Drafts email via Gemini |
| "Jarvis, take a screenshot" | Opens Snipping Tool |
| "Jarvis, volume up" | Increases system volume |

## 📦 Build .exe

```bash
cd electron
npm run build
# Output: electron/release/JARVIS AI Setup.exe
```
