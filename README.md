# StreetOS AI
> The AI Operating System for Africa's Informal Economy

---

## Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| Git | any | https://git-scm.com |
| Docker Desktop | any | https://docker.com (optional but recommended) |
| Expo Go app | latest | App Store / Play Store (for mobile testing) |

---

## Project Structure

```
StreetOS/
├── backend/        Node.js + Express + TypeScript API (port 5000)
├── ai-service/     Python + FastAPI + Gemini AI service (port 8000)
├── mobile/         React Native + Expo app
└── docker-compose.yml
```

---

## Step 1 — Configure Environment Variables

### Backend (`backend/.env`)
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/streetos
JWT_ACCESS_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run same command again for a different value>
```
Everything else in `backend/.env` can stay as-is for local dev.

### AI Service (`ai-service/.env`)
```
GEMINI_API_KEY=<get from https://aistudio.google.com/app/apikey>
MONGODB_URI=<same as backend>
WHISPER_MODEL=base
```

### Mobile (`mobile/.env`)
```
# If using physical phone on same WiFi, replace with your PC's local IP:
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api/v1

# Android emulator:
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api/v1

# iOS simulator:
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Option A — Run with Docker (Recommended)

Runs Redis + Backend + AI Service together automatically.

```bash
# From the root StreetOS/ folder:
docker-compose up --build
```

Services will be available at:
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000
- Redis: localhost:6379

Then in a separate terminal, run the mobile app:
```bash
cd mobile
npm install
npx expo start
```

---

## Option B — Run Without Docker (3 Terminals)

### Terminal 1 — Redis
```bash
# Windows (with WSL or Redis for Windows):
redis-server

# Or use the free Redis Cloud: https://redis.io/try-free/
# Then update REDIS_URL in backend/.env
```

### Terminal 2 — Backend (Node.js)
```bash
cd backend
npm install
npm run dev
```
You should see:
```
✓ MongoDB connected successfully
✓ Redis connected
✓ StreetOS API running on port 5000 [development]
```

### Terminal 3 — AI Service (Python)
```bash
cd ai-service

# Create virtual environment (first time only)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 4 — Mobile (Expo)
```bash
cd mobile
npm install
npx expo start
```
- Press `a` to open Android emulator
- Press `i` to open iOS simulator
- Scan the QR code with Expo Go on your phone

---

## Verify Everything is Running

Open these URLs in your browser:

| Service | URL | Expected |
|---------|-----|----------|
| Backend health | http://localhost:5000/health | `{"status":"ok","service":"streetos-api"}` |
| AI service health | http://localhost:8000/health | `{"status":"ok","service":"streetos-ai","ai_provider":"gemini"}` |
| AI docs (Swagger) | http://localhost:8000/docs | Interactive API docs |

---

## First-Time Setup Checklist

- [ ] MongoDB Atlas cluster created and URI added to `.env`
- [ ] Gemini API key added to `ai-service/.env`
- [ ] JWT secrets generated and added to `backend/.env`
- [ ] Redis running (Docker or cloud)
- [ ] Backend starts without errors
- [ ] AI service starts without errors
- [ ] Expo app loads on phone/emulator
- [ ] Register an account in the app
- [ ] Try a voice transaction

---

## Common Issues

**"Missing required env variable: MONGODB_URI"**
→ Make sure `backend/.env` exists and has `MONGODB_URI` set.

**"GEMINI_API_KEY not found"**
→ Make sure `ai-service/.env` exists and has `GEMINI_API_KEY` set.

**Mobile can't connect to backend on physical phone**
→ Use your PC's local IP address in `mobile/.env`, not `localhost`.
→ Find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

**Whisper model download takes long on first run**
→ Normal. The `base` model (~140MB) downloads once and is cached.

**Redis connection refused**
→ Make sure Redis is running. With Docker: `docker-compose up redis`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo, TypeScript, Zustand, React Query |
| Backend | Node.js, Express, TypeScript, MongoDB, Redis |
| AI | Python, FastAPI, Gemini 1.5, Whisper, LangGraph |
| Database | MongoDB Atlas |
| Cache | Redis |
| Storage | Cloudinary |
| Push | Firebase Cloud Messaging |
