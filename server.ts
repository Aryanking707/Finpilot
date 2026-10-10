import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Natural-Language Financial Advisor Query
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, financialContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemInstruction = `You are FinPilot, an elite AI Personal Financial Advisor and Budgeting Strategist.
Your goal is to guide the user (Aryan) toward financial freedom, realistic zero-based budgeting, smart debt payoff, and disciplined investing in India.
Currency is Indian Rupee (₹ / INR). Format all currency values using ₹ (e.g. ₹1,40,000, ₹25,000, ₹15,000).

User's Current Financial Snapshot:
${financialContext ? JSON.stringify(financialContext, null, 2) : 'No specific snapshot provided.'}

Guidelines:
1. Always base your advice on the user's concrete Indian Rupee numbers provided above (monthly income, outflows, category spending, savings rate, and goals).
2. Be direct, compassionate, and quantitative (calculate exact Rupees saved, timeline to reach goals, compound growth in mutual funds/SIPs/FDs).
3. Frame answers with clean formatting: use concise paragraphs, bullet points, bold key Rupee numbers, and actionable "Next Steps".
4. When asked "Can I afford X?", calculate the impact on their monthly surplus, emergency fund, and goal timelines before giving a reasoned recommendation.
5. Provide contextual knowledge for the Indian market when relevant (e.g., SIPs in Index Funds, High-Yield FDs, Tax-saving ELSS / PPF, health insurance top-ups).
6. Never invent generic platitudes. Tailor every word to Aryan's specific financial situation.`;

    if (!ai) {
      // Intelligent fallback when API key is not configured
      const lastMessage = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `Here is advice based on your current numbers, Aryan:\n\n**Financial Assessment:**\nYour current monthly income is **₹${(financialContext?.monthlyIncome || 140000).toLocaleString('en-IN')}** and monthly expenses are **₹${(financialContext?.monthlyExpenses || 97000).toLocaleString('en-IN')}**, leaving a net cash surplus of **₹${((financialContext?.monthlyIncome || 140000) - (financialContext?.monthlyExpenses || 97000)).toLocaleString('en-IN')}** (${financialContext?.savingsRate || 31}% savings rate).\n\n**Recommendation regarding "${lastMessage.slice(0, 50)}...":**\n- Keep your essential living expenses (Rent, Groceries, EMIs) under 50% of your take-home pay.\n- Prioritize maintaining at least 6 months of living expenses in an Emergency High-Yield Fixed Deposit or liquid fund.\n- Direct your monthly surplus into disciplined Mutual Fund SIPs (Nifty 50 Index Fund) and fast-tracking loan payoffs.\n\n*(Note: For personalized dynamic AI responses, please ensure GEMINI_API_KEY is active.)*`
      });
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I apologize, I could not generate a financial response. Please try rephrasing.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: 'Failed to process financial query',
      details: error.message,
    });
  }
});

