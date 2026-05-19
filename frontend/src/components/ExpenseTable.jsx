import React from 'react';
import { Edit2, Trash2, Calendar, ShoppingBag, Utensils, CreditCard, Film, Activity, Car, GraduationCap, MoreHorizontal } from 'lucide-react';

const CATEGORY_MAP = {
  Food: { icon: Utensils, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  Shopping: { icon: ShoppingBag, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  Bills: { icon: CreditCard, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  Entertainment: { icon: Film, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  Health: { icon: Activity, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  Transport: { icon: Car, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  Education: { icon: GraduationCap, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  Other: { icon: MoreHorizontal, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

const ExpenseTable = ({ expenses = [], onEdit, onDelete }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return isNaN(dateObj.getTime())
      ? dateStr
      : dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (expenses.length === 0) {
    return (
      <div className="py-8 text-center text-[var(--text-muted)] font-semibold text-sm">
        No transactions recorded in this view
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
      <table className="w-full border-collapse text-left text-sm text-[var(--text-main)]">
        <thead className="bg-[var(--bg-main)]/45 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)]">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 hidden md:table-cell">Description</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]/60">
          {expenses.map((expense) => {
            const expId = expense._id || expense.id;
            const categoryDetails = CATEGORY_MAP[expense.category] || CATEGORY_MAP.Other;
            const Icon = categoryDetails.icon;

            return (
              <tr key={expId} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                {/* Title */}
                <td className="px-6 py-4.5 font-semibold text-[var(--text-main)]">
                  {expense.title}
                </td>
                
                {/* Category Badge */}
                <td className="px-6 py-4.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold ${categoryDetails.color}`}>
                    <Icon className="h-3 w-3" />
                    {expense.category}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-6 py-4.5 font-bold text-[var(--accent)]">
                  ${expense.amount.toFixed(2)}
                </td>

                {/* Date */}
                <td className="px-6 py-4.5 text-xs text-[var(--text-muted)]">
                  {formatDate(expense.date)}
                </td>

                {/* Description (Hidden on mobile) */}
                <td className="px-6 py-4.5 text-xs text-[var(--text-muted)] max-w-xs truncate hidden md:table-cell">
                  {expense.description || <span className="text-[var(--text-muted)]/60 italic">No description</span>}
                </td>

                {/* Actions */}
                <td className="px-6 py-4.5 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(expense)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]/60 text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/55 transition-all"
                      title="Edit Entry"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(expId)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]/60 text-[var(--text-muted)] hover:text-rose-400 hover:border-rose-500/25 transition-all"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
