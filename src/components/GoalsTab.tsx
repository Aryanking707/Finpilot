import React, { useState } from 'react';
import { FinancialGoal, UserProfile } from '../types';
import { calculateGoalProjection, formatCurrency } from '../utils/finance';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Plane,
  Home,
  Trash2
} from 'lucide-react';

interface GoalsTabProps {
  goals: FinancialGoal[];
  setGoals: React.Dispatch<React.SetStateAction<FinancialGoal[]>>;
  profile: UserProfile;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({ goals, setGoals, profile }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newMonthly, setNewMonthly] = useState('');
  const [newDate, setNewDate] = useState('2027-12');
  const [newCategory, setNewCategory] = useState<'emergency' | 'debt' | 'lifestyle' | 'investment'>('emergency');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget) return;

    const targetAmount = parseFloat(newTarget);
    const currentAmount = parseFloat(newCurrent) || 0;
    const monthlyContribution = parseFloat(newMonthly) || 100;

    const newGoal: FinancialGoal = {
      id: `g-${Date.now()}`,
      title: newTitle.trim(),
      targetAmount,
      currentAmount,
      monthlyContribution,
      targetDate: newDate,
      category: newCategory,
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewTitle('');
    setNewTarget('');
    setNewCurrent('');
    setNewMonthly('');
    setIsAddModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleQuickAddContribution = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return ShieldCheck;
      case 'investment':
        return Home;
      case 'lifestyle':
        return Plane;
      case 'debt':
        return TrendingUp;
      default:
        return Target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Financial Milestones & Goals</h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Wealth Roadmap
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Track emergency cushions, debt payoff deadlines, and lifestyle targets with dynamic runway projections.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => {
          const projection = calculateGoalProjection(goal);
          const Icon = getCategoryIcon(goal.category);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{goal.title}</h3>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {goal.category} Milestone · Target: {goal.targetDate}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Remove goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(goal.currentAmount, profile.currency)}
                    </span>
                    <span className="font-mono text-slate-500">
                      of {formatCurrency(goal.targetAmount, profile.currency)} ({projection.progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${projection.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Metrics detail */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Monthly Inflow</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatCurrency(goal.monthlyContribution, profile.currency)}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Est. Completion</span>
                    <span className="font-semibold text-slate-800">
                      {projection.monthsRemaining} months left
                    </span>
                  </div>
                </div>
              </div>

              {/* Status pill & Quick add funds */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {projection.onTrack ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    On Track for Target
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Behind target by {projection.monthsRemaining - projection.monthsUntilTarget} mo
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAddContribution(goal.id, 2000)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded transition-colors"
                  >
                    +₹2k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddContribution(goal.id, 5000)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded transition-colors"
                  >
                    +₹5k
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">New Financial Goal</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Emergency Liquid Fund"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Amount ({profile.currency})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="500000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Current Saved ({profile.currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="150000"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Monthly Contribution ({profile.currency})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="20000"
                    value={newMonthly}
                    onChange={(e) => setNewMonthly(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Month</label>
                  <input
                    type="month"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-500"
                >
                  <option value="emergency">Emergency Safety Fund</option>
                  <option value="investment">Major Asset / House Down Payment</option>
                  <option value="debt">Debt Elimination</option>
                  <option value="lifestyle">Lifestyle & Travel</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
