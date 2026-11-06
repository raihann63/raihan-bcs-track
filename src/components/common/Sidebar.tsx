import React from 'react';
import { usePrep } from '../../context/PrepContext';
import { AppView } from '../../types';
import {
  LayoutDashboard,
  CalendarRange,
  Clock,
  BookOpen,
  RefreshCw,
  CheckSquare,
  Award,
  TrendingUp,
  Settings,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { currentView, setCurrentView, subjects, profile } = usePrep();

  const navItems: { view: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { view: 'routine', label: 'Weekly Routine', icon: <CalendarRange className="w-4 h-4" /> },
    { view: 'tracker', label: 'Daily Tracker', icon: <Clock className="w-4 h-4" /> },
    {
      view: 'subjects',
      label: 'Subjects & Syllabus',
      icon: <BookOpen className="w-4 h-4" />,
      badge: subjects.some((s) => s.totalPages === null) ? 'Config' : undefined,
    },
    { view: 'revision', label: 'Revision Tracker', icon: <RefreshCw className="w-4 h-4" /> },
    { view: 'qbank', label: 'Question Bank', icon: <CheckSquare className="w-4 h-4" /> },
    { view: 'modelTests', label: 'Model Tests', icon: <Award className="w-4 h-4" /> },
    { view: 'reports', label: 'Reports & Pace', icon: <TrendingUp className="w-4 h-4" /> },
    { view: 'settings', label: 'Settings & Data', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    onCloseMobile();
  };

    // TODO: নিজের BCS Preliminary পরীক্ষার তারিখ বসান
  const EXAM_DATE = new Date('2027-03-01');
  const daysLeft = Math.max(
    0,
    Math.ceil((EXAM_DATE.getTime() - Date.now()) / 86400000)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Wordmark */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
                B
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">
                  RAIHAN BCS TRACKER
                </div>
                <div className="text-[10px] text-teal-400 font-medium">4-Month Sprint · 14h/Day</div>
              </div>
            </div>
          </div>

                    {/* Target Card */}
          <div className="px-4 py-3.5 mx-3 my-3 bg-linear-to-br from-slate-900 to-teal-950/30 border border-slate-800/80 rounded-xl">
            <div className="text-[10px] font-mono tracking-widest text-slate-500">MY TARGET</div>
            <div className="mt-1">
              <span className="text-2xl font-extrabold text-teal-400 tracking-tight">ASP</span>
              <div className="text-[11px] text-slate-400">Assistant Superintendent of Police</div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-slate-500">Merit Goal</div>
                <div className="font-mono font-bold text-white tabular-nums">Top 100</div>
              </div>
              <div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Daily
                </div>
                <div className="font-mono font-bold text-teal-400 tabular-nums">
                  {profile.dailyHourTarget}h
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] italic text-slate-500 leading-snug">
              "Uniform earned, not given."
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-teal-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500">
          <div className="flex justify-between items-center font-mono">
            <span>Uttoron + Assurance</span>
            <span className="text-teal-500/80 font-bold">Offline Sync</span>
          </div>
        </div>
      </aside>
    </>
  );
};
