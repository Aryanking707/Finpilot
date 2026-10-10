import React, { useState } from 'react';
import { Transaction, CategoryType, UserProfile } from '../types';
import { CATEGORIES } from '../data/defaultData';
import { Sparkles, X, Check } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  profile: UserProfile;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  profile,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Food & Groceries');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Smart auto-categorization when description changes
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);
    const lower = val.toLowerCase();

    if (/rent|mortgage|apartment|landlord|society|maintenance/i.test(lower)) {
      setCategory('Housing');
    } else if (/blinkit|zepto|dmart|d-mart|grocer|market|bigbasket|nature|instamart/i.test(lower)) {
      setCategory('Food & Groceries');
    } else if (/swiggy|zomato|coffee|blue tokai|starbucks|restaurant|bar|pizza|biryani|chai/i.test(lower)) {
      setCategory('Dining Out');
    } else if (/uber|ola|rapido|metro|petrol|fuel|shell|hp|indianoil/i.test(lower)) {
      setCategory('Transportation');
    } else if (/electric|power|bescom|gas|water|wifi|broadband|airtel|jio/i.test(lower)) {
      setCategory('Utilities');
    } else if (/netflix|spotify|hotstar|prime|youtube|cult\.fit|cult|gym/i.test(lower)) {
      setCategory('Subscriptions');
      setIsRecurring(true);
    } else if (/myntra|amazon|flipkart|zara|uniqlo|clothing|shoes|croma/i.test(lower)) {
      setCategory('Shopping');
    } else if (/cult|pharmacy|1mg|apollo|hospital|doctor|health/i.test(lower)) {
      setCategory('Healthcare');
    } else if (/zerodha|groww|sip|mutual fund|nifty|uti|ppf|fd/i.test(lower)) {
      setCategory('Savings & Investments');
    } else if (/emi|loan|credit card|sbi|hdfc loan/i.test(lower)) {
      setCategory('Debt Repayment');
    } else if (/salary|paycheck|payroll|deposit|client|bonus|credited/i.test(lower)) {
      setCategory('Income');
      setType('income');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      description: description.trim(),
      amount: parsedAmount,
      category,
      type,
      date,
      isRecurring,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Record Transaction</h3>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Auto-Tags
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Segmented toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                type === 'expense' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Expense (- Outflow)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Income');
              }}
              className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                type === 'income' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Income (+ Inflow)
            </button>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Merchant or Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy, Blinkit, Uber, Cult.fit, D-Mart..."
              value={description}
              onChange={handleDescriptionChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500 font-medium"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount ({profile.currency})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="42.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-medium focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-emerald-500"
            >
              {type === 'income' ? (
                <option value="Income">Income</option>
              ) : (
                CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isRecurring" className="text-slate-700 font-medium cursor-pointer">
              Mark as Recurring (Subscription / Monthly bill / Regular paycheck)
            </label>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Split with partner, work reimbursement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
