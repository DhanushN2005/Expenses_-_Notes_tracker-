import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Palette
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { theme, setTheme, themeList } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] shadow-lg backdrop-blur-md hover:opacity-90 active:scale-95 transition-all"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-45 flex w-64 flex-col border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] p-5 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-gradient)] shadow-lg shadow-[var(--accent)]/25">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-slate-200 bg-clip-text text-transparent">
              Noted.
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-[var(--accent)] uppercase">
              Workspace
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/20 shadow-inner'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] border border-transparent'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Dynamic Theme Selector Panel */}
        <div className="px-2 py-3 border-t border-[var(--border-color)]/60 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
            <Palette className="h-3.5 w-3.5" />
            <span>Workspace Theme</span>
          </div>
          <div className="flex items-center gap-2">
            {themeList.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all active:scale-90 ${
                  theme === t.id
                    ? 'border-[var(--accent)] bg-[var(--accent-glow)] shadow-md shadow-[var(--accent)]/10 scale-105'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]'
                }`}
                title={t.name}
              >
                <div 
                  className="h-4.5 w-4.5 rounded-lg"
                  style={{ backgroundColor: t.primary }}
                />
                {theme === t.id && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[var(--accent)] shadow shadow-[var(--accent)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User Card & Logout bottom section */}
        <div className="border-t border-[var(--border-color)]/60 pt-5 mt-auto space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/20">
              <span className="text-sm font-bold uppercase">{user?.name ? user.name[0] : 'U'}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[var(--text-main)] truncate">{user?.name || 'User'}</span>
              <span className="text-xs text-[var(--text-muted)] truncate">{user?.email || 'user@example.com'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-[var(--border-color)]/60 bg-[var(--bg-card)] px-4 py-3 text-sm font-semibold text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/10 active:scale-[0.98] transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
