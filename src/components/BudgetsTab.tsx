import React, { useState } from 'react';
import { BudgetEnvelope, Transaction, UserProfile, CategoryType } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../data/defaultData';
import { formatCurrency } from '../utils/finance';
import {
  Sparkles,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sliders,
  HelpCircle,
  Plus,
  RefreshCw,
  Edit2
} from 'lucide-react';

interface BudgetsTabProps {
  budgets: BudgetEnvelope[];
  setBudgets: React.Dispatch<React.SetStateAction<BudgetEnvelope[]>>;
  transactions: Transaction[];
  profile: UserProfile;
}

export const BudgetsTab: React.FC<BudgetsTabProps> = ({
  budgets,
  setBudgets,
  transactions,
  profile,
}) => {
  const [strategy, setStrategy] = useState<'balanced' | 'aggressive_savings' | 'debt_snowball' | 'lean_frugal'>('balanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotes, setGenerationNotes] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');

  // Calculate actual spending per category
  const actualSpendingByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      actualSpendingByCategory[t.category] = (actualSpendingByCategory[t.category] || 0) + t.amount;
    });

  const totalAllocated = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const unallocated = profile.monthlyIncome - totalAllocated;

  const handleGenerateAIBudget = async () => {
    setIsGenerating(true);
    setGenerationNotes(null);

    try {
      const res = await fetch('/api/gemini/generate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: profile.monthlyIncome,
          currentSpendingByCategory: actualSpendingByCategory,
          philosophy: strategy,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate budget');

      const data = await res.json();
      if (data.allocations && Array.isArray(data.allocations)) {
        const newEnvelopes: BudgetEnvelope[] = data.allocations.map((a: any, i: number) => ({
          id: `b-gen-${Date.now()}-${i}`,
          category: a.category as CategoryType,
          monthlyLimit: a.amount,
          type: a.type || 'needs',
          rationale: a.rationale,
        }));
        setBudgets(newEnvelopes);
        setGenerationNotes(data.strategyRationale || 'AI budget plan generated successfully.');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLimit = (id: string) => {
    const parsed = parseFloat(tempLimit);
    if (!isNaN(parsed) && parsed >= 0) {
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, monthlyLimit: parsed } : b))
      );
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Envelope Control & Zero-Based Reconciler */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Zero-Based Envelope Budgets</h2>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Monthly Cap System
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Every dollar of your {formatCurrency(profile.monthlyIncome, profile.currency)} income should have an intentional job: needs, wants, or wealth-building.
            </p>
          </div>

          {/* AI Generator Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-emerald-500"
            >
              <option value="balanced">Balanced 50/30/20 Target</option>
              <option value="aggressive_savings">Aggressive Wealth Saver (30%+)</option>
              <option value="debt_snowball">Debt Acceleration Focus</option>
              <option value="lean_frugal">Lean & Frugal Baseline</option>
            </select>

            <button
              type="button"
              onClick={handleGenerateAIBudget}
              disabled={isGenerating}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Synthesizing Optimal Envelopes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Generate AI Budget</span>
                </>
              )}
            </button>
          </div>
        </div>

        {generationNotes && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{generationNotes}</p>
          </div>
        )}

        {/* Zero-Based Reconciliation Summary Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-medium block">Monthly Inflow</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {formatCurrency(profile.monthlyIncome, profile.currency)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-medium block">Total Envelopes Allocated</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {formatCurrency(totalAllocated, profile.currency)}
            </span>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              Math.abs(unallocated) < 50
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : unallocated > 0
                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <span className="text-[11px] font-medium block">
              {unallocated >= 0 ? 'Remaining to Allocate' : 'Over-Allocated Deficit'}
            </span>
            <span className="text-lg font-bold font-mono">
              {unallocated >= 0 ? '+' : ''}
              {formatCurrency(unallocated, profile.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Envelopes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((envelope) => {
          const spent = actualSpendingByCategory[envelope.category] || 0;
          const limit = envelope.monthlyLimit || 1;
          const percentageUsed = Math.round((spent / limit) * 100);
          const isOver = spent > limit;
          const isWarning = percentageUsed >= 80 && !isOver;
          const colorInfo = CATEGORY_COLORS[envelope.category] || CATEGORY_COLORS.Other;

          return (
            <div
              key={envelope.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
                isOver ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: colorInfo.fill }}
                    />
                    <h3 className="font-bold text-slate-900 text-sm">{envelope.category}</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5 block">
                    {envelope.type}
                  </span>
                </div>

                {isOver ? (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    +{percentageUsed - 100}% Over
                  </span>
                ) : isWarning ? (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {percentageUsed}% Used
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {percentageUsed}% Used
                  </span>
                )}
              </div>

              {/* Numbers & Editable Limit */}
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-xs text-slate-500 block">Spent</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    {formatCurrency(spent, profile.currency)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Monthly Limit</span>
                  {editingId === envelope.id ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(e.target.value)}
                        className="w-20 px-1 py-0.5 text-xs font-mono border border-slate-300 rounded focus:outline-emerald-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveLimit(envelope.id)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTempLimit(envelope.monthlyLimit.toString());
                        setEditingId(envelope.id);
                      }}
                      className="font-mono text-base font-semibold text-slate-700 hover:text-emerald-600 flex items-center gap-1 justify-end transition-colors"
                      title="Click to edit envelope limit"
                    >
                      {formatCurrency(envelope.monthlyLimit, profile.currency)}
                      <Edit2 className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Meter */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percentageUsed)}%` }}
                />
              </div>

              {/* Rationale or Notes */}
              {envelope.rationale && (
                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-2">
                  {envelope.rationale}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
