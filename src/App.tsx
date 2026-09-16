import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AccessGate } from './components/AccessGate';
import { Home } from './pages/Home';
import { Attendance } from './pages/Attendance';
import { Timetable } from './pages/Timetable';
import { Admin } from './pages/Admin';
import { Reports } from './pages/Reports';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <AccessGate>
      <div className="min-h-screen bg-[#f6fafb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white transition-colors duration-200">
        <Header />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'home' && <Home />}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'timetable' && <Timetable />}
          {activeTab === 'admin' && <Admin />}
          {activeTab === 'reports' && <Reports />}
        </main>
      </div>
    </AccessGate>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
