import { Transaction, BudgetEnvelope, FinancialGoal, CategoryType } from '../types';

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${currency}${formatted}`;
}

export function formatCompactCurrency(amount: number, currency: string = '₹'): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absAmount >= 10000000) {
    return `${sign}${currency}${(absAmount / 10000000).toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) {
    return `${sign}${currency}${(absAmount / 100000).toFixed(1)} Lakh`;
  }
  if (absAmount >= 1000) {
    return `${sign}${currency}${(absAmount / 1000).toFixed(1)}k`;
  }
  return `${sign}${currency}${Math.round(absAmount)}`;
}

export function calculateTotals(transactions: Transaction[], monthlyIncome: number) {
  const currentMonthTransactions = transactions.filter(t => {
    // defaults to all expenses in current scope
    return true;
  });

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const loggedIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const effectiveIncome = loggedIncome > 0 ? loggedIncome : monthlyIncome;
  const netSavings = Math.max(0, effectiveIncome - totalExpenses);
  const savingsRate = effectiveIncome > 0 ? Math.round((netSavings / effectiveIncome) * 100) : 0;

  return {
    totalExpenses,
    effectiveIncome,
    netSavings,
    savingsRate,
  };
}

export function calculateCategoryBreakdown(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};

  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const totalExpenseSum = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category as CategoryType,
      amount,
      percentage: totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function calculate503020(budgets: BudgetEnvelope[], transactions: Transaction[], income: number) {
  const needsCategories = new Set(budgets.filter(b => b.type === 'needs').map(b => b.category));
  const wantsCategories = new Set(budgets.filter(b => b.type === 'wants').map(b => b.category));
  const savingsCategories = new Set(budgets.filter(b => b.type === 'savings').map(b => b.category));

  // Fallback category mapping if budgets are incomplete
  const defaultNeeds = new Set(['Housing', 'Food & Groceries', 'Transportation', 'Utilities', 'Healthcare', 'Debt Repayment']);
  const defaultWants = new Set(['Dining Out', 'Shopping', 'Subscriptions', 'Entertainment', 'Other']);
  const defaultSavings = new Set(['Savings & Investments']);

  let actualNeeds = 0;
  let actualWants = 0;
  let actualSavings = 0;

  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (savingsCategories.has(t.category) || defaultSavings.has(t.category)) {
      actualSavings += t.amount;
    } else if (needsCategories.has(t.category) || (defaultNeeds.has(t.category) && !wantsCategories.has(t.category))) {
      actualNeeds += t.amount;
    } else {
      actualWants += t.amount;
    }
  });

  const total = income > 0 ? income : (actualNeeds + actualWants + actualSavings);
  return {
    needs: {
      amount: actualNeeds,
      percentage: total > 0 ? Math.round((actualNeeds / total) * 100) : 0,
      targetPercentage: 50,
      targetAmount: total * 0.5,
    },
    wants: {
      amount: actualWants,
      percentage: total > 0 ? Math.round((actualWants / total) * 100) : 0,
      targetPercentage: 30,
      targetAmount: total * 0.3,
    },
    savings: {
      amount: actualSavings,
      percentage: total > 0 ? Math.round((actualSavings / total) * 100) : 0,
      targetPercentage: 20,
      targetAmount: total * 0.2,
    },
  };
}

export function detectRecurringSubscriptions(transactions: Transaction[]) {
  // Finds transactions tagged as isRecurring or in Subscriptions category or recognized services
  const subscriptionMerchants = [
    'netflix', 'spotify', 'hotstar', 'disney', 'amazon prime', 'prime',
    'youtube', 'cult.fit', 'cult', 'swiggy one', 'zomato gold', 'blinkit',
    'zepto', 'gym', 'gymnasium', 'times prime', 'chatgpt', 'github', 'icloud', 'apple', 'airtel', 'jio'
  ];

  return transactions.filter(t => {
    if (t.type !== 'expense') return false;
    if (t.isRecurring) return true;
    if (t.category === 'Subscriptions') return true;
    const lower = t.description.toLowerCase();
    return subscriptionMerchants.some(m => lower.includes(m));
  });
}

export function detectSpendingAnomalies(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return [];

  // Group by category to find average and flag > 2x average or > ₹6,000 in discretionary
  const categoryAmounts: Record<string, number[]> = {};
  expenses.forEach(t => {
    if (!categoryAmounts[t.category]) categoryAmounts[t.category] = [];
    categoryAmounts[t.category].push(t.amount);
  });

  const anomalies: { transaction: Transaction; reason: string }[] = [];

  expenses.forEach(t => {
    const list = categoryAmounts[t.category];
    const avg = list.reduce((a, b) => a + b, 0) / list.length;

    if (t.amount > 6000 && (t.category === 'Dining Out' || t.category === 'Shopping' || t.category === 'Entertainment')) {
      anomalies.push({
        transaction: t,
        reason: `Large discretionary purchase (₹${t.amount.toLocaleString('en-IN')}) exceeds typical envelope thresholds.`,
      });
    } else if (list.length >= 3 && t.amount > avg * 2.2 && t.amount > 2000) {
      anomalies.push({
        transaction: t,
        reason: `Higher than normal for ${t.category} (Category Average: ₹${Math.round(avg).toLocaleString('en-IN')}).`,
      });
    }
  });

  return anomalies;
}

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recurring', 'Notes'];
  const rows = transactions.map(t => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    t.type,
    t.amount.toFixed(2),
    t.isRecurring ? 'Yes' : 'No',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function calculateGoalProjection(goal: FinancialGoal) {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const monthly = goal.monthlyContribution > 0 ? goal.monthlyContribution : 100;
  const monthsRemaining = Math.ceil(remaining / monthly);

  const targetDateObj = new Date(goal.targetDate);
  const now = new Date();
  const monthsUntilTarget = Math.max(1, (targetDateObj.getFullYear() - now.getFullYear()) * 12 + (targetDateObj.getMonth() - now.getMonth()));

  const onTrack = monthsRemaining <= monthsUntilTarget;
  const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

  return {
    remaining,
    monthsRemaining,
    monthsUntilTarget,
    onTrack,
    progressPercentage,
  };
}
