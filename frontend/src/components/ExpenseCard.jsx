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

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const { title, amount, category, description, date, _id, id } = expense;
  const expenseId = _id || id;

  const categoryDetails = CATEGORY_MAP[category] || CATEGORY_MAP.Other;
  const Icon = categoryDetails.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return isNaN(dateObj.getTime())
      ? dateStr
      : dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="group relative rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 backdrop-blur-md transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        {/* Category Icon & Titles */}
        <div className="flex items-center gap-3.5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${categoryDetails.color}`}>
            <Icon className="h-5.5 w-5.5" />
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-main)] transition-colors line-clamp-1">
              {title}
            </h4>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)]">
              {category}
            </span>
          </div>
        </div>

        {/* Amount display */}
        <div className="text-right">
          <span className="text-lg font-extrabold text-[var(--accent)]">
            ${amount.toFixed(2)}
          </span>
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-[var(--text-muted)]">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(date)}</span>
          </div>
        </div>
      </div>

      {/* Description text */}
      {description && (
        <p className="mt-4 text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Card Action Row */}
      <div className="mt-5 flex items-center justify-end gap-2 border-t border-[var(--border-color)] pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(expense)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/55 active:scale-90 transition-all"
          title="Edit Transaction"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(expenseId)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-rose-400 hover:border-rose-500/25 active:scale-90 transition-all"
          title="Delete Transaction"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;
