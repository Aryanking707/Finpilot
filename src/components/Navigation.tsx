import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  TrendingDown,
  PiggyBank,
  Target,
  Bot
} from 'lucide-react';

export type TabKey = 'overview' | 'transactions' | 'budgets' | 'insights' | 'advisor' | 'goals' | 'coach';

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  unresolvedSuggestionsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unresolvedSuggestionsCount = 0,
}) => {
  const tabs = [
    { key: 'overview', label: 'Cash Flow & Overview', icon: LayoutDashboard },
    { key: 'transactions', label: 'Transactions & Scanner', icon: Receipt },
    { key: 'budgets', label: 'Budget Envelopes', icon: PieChart },
    { key: 'insights', label: 'Patterns & Leaks', icon: TrendingDown },
    {
      key: 'advisor',
      label: 'Savings Advisor & Simulator',
      icon: PiggyBank,
      badge: unresolvedSuggestionsCount > 0 ? unresolvedSuggestionsCount : undefined,
    },
    { key: 'goals', label: 'Financial Goals', icon: Target },
    { key: 'coach', label: 'FinPilot AI Coach', icon: Bot, isAIFeature: true },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-sm ${
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.isAIFeature && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active AI Assistant" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
