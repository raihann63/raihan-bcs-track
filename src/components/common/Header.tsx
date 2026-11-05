import React from 'react';
import { usePrep } from '../../context/PrepContext';
import { Play, Pause, Square, Plus, Sparkles, BookOpen } from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

interface HeaderProps {
  onOpenQuickLog: () => void;
  onOpenTimerModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickLog,
  onOpenTimerModal,
  onToggleMobileSidebar,
}) => {
  const {
    currentView,
    timerSeconds,
    isTimerRunning,
    pauseTimer,
    resumeTimer,
    timerSubjectId,
    subjects,
    profile,
  } = usePrep();

  const formatTimerTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeSubject = subjects.find((s) => s.id === timerSubjectId);

  const viewTitles: Record<string, string> = {
    dashboard: 'Preparation Command Center',
    routine: 'Weekly Study Routine (Saturday–Friday)',
    tracker: 'Daily Study Session & Time Tracker',
    subjects: 'Subject Specifications & Page Progress',
    revision: 'Spaced Repetition Engine (1-3-7-15 Days)',
    qbank: 'Assurance Question Bank Chapter Tracker',
    modelTests: 'Model Tests & Diagnostic Score Analysis',
    reports: 'Pace Analysis & Preparation Forecasting',
    settings: 'Configuration, Target Pace & Data Backup',
  };

  return (
    <header className="h-16 px-4 md:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-teal-400">Study Build</span>
            <span aria-hidden="true">/</span>
            <span className="truncate">{profile.examName}</span>
          </div>
          <h1 className="text-sm md:text-base font-bold text-white tracking-tight truncate">
            {viewTitles[currentView] || 'Overview'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Live Study Stopwatch Widget */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {formatTimerTime(timerSeconds)}
          </span>
          {isTimerRunning ? (
            <button
              onClick={pauseTimer}
              title="Pause Timer"
              className="p-1 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              title="Start Timer"
              className="p-1 text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
          <button
            onClick={onOpenTimerModal}
            className="text-[11px] font-medium text-slate-300 hover:text-white border-l border-slate-700/60 pl-2 ml-1"
          >
            {activeSubject ? activeSubject.name.split(' ')[0] : 'Timer'}
          </button>
        </div>

        {/* Quick Log Session Button */}
        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Log Session</span>
          <span className="sm:hidden">Log</span>
        </button>
      </div>
    </header>
  );
};
