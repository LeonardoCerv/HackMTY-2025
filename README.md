# 💰 Capital One HackMTY 2025 — Personal Expense Dashboard

A full-stack **personal finance dashboard** built with **Next.js**, **FastAPI**, and **AI-powered financial insights**.  
It helps users visualize their income, expenses, and debt while interacting with an AI financial assistant for personalized recommendations.

---

## 🚀 Overview

This project demonstrates a **real-world personal finance app** integrating data visualization, backend APIs, and generative AI:

- **Frontend:** Next.js + TypeScript interface for accounts, transactions, and charts  
- **Backend:** FastAPI endpoints serving financial data (mockable or via Capital One’s Nessie API)  
- **Agent:** FastAPI service powered by **Google Gemini** for natural-language financial analysis

---

## ✨ Key Features

- 📊 **Real-Time Dashboard** — Track net worth, income, expenses, and liabilities  
- 🔍 **Transaction Search & Pagination** — Filter and explore your transaction history  
- 🤖 **AI Assistant** — Ask natural-language financial questions and get smart responses  
- 💳 **Debt Management** — Monitor loans, credit cards, and payoff suggestions  
- 🧩 **Mock Data Mode** — Run locally without external APIs  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python 3.10+) |
| **Agent** | FastAPI + Google Gemini (optional) |
| **Charts** | Recharts |
| **Data Fetching** | SWR |

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18  
- **Python** ≥ 3.10  
- *(Optional)* Google Gemini API key for AI features  
- *(Optional)* Nessie API key for live financial data  

---

## 🔐 Environment Variables

Create a `.env` (or `.env.local` in the frontend) with:

```bash
GOOGLE_AI_API_KEY=your_gemini_api_key_here   # optional
NESSIE_API_KEY=your_nessie_key_here           # optional
use_mock=true                                 # set false for live data
```

---

## 🧭 Quick Start (Local Setup)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/LeonardoCerv/HackMTY-2025.git
cd HackMTY-2025
```

### 2️⃣ Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3️⃣ Agent (AI Service)
```bash
cd ../agent
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

### 4️⃣ Frontend (Next.js)
```bash
cd ../frontend
npm install
npm run dev
```

Then open 👉 [http://localhost:3000](http://localhost:3000)

**Default Ports:**
- Frontend → `3000`  
- Backend → `8000`  
- Agent → `8001`

---

## 🧩 How It Works

1. **Frontend** calls internal API routes (`app/api/*`) which proxy to the backend or AI agent.  
2. **Backend** aggregates financial data (mock JSON or Nessie API).  
3. **Agent** receives natural-language queries + transaction context, processes them via **Gemini**, and returns structured financial insights with optional chart data.  

---

## 📁 Project Structure

```
HackMTY-2025/
├── frontend/   # Next.js app, components, hooks, and API routes
├── backend/    # FastAPI app, endpoints, and mock JSON data
├── agent/      # AI analysis microservice using Google Gemini
└── .env        # Environment variables
```

### 🧱 Key Files
**Frontend**
- `app/page.tsx`, `app/api/*/route.ts` — Core UI & API proxies  
- `components/ai-chat-assistant.tsx` — Conversational AI  
- `lib/financial-analysis.ts` — Data formatting & insights logic  

**Backend**
- `main.py`, `run.py`, `routers/api_router.py` — REST endpoints  
- `data-transactions/*.json` — Mock fixtures  

**Agent**
- `main.py` — AI entrypoint  
- `generate_new_graph.py` — LLM financial analysis  

---

## 🧰 Mock vs Live Data

| Mode | Description |
|------|--------------|
| `use_mock=true` | Uses bundled JSON data under `backend/data-*` |
| `use_mock=false` | Fetches live data using the Nessie API (requires key) |

---

## 🧾 Troubleshooting

| Issue | Fix |
|--------|-----|
| Frontend can’t reach backend | Ensure FastAPI runs on `http://127.0.0.1:8000` |
| Missing AI responses | Check that the **Agent** is running (`:8001`) and `GOOGLE_AI_API_KEY` is set |
| CORS errors | Verify CORS middleware in both backend and agent |

---

## ☁️ Deployment

**Recommended Setup:**
- Frontend → [Vercel](https://vercel.com)  
- Backend & Agent → Docker or any Python-compatible cloud (AWS, Render, Railway, etc.)

Ensure all environment variables are properly configured in each environment.

---

## 💬 Example AI Queries

Try asking the assistant:

- “Which recurring expenses are affecting my savings most?”  
- “How can I reduce my monthly spending?”  
- “What’s my debt payoff timeline?”  
- “Am I saving enough for emergencies?”

---

## 🤝 Contributing

Built with ❤️ for **Capital One HackMTY 2025**.  
Contributions and forks are welcome!  

---

## 📜 License

[MIT License](LICENSE)