// 2. Deep Spending Pattern & Savings Insights Analysis
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { financialData } = req.body;

    if (!ai) {
      // Deterministic analytical calculation fallback in Indian Rupees
      const totalExpenses = financialData?.totalExpenses || 97000;
      const totalIncome = financialData?.totalIncome || 140000;
      const surplus = totalIncome - totalExpenses;
      return res.json({
        summary: `You are currently retaining ₹${surplus.toLocaleString('en-IN')}/month (${Math.round((surplus / totalIncome) * 100)}% savings rate), Aryan. Your largest spending outflows are in Rent/Housing, Groceries, and Food Deliveries.`,
        keyPatterns: [
          'Discretionary dining and Swiggy/Zomato food orders account for nearly 12% of total expenditures.',
          'Recurring subscriptions total approximately ₹2,800/month across OTT, music, and fitness platforms.',
          'Weekend dining and entertainment spikes represent 60% of all variable retail spending.'
        ],
        savingsSuggestions: [
          {
            title: 'Trim Swiggy & Zomato Delivery Surges',
            category: 'Dining Out',
            monthlySavings: 3800,
            annualSavings: 45600,
            impact: 'high',
            difficulty: 'medium',
            actionPlan: 'Limit online food orders to twice a week and plan weekday dinners around home staples.'
          },
          {
            title: 'Consolidate OTT Subscriptions (Airtel Black / Times Prime)',
            category: 'Subscriptions',
            monthlySavings: 950,
            annualSavings: 11400,
            impact: 'medium',
            difficulty: 'easy',
            actionPlan: 'Bundle Netflix, Hotstar and Prime through a single family plan instead of separate billings.'
          },
          {
            title: 'Enable Auto-Sweep on Idle Bank Balance',
            category: 'Savings & Investments',
            monthlySavings: 1400,
            annualSavings: 16800,
            impact: 'medium',
            difficulty: 'easy',
            actionPlan: 'Activate 7.1% auto-sweep FD on checking account balances exceeding ₹50,000.'
          }
        ],
        spendingLeakAlerts: [
          'Frequent quick-commerce deliveries (Blinkit/Zepto) with multiple convenience charges adding up to ₹1,400/mo.',
          'Unused OTT subscriptions renewing on auto-debit.'
        ],
        benchmarkComparison: {
          needsPercentage: 47,
          wantsPercentage: 22,
          savingsPercentage: 31,
          idealRatio: '50% Needs / 30% Wants / 20% Savings (Disciplined allocation!)'
        }
      });
    }

    const prompt = `Analyze this user's (Aryan) personal financial snapshot, spending records, and categories in Indian Rupees (₹ / INR):
${JSON.stringify(financialData, null, 2)}

Provide an in-depth financial advisory report in JSON format with the following fields:
1. summary (string): 2-3 sentence executive synthesis of their current health, cash-flow surplus in ₹, and biggest opportunities.
2. keyPatterns (array of strings): 3-4 notable spending habits, spikes, or behavioural trends detected in the Indian context.
3. savingsSuggestions (array of objects): 3-5 specific, realistic, high-impact savings recommendations in INR (₹).
   Each item must have:
   - title (string)
   - category (string)
   - monthlySavings (number, estimated ₹ saved/mo)
   - annualSavings (number, monthlySavings * 12)
   - impact ('high' | 'medium' | 'low')
   - difficulty ('easy' | 'medium' | 'hard')
   - actionPlan (string, 1-2 sentence concrete step)
4. spendingLeakAlerts (array of strings): 2-3 undetected financial leaks (subscriptions, delivery surges, convenience fees).
5. benchmarkComparison (object):
   - needsPercentage (number, integer)
   - wantsPercentage (number, integer)
   - savingsPercentage (number, integer)
   - idealRatio (string explaining how their 50/30/20 compares)

Return ONLY valid JSON matching this schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text?.trim() || '{}';
    const analysis = JSON.parse(text);
    return res.json(analysis);
  } catch (error: any) {
    console.error('Gemini analyze error:', error);
    return res.status(500).json({ error: 'Failed to analyze spending data', details: error.message });
  }
});

// 3. Intelligent Monthly Budget Envelope Generation
app.post('/api/gemini/generate-budget', async (req, res) => {
  try {
    const { income, currentSpendingByCategory, philosophy } = req.body;

    if (!ai) {
      // Fallback 50/30/20 calculation in Indian Rupees
      const monthlyIncome = income || 140000;
      const budgetAllocations = [
        { category: 'Housing', amount: Math.round(monthlyIncome * 0.25), type: 'needs', rationale: 'Target 25% for apartment rent, society maintenance, and property upkeep.' },
        { category: 'Food & Groceries', amount: Math.round(monthlyIncome * 0.10), type: 'needs', rationale: 'D-Mart staples, fresh fruits/veggies and quick commerce.' },
        { category: 'Utilities', amount: Math.round(monthlyIncome * 0.04), type: 'needs', rationale: 'Electricity, piped gas, broadband and mobile plans.' },
        { category: 'Transportation', amount: Math.round(monthlyIncome * 0.06), type: 'needs', rationale: 'Uber/Ola, Metro pass, fuel and car servicing.' },
        { category: 'Healthcare', amount: Math.round(monthlyIncome * 0.04), type: 'needs', rationale: 'Cult.fit fitness, health insurance top-up and medications.' },
        { category: 'Dining Out', amount: Math.round(monthlyIncome * 0.08), type: 'wants', rationale: 'Swiggy/Zomato orders and weekend cafe visits.' },
        { category: 'Shopping', amount: Math.round(monthlyIncome * 0.06), type: 'wants', rationale: 'Amazon India, Myntra, apparel and electronics.' },
        { category: 'Subscriptions', amount: Math.round(monthlyIncome * 0.02), type: 'wants', rationale: 'Netflix, Spotify, Prime Video and digital tools.' },
        { category: 'Savings & Investments', amount: Math.round(monthlyIncome * 0.30), type: 'savings', rationale: 'Nifty 50 Index Mutual Funds SIP, PPF & emergency liquid FD.' },
        { category: 'Debt Repayment', amount: Math.round(monthlyIncome * 0.05), type: 'needs', rationale: 'Education loan EMI or vehicle loan reduction.' }
      ];
      return res.json({
        totalAllocated: budgetAllocations.reduce((acc, b) => acc + b.amount, 0),
        allocations: budgetAllocations,
        strategyRationale: 'Generated a disciplined Indian household budget envelope optimized for high mutual fund wealth accumulation.'
      });
    }

    const prompt = `You are a certified Indian financial planner (SEBI registered advisor mindset).
