import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { Fingerprint, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface BiometricEnrollmentProps {
  student: Student;
  onBack: () => void;
}

const FINGER_OPTIONS = [
  { id: 'Left Thumb', hand: 'Left', name: 'Thumb' },
  { id: 'Left Index', hand: 'Left', name: 'Index' },
  { id: 'Left Middle', hand: 'Left', name: 'Middle' },
  { id: 'Left Ring', hand: 'Left', name: 'Ring' },
  { id: 'Left Pinky', hand: 'Left', name: 'Pinky' },
  { id: 'Right Thumb', hand: 'Right', name: 'Thumb' },
  { id: 'Right Index', hand: 'Right', name: 'Index' },
  { id: 'Right Middle', hand: 'Right', name: 'Middle' },
  { id: 'Right Ring', hand: 'Right', name: 'Ring' },
  { id: 'Right Pinky', hand: 'Right', name: 'Pinky' },
];

export const BiometricEnrollment: React.FC<BiometricEnrollmentProps> = ({ student, onBack }) => {
  const { enrollStudentFingers } = useApp();
  const [selectedFinger, setSelectedFinger] = useState<string>('Right Index');
  const [enrolledFingers, setEnrolledFingers] = useState<string[]>(student.enrolledFingers || []);
  const [scanStep, setScanStep] = useState<number>(0); // 0 = idle, 1 = scan 1, 2 = scan 2, 3 = complete
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleStartEnrollment = (fingerName: string) => {
    setSelectedFinger(fingerName);
    setScanStep(1);
    setIsScanning(true);
    setStatusMessage('Place finger on biometric scanner...');

    // Simulate Step 1 capture
    setTimeout(() => {
      setScanStep(2);
      setStatusMessage('Lift finger and place again to verify ridges...');

      // Simulate Step 2 capture
      setTimeout(() => {
        setScanStep(3);
        setIsScanning(false);
        setStatusMessage('Biometric template generated (Quality: 98.4%)');

        const updated = Array.from(new Set([...enrolledFingers, fingerName]));
        setEnrolledFingers(updated);
        enrollStudentFingers(student.id, updated);
      }, 1600);
    }, 1600);
  };

  const handleRemoveFinger = (fingerName: string) => {
    const updated = enrolledFingers.filter((f) => f !== fingerName);
    setEnrolledFingers(updated);
    enrollStudentFingers(student.id, updated);
    if (selectedFinger === fingerName) {
      setScanStep(0);
      setStatusMessage('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#007c82] dark:text-teal-400 hover:text-[#005c61] bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Student List
      </button>

      {/* Main Enrollment Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003b5c] to-[#006b78] p-6 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Biometric Authentication Service
            </div>
            <h2 className="text-2xl font-bold mt-1">Fingerprint Enrollment</h2>
            <p className="text-slate-200 text-sm mt-1">
              Enroll fingerprints for <strong className="text-white underline">{student.name}</strong> ({student.indexNumber}) to enable biometric attendance marking.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-slate-300">Enrolled Count</span>
            <span className="text-2xl font-black text-emerald-400">{enrolledFingers.length}/10</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tip Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 flex items-center gap-3 text-sm text-emerald-800 dark:text-emerald-300">
            <span className="text-lg">💡</span>
            <div>
              <span className="font-bold">Recommendation:</span> Enroll at least 2 fingers (e.g. Right Thumb and Right Index) per student for optimal scanning reliability and backup in lecture halls.
            </div>
          </div>

          {/* Hand / Finger Selection */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              1. Select Finger to Enroll
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Hand */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Left Hand
                </span>
                <div className="space-y-1.5">
                  {FINGER_OPTIONS.filter((f) => f.hand === 'Left').map((f) => {
                    const isEnrolled = enrolledFingers.includes(f.id);
                    const isCurrent = selectedFinger === f.id;
                    return (
                      <div
                        key={f.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                          isCurrent
                            ? 'bg-teal-100/70 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Fingerprint className={`w-4 h-4 ${isEnrolled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                          {f.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {isEnrolled ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Enrolled
                              </span>
                              <button
                                onClick={() => handleRemoveFinger(f.id)}
                                className="text-xs text-rose-500 hover:text-rose-700 underline font-medium cursor-pointer"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEnrollment(f.id)}
                              disabled={isScanning}
                              className="px-2.5 py-1 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-md border border-teal-200 dark:border-teal-800 cursor-pointer disabled:opacity-50"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Hand */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Right Hand
                </span>
                <div className="space-y-1.5">
                  {FINGER_OPTIONS.filter((f) => f.hand === 'Right').map((f) => {
                    const isEnrolled = enrolledFingers.includes(f.id);
                    const isCurrent = selectedFinger === f.id;
                    return (
                      <div
                        key={f.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                          isCurrent
                            ? 'bg-teal-100/70 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Fingerprint className={`w-4 h-4 ${isEnrolled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                          {f.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {isEnrolled ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Enrolled
                              </span>
                              <button
                                onClick={() => handleRemoveFinger(f.id)}
                                className="text-xs text-rose-500 hover:text-rose-700 underline font-medium cursor-pointer"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEnrollment(f.id)}
                              disabled={isScanning}
                              className="px-2.5 py-1 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-md border border-teal-200 dark:border-teal-800 cursor-pointer disabled:opacity-50"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Scanner Simulation Chamber */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
            <div className="absolute top-3 left-4 text-xs font-mono text-emerald-400/80">
              OPTICAL SENSOR · SECUGEN / DIGITALPERSONA COMPLIANT
            </div>
            
            <div className="my-4 relative">
              {/* Pulsing ring during scan */}
              {isScanning && (
                <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
              )}

              <div
                className={`w-28 h-28 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                  isScanning
                    ? 'bg-teal-950/80 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                    : scanStep === 3
                    ? 'bg-emerald-950/80 border-emerald-500'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                <Fingerprint
                  className={`w-16 h-16 transition-colors duration-300 ${
                    isScanning
                      ? 'text-emerald-400 animate-pulse'
                      : scanStep === 3
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Live feedback message */}
            <div className="space-y-1">
              <div className="text-base font-bold text-white">
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    {statusMessage}
                  </span>
                ) : scanStep === 3 ? (
                  <span className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    {selectedFinger} Successfully Enrolled!
                  </span>
                ) : (
                  <span>Select any finger above to start enrollment</span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {scanStep === 3
                  ? 'Biometric vector registered into student identification registry'
                  : 'Requires active optical scanner sensor contact'}
              </p>
            </div>

            {/* Step badges */}
            <div className="flex items-center gap-3 mt-4 text-xs">
              <div
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  scanStep >= 1 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-slate-800 text-slate-500'
                }`}
              >
                <span>1</span> Scan 1
              </div>
              <div className="w-4 h-0.5 bg-slate-700" />
              <div
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  scanStep >= 2 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-slate-800 text-slate-500'
                }`}
              >
                <span>2</span> Verification
              </div>
              <div className="w-4 h-0.5 bg-slate-700" />
              <div
                className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  scanStep === 3 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                }`}
              >
                <span>3</span> Complete
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2 text-sm font-bold text-white bg-[#007c82] hover:bg-[#00666b] rounded-lg shadow-sm cursor-pointer"
            >
              Done & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
