import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import NoteCard from '../components/NoteCard';
import ExpenseForm from '../components/ExpenseForm';
import NoteModal from '../components/NoteModal';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import { getExpenseSummary, createExpense } from '../api/expenses';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Utensils, 
  ShoppingBag, 
  CreditCard, 
  Film, 
  Activity, 
  Car, 
  GraduationCap, 
  MoreHorizontal,
  Sparkles,
  ClipboardList,
  PiggyBank
} from 'lucide-react';

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

const DashboardPage = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    monthlySpending: 0,
    recentTransactions: [],
    totalNotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const budget = Number(localStorage.getItem('noted-monthly-budget')) || 1000;
  
  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const [greeting, setGreeting] = useState('Welcome back');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const notesData = await getNotes();
      setNotes(notesData || []);

      const summaryData = await getExpenseSummary();
      setSummary(summaryData || {
        totalExpenses: 0,
        monthlySpending: 0,
        recentTransactions: [],
        totalNotes: 0,
      });
    } catch (err) {
      console.error('Failed to retrieve dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Note Modal Actions
  const handleEditNoteClick = (note) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (selectedNote) {
        const id = selectedNote._id || selectedNote.id;
        const updated = await updateNote(id, noteData);
        setNotes(notes.map((n) => ((n._id || n.id) === id ? updated : n)));
      } else {
        const created = await createNote(noteData);
        setNotes([created, ...notes]);
      }
      return true;
    } catch (err) {
      console.error('Failed to save note:', err);
      return false;
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter((n) => (n._id || n.id) !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleTogglePin = async (note) => {
    const id = note._id || note.id;
    try {
      const updated = await updateNote(id, {
        ...note,
        pinned: !note.pinned,
      });
      setNotes(notes.map((n) => ((n._id || n.id) === id ? updated : n)));
    } catch (err) {
      console.error('Failed to update pin status:', err);
    }
  };

  // Expense Modal Actions
  const handleSaveExpense = async (expenseData) => {
    try {
      await createExpense(expenseData);
      
      // Re-fetch dashboard summaries
      const summaryData = await getExpenseSummary();
      setSummary(summaryData);
      return true;
    } catch (err) {
      console.error('Failed to record expense:', err);
      return false;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return isNaN(dateObj.getTime())
      ? dateStr
      : dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  };

  return (
    <Layout>
      {/* Greetings Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-6 mb-8 pl-12 lg:pl-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[var(--text-main)] flex items-center gap-2">
            {greeting}, {user?.name || 'Workspace User'}! <Sparkles className="h-6 w-6 text-[var(--accent)] animate-pulse" />
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Here's a quick overview of your secure digital productivity cockpit.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedNote(null);
              setIsNoteModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)] transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 text-[var(--accent)]" />
            <span>New Note</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition-all hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 animate-pulse flex flex-col justify-between">
              <div className="h-4 w-2/3 rounded-lg bg-[var(--border-color)]"></div>
              <div className="h-6 w-1/2 rounded-lg bg-[var(--border-color)]"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Notes */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Workspace Notes</span>
                <h3 className="text-2xl font-black text-[var(--text-main)]">{notes.length}</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Stored documents</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Total Expenses */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Gross Spending</span>
                <h3 className="text-2xl font-black text-[var(--text-main)]">${(summary.totalExpenses || 0).toFixed(2)}</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Lifetime transactions</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <DollarSign className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Monthly Spending */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">This Month's Bill</span>
                <h3 className="text-2xl font-black text-emerald-400">${(summary.monthlySpending || 0).toFixed(2)}</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Current calendar cycle</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calendar className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Monthly Budget Progress */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Monthly Budget Limit</span>
                  <h3 className="text-2xl font-black text-[var(--text-main)]">${budget.toFixed(2)}</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <PiggyBank className="h-5.5 w-5.5" />
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full mt-2">
                <div className="flex items-center justify-between text-[9px] font-extrabold text-[var(--text-muted)] mb-1">
                  <span>{Math.round(((summary.monthlySpending || 0) / budget) * 100)}% Used</span>
                  <span>${(summary.monthlySpending || 0).toFixed(0)} / ${budget.toFixed(0)}</span>
                </div>
                <div className="w-full bg-[var(--bg-main)] rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      ((summary.monthlySpending || 0) / budget) * 100 > 90 
                        ? 'bg-rose-500' 
                        : ((summary.monthlySpending || 0) / budget) * 100 >= 70 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(((summary.monthlySpending || 0) / budget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Split Content: Recent Notes & Recent Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Recent Notes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-[var(--text-main)] text-sm md:text-base">Recent Notes</h3>
                </div>
                <Link 
                  to="/notes" 
                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>View Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {notes.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 border-dashed text-[var(--text-muted)]">
                  <FileText className="h-8 w-8 mb-2 opacity-40" />
                  <span className="text-xs font-medium">No notes available yet.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {notes.slice(0, 2).map((note) => (
                    <NoteCard
                      key={note._id || note.id}
                      note={note}
                      onEdit={handleEditNoteClick}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Recent Transactions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <DollarSign className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-[var(--text-main)] text-sm md:text-base">Recent Transactions</h3>
                </div>
                <Link 
                  to="/expenses" 
                  className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <span>View Ledgers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {(!summary.recentTransactions || summary.recentTransactions.length === 0) ? (
                <div className="h-48 flex flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 border-dashed text-[var(--text-muted)]">
                  <DollarSign className="h-8 w-8 mb-2 opacity-40" />
                  <span className="text-xs font-medium">No transactions recorded yet.</span>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] divide-y divide-[var(--border-color)]/60 overflow-hidden">
                  {summary.recentTransactions.slice(0, 3).map((exp) => {
                    const categoryDetails = CATEGORY_MAP[exp.category] || CATEGORY_MAP.Other;
                    const Icon = categoryDetails.icon;
                    return (
                      <div key={exp._id || exp.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${categoryDetails.color}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[var(--text-main)]">{exp.title}</h4>
                            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{exp.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[var(--accent)]">${exp.amount.toFixed(2)}</span>
                          <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{formatDate(exp.date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Note Creation/Editing Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={selectedNote}
      />

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />
    </Layout>
  );
};

export default DashboardPage;
