import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary } from '../api/expenses';
import { Plus, LayoutGrid, List, Search, Filter, AlertCircle, TrendingDown, Calendar, RefreshCw, XCircle, Edit2, Check, X, PiggyBank, Download } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalExpenses: 0, monthlySpending: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Date Range states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Customizable budget states
  const [budget, setBudget] = useState(() => {
    return Number(localStorage.getItem('noted-monthly-budget')) || 1000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(String(budget));

  // Custom toast notifications state
  const [alert, setAlert] = useState(null);

  const categories = ['All', 'Food', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Transport', 'Education', 'Other'];

  const fetchExpensesAndSummary = async () => {
    setLoading(true);
    try {
      const expensesData = await getExpenses();
      setExpenses(expensesData || []);
      
      const summaryData = await getExpenseSummary();
      setSummary(summaryData || { totalExpenses: 0, monthlySpending: 0 });
    } catch (err) {
      triggerAlert('error', 'Failed to retrieve expense data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndSummary();
  }, []);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleSaveBudget = () => {
    const val = Number(tempBudget);
    if (isNaN(val) || val <= 0) {
      triggerAlert('error', 'Please enter a valid positive number for your budget.');
      return;
    }
    setBudget(val);
    localStorage.setItem('noted-monthly-budget', String(val));
    setIsEditingBudget(false);
    triggerAlert('success', 'Monthly budget limit updated!');
  };

  const handleCreateClick = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        // Update Transaction
        const id = editingExpense._id || editingExpense.id;
        const updated = await updateExpense(id, expenseData);
        setExpenses(expenses.map((e) => ((e._id || e.id) === id ? updated : e)));
        triggerAlert('success', 'Transaction updated successfully!');
      } else {
        // Create Transaction
        const created = await createExpense(expenseData);
        setExpenses([created, ...expenses]);
        triggerAlert('success', 'Transaction recorded successfully!');
      }
      
      // Refresh totals summary asynchronously
      const summaryData = await getExpenseSummary();
      setSummary(summaryData || { totalExpenses: 0, monthlySpending: 0 });
      return true;
    } catch (err) {
      triggerAlert('error', err.response?.data?.error || 'Failed to save transaction.');
      return false;
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;

    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((e) => (e._id || e.id) !== id));
      triggerAlert('success', 'Transaction record deleted.');
      
      // Refresh totals summary asynchronously
      const summaryData = await getExpenseSummary();
      setSummary(summaryData || { totalExpenses: 0, monthlySpending: 0 });
    } catch (err) {
      triggerAlert('error', 'Failed to delete transaction. Try again.');
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      triggerAlert('error', 'No expenses available to export.');
      return;
    }
    
    // Create CSV content
    const headers = ['Title', 'Amount', 'Category', 'Description', 'Date', 'Created At'];
    const rows = filteredExpenses.map(exp => [
      `"${exp.title.replace(/"/g, '""')}"`,
      exp.amount.toFixed(2),
      `"${exp.category}"`,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
      exp.date,
      new Date(exp.createdAt).toLocaleString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Noted_Expenses_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert('success', 'Expenses exported successfully as CSV!');
  };

  // Filter expenses by search query, category, and date range
  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && (exp.date >= startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && (exp.date <= endDate);
    }
    
    return matchesCategory && matchesSearch && matchesDate;
  });

  return (
    <Layout>
      {/* Floating Custom Toast Alerts */}
      {alert && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 select-none max-w-md border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)]">
          {alert.type === 'success' ? (
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          )}
          <span className="text-xs font-semibold tracking-wide uppercase text-[var(--text-muted)]">
            {alert.type === 'success' ? 'SUCCESS: ' : 'ERROR: '}
          </span>
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-6 mb-8 pl-12 lg:pl-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[var(--text-main)]">
            Expenses Tracker
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Track and categorize your spending habits securely.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] px-4 py-3 text-xs font-bold text-[var(--text-main)] cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all active:scale-[0.98]"
            title="Download CSV report"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Card 1: Total Spent */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Expenditures</span>
            <h3 className="text-3xl font-extrabold text-[var(--accent)]">
              ${(summary.totalExpenses || 0).toFixed(2)}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Current Month Spending */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">This Month's Spending</span>
            <h3 className="text-3xl font-extrabold text-emerald-400">
              ${(summary.monthlySpending || 0).toFixed(2)}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Monthly Budget Progress */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 backdrop-blur-md flex flex-col justify-between sm:col-span-2 lg:col-span-1 min-h-[110px] relative overflow-hidden group">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Monthly Budget Goal</span>
              
              {isEditingBudget ? (
                <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                  <span className="text-sm font-bold text-[var(--text-main)]">$</span>
                  <input
                    type="number"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    className="w-20 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-2 py-0.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveBudget();
                      if (e.key === 'Escape') setIsEditingBudget(false);
                    }}
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleSaveBudget}
                    className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="p-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-2xl font-black text-[var(--text-main)]">
                    ${budget.toFixed(2)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setTempBudget(String(budget));
                      setIsEditingBudget(true);
                    }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all cursor-pointer"
                    title="Set Budget limit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <PiggyBank className="h-5.5 w-5.5" />
            </div>
          </div>

          {/* Progress Bar with Color Coding based on threshold */}
          <div className="mt-3.5 w-full">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-[var(--text-muted)] mb-1">
              <span>{Math.round((summary.monthlySpending / budget) * 100)}% Used</span>
              <span>${summary.monthlySpending.toFixed(0)} / ${budget.toFixed(0)}</span>
            </div>
            
            <div className="w-full bg-[var(--bg-main)] rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  (summary.monthlySpending / budget) * 100 > 90 
                    ? 'bg-rose-500 shadow-md shadow-rose-500/30' 
                    : (summary.monthlySpending / budget) * 100 >= 70 
                      ? 'bg-amber-500 shadow-md shadow-amber-500/30' 
                      : 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                }`}
                style={{ width: `${Math.min((summary.monthlySpending / budget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row: Search & View Toggle */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-muted)]">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 pl-10 pr-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'grid' 
                ? 'bg-[var(--bg-card-hover)] text-[var(--accent)] shadow-md border border-[var(--border-color)]/60' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'table' 
                ? 'bg-[var(--bg-card-hover)] text-[var(--accent)] shadow-md border border-[var(--border-color)]/60' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Date Filters Panel */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-6 bg-[var(--bg-card)]/30 border border-[var(--border-color)]/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-[var(--accent)]" />
          <span>Date Range:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
            title="Start Date"
          />
          <span className="text-xs text-[var(--text-muted)] font-semibold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
            title="End Date"
          />
          
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-xs font-bold cursor-pointer"
            >
              Reset Range
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] mr-2 border-r border-[var(--border-color)] pr-3.5">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Group:</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/30'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-transparent hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Expense Lists Display */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 animate-pulse flex flex-col justify-between">
              <div>
                <div className="h-4 w-2/3 rounded-lg bg-[var(--border-color)]/60"></div>
                <div className="mt-4 h-3 w-5/6 rounded-lg bg-[var(--border-color)]/60"></div>
              </div>
              <div className="h-3 w-1/4 rounded-lg bg-[var(--border-color)]/60"></div>
            </div>
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-[var(--text-muted)] mb-4 border border-[var(--border-color)]">
            <XCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">No transactions found</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] text-center max-w-sm">
            {searchQuery || selectedCategory !== 'All' 
              ? "We couldn't find any transaction matches. Try clearing your filters."
              : "Your transaction registry is empty! Create your first expense using the button above."}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExpenses.map((exp) => (
            <ExpenseCard
              key={exp._id || exp.id}
              expense={exp}
              onEdit={handleEditClick}
              onDelete={handleDeleteExpense}
            />
          ))}
        </div>
      ) : (
        <ExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEditClick}
          onDelete={handleDeleteExpense}
        />
      )}

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
      />
    </Layout>
  );
};

export default Expenses;
