import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ShieldAlert, GraduationCap, Users, LogOut, CheckCircle2, Lock, Sparkles, Building2, Zap, ArrowRight } from 'lucide-react';

export const AccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    firebaseUser,
    isAuthLoading,
    isAuthorized,
    loginWithGoogle,
    logoutUser,
    currentUser,
    isAutoSignIn,
    toggleAutoSignIn,
    autoSignInAsMaster
  } = useApp();

  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  // 1. If Auto Sign-in is active OR user is authorized with Google credentials, grant instant access!
  if (isAutoSignIn || (firebaseUser && isAuthorized)) {
    return <>{children}</>;
  }

  // 2. Loading screen while Firebase Auth resolves
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#003b5c] p-2 flex items-center justify-center shadow-md animate-pulse">
            <img src="/assets/uenr_logo.jpg" alt="UENR" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#003b5c]">UENR Attendance Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Verifying security credentials...</p>
          </div>
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mt-2"></div>
        </div>
      </div>
    );
  }

  // 3. Not signed in and Auto Sign-in paused: Show login options
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00243a] via-[#003b5c] to-[#005a78] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          
          {/* Header Banner */}
          <div className="bg-[#003b5c] p-6 text-center text-white relative">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-white p-2 shadow-lg mb-3 flex items-center justify-center border-2 border-emerald-400">
              <img
                src="/assets/uenr_logo.jpg"
                alt="UENR Emblem"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#8dc63f] bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40 mb-1">
              Department of Information Technology
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Course Attendance System
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              University of Energy and Natural Resources, Sunyani
            </p>
          </div>

          {/* Body content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Auto Sign-In Option (Bypasses Gmail prompt) */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-500/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Zap className="w-5 h-5 text-emerald-100" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                    Instant Auto Sign-In
                  </h3>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    Launch directly into the portal as <strong>Dr. Jones Darko (HOD)</strong> without selecting or prompting for Gmail.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (rememberDevice) {
                    toggleAutoSignIn(true);
                  }
                  autoSignInAsMaster();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-emerald-200 text-emerald-200" />
                <span>Auto Sign-In as HOD (No Gmail Prompt)</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            </div>

            {/* Auto Sign-in Preference Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Remember this device (Always auto-sign in without asking)
              </span>
            </label>

            {/* Standard Google Auth (Single-click with active Google session) */}
            <div className="pt-1 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Or Sign In with Google
              </p>
              
              <button
                onClick={() => loginWithGoogle(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <div className="bg-white p-1 rounded-md">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <span>Sign In with Active Google Account</span>
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">
              Department of Information Technology · UENR Sunyani Campus
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Signed in with Google, but NOT registered on the Authorized Personnel List
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-200">
          
          <div className="bg-rose-600 p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto flex items-center justify-center mb-3">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold">Access Unauthorized</h2>
            <p className="text-xs text-rose-100 mt-1">
              Restricted to UENR HODs, Lecturers & Class Representatives
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <p className="text-slate-500 font-medium">Logged in account:</p>
              <div className="flex items-center gap-2 font-bold text-slate-800 break-all bg-white p-2 rounded-xl border border-slate-200">
                <span>{firebaseUser.email}</span>
              </div>
              <p className="text-slate-600 leading-relaxed pt-1">
                This email address is not currently listed in the Department of Information Technology authorized registry. Only authorized faculty and appointed class representatives are granted access.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => logoutUser()}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out & Try Another Account</span>
              </button>

              <button
                onClick={() => autoSignInAsMaster()}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Auto Sign-In as Primary HOD</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authorized! Render application
  return <>{children}</>;
};
