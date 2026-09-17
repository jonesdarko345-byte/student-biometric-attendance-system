import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, Lock, FileText, X, CheckCircle2, AlertCircle, Building2, User } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-colors pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            
            {/* Brand, Copyright, and Author */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-2 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#003b5c] text-[#8dc63f] flex items-center justify-center font-black text-[11px] shadow-xs">
                  U
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  UENR Course Attendance System
                </span>
              </div>
              
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
              
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                &copy; {currentYear} All rights reserved. Developed by{' '}
                <span className="font-semibold text-[#007c82] dark:text-teal-400">
                  Dr. Jones Darko
                </span>
              </p>
            </div>

            {/* Department, Compliance, and Security Badges */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-[#007c82] dark:text-teal-400" />
                IT Department
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                75% Rule Compliant
              </span>

              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 transition-colors cursor-pointer"
                title="View Software License & Ownership Agreement"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Enterprise License
              </button>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <Lock className="w-3 h-3" />
                Cloud Secured
              </span>
            </div>

          </div>

          {/* Institutional & Legal Disclaimer */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
            <p>
              Official course management & biometric attendance portal for the University of Energy and Natural Resources (UENR).
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                className="hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Terms & Licensing
              </button>
              <span>·</span>
              <span className="font-mono text-[10px]">
                v2.6 Enterprise · 2026/2027
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* SOFTWARE LICENSE & OWNERSHIP MODAL */}
      {showLicenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Verified Active License
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Proprietary Commercial
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Software License & Intellectual Property
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  UENR Course Attendance & Biometric Academic Governance System
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              
              {/* Licensor & Licensee Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block flex items-center gap-1">
                    <User className="w-3 h-3 text-[#007c82]" />
                    Author & Proprietary Licensor
                  </span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Dr. Jones Darko
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Department of Information Technology
                  </p>
                  <p className="text-[#007c82] dark:text-teal-400 font-mono text-[11px]">
                    jonesdarko345@gmail.com
                  </p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    Authorized Institutional Licensee
                  </span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    UENR (IT Department)
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    University of Energy and Natural Resources
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                    Coverage: 2026/2027 Academic Year
                  </p>
                </div>
              </div>

              {/* License Scope */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  1. Permitted Scope of Use
                </h4>
                <p>
                  The Licensor grants the authorized department a non-exclusive right to utilize this software for recording course roll calls, verifying biometric student presence, enforcing the 75% attendance threshold for semester examination qualification, and generating compliance audit records.
                </p>
              </div>

              {/* Proprietary Ownership & Protection */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-amber-600" />
                  2. Intellectual Property & Commercial Restrictions
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>
                    <strong>All Rights Reserved:</strong> All source code, interfaces, algorithms, and design assets remain the exclusive intellectual property of <strong>Dr. Jones Darko</strong>.
                  </li>
                  <li>
                    <strong>No Redistribution or Resale:</strong> The software may not be copied, modified, reverse-engineered, sublicensed, or redistributed to third parties without prior written consent from the author.
                  </li>
                  <li>
                    <strong>Institutional Expansion:</strong> Deploying this platform to other university faculties, schools, or external institutions requires an official commercial service agreement with the Licensor.
                  </li>
                </ul>
              </div>

              {/* Data Privacy */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/50 flex items-start gap-2.5 text-teal-900 dark:text-teal-200 text-[11px]">
                <AlertCircle className="w-4 h-4 text-[#007c82] shrink-0 mt-0.5" />
                <p>
                  <strong>Institutional Data Protection:</strong> All student attendance logs and biometric verification records are stored securely in cloud-backed persistence under strict departmental audit controls.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                Document: LICENSE.md (Repository Root)
              </span>

              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="px-5 py-2 rounded-xl bg-[#003b5c] hover:bg-[#002d47] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close Agreement
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
