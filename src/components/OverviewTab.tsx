import React from 'react';
import { Transaction, BudgetEnvelope, FinancialGoal, UserProfile, SavingsSuggestion } from '../types';
import { calculateTotals, calculateCategoryBreakdown, calculate503020, formatCurrency } from '../utils/finance';
import { CATEGORY_COLORS } from '../data/defaultData';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Zap
} from 'lucide-react';

interface OverviewTabProps {
  profile: UserProfile;
  transactions: Transaction[];
  budgets: BudgetEnvelope[];
  goals: FinancialGoal[];
  suggestions: SavingsSuggestion[];
  onNavigateToTab: (tab: any) => void;
  onOpenAddModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  transactions,
  budgets,
  goals,
  suggestions,
  onNavigateToTab,
  onOpenAddModal,
}) => {
  const { totalExpenses, effectiveIncome, netSavings, savingsRate } = calculateTotals(transactions, profile.monthlyIncome);
  const categoryBreakdown = calculateCategoryBreakdown(transactions);
  const benchmark = calculate503020(budgets, transactions, effectiveIncome);

  const totalMonthlyGoalContributions = goals.reduce((acc, g) => acc + g.monthlyContribution, 0);
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const topSuggestion = suggestions.find(s => !s.implemented) || suggestions[0];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Executive Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Financial Snapshot · October 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {profile.name}’s Financial Velocity
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You are retaining <span className="text-emerald-400 font-semibold font-mono">{formatCurrency(netSavings, profile.currency)}</span> ({savingsRate}% of income) this month.
              {benchmark.needs.percentage > 50
                ? ' Essential needs are slightly higher than the 50% target threshold; reviewing recurring bills could unlock extra cash flow.'
                : ' Your essential expenses are disciplined, positioning you well for aggressive goal payoff.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('coach')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask FinPilot AI</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('budgets')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              <span>Manage Envelopes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Effective Income */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Monthly Income</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(effectiveIncome, profile.currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-medium">100% Inflow</span>
            <span>· Primary base</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Outflow (MTD)</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalExpenses, profile.currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-slate-700 font-medium font-mono">
              {Math.round((totalExpenses / (effectiveIncome || 1)) * 100)}%
            </span>
            <span>of monthly income utilized</span>
          </div>
        </div>

        {/* Net Cash Flow / Surplus */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Net Monthly Surplus</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {formatCurrency(netSavings, profile.currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-medium font-mono">{savingsRate}% savings rate</span>
            <span>· Retained cash</span>
          </div>
        </div>

        {/* Goal Pipeline Allocation */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Committed Goals</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalMonthlyGoalContributions, profile.currency)}/mo
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>{goals.length} active goals tracked</span>
          </div>
        </div>
      </div>

      {/* Middle Section: 50/30/20 Framework & AI Savings Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 50/30/20 Rule Balance Gauge */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">50 / 30 / 20 Budget Health Benchmark</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard gold-standard allocation: 50% Needs, 30% Wants, 20% Wealth & Savings
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('budgets')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <span>Customize</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Unified Visual Bar */}
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 mb-5">
            <div
              style={{ width: `${Math.min(100, benchmark.needs.percentage)}%` }}
              className="bg-indigo-600 transition-all duration-500"
              title={`Needs: ${benchmark.needs.percentage}%`}
            />
            <div
              style={{ width: `${Math.min(100, benchmark.wants.percentage)}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Wants: ${benchmark.wants.percentage}%`}
            />
            <div
              style={{ width: `${Math.min(100, benchmark.savings.percentage)}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Savings: ${benchmark.savings.percentage}%`}
            />
          </div>

          {/* 3 Pillar Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Needs */}
            <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center justify-between font-semibold text-indigo-950 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                  Essential Needs
                </span>
                <span className="font-mono">{benchmark.needs.percentage}%</span>
              </div>
              <p className="text-slate-600 font-mono text-sm font-semibold">
                {formatCurrency(benchmark.needs.amount, profile.currency)}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Target: 50% ({formatCurrency(benchmark.needs.targetAmount, profile.currency)})
              </div>
            </div>

            {/* Wants */}
            <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-100">
              <div className="flex items-center justify-between font-semibold text-amber-950 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Discretionary Wants
                </span>
                <span className="font-mono">{benchmark.wants.percentage}%</span>
              </div>
              <p className="text-slate-600 font-mono text-sm font-semibold">
                {formatCurrency(benchmark.wants.amount, profile.currency)}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Target: 30% ({formatCurrency(benchmark.wants.targetAmount, profile.currency)})
              </div>
            </div>

            {/* Savings & Investments */}
            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center justify-between font-semibold text-emerald-950 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Savings & Wealth
                </span>
                <span className="font-mono">{benchmark.savings.percentage}%</span>
              </div>
              <p className="text-slate-600 font-mono text-sm font-semibold">
                {formatCurrency(benchmark.savings.amount, profile.currency)}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Target: 20% ({formatCurrency(benchmark.savings.targetAmount, profile.currency)})
              </div>
            </div>
          </div>
        </div>

        {/* AI Top Recommendation Spotlight */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Priority Opportunity</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {topSuggestion?.title || 'Audit Recurring Subscriptions'}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {topSuggestion?.actionPlan || 'Identify and cancel redundant memberships to unlock instant monthly surplus.'}
            </p>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Est. Annual Cash Reclaimed</span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  +{formatCurrency(topSuggestion?.annualSavings || 480, profile.currency)}/yr
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Monthly Boost</span>
                <span className="text-sm font-semibold font-mono text-slate-800">
                  +{formatCurrency(topSuggestion?.monthlySavings || 40, profile.currency)}/mo
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigateToTab('advisor')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Explore All Savings Leaks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Category Outflow Distribution & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Spending by Category</h3>
              <p className="text-xs text-slate-500">Distribution of all current month expenses</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {categoryBreakdown.length} categories
            </span>
          </div>

          <div className="space-y-3 mt-3">
            {categoryBreakdown.slice(0, 6).map((item) => {
              const colorInfo = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: colorInfo.fill }}
                      />
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500">{item.percentage}%</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.amount, profile.currency)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: colorInfo.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>View Category Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
                <p className="text-xs text-slate-500">Latest recorded inflows and expenditures</p>
              </div>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                + Add New
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{tx.category}</span>
                        <span>·</span>
                        <span>{tx.date}</span>
                        {tx.isRecurring && (
                          <>
                            <span>·</span>
                            <span className="text-indigo-600 font-medium">Recurring</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      className={`font-mono font-semibold ${
                        isExpense ? 'text-slate-900' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount, profile.currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>View All ({transactions.length}) Transactions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
