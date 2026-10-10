import React, { useState } from 'react';
import { SavingsSuggestion, UserProfile, Transaction, FinancialGoal } from '../types';
import { formatCurrency } from '../utils/finance';
import {
  Sparkles,
  PiggyBank,
  CheckCircle2,
  Sliders,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Compass
} from 'lucide-react';

interface SavingsAdvisorTabProps {
  suggestions: SavingsSuggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<SavingsSuggestion[]>>;
  profile: UserProfile;
  transactions: Transaction[];
  goals: FinancialGoal[];
  onNavigateToTab: (tab: any) => void;
}

export const SavingsAdvisorTab: React.FC<SavingsAdvisorTabProps> = ({
  suggestions,
  setSuggestions,
  profile,
  transactions,
  goals,
  onNavigateToTab,
}) => {
  // What-If Simulator state
  const [diningReduction, setDiningReduction] = useState(25); // percentage
  const [subReduction, setSubReduction] = useState(30);
  const [shoppingReduction, setShoppingReduction] = useState(20);

  // Compound growth widget state
  const [monthlyInvest, setMonthlyInvest] = useState(15000);
  const [investmentYears, setInvestmentYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(12.0);

  // Calculate actual baseline spends for categories
  const diningActual = transactions
    .filter(t => t.type === 'expense' && t.category === 'Dining Out')
    .reduce((s, t) => s + t.amount, 0) || 11000;

  const subActual = transactions
    .filter(t => t.type === 'expense' && (t.category === 'Subscriptions' || t.isRecurring))
    .reduce((s, t) => s + t.amount, 0) || 2800;

  const shoppingActual = transactions
    .filter(t => t.type === 'expense' && t.category === 'Shopping')
    .reduce((s, t) => s + t.amount, 0) || 8500;

  // Reclaimed cash calculations
  const monthlyReclaimed =
    (diningActual * (diningReduction / 100)) +
    (subActual * (subReduction / 100)) +
    (shoppingActual * (shoppingReduction / 100));

  const annualReclaimed = monthlyReclaimed * 12;

  // 5-year future value at 7% compound growth: FV = P * [((1 + r)^n - 1) / r]
  const monthlyRate = 0.07 / 12;
  const months5Yr = 60;
  const fiveYearFutureValue = monthlyReclaimed > 0
    ? monthlyReclaimed * ((Math.pow(1 + monthlyRate, months5Yr) - 1) / monthlyRate)
    : 0;

  // Toggle suggestion implemented
  const toggleImplemented = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, implemented: !s.implemented } : s))
    );
  };

  const implementedSuggestions = suggestions.filter(s => s.implemented);
  const totalReclaimedFromImplemented = implementedSuggestions.reduce((acc, s) => acc + s.monthlySavings, 0);

  // Compound wealth calculation
  const totalMonths = investmentYears * 12;
  const r = (annualRate / 100) / 12;
  const totalFutureValue = monthlyInvest > 0 && r > 0
    ? monthlyInvest * ((Math.pow(1 + r, totalMonths) - 1) / r)
    : monthlyInvest * totalMonths;
  const totalPrincipal = monthlyInvest * totalMonths;
  const totalInterestGained = Math.max(0, totalFutureValue - totalPrincipal);

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Savings Suggestions & What-If Engine</h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Actionable Leak Plugs
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Concrete high-impact recommendations to trim low-utility expenditures and compound wealth.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-right">
            <span className="text-[11px] text-emerald-800 font-medium block">Implemented Monthly Surplus</span>
            <span className="text-lg font-bold font-mono text-emerald-700">
              +{formatCurrency(totalReclaimedFromImplemented, profile.currency)}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Interactive What-If Spending Simulator */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-sm border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Interactive Spending Scenario Simulator</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              What if you trim discretionary spending this month?
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Adjust the sliders below to see immediate monthly cash flow, 1-year cash, and 5-year investment compounding.
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Dining Out Slider */}
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Dining Out & Takeout</span>
              <span className="font-mono text-emerald-400 font-bold">-{diningReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={diningReduction}
              onChange={(e) => setDiningReduction(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Baseline: {formatCurrency(diningActual, profile.currency)}</span>
              <span className="text-emerald-400">
                Saves: +{formatCurrency(diningActual * (diningReduction / 100), profile.currency)}/mo
              </span>
            </div>
          </div>

          {/* Subscriptions Slider */}
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Subscriptions & Tools</span>
              <span className="font-mono text-emerald-400 font-bold">-{subReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={subReduction}
              onChange={(e) => setSubReduction(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Baseline: {formatCurrency(subActual, profile.currency)}</span>
              <span className="text-emerald-400">
                Saves: +{formatCurrency(subActual * (subReduction / 100), profile.currency)}/mo
              </span>
            </div>
          </div>

          {/* Shopping Slider */}
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Shopping & Personal</span>
              <span className="font-mono text-emerald-400 font-bold">-{shoppingReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={shoppingReduction}
              onChange={(e) => setShoppingReduction(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Baseline: {formatCurrency(shoppingActual, profile.currency)}</span>
              <span className="text-emerald-400">
                Saves: +{formatCurrency(shoppingActual * (shoppingReduction / 100), profile.currency)}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Live Simulation Results */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">Monthly Cash Reclaimed</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              +{formatCurrency(monthlyReclaimed, profile.currency)}/mo
            </span>
            <span className="text-[10px] text-slate-400 block">Immediate surplus in checking</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">1-Year Direct Savings</span>
            <span className="text-2xl font-bold font-mono text-white">
              +{formatCurrency(annualReclaimed, profile.currency)}/yr
            </span>
            <span className="text-[10px] text-slate-400 block">Unlocks emergency fund milestone</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">5-Year Compound Value (7% APY)</span>
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {formatCurrency(fiveYearFutureValue, profile.currency)}
            </span>
            <span className="text-[10px] text-slate-400 block">Invested into broad index fund</span>
          </div>
        </div>
      </div>

      {/* Suggested Actions List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Curated AI Leak Fixes</h3>
            <p className="text-xs text-slate-500">Ranked by effort vs monthly financial return</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {implementedSuggestions.length} of {suggestions.length} implemented
          </span>
        </div>

        <div className="space-y-3">
          {suggestions.map((sug) => {
            return (
              <div
                key={sug.id}
                className={`p-4 rounded-xl border transition-all ${
                  sug.implemented
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{sug.title}</h4>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {sug.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          sug.difficulty === 'easy'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sug.difficulty} effort
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sug.actionPlan}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-emerald-600 block">
                        +{formatCurrency(sug.monthlySavings, profile.currency)}/mo
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({formatCurrency(sug.annualSavings, profile.currency)}/yr)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleImplemented(sug.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        sug.implemented
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{sug.implemented ? 'Implemented' : 'Mark Fixed'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compound Growth & Wealth Simulator */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Compound Wealth Projection Engine</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate regular monthly contributions into high-yield accounts or diversified index funds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Monthly Contribution</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(monthlyInvest, profile.currency)}/mo</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={monthlyInvest}
                onChange={(e) => setMonthlyInvest(parseInt(e.target.value, 10))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Time Horizon</span>
                <span className="font-mono font-bold text-slate-900">{investmentYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(parseInt(e.target.value, 10))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Expected Annual Return</span>
                <span className="font-mono font-bold text-slate-900">{annualRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="18.0"
                step="0.5"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                Typical: 7.1% (PPF / Senior FD) · 12.0% (Nifty 50 Index SIP) · 14.5% (Flexi-Cap / Active Equity)
              </span>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                Total Projected Portfolio Value
              </span>
              <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
                {formatCurrency(totalFutureValue, profile.currency)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/70 text-xs">
              <div>
                <span className="text-slate-500 block">Your Principal Invested</span>
                <span className="font-mono font-bold text-slate-800 text-base">
                  {formatCurrency(totalPrincipal, profile.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Compound Interest Earned</span>
                <span className="font-mono font-bold text-emerald-600 text-base">
                  +{formatCurrency(totalInterestGained, profile.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
