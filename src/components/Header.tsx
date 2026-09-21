import React, { useState } from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Users,
  BarChart3,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  Clock,
  Cloud,
  RefreshCw,
  LogOut,
  CheckCircle2,
  GraduationCap,
  Building2,
  KeyRound,
  WifiOff,
  Smartphone,
  Sun,
  Moon,
  Laptop,
  Zap,
  ChevronDown,
  X,
  LogIn,
  Check
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openDatabaseTab,
    currentUser,
    setCurrentUser,
    isRoleMenuOpen,
    setIsRoleMenuOpen,
    resetToDefaults,
    firebaseUser,
    loginWithGoogle,
    isCloudConnected,
    isSyncing,
    isOnline,
    isPoorConnection,
    offlineCacheInfo,
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
    logoutUser,
    switchAccount,
    isAutoSignIn,
    toggleAutoSignIn,
    clearAllStudents
  } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'admin', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'hod':
        return { label: 'HOD', title: 'Head of Department', bg: 'bg-purple-950/80 text-purple-300 border-purple-400/40', initial: 'H' };
      case 'class_rep':
        return { label: 'Class Rep', title: 'Class Representative', bg: 'bg-blue-950/80 text-blue-300 border-blue-400/40', initial: 'C' };
      case 'lecturer':
      default:
        return { label: 'Lecturer', title: 'Course Lecturer', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40', initial: 'L' };
    }
  };

  const currentRoleMeta = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-50 bg-[#003b5c] text-white shadow-md border-b border-[#002840]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & School Title */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none group cursor-pointer min-w-0"
          >
            <div className="relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-white p-1 shadow-sm border border-emerald-500/30 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/uenr_logo.jpg"
                alt="UENR Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-lg md:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors truncate">
                UENR Attendance
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate hidden xs:inline sm:inline">
                Faculty & Class Rep Portal
              </span>
            </div>
          </button>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#007c82] text-white shadow-sm ring-1 ring-white/20'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Profile Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Network & Cloud Status Indicator */}
            {!isOnline ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/25 border border-amber-400/50 text-[11px] font-bold text-amber-200"
                title="Device is offline. Showing locally saved timetable and data."
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                <span>Offline (Cached)</span>
              </div>
            ) : isPoorConnection ? (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/40 text-[11px] font-semibold text-sky-200"
                title="Poor connection detected. High-speed local cache active."
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden md:inline">Slow Net (Cached)</span>
              </div>
            ) : (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/25 border border-white/15 text-[11px] font-medium text-slate-200"
                title={isCloudConnected ? "Cloud sync active" : "Connecting to database"}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : isCloudConnected ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden md:inline">
                  {isSyncing ? 'Syncing...' : isCloudConnected ? 'Cloud Active' : 'Connecting'}
                </span>
              </div>
            )}

            {/* Today's Date Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-medium text-slate-200 border border-white/15">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{todayStr}</span>
            </div>

            {/* Global Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/25 hover:bg-black/40 border border-white/15 text-slate-200 hover:text-amber-300 transition-all duration-200 cursor-pointer relative group"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode for low-light environment"}
              aria-label="Toggle light and dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-sky-200 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>

            {/* User Profile & Role Settings - Always Visible on Mobile and Desktop */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#006b78] hover:bg-[#007c82] active:bg-[#005761] text-white text-xs font-medium border border-teal-400/40 transition-colors shadow-sm cursor-pointer"
                title="Switch active role and account options"
                aria-label="Switch active role and account options"
                aria-expanded={isRoleMenuOpen}
              >
                <div className="relative flex-shrink-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-emerald-400"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-400/30 text-emerald-200 flex items-center justify-center font-black text-xs border border-emerald-400/30">
                      {currentRoleMeta.initial}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#003b5c] bg-emerald-400" />
                </div>

                {/* Mobile View: Prominent Role Badge + Down Chevron */}
                <div className="flex md:hidden items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border shadow-xs ${currentRoleMeta.bg}`}>
                    {currentRoleMeta.label}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Desktop View: Name, Role Badge + Down Chevron */}
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-xs leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase tracking-wider ${currentRoleMeta.bg}`}>
                      {currentRoleMeta.label}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-emerald-300 transition-transform duration-200 ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {isRoleMenuOpen && (
                <>
                  {/* Backdrop overlay on mobile/desktop */}
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity"
                    onClick={() => setIsRoleMenuOpen(false)}
                  />

                  {/* Responsive Role & Account Menu Modal/Dropdown */}
                  <div
                    className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-88 max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2.5 text-slate-800 dark:text-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Top Header Bar with Close Button */}
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Role & Account Options
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRoleMenuOpen(false)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* User Profile Info */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-base">
                          {currentUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </p>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${currentRoleMeta.bg}`}>
                            {currentRoleMeta.title}
                          </span>
                          {firebaseUser ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              • Google Connected
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                              • Local Session
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Role Switcher */}
                    <div className="py-2.5 px-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="px-1 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Switch Active Role</span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Tap to change</span>
                      </div>
                      
                      <div className="space-y-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUser((prev) => ({ ...prev, role: 'hod' }));
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            currentUser.role === 'hod'
                              ? 'border-purple-500/60 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold ring-1 ring-purple-400/40'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">Head of Department (HOD)</div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Full admin, staff whitelist, roster control</p>
                            </div>
                          </div>
                          {currentUser.role === 'hod' && (
                            <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUser((prev) => ({ ...prev, role: 'lecturer' }));
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            currentUser.role === 'lecturer'
                              ? 'border-teal-500/60 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold ring-1 ring-teal-400/40'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">Lecturer Mode</div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Mark roll calls, enroll biometrics, view reports</p>
                            </div>
                          </div>
                          {currentUser.role === 'lecturer' && (
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUser((prev) => ({ ...prev, role: 'class_rep' }));
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            currentUser.role === 'class_rep'
                              ? 'border-blue-500/60 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold ring-1 ring-blue-400/40'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">Class Representative Mode</div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">In-class attendance assistance</p>
                            </div>
                          </div>
                          {currentUser.role === 'class_rep' && (
                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Theme Preference Segmented Toggle */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Theme / Low-Light Mode</span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                          {theme} {isDarkMode ? '(Dark)' : '(Light)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            theme === 'light'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Light</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            theme === 'dark'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-sky-400" />
                          <span>Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('system')}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            theme === 'system'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Laptop className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                          <span>System</span>
                        </button>
                      </div>
                    </div>

                    {/* Auto Sign-In Configuration */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-4 h-4 ${isAutoSignIn ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Auto Sign-In</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {isAutoSignIn ? 'Active (No Gmail prompt on start)' : 'Paused (Will ask for login)'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleAutoSignIn()}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isAutoSignIn
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isAutoSignIn ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>

                    {/* Management Shortcuts */}
                    <div className="border-t border-slate-100 dark:border-slate-800 py-1.5">
                      <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Management Shortcuts
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          setIsRoleMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Manage Authorized Staff & Class Reps</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to clear all students from the class roster?')) {
                            clearAllStudents();
                            setIsRoleMenuOpen(false);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Clear All Students in Class</span>
                      </button>
                    </div>

                    {/* Account Actions */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
                      {firebaseUser ? (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsRoleMenuOpen(false);
                              await switchAccount();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left font-semibold cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                            <span>Switch Google Account</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              setIsRoleMenuOpen(false);
                              await logoutUser();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left font-bold cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out of Portal</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsRoleMenuOpen(false);
                              await loginWithGoogle(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-left font-bold cursor-pointer"
                          >
                            <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span>Sign in with Google Account</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsRoleMenuOpen(false);
                              resetToDefaults();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 text-slate-500" />
                            <span>Reset Session Defaults</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
