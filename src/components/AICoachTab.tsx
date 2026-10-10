import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile, Transaction, BudgetEnvelope, FinancialGoal } from '../types';
import { calculateTotals, calculateCategoryBreakdown, formatCurrency } from '../utils/finance';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface AICoachTabProps {
  profile: UserProfile;
  transactions: Transaction[];
  budgets: BudgetEnvelope[];
  goals: FinancialGoal[];
}

export const AICoachTab: React.FC<AICoachTabProps> = ({
  profile,
  transactions,
  budgets,
  goals,
}) => {
  const { totalExpenses, effectiveIncome, netSavings, savingsRate } = calculateTotals(transactions, profile.monthlyIncome);
  const categoryBreakdown = calculateCategoryBreakdown(transactions);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      role: 'model',
      content: `Hello ${profile.name}! I am FinPilot, your AI personal financial advisor.

I have full visibility into your live numbers:
• **Monthly Income:** ${formatCurrency(effectiveIncome, profile.currency)}
• **Current Outflow:** ${formatCurrency(totalExpenses, profile.currency)}
• **Net Surplus:** ${formatCurrency(netSavings, profile.currency)}/mo (${savingsRate}% savings rate)
• **Active Goals:** ${goals.length} tracked

How can I help you optimize your wealth today? You can ask me scenario questions like *"Can I afford a $1,200 trip in July?"*, request a debt payoff plan, or ask for tailored ways to trim your biggest spending categories.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'Can I afford a ₹65,000 vacation trip in 3 months?',
    'Where did most of my money go and how can I cut ₹8,000/month?',
    'Create a 6-month plan to save ₹1,50,000 without feeling deprived.',
    'Should I prepay my education loan or step up my Mutual Fund SIPs?',
    'What would my emergency runway be if my income stopped tomorrow?',
    'How should I allocate my monthly investments between Nifty 50, Flexi-Cap, and PPF/FD?'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    // Build rich financial snapshot payload for server
    const financialContext = {
      profileName: profile.name,
      monthlyIncome: effectiveIncome,
      monthlyExpenses: totalExpenses,
      netSurplus: netSavings,
      savingsRate: `${savingsRate}%`,
      topCategories: categoryBreakdown.slice(0, 5),
      budgets: budgets.map(b => ({ category: b.category, limit: b.monthlyLimit, type: b.type })),
      goals: goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount, monthly: g.monthlyContribution })),
    };

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          financialContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Advisor response failed');
      }

      const data = await res.json();
      const modelReply: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: data.reply || 'I analyzed your query, but could not generate a response. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelReply]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: `I encountered an issue communicating with the financial advisory server. Based on your current surplus of **${formatCurrency(netSavings, profile.currency)}/mo**, your fundamentals remain healthy. Please try asking again shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        role: 'model',
        content: `Chat session refreshed. What financial goal or budgeting decision would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to format model messages with simple markdown-like elements (bold, bullets)
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Process bold tags **bold**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{renderedLine}</span>
              </div>
            );
          }

          return <p key={idx}>{renderedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-190px)] min-h-[550px] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Top Advisor Header & Snapshot Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">FinPilot Advisor</h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Live Data Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Analyzing: {formatCurrency(effectiveIncome, profile.currency)} Income · {formatCurrency(totalExpenses, profile.currency)} Outflows · {savingsRate}% Savings Rate
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-4 shadow-2xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                }`}
              >
                {isUser ? (
                  <p className="text-xs sm:text-sm font-medium">{msg.content}</p>
                ) : (
                  renderMessageContent(msg.content)
                )}
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 flex items-center gap-2 text-xs text-slate-500 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>FinPilot is analyzing cash flow calculations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 text-[11px] font-semibold">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Try:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask FinPilot any financial, budgeting, or savings question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
