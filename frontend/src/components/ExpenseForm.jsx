import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Food', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Transport', 'Education', 'Other'];

const ExpenseForm = ({ isOpen, onClose, onSave, expense = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || '',
        amount: expense.amount || '',
        category: expense.category || 'Food',
        description: expense.description || '',
        date: expense.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setError('');
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.title.trim()) return setError('Transaction title is required.');
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return setError('Amount must be a positive number greater than 0.');
    }
    if (!formData.date) return setError('Transaction date is required.');

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      
      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
      />

      {/* Form Container */}
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-5">
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            {expense ? 'Modify Expense Transaction' : 'Record New Expense'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/10 bg-rose-500/5 p-3.5 text-xs text-rose-400 mb-5">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Weekly Groceries"
              className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/60 py-3 px-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/60 outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="25.50"
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/60 py-3 px-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/60 outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/60 py-3 px-4 text-sm text-[var(--text-main)] outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] select-none"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/60 py-3 px-4 text-sm text-[var(--text-main)] outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Add more details about the expenditure..."
              className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/60 py-3 px-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/60 outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-5 py-3 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition-all hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="h-4.5 w-4.5" />
              <span>{submitting ? 'Saving...' : 'Save Transaction'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
