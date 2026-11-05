import React from 'react';
import { usePrep } from '../../context/PrepContext';
import { Modal } from '../common/Modal';
import { Play, Pause, RotateCcw, CheckCircle, Flame } from 'lucide-react';

interface ActiveTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSessionWithDuration: (subjectId: string, durationMinutes: number) => void;
}

export const ActiveTimerModal: React.FC<ActiveTimerModalProps> = ({
  isOpen,
  onClose,
  onOpenSessionWithDuration,
}) => {
  const {
    timerSeconds,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    timerSubjectId,
    subjects,
    profile,
  } = usePrep();

  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;

  const activeSubject = subjects.find((s) => s.id === timerSubjectId);

  const handleFinishAndLog = () => {
    const totalMinutes = Math.max(1, Math.round(timerSeconds / 60));
    pauseTimer();
    onClose();
    onOpenSessionWithDuration(timerSubjectId, totalMinutes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Active Study Stopwatch"
      subtitle={`Daily Target: ${profile.dailyHourTarget} Hours · Real-Time Tracking`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
        {/* Subject Picker */}
        <div className="w-full max-w-xs">
          <label className="block text-xs text-slate-400 font-medium mb-1.5 text-left">
            Active Study Subject
          </label>
          <select
            value={timerSubjectId}
            onChange={(e) => startTimer(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.bookName.split(' ')[1] || 'Book'})
              </option>
            ))}
          </select>
        </div>

        {/* Stopwatch Display */}
        <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 w-full max-w-xs shadow-inner">
          <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-widest tabular-nums">
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-teal-400 mt-2 flex items-center justify-center gap-1.5 font-medium">
            <Flame className="w-3.5 h-3.5" />
            <span>{isTimerRunning ? 'Session In Progress' : 'Timer Paused'}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            title="Reset to 0"
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isTimerRunning ? (
            <button
              onClick={pauseTimer}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{timerSeconds > 0 ? 'Resume' : 'Start Focus'}</span>
            </button>
          )}

          <button
            onClick={handleFinishAndLog}
            disabled={timerSeconds < 30}
            title="Finish & Save Record"
            className={`px-4 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all ${
              timerSeconds >= 30
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer'
                : 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Log Record</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 max-w-xs">
          The timer continues to run in the background while you switch between syllabus pages and
          notes.
        </p>
      </div>
    </Modal>
  );
};
