<!-- # Capital One HackMTY 2025 - Personal Expense Dashboard

A Next.js-based personal finance dashboard that integrates with Capital One's API to provide real-time financial insights and AI-powered conversational analysis.

## Features

- **Real-time Financial Dashboard**: View net worth, income, expenses, and debt in real-time
- **Interactive Charts**: Visualize earnings trends and expense breakdowns
- **AI Financial Assistant**: Ask questions about your finances using Gemini AI
- **Expense Analysis**: Identify recurring expenses and savings opportunities
- **Debt Management**: Track credit cards, loans, and payoff strategies

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: SWR
- **AI**: Google Gemini AI
- **UI Components**: Custom component library

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/LeonardoCerv/HackMTY-2025.git
   cd HackMTY-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_AI_API_KEY=your_gemini_api_key_here
   ```

   Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the dashboard.

## API Endpoints

- `GET /api/accounts` - Fetch user accounts
- `GET /api/transactions` - Fetch transaction history
- `POST /api/insights` - Get AI-powered financial insights

## Key Components

- **DashboardHeader**: Overview of net worth, income, and expenses
- **EarningsSection**: Income trends and source breakdown
- **ExpensesSection**: Expense categories and analysis
- **DebtSection**: Credit cards and loans management
- **AIChatAssistant**: Conversational financial advisor

## Example Questions for AI Assistant

- "Which small, recurring expenses are silently eating away most of my earnings?"
- "How can I reduce my monthly expenses?"
- "What's my debt payoff strategy?"
- "Am I saving enough for emergencies?"

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── accounts/route.ts
│   │   ├── transactions/route.ts
│   │   └── insights/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── dashboard-header.tsx
│   ├── earnings-section.tsx
│   ├── expenses-section.tsx
│   ├── debt-section.tsx
│   └── ai-chat-assistant.tsx
├── lib/
│   ├── hooks.ts
│   ├── utils.ts
│   └── financial-analysis.ts
└── types/
    └── financial.ts
```

## Deployment

This project can be deployed on Vercel, Netlify, or any platform supporting Next.js.

For Vercel deployment:
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically

## Contributing

This project was built for the Capital One HackMTY 2025 hackathon. Feel free to fork and extend with additional features!

## License

MIT License -->

# Capital One HackMTY 2025 — Personal Expense Dashboard

A Next.js personal finance dashboard that integrates a FastAPI backend and an AI Agent service to provide insights, transaction analysis, and debt management suggestions.

## Overview

This project demonstrates a full-stack personal finance product:
- Frontend: Next.js + TypeScript UI for accounts, transactions, charts and an AI assistant.
- Backend: FastAPI endpoints serving accounts, transactions, loans and credit data (mockable or via Nessie).
- Agent: FastAPI AI service that formats LLM responses (Google Gemini) into actionable insights.

## Key features

- Real-time dashboard: net worth, income vs expenses, liabilities.
- Transaction table with search and pagination.
- AI assistant: natural-language queries for personalized recommendations and charts.
- Debt overview: loans, credit score and payoff suggestions.
- Mock data support for offline development.

## Tech stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, Python 3.10+
- Agent: FastAPI + Google Generative AI (optional)
- Charts: Recharts

## Prerequisites

- Node.js >= 18 and npm
- Python 3.10+
- Google Gemini API key for AI features

## Environment

Create a .env at repo root or use .env.local. Common variables:
- GOOGLE_AI_API_KEY (optional, for agent)
- NESSIE_API_KEY (optional, for live data)
- use_mock (true to use included JSON fixtures)

## Quick start (local development)

1. Clone repository
bash
git clone https://github.com/LeonardoCerv/HackMTY-2025.git
cd HackMTY-2025


2. Backend (FastAPI)
bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
# Run:
python run.py
# or:
uvicorn main:app --reload --host 127.0.0.1 --port 8000


3. Agent (AI service)
bash
cd ../agent
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001


4. Frontend (Next.js)
bash
cd ../frontend
npm install
npm run dev
# Open http://localhost:3000


Default ports:
- Backend: 8000
- Agent: 8001
- Frontend: 3000

## How it works (high level)

- Frontend calls internal API routes under frontend/app/api/* which proxy to the backend or agent.
- Backend serves consolidated and normalized data (mock JSON or Nessie).
- Agent accepts user queries + relevant transactions, uses LLM to return structured analyses and optional chart descriptors consumed by the UI.

## Project structure (top-level)

- frontend/ — Next.js app, components, hooks, types
- backend/ — FastAPI app, API logic and mock data (data-*)
- agent/ — AI agent service and analysis generator
- .env — environment variables

## Key files & components

- Frontend:
  - app/page.tsx, app/api/*/route.ts
  - components/compact-ai-chat-assistant.tsx
  - components/agent-response-modal.tsx
  - lib/hooks.ts, lib/financial-analysis.ts
  - types/financial.ts
