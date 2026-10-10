export type CategoryType =
  | 'Housing'
  | 'Food & Groceries'
  | 'Dining Out'
  | 'Transportation'
  | 'Utilities'
  | 'Healthcare'
  | 'Shopping'
  | 'Subscriptions'
  | 'Entertainment'
  | 'Savings & Investments'
  | 'Debt Repayment'
  | 'Income'
  | 'Other';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: CategoryType;
  type: 'expense' | 'income';
  date: string; // YYYY-MM-DD
  isRecurring?: boolean;
  merchant?: string;
  notes?: string;
  tags?: string[];
}

export interface BudgetEnvelope {
  id: string;
  category: CategoryType;
  monthlyLimit: number;
  type: 'needs' | 'wants' | 'savings';
  rationale?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string; // YYYY-MM
  category: 'emergency' | 'debt' | 'lifestyle' | 'investment';
  icon?: string;
}

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  currency: string;
  budgetStrategy: 'balanced' | 'aggressive_savings' | 'debt_snowball' | 'lean_frugal';
  profilePreset?: string;
}

export interface SavingsSuggestion {
  id: string;
  title: string;
  category: string;
  monthlySavings: number;
  annualSavings: number;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  actionPlan: string;
  implemented?: boolean;
}

export interface BenchmarkComparison {
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  idealRatio: string;
}

export interface SpendingAnalysisReport {
  summary: string;
  keyPatterns: string[];
  savingsSuggestions: SavingsSuggestion[];
  spendingLeakAlerts: string[];
  benchmarkComparison: BenchmarkComparison;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
