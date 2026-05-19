import React from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`theme-${theme} min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex transition-colors duration-300`}>
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen w-full overflow-x-hidden">
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
