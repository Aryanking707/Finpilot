import React, { useState } from 'react';
import { Transaction, BudgetEnvelope, UserProfile, FinancialGoal, SpendingAnalysisReport } from '../types';
import {
  detectRecurringSubscriptions,
  detectSpendingAnomalies,
  calculateTotals,
  calculateCategoryBreakdown,
  formatCurrency
} from '../utils/finance';
import {
  Sparkles,
  TrendingDown,
  AlertCircle,
  Repeat,
  CheckCircle,
  Loader2,
  Calendar,
  Check,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface InsightsTabProps {
  transactions: Transaction[];
  budgets: BudgetEnvelope[];
  profile: UserProfile;
  goals: FinancialGoal[];
  onNavigateToTab: (tab: any) => void;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  transactions,
  budgets,
  profile,
  goals,
  onNavigateToTab,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<SpendingAnalysisReport | null>(null);
  const [reviewedSubscriptions, setReviewedSubscriptions] = useState<Record<string, boolean>>({});

  const subscriptions = detectRecurringSubscriptions(transactions);
  const anomalies = detectSpendingAnomalies(transactions);
  const { totalExpenses, effectiveIncome, netSavings } = calculateTotals(transactions, profile.monthlyIncome);
  const categoryBreakdown = calculateCategoryBreakdown(transactions);

  const totalMonthlySubscriptions = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialData: {
            profile,
            totalIncome: effectiveIncome,
            totalExpenses,
            netSavings,
            categories: categoryBreakdown,
            recurringSubscriptionsCount: subscriptions.length,
            subscriptionsMonthlySum: totalMonthlySubscriptions,
            goals: goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })),
          },
        }),
      });

      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      setAiReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSubscriptionReviewed = (id: string) => {
    setReviewedSubscriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Analysis CTA */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Spending Patterns & Financial Leaks</h2>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                Pattern Recognition
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Automatic auditing of recurring digital subscriptions, impulse spending spikes, and discretionary outflows.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Running Gemini Deep Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analyze Spending Patterns</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic AI Executive Report if available */}
        {aiReport && (
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Executive Synthesis</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{aiReport.summary}</p>
            </div>

            {aiReport.keyPatterns && aiReport.keyPatterns.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Detected Behavioural Habits & Trends</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {aiReport.keyPatterns.map((pat, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 leading-relaxed">
                      • {pat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subscription Audit & Leak Detection Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Recurring Subscriptions & Services Audit</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified {subscriptions.length} recurring charges costing{' '}
              <strong className="text-slate-800 font-mono">
                {formatCurrency(totalMonthlySubscriptions, profile.currency)}/mo
              </strong>{' '}
              ({formatCurrency(totalMonthlySubscriptions * 12, profile.currency)}/year).
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('advisor')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>Simulate Cutting Unused</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Service / Merchant</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Monthly Cost</th>
                <th className="py-2.5 px-3">Annual Drain</th>
                <th className="py-2.5 px-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No recurring subscriptions detected.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const isReviewed = reviewedSubscriptions[sub.id];
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {sub.description}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {sub.category}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                        {formatCurrency(sub.amount, profile.currency)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {formatCurrency(sub.amount * 12, profile.currency)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleSubscriptionReviewed(sub.id)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                            isReviewed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isReviewed ? '✓ Verified Essential' : 'Mark Reviewed'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomalies & Spending Outliers Grid */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">Spending Anomalies & Spikes Detected</h3>
        </div>
        <p className="text-xs text-slate-500">
          Unusual charges exceeding typical baseline envelopes or high single-transaction spikes.
        </p>

        {anomalies.length === 0 ? (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>No abnormal spikes or extreme outliers detected in recent transactions. Spending is stable.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {anomalies.map((anom, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-amber-950">
                  <span>{anom.transaction.description}</span>
                  <span className="font-mono text-amber-900 font-bold">
                    {formatCurrency(anom.transaction.amount, profile.currency)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{anom.transaction.category}</span>
                  <span>·</span>
                  <span>{anom.transaction.date}</span>
                </div>
                <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                  {anom.reason}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
