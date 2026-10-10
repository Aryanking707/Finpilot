import React, { useState } from 'react';
import { Transaction, CategoryType, UserProfile } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../data/defaultData';
import { formatCurrency } from '../utils/finance';
import {
  Search,
  Filter,
  Trash2,
  Sparkles,
  Receipt,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface TransactionsTabProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onAddBatchTransactions: (txs: Omit<Transaction, 'id'>[]) => void;
  onDeleteTransaction: (id: string) => void;
  profile: UserProfile;
  onOpenAddModal: () => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  onAddBatchTransactions,
  onDeleteTransaction,
  profile,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'expense' | 'income'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // AI Paste Parser state
  const [isParserOpen, setIsParserOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);
  const [parserError, setParserError] = useState<string | null>(null);

  // Filter & Sort logic
  const filtered = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortDirection === 'desc' ? diff : -diff;
    } else {
      const diff = b.amount - a.amount;
      return sortDirection === 'desc' ? diff : -diff;
    }
  });

  const handleAIParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParserError(null);
    setParsedPreview(null);

    try {
      const res = await fetch('/api/gemini/parse-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      if (!res.ok) {
        throw new Error('Failed to parse text with AI');
      }

      const data = await res.json();
      if (data.transactions && Array.isArray(data.transactions)) {
        setParsedPreview(data.transactions);
      } else {
        throw new Error('No valid transactions recognized');
      }
    } catch (err: any) {
      console.error(err);
      setParserError(err.message || 'Error parsing text');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmBatchAdd = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    onAddBatchTransactions(parsedPreview);
    setParsedPreview(null);
    setRawText('');
    setIsParserOpen(false);
  };

  const handleInsertSampleText = () => {
    setRawText(
      `Uber Premier ride to office ₹480 2026-10-09
Blinkit organic milk and vegetables ₹940 2026-10-08
Blue Tokai cold brew coffee ₹280
Swiggy dinner order ₹620
Netflix India 4K monthly subscription ₹649
Freelance UI design milestone ₹35000`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Scanner Collapse */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Expense Ledger & Auto-Categorization</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, filter, or paste raw bank statements for automatic classification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsParserOpen(!isParserOpen)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isParserOpen ? 'Hide AI Text Parser' : 'Smart AI Text Parser'}</span>
              {isParserOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {/* Collapsible AI Text Parser Drawer */}
        {isParserOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-5 rounded-b-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Gemini Raw Statement & Receipt Parser
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Paste unformatted text, SMS notifications, or multi-line bank exports. AI will extract amounts, merchants, dates, and categories.
                </p>
              </div>
              <button
                type="button"
                onClick={handleInsertSampleText}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 underline"
              >
                Insert Sample Text
              </button>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Swiggy ₹650, Blinkit ₹1,240, Shell petrol ₹2,400, Cult.fit ₹1,650..."
              rows={4}
              className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {rawText.length > 0 ? `${rawText.split('\n').filter(Boolean).length} lines ready` : 'Paste lines above'}
              </span>

              <button
                type="button"
                onClick={handleAIParse}
                disabled={isParsing || !rawText.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Analyzing & Categorizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Extract with AI</span>
                  </>
                )}
              </button>
            </div>

            {parserError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {parserError}
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedPreview && parsedPreview.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Parsed {parsedPreview.length} Transactions</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmBatchAdd}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                  >
                    Import All into Ledger
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {parsedPreview.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">{item.description}</span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{item.category}</span>
                          <span>·</span>
                          <span>{item.date}</span>
                          {item.isRecurring && <span className="text-indigo-600">Recurring</span>}
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">
                        {item.type === 'expense' ? '-' : '+'}
                        {formatCurrency(item.amount, profile.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, note, or item..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-emerald-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Type Segmented Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                typeFilter === 'expense' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                typeFilter === 'income' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Income
            </button>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
            <span className="text-slate-500">Sort:</span>
            <button
              type="button"
              onClick={() => {
                if (sortField === 'date') {
                  setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortField('date');
                  setSortDirection('desc');
                }
              }}
              className={`px-1.5 py-0.5 rounded ${sortField === 'date' ? 'font-bold text-slate-900' : 'text-slate-500'}`}
            >
              Date {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                if (sortField === 'amount') {
                  setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortField('amount');
                  setSortDirection('desc');
                }
              }}
              className={`px-1.5 py-0.5 rounded ${sortField === 'amount' ? 'font-bold text-slate-900' : 'text-slate-500'}`}
            >
              Amount {sortField === 'amount' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description / Merchant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No transactions match your filter criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try clearing your search query or add a new transaction.</p>
                  </td>
                </tr>
              ) : (
                sorted.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const color = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{tx.description}</span>
                          {tx.isRecurring && (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                              Recurring
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{tx.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color.text}`}>
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: color.fill }}
                          />
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 capitalize">
                        {tx.type}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                          isExpense ? 'text-slate-900' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, profile.currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-70 group-hover:opacity-100"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-800">{sorted.length}</strong> of{' '}
            <strong className="text-slate-800">{transactions.length}</strong> entries
          </span>
          <span className="font-mono font-medium">
            Net: {formatCurrency(
              sorted.reduce((acc, t) => acc + (t.type === 'expense' ? -t.amount : t.amount), 0),
              profile.currency
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
