# 💰 Capital One HackMTY 2025 — Personal Expense Dashboard

A full-stack personal finance dashboard demonstrating how to combine a modern React/Next frontend, FastAPI backend, and an AI-powered analysis microservice to visualize transactions, income, expenses, and debt and to provide natural-language financial insights.

This README shows everything you need to install dependencies and run the project locally (Windows PowerShell friendly), along with environment variables, quick examples, troubleshooting, and notes about the tech used.

## Highlights

- Dashboard UI (Next.js + TypeScript + Tailwind)
- Backend REST API (FastAPI, mock JSON fixtures or Nessie live data)
- Agent / AI microservice (FastAPI wrapper around an LLM/Google Gemini-style API)
- Mock data included for quick local runs

## Tech stack

- Frontend: Next.js (app router), React, TypeScript, Tailwind CSS
- Backend: FastAPI (Python 3.10+), Uvicorn
- Agent: FastAPI service using a (configurable) LLM provider
- Data & utils: JSON fixtures under `backend/data-*`, helper code in `frontend/lib`

## Prerequisites

- Node.js >= 18 (for the frontend)
- Python >= 3.10 (for backend & agent)
- git (to clone the repo)

Optional
- Google Gemini / LLM API key (for agent advanced responses)
- Nessie API key (for live financial data)

If you don't have these optional keys the project can run fully on the included mock data.

## Environment variables

Create a top-level `.env` for backend/agent and `frontend/.env.local` (if you want different frontend-only settings). Minimal recommended variables:

- GOOGLE_AI_API_KEY=your_gemini_api_key_here   # optional (Agent)
- NESSIE_API_KEY=your_nessie_key_here           # optional (Backend live mode)
- USE_MOCK=true                                 # true = use bundled JSON, false = use Nessie/live
- BACKEND_URL=http://127.0.0.1:8000             # frontend -> backend proxy (optional override)
- AGENT_URL=http://127.0.0.1:8001               # frontend -> agent proxy (optional override)

Notes:
- The repo's default behavior uses mock data when `USE_MOCK` (or `use_mock`) is set to `true`.
- Keys and variable names are case-insensitive depending on how each service reads them; follow the files in `backend/` and `agent/` for exact names if you modify code.

## Quick start (Windows PowerShell-focused)

Below are step-by-step instructions to run the three main pieces: backend, agent, and frontend. You can open three PowerShell tabs or terminals and run each service in its own terminal.

1) Clone repo

```powershell
git clone https://github.com/LeonardoCerv/HackMTY-2025.git
cd HackMTY-2025
```

2) Backend & Agent — install dependencies (two options)

You can install Python dependencies using a virtual environment (recommended) or install them directly into your local/global Python environment (not recommended but supported). Below are both options for the `backend` and `agent` services.

Recommended: use a virtual environment (isolated per-project)

Backend (venv)
```powershell
cd backend
python -m venv .venv
# PowerShell: activate venv
. .venv\Scripts\Activate.ps1
# If activation is blocked by execution policy, run:
# Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

python -m pip install --upgrade pip
python -m pip install -r .\requirements.txt
# Run backend (development)
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Agent (venv)
```powershell
cd ..\agent
python -m venv .venv
. .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r .\requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Alternative: install directly into your local/global Python environment (no virtualenv)

Warning: installing globally may pollute your system Python and cause version conflicts. Use this only if you intentionally want global installs.

Backend (global/local)
```powershell
cd backend
python -m pip install --upgrade pip
python -m pip install -r .\requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Agent (global/local)
```powershell
cd ..\agent
python -m pip install --upgrade pip
python -m pip install -r .\requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Notes about local/global installs:
- If you use `python -m pip install -r requirements.txt` without activating a venv, packages install into whatever Python interpreter `python` points to (system or user). You can use `python -m pip install --user -r requirements.txt` to install into the current user's site-packages instead of system-wide (safer on some systems).
- Confirm the `python` executable you expect with `python -V` or `Get-Command python` (PowerShell).

3) Frontend (Next.js) — run on port 3000

Open a new terminal tab and run:

```powershell
cd ..\frontend
npm install
npm run dev
```

Visit http://localhost:3000 in your browser.

Default ports used by the project:

- Frontend → 3000
- Backend → 8000
- Agent → 8001

If you need to change ports, update service start commands and the `BACKEND_URL` / `AGENT_URL` env vars as needed.

## Run flow & notes

- The Next frontend calls internal API routes under `app/api/*` which proxy or fetch from `BACKEND_URL` or `AGENT_URL`.
- The backend exposes endpoints which read mock JSON from `backend/data-*` when `USE_MOCK=true`.
- The agent receives natural-language queries plus transaction context and (optionally) sends requests to an LLM provider using `GOOGLE_AI_API_KEY`.

## Example requests

Health checks (PowerShell/curl examples):

```powershell
# Backend health (PowerShell)
Invoke-RestMethod 'http://127.0.0.1:8000'

# Agent health
Invoke-RestMethod 'http://127.0.0.1:8001'
```

Or curl (cross-platform):

```bash
curl http://127.0.0.1:8000
curl http://127.0.0.1:8001
```

## Troubleshooting

- Virtualenv activation errors (PowerShell): set the execution policy for current user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

- CORS issues: ensure both backend and agent include proper CORS middleware if calling from the frontend directly. The project includes CORS setup—confirm origins/ports match.
- Port collision: change ports or stop the process using the port. On Windows you can check with `netstat -ano | Select-String 8000`.
- Missing API keys: if `GOOGLE_AI_API_KEY` or `NESSIE_API_KEY` are missing and you set `USE_MOCK=false`, the services will fail to fetch live data. Either set the key or revert to `USE_MOCK=true`.
- Dependency install errors: ensure Python version >= 3.10 and Node >= 18. Upgrade pip if necessary: `python -m pip install --upgrade pip`.

## Tests & lint (tips)

- Frontend: the project uses standard Next.js scripts. Run `npm run lint` or other scripts present in `frontend/package.json` if available.
- Backend/Agent: no formal tests bundled, but you can validate endpoints with curl/Invoke-RestMethod.

## Deployment notes

- Frontend: deploy to Vercel for best DX.
- Backend & Agent: containerize with Docker or deploy to a Python host. Ensure env vars and secrets are configured in the target environment.

## Files & where to look

- `frontend/` — UI, components, API routes proxied to backend/agent
- `backend/` — FastAPI app, `data-transactions/*.json` mock fixtures
- `agent/` — FastAPI AI microservice and `generate_new_graph.py` for analysis logic

## License

This project is offered under the MIT license (see `LICENSE`).