- Backend:
  - main.py, run.py, api.py
  - data-transactions/*.json (mock fixtures)
- Agent:
  - main.py
  - generate_new_graph.py (generate_financial_analysis)

## Mock vs Live data

- Set use_mock=true to use local JSON fixtures under backend/data-*
- To use Nessie, set use_mock=false and provide NESSIE_API_KEY

## Troubleshooting

- Frontend cannot reach backend → confirm backend at http://127.0.0.1:8000
- AI responses missing → verify GOOGLE_AI_API_KEY and that agent is running on port 8001
- Check backend/agent console logs for errors

## Deployment

- Frontend: Vercel (Next.js) recommended
- Backend & Agent: Docker, cloud VM or serverless Python host — ensure CORS and env vars

## Contributing & License

Built for Capital One HackMTY 2025. Fork and extend. MIT License.
// filepath: c:\Users\josem\OneDrive\Escritorio\lkl\HackMTY-2025\README.md

# Capital One HackMTY 2025 — Personal Expense Dashboard

A Next.js personal finance dashboard that integrates a FastAPI backend and an AI Agent service to provide insights, transaction analysis, and debt management suggestions.

## Overview

This project demonstrates a full-stack personal finance product:
- Frontend: Next.js + TypeScript UI for accounts, transactions, charts and an AI assistant.
- Backend: FastAPI endpoints serving accounts, transactions, loans and credit data (mockable or via Nessie).
- Agent: FastAPI AI service that formats LLM responses (Google Gemini) into actionable insights.

## Key features

- Real-time dashboard: net worth, income vs expenses, liabilities.
- Transaction table with search and pagination.
- AI assistant: natural-language queries for personalized recommendations and charts.
- Debt overview: loans, credit score and payoff suggestions.
- Mock data support for offline development.

## Tech stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, Python 3.10+
- Agent: FastAPI + Google Generative AI (optional)
- Charts: Recharts

## Prerequisites

- Node.js >= 18 and npm
- Python 3.10+
- Optional: Google Gemini API key for AI features

## Environment

Create a .env at repo root or use .env.local. Common variables:
- GOOGLE_AI_API_KEY (optional, for agent)
- NESSIE_API_KEY (optional, for live data)
- use_mock (true to use included JSON fixtures)

## Quick start (local development)

1. Clone repository
bash
git clone https://github.com/LeonardoCerv/HackMTY-2025.git
cd HackMTY-2025


2. Backend (FastAPI)
bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
# Run:
python run.py
# or:
uvicorn main:app --reload --host 127.0.0.1 --port 8000


3. Agent (AI service)
bash
cd ../agent
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001


4. Frontend (Next.js)
bash
cd ../frontend
npm install
npm run dev
# Open http://localhost:3000
```

Default ports:
- Backend: 8000
- Agent: 8001
- Frontend: 3000

## How it works (high level)

- Frontend calls internal API routes under frontend/app/api/* which proxy to the backend or agent.
- Backend serves consolidated and normalized data (mock JSON or Nessie).
- Agent accepts user queries + relevant transactions, uses LLM to return structured analyses and optional chart descriptors consumed by the UI.

## Project structure (top-level)

- frontend/ — Next.js app, components, hooks, types
- backend/ — FastAPI app, API logic and mock data (data-*)
- agent/ — AI agent service and analysis generator
- .env — environment variables

## Key files & components

- Frontend:
  - app/page.tsx, app/api/*/route.ts
  - components/compact-ai-chat-assistant.tsx
  - components/agent-response-modal.tsx
  - lib/hooks.ts, lib/financial-analysis.ts
  - types/financial.ts
- Backend:
  - main.py, run.py, api.py
  - data-transactions/*.json (mock fixtures)
- Agent:
  - main.py
  - generate_new_graph.py (generate_financial_analysis)

## Mock vs Live data

- Set use_mock=true to use local JSON fixtures under backend/data-*
- To use Nessie, set use_mock=false and provide NESSIE_API_KEY

## Troubleshooting

- Frontend cannot reach backend → confirm backend at http://127.0.0.1:8000
- AI responses missing → verify GOOGLE_AI_API_KEY and that agent is running on port 8001
- Check backend/agent console logs for errors

## Deployment

- Frontend: Vercel (Next.js) recommended
- Backend & Agent: Docker, cloud VM or serverless Python host — ensure CORS and env vars

## Contributing & License

Built for Capital One HackMTY 2025. Fork and extend. MIT License.