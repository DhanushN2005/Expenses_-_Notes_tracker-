import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const ExpenseBarChart = ({ expenses = [] }) => {
  const { activeTheme } = useTheme();

  // Helper to group expenses by month
  const getMonthlyData = () => {
    const monthlyGroups = {};

    // Grouping
    expenses.forEach((exp) => {
      if (!exp.date) return;
      
      const dateObj = new Date(exp.date);
      if (isNaN(dateObj.getTime())) return;

      const monthName = dateObj.toLocaleString('default', { month: 'short' });
      const year = dateObj.getFullYear();
      const monthYearKey = `${monthName} ${year}`;
      const sortKey = `${year}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyGroups[monthYearKey]) {
        monthlyGroups[monthYearKey] = {
          month: monthYearKey,
          amount: 0,
          sortKey: sortKey
        };
      }
      monthlyGroups[monthYearKey].amount += exp.amount;
    });

    // Convert to array and sort chronologically
    return Object.values(monthlyGroups)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6); // Limit to last 6 active months
  };

  const data = getMonthlyData();

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-muted)] font-medium text-sm">
        No monthly transaction data available
      </div>
    );
  }

  // Bind active brand colors
  const primaryColor = activeTheme?.primary || '#6366f1';
  const secondaryColor = activeTheme?.accentSecondary || '#a855f7';

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="month" 
            stroke="var(--text-muted)" 
            fontSize={11}
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={11}
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              color: 'var(--text-main)',
              backdropFilter: 'blur(10px)',
            }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Total Spent']}
          />
          <Bar 
            dataKey="amount" 
            fill="url(#colorAmount)" 
            radius={[6, 6, 0, 0]} 
            maxBarSize={40}
          >
            {/* Custom elegant gradient definition matching the workspace theme */}
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.25}/>
              </linearGradient>
            </defs>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBarChart;
