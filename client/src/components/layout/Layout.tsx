import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingAssistant } from './FloatingAssistant';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070D1E] font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingAssistant />
    </div>
  );
};