Generate a realistic monthly zero-based budget envelope plan in Indian Rupees (₹ / INR) for user Aryan with:
- Monthly Net Take-Home Income: ₹${income}
- Strategy / Philosophy: ${philosophy || 'Balanced 50/30/20'}
- Current Monthly Spending History: ${JSON.stringify(currentSpendingByCategory || {})}

Return a JSON object with:
1. allocations (array of objects):
   - category (string, standard names: "Housing", "Food & Groceries", "Transportation", "Dining Out", "Shopping", "Utilities", "Healthcare", "Subscriptions", "Entertainment", "Savings & Investments", "Debt Repayment")
   - amount (number, monthly allocation limit in INR (₹), rounded to nearest 500 or 1000 rupees)
   - type ("needs" | "wants" | "savings")
   - rationale (string, 1 short sentence justifying why this limit was chosen for an Indian resident)
2. totalAllocated (number, should equal or be within ₹1,000 of the monthly income)
3. strategyRationale (string, 2 sentences explaining how this budget addresses Aryan's goals and wealth creation in India).

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini generate budget error:', error);
    return res.status(500).json({ error: 'Failed to generate budget', details: error.message });
  }
});

// 4. Parse Unstructured Bank Lines or Receipt Text (UPI, SMS, Bank statements)
app.post('/api/gemini/parse-transactions', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'rawText is required' });
    }

    if (!ai) {
      // Fallback simple line parser for Indian SMS / Bank formats
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      const parsed = lines.map((line, idx) => {
        const numMatch = line.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{2})?)/i);
        const amount = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 500;
        const isIncome = /credited|salary|deposit|received|refund/i.test(line);
        let category = 'Other';
        if (/blinkit|zepto|grocery|dmart|d-mart|nature|vegetables|bigbasket/i.test(line)) category = 'Food & Groceries';
        else if (/swiggy|zomato|coffee|blue tokai|starbucks|restaurant|mcdonald|chai/i.test(line)) category = 'Dining Out';
        else if (/uber|ola|rapido|metro|petrol|fuel|shell|hp|indianoil/i.test(line)) category = 'Transportation';
        else if (/netflix|spotify|hotstar|prime|youtube|cult|gym/i.test(line)) category = 'Subscriptions';
        else if (/airtel|jio|electricity|power|gas|bescom|wifi|broadband/i.test(line)) category = 'Utilities';
        else if (/rent|society|maintenance|landlord|hiranandani/i.test(line)) category = 'Housing';
        else if (/zerodha|groww|sip|mutual fund|uti|hdfc mf|nifty/i.test(line)) category = 'Savings & Investments';
        else if (/emi|loan|credit card|hdfc bank|sbi/i.test(line)) category = 'Debt Repayment';

        return {
          id: `tx-${Date.now()}-${idx}`,
          description: line.replace(/(?:₹|rs\.?|inr)?\s*[0-9]+(?:,[0-9]+)*(?:\.[0-9]{2})?/i, '').trim() || 'Transaction',
          amount,
          type: isIncome ? 'income' : 'expense',
          category,
          date: new Date().toISOString().split('T')[0],
          isRecurring: /netflix|spotify|cult|rent|salary|sip|emi/i.test(line)
        };
      });
      return res.json({ transactions: parsed });
    }

    const prompt = `Parse the following raw text (which may be Indian UPI SMS alerts, bank debits/credits, net banking statements, or receipt text) into a clean structured list of transactions in Indian Rupees (₹).
Current year is 2026.
Raw Text:
"""
${rawText}
"""

Return a JSON object with a "transactions" array. Each object must have:
- description: string (clean merchant or transaction name, e.g. "Swiggy", "Blinkit", "Uber", "Zerodha SIP", "D-Mart", "Cult.fit")
- amount: number (positive number in INR / ₹)
- type: 'expense' | 'income'
- category: string (one of: "Housing", "Food & Groceries", "Dining Out", "Transportation", "Utilities", "Healthcare", "Shopping", "Subscriptions", "Entertainment", "Savings & Investments", "Debt Repayment", "Income", "Other")
- date: string (YYYY-MM-DD format, estimate recent date if omitted)
- isRecurring: boolean (true if subscription or regular monthly charge like rent/gym/salary/SIP/EMI)

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{"transactions":[]}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini parse transactions error:', error);
    return res.status(500).json({ error: 'Failed to parse transactions', details: error.message });
  }
});

// Vite Middleware or Static file serving
async function setupApp() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinPilot server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
