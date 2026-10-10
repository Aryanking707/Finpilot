import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types';
import { DEMO_PROFILES } from '../data/defaultData';
import { exportTransactionsToCSV, formatCurrency } from '../utils/finance';
import {
  Wallet,
  Plus,
  Download,
  RotateCcw,
  Sparkles,
  Edit3,
  Check,
  X,
  Users
} from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onLoadPreset: (presetKey: string) => void;
  onOpenAddModal: () => void;
  transactions: Transaction[];
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  setProfile,
  onLoadPreset,
  onOpenAddModal,
  transactions,
  onResetData,
}) => {
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(profile.monthlyIncome.toString());

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tempIncome);
    if (!isNaN(parsed) && parsed > 0) {
      setProfile(prev => ({ ...prev, monthlyIncome: parsed }));
    }
    setIsEditingIncome(false);
  };

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(transactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finpilot_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">FinPilot</h1>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> AI Advisor
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Personal Budgeting & Financial Intelligence System
              </p>
            </div>
          </div>

          {/* Quick Context Controls & Presets */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Demo Persona Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
              <span className="text-slate-500 px-2 flex items-center gap-1 font-medium hidden sm:inline-flex">
                <Users className="w-3.5 h-3.5" /> Profile:
              </span>
              <button
                type="button"
                onClick={() => onLoadPreset('tech_pro')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  profile.name === 'Aryan'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aryan
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset('family')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  profile.name === 'Sharma Family'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Family
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset('grad')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  profile.name === 'Rohan'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rohan (Grad)
              </button>
            </div>

            {/* Income Display & Quick Edit */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1 flex items-center gap-2">
              <span className="text-slate-500 font-medium">Net Income:</span>
              {isEditingIncome ? (
                <form onSubmit={handleSaveIncome} className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempIncome}
                    onChange={(e) => setTempIncome(e.target.value)}
                    className="w-20 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-mono font-medium focus:outline-emerald-500"
                    autoFocus
                  />
                  <button type="submit" className="p-0.5 text-emerald-600 hover:text-emerald-700" title="Save">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingIncome(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempIncome(profile.monthlyIncome.toString());
                    setIsEditingIncome(true);
                  }}
                  className="font-mono font-semibold text-slate-900 flex items-center gap-1 hover:text-emerald-600 transition-colors"
                  title="Click to edit monthly income"
                >
                  {formatCurrency(profile.monthlyIncome, profile.currency)}/mo
                  <Edit3 className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            {/* Export & Reset */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 font-medium"
              title="Download Transactions as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={onResetData}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              title="Reset sample data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Main Action: Add Transaction */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
