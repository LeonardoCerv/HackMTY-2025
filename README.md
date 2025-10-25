# Capital One HackMTY 2025 - Personal Expense Dashboard

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

MIT License
