import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const ExpensePieChart = ({ data = [] }) => {
  const { activeTheme } = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-muted)] font-medium text-sm">
        No expense data available for charts
      </div>
    );
  }

  // Generate dynamic, elegant color sequences based on the active theme's primary brand color
  const baseColor = activeTheme?.primary || '#6366f1';
  
  // Custom shades tailored to harmonize with each base theme
  const getThemePalette = (primary) => {
    switch (activeTheme?.id) {
      case 'dark-indigo':
        return ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#3b82f6', '#06b6d4', '#64748b'];
      case 'dark-emerald':
        return ['#10b981', '#059669', '#047857', '#06b6d4', '#0891b2', '#0e7490', '#34d399', '#64748b'];
      case 'dark-rose':
        return ['#f43f5e', '#e11d48', '#be123c', '#ec4899', '#d946ef', '#a855f7', '#fb7185', '#64748b'];
      case 'light-modern':
        return ['#3b82f6', '#2563eb', '#1d4ed8', '#06b6d4', '#0891b2', '#a855f7', '#60a5fa', '#94a3b8'];
      default:
        return [primary, '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#3b82f6', '#06b6d4', '#64748b'];
    }
  };

  const palette = getThemePalette(baseColor);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold tracking-wider"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={90}
            innerRadius={45} // Turned into a beautiful Donut Chart for ultra premium aesthetic
            paddingAngle={3}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={palette[index % palette.length]} 
                stroke="var(--bg-card)" 
                strokeWidth={2}
                className="outline-none transition-all duration-300 hover:opacity-90"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              color: 'var(--text-main)',
              backdropFilter: 'blur(10px)',
            }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
