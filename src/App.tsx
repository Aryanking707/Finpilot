import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Transaction,
  BudgetEnvelope,
  FinancialGoal,
  SavingsSuggestion
} from './types';
import { DEMO_PROFILES } from './data/defaultData';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { OverviewTab } from './components/OverviewTab';
import { TransactionsTab } from './components/TransactionsTab';
import { BudgetsTab } from './components/BudgetsTab';
import { InsightsTab } from './components/InsightsTab';
import { SavingsAdvisorTab } from './components/SavingsAdvisorTab';
import { GoalsTab } from './components/GoalsTab';
import { AICoachTab } from './components/AICoachTab';
import { AddTransactionModal } from './components/AddTransactionModal';

const STORAGE_KEYS = {
  PROFILE: 'finpilot_profile_inr_v2',
  TRANSACTIONS: 'finpilot_transactions_inr_v2',
  BUDGETS: 'finpilot_budgets_inr_v2',
  GOALS: 'finpilot_goals_inr_v2',
  SUGGESTIONS: 'finpilot_suggestions_inr_v2',
};

export default function App() {
  // Initialize state with localStorage or defaults
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currency === '₹' && (parsed.name === 'Aryan' || parsed.name)) {
          return parsed;
        }
      }
      return DEMO_PROFILES.tech_pro.profile;
    } catch {
      return DEMO_PROFILES.tech_pro.profile;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : DEMO_PROFILES.tech_pro.transactions;
    } catch {
      return DEMO_PROFILES.tech_pro.transactions;
    }
  });

  const [budgets, setBudgets] = useState<BudgetEnvelope[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return saved ? JSON.parse(saved) : DEMO_PROFILES.tech_pro.budgets;
    } catch {
      return DEMO_PROFILES.tech_pro.budgets;
    }
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : DEMO_PROFILES.tech_pro.goals;
    } catch {
      return DEMO_PROFILES.tech_pro.goals;
    }
  });

  const [suggestions, setSuggestions] = useState<SavingsSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
      return saved ? JSON.parse(saved) : DEMO_PROFILES.tech_pro.suggestions;
    } catch {
      return DEMO_PROFILES.tech_pro.suggestions;
    }
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(suggestions));
  }, [suggestions]);

  // Persona Loader
  const handleLoadPreset = (presetKey: string) => {
    const data = DEMO_PROFILES[presetKey] || DEMO_PROFILES.tech_pro;
    setProfile(data.profile);
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setGoals(data.goals);
    setSuggestions(data.suggestions);
  };

  // Reset to original demo
  const handleResetData = () => {
    handleLoadPreset('tech_pro');
  };

  // Add single transaction
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Add batch transactions (from AI Scanner)
  const handleAddBatchTransactions = (newTxsData: Omit<Transaction, 'id'>[]) => {
    const created: Transaction[] = newTxsData.map((t, idx) => ({
      ...t,
      id: `tx-batch-${Date.now()}-${idx}`,
    }));
    setTransactions((prev) => [...created, ...prev]);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const unresolvedSuggestionsCount = suggestions.filter((s) => !s.implemented).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Application Header */}
      <Header
        profile={profile}
        setProfile={setProfile}
        onLoadPreset={handleLoadPreset}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        transactions={transactions}
        onResetData={handleResetData}
      />

      {/* Primary Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unresolvedSuggestionsCount={unresolvedSuggestionsCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            profile={profile}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            suggestions={suggestions}
            onNavigateToTab={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onAddBatchTransactions={handleAddBatchTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            profile={profile}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsTab
            budgets={budgets}
            setBudgets={setBudgets}
            transactions={transactions}
            profile={profile}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab
            transactions={transactions}
            budgets={budgets}
            profile={profile}
            goals={goals}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'advisor' && (
          <SavingsAdvisorTab
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            profile={profile}
            transactions={transactions}
            goals={goals}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTab
            goals={goals}
            setGoals={setGoals}
            profile={profile}
          />
        )}

        {activeTab === 'coach' && (
          <AICoachTab
            profile={profile}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
          />
        )}
      </main>

      {/* Add Transaction Dialog */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        profile={profile}
      />

      {/* Quiet, Clean Editorial Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">FinPilot AI</span>
            <span>·</span>
            <span>Personal Budgeting & Financial Education Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>·</span>
            <span>Zero-Based Budget Envelope Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
