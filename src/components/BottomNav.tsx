import React from 'react';
import { LayoutDashboard, CalendarCheck, CalendarDays, Users, BarChart3 } from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'admin', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.45)] transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-md md:max-w-2xl mx-auto px-2 py-1.5 flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 min-h-[52px] group cursor-pointer ${
                isActive
                  ? 'text-[#007c82] dark:text-teal-300 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Active Indicator Background Pill */}
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/70 scale-105 shadow-xs'
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#007c82] dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] leading-tight tracking-tight mt-0.5 whitespace-nowrap transition-colors ${
                  isActive ? 'font-black text-[#007c82] dark:text-teal-300' : 'font-medium'
                }`}
              >
                {item.label}
              </span>

              {/* Active tiny top indicator dot */}
              {isActive && (
                <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-[#007c82] dark:bg-teal-300 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
