import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ExpensePieChart from '../charts/ExpensePieChart';
import ExpenseBarChart from '../charts/ExpenseBarChart';
import { getExpenses, getCategorySummary } from '../api/expenses';
import { TrendingUp, PieChart as PieIcon, BarChart2, DollarSign, Wallet, ShieldAlert, Sparkles } from 'lucide-react';

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Set budget state
  const [budget] = useState(() => {
    return Number(localStorage.getItem('noted-monthly-budget')) || 1000;
  });

  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    highest: { name: 'None', value: 0 },
    count: 0,
  });

  const calculateStats = (expensesList, categorySummary) => {
    const count = expensesList.length;
    if (count === 0) {
      setStats({ total: 0, average: 0, highest: { name: 'None', value: 0 }, count: 0 });
      return;
    }

    const total = expensesList.reduce((acc, curr) => acc + curr.amount, 0);
    const average = total / count;

    let highest = { name: 'None', value: 0 };
    if (categorySummary && categorySummary.length > 0) {
      const sorted = [...categorySummary].sort((a, b) => b.value - a.value);
      highest = {
        name: sorted[0]?.name || 'None',
        value: sorted[0]?.value || 0
      };
    }

    setStats({ total, average, highest, count });
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const expensesList = await getExpenses();
      const catData = await getCategorySummary();
      
      setExpenses(expensesList || []);
      setCategoryData(catData || []);
      
      calculateStats(expensesList || [], catData || []);
    } catch (err) {
      console.error('Failed to load analytical metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <Layout>
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-6 mb-8 pl-12 lg:pl-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[var(--text-main)]">
            Financial Insights
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Gain deep, dynamic analytic understanding of your monthly spending.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent"></div>
            <span className="text-sm font-semibold text-[var(--text-muted)]">Compiling financial metrics...</span>
          </div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-[var(--text-muted)] mb-4 border border-[var(--border-color)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">No data for analytics</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] text-center max-w-sm">
            Record a few transactions under the Expenses tab to unlock insights and graphical breakdowns.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1: Total Spending */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Gross Spending</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50/10 text-indigo-400 border border-indigo-200/20">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--text-main)]">${stats.total.toFixed(2)}</h3>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Accumulated across lifetime workspace</p>
            </div>

            {/* Stat 2: Average Size */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Average Transaction</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50/10 text-emerald-400 border border-emerald-200/20">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--text-main)]">${stats.average.toFixed(2)}</h3>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Average spent per singular entry</p>
            </div>

            {/* Stat 3: Highest Sector */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Largest Category</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50/10 text-violet-400 border border-violet-200/20">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--text-main)] truncate">{stats.highest.name}</h3>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Totaling ${stats.highest.value.toFixed(2)} spent</p>
            </div>

            {/* Stat 4: Transaction Count */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Transaction Volume</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50/10 text-pink-400 border border-pink-200/20">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--text-main)]">{stats.count} entries</h3>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Total volume in dataset</p>
            </div>
          </div>

          {/* Graphics Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Category Breakdown (Pie) */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-4 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50/10 text-indigo-400 border border-indigo-200/20">
                  <PieIcon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)]">Category Allocations</h3>
              </div>
              <ExpensePieChart data={categoryData} />
            </div>

            {/* Monthly Trend (Bar) */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-4 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-5/10 text-emerald-400 border border-emerald-200/20">
                  <BarChart2 className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)]">Monthly Spending Trends</h3>
              </div>
              <ExpenseBarChart expenses={expenses} />
            </div>

          </div>

          {/* Smart Insights Panel */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform duration-500 group-hover:scale-110">
              <Sparkles className="h-28 w-28 text-[var(--accent)]" />
            </div>
            
            <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-4 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-main)]">Smart Financial Advisory</h3>
                <p className="text-[10px] text-[var(--text-muted)]">AI-powered personal wealth coaching and spending observations.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Insight 1: Budget Health */}
              <div className="flex gap-3 items-start">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  (stats.total > budget) 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : (stats.total > budget * 0.8) 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">Workspace Budget Status</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {stats.total > budget 
                      ? `Alert: Your gross spending ($${stats.total.toFixed(2)}) has exceeded your set monthly budget goal ($${budget.toFixed(2)}) by $${(stats.total - budget).toFixed(2)}. We advise freezing non-essential transactions immediately.`
                      : stats.total > budget * 0.8
                        ? `Warning: You have used ${Math.round((stats.total / budget) * 100)}% of your monthly budget limit ($${budget.toFixed(2)}). You only have $${(budget - stats.total).toFixed(2)} remaining before hitting your threshold.`
                        : `Healthy: Your budget utilisation is in excellent shape! You've used only ${Math.round((stats.total / budget) * 100)}% ($${stats.total.toFixed(2)}) of your total $${budget.toFixed(2)} monthly spending limit.`
                    }
                  </p>
                </div>
              </div>

              {/* Insight 2: Category observation */}
              {stats.highest.name !== 'None' && (
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)]">Major Expenditure Outlet</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Your single largest spending sector is <span className="font-extrabold text-[var(--accent)] uppercase">{stats.highest.name}</span>, draining <span className="font-bold text-[var(--text-main)]">${stats.highest.value.toFixed(2)}</span>. This accounts for <span className="font-bold text-[var(--text-main)]">{Math.round((stats.highest.value / stats.total) * 100)}%</span> of your total expenditure.
                    </p>
                  </div>
                </div>
              )}

              {/* Insight 3: Dynamic Coaching Advice */}
              <div className="flex gap-3 items-start">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)]">Tailored Financial Guidance</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 italic">
                    {stats.highest.name === 'Food' && "💡 Tip: Food spending is your top outlet. Preparing meals at home or packing lunch can save you up to $250/month! Consider drafting a weekly grocery checklist to control impulse snack purchases."}
                    {stats.highest.name === 'Shopping' && "💡 Tip: Shopping purchases are driving up your bills. Apply the '30-Day Rule' to discretionary items: wait 30 days before buying to see if the urge subsides!"}
                    {stats.highest.name === 'Entertainment' && "💡 Tip: Entertainment costs are high. Search your local area for free community concerts, galleries, parks, or movie nights, and review your digital media subscription audits."}
                    {stats.highest.name === 'Bills' && "💡 Tip: Your recurring bills are substantial. Spend 30 minutes researching competitor utility packages, cell contracts, and insurance rates, or negotiate downgrades on unused recurring subscription tiers."}
                    {(stats.highest.name === 'Other' || stats.highest.name === 'None') && "💡 Tip: Keep categorizing your expenses to refine your financial dashboard insights. Set up minor automated weekly transfers into a locked savings deposit to build an emergency fund."}
                    {stats.highest.name !== 'Food' && stats.highest.name !== 'Shopping' && stats.highest.name !== 'Entertainment' && stats.highest.name !== 'Bills' && stats.highest.name !== 'Other' && stats.highest.name !== 'None' && `💡 Tip: Spending in ${stats.highest.name} is leading. We suggest reviewing these entries to ensure they are high-utility necessities rather than impulse buys.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
};

export default Analytics;
