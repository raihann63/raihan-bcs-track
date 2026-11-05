import React, { useState } from 'react';
import { usePrep } from '../../context/PrepContext';
import { StudySession } from '../../types';
import { getTodayDateString, formatDateDisplay } from '../../utils/dateUtils';
import { ProgressBar } from '../common/ProgressBar';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

interface DailyTrackerViewProps {
  onOpenNewSessionModal: (date?: string) => void;
  onEditSession: (session: StudySession) => void;
}

export const DailyTrackerView: React.FC<DailyTrackerViewProps> = ({
  onOpenNewSessionModal,
  onEditSession,
}) => {
  const { sessions, deleteStudySession, subjects, profile } = usePrep();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Filter sessions for selected date
  const dateSessions = sessions.filter((s) => s.date === selectedDate);

  // Daily aggregates
  const dayTotalMinutes = dateSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const dayHours = (dayTotalMinutes / 60).toFixed(1);
  const targetMinutes = profile.dailyHourTarget * 60;
  const dayAchievementPct = Math.min(
    100,
    Math.round(((dayTotalMinutes / targetMinutes) * 1000) / 10)
  );

  const dayTotalPages = dateSessions.reduce((acc, s) => {
    if (s.startPage && s.endPage && s.endPage >= s.startPage) {
      return acc + (s.endPage - s.startPage + 1);
    }
    return acc;
  }, 0);

  const dayTotalMCQs = dateSessions.reduce((acc, s) => acc + s.mcqsAttempted, 0);
  const dayCorrectMCQs = dateSessions.reduce((acc, s) => acc + s.mcqsCorrect, 0);
  const dayAccuracy =
    dayTotalMCQs > 0 ? ((dayCorrectMCQs / dayTotalMCQs) * 100).toFixed(1) : '0.0';

  const statusIcons = {
    completed: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
    partial: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
    missed: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
  };

  const statusLabels = {
    completed: 'Completed',
    partial: 'Partial',
    missed: 'Missed',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Daily Study Session Tracker</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log start/end times, pages covered in Uttoron books, and chapter-wise Assurance MCQs
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white">
            <Calendar className="w-4 h-4 text-teal-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={() => onOpenNewSessionModal(selectedDate)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Gauge & Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Hours Studied */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Study Hours Today</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{dayHours}h</span>
            <span className="text-xs text-slate-500 font-mono">/ {profile.dailyHourTarget}h Goal</span>
          </div>
          <div className="mt-2">
            <ProgressBar percentage={dayAchievementPct} color={dayTotalMinutes >= targetMinutes ? 'emerald' : 'teal'} height="sm" />
          </div>
        </div>

        {/* Target Achievement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1">Target Achievement</div>
          <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
            {dayAchievementPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {dayTotalMinutes >= targetMinutes
              ? '12h Target Reached'
              : `${((targetMinutes - dayTotalMinutes) / 60).toFixed(1)}h Remaining`}
          </div>
        </div>

        {/* Pages Studied Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Pages Studied</span>
            <BookOpen className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {dayTotalPages}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Book span covered today</div>
        </div>

        {/* MCQs Solved Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Assurance MCQs</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {dayTotalMCQs}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            {dayAccuracy}% Accuracy ({dayCorrectMCQs} correct)
          </div>
        </div>
      </div>

      {/* Sessions Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Sessions on {formatDateDisplay(selectedDate)}</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({dateSessions.length} logged)
            </span>
          </h3>

          <div className="text-xs text-slate-400 font-mono">
            Total Time: <span className="text-white font-bold">{dayHours} Hours</span>
          </div>
        </div>

        {dateSessions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Clock className="w-10 h-10 text-slate-600" />
            <div className="text-sm font-semibold text-slate-300">
              No study sessions logged for {formatDateDisplay(selectedDate)}
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Record your completed study blocks, page numbers from Uttoron books, and chapter MCQs.
            </p>
            <button
              onClick={() => onOpenNewSessionModal(selectedDate)}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Log Session for This Date
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {dateSessions.map((session) => {
              const subject = subjects.find((s) => s.id === session.subjectId);
              const durationHours = (session.durationMinutes / 60).toFixed(1);
              const sessionAccuracy =
                session.mcqsAttempted > 0
                  ? ((session.mcqsCorrect / session.mcqsAttempted) * 100).toFixed(1)
                  : null;

              return (
                <div
                  key={session.id}
                  className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs"
                >
                  {/* Left: Time and Subject */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-center shrink-0 w-20">
                      <div className="text-white font-bold">{session.startTime}</div>
                      <div className="text-[10px] text-slate-400">{session.endTime}</div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {subject?.name || session.subjectId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {durationHours} Hours ({session.durationMinutes}m)
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-300">
                          {statusIcons[session.status]}
                          <span>{statusLabels[session.status]}</span>
                        </span>
                      </div>

                      {session.topicTitle && (
                        <div className="text-xs text-teal-400 font-medium mt-0.5">
                          Topic: {session.topicTitle}
                        </div>
                      )}

                      {session.notes && (
                        <div className="text-slate-400 text-[11px] mt-1 line-clamp-2 italic">
                          "{session.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Pages & MCQs */}
                  <div className="flex items-center gap-6 self-start lg:self-center font-mono text-[11px]">
                    {session.startPage && session.endPage ? (
                      <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                        <div className="text-slate-400">Pages Covered:</div>
                        <div className="font-bold text-white">
                          pp. {session.startPage} – {session.endPage}{' '}
                          <span className="text-teal-400">
                            (+{session.endPage - session.startPage + 1}p)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 italic">No page interval entered</div>
                    )}

                    {session.mcqsAttempted > 0 ? (
                      <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                        <div className="text-slate-400">Assurance QBank:</div>
                        <div className="font-bold text-white">
                          {session.mcqsCorrect} / {session.mcqsAttempted} Correct{' '}
                          <span className="text-emerald-400">({sessionAccuracy}%)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 italic">No MCQs in this session</div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => onEditSession(session)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit Session"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStudySession(session.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
