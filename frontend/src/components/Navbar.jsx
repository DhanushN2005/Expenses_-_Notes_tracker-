import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, Search, User } from 'lucide-react';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand/Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/10">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-slate-200 bg-clip-text text-transparent">
            Noted.
          </span>
        </div>

        {/* Search Bar - only on desktop or large screens */}
        <div className="hidden md:flex relative max-w-md w-full mx-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, content, or category..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900/40 py-1 pl-1.5 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">
              {user?.name || 'My Account'}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-0 sm:px-3.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100 active:scale-95"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
