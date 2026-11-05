import React, { useState, useEffect } from 'react';
import { usePrep } from '../../context/PrepContext';
import { Modal } from '../common/Modal';
import { calculateNewUniquePagesAdded } from '../../utils/pageCalculations';
import { getTodayDateString } from '../../utils/dateUtils';
import { StudySession, SessionStatus } from '../../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectId?: string;
  initialDurationMinutes?: number;
  editingSession?: StudySession | null;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  initialSubjectId,
  initialDurationMinutes,
  editingSession,
}) => {
  const { subjects, logStudySession, updateStudySession } = usePrep();

  const [date, setDate] = useState(getTodayDateString());
  const [subjectId, setSubjectId] = useState(initialSubjectId || 'bangla_grammar');
  const [topicTitle, setTopicTitle] = useState('');
  const [startTime, setStartTime] = useState('06:30');
  const [endTime, setEndTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(210);
  const [startPage, setStartPage] = useState<string>('');
  const [endPage, setEndPage] = useState<string>('');
  const [mcqsAttempted, setMcqsAttempted] = useState<string>('');
  const [mcqsCorrect, setMcqsCorrect] = useState<string>('');
  const [status, setStatus] = useState<SessionStatus>('completed');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected subject config
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  useEffect(() => {
    if (editingSession) {
      setDate(editingSession.date);
      setSubjectId(editingSession.subjectId);
      setTopicTitle(editingSession.topicTitle || '');
      setStartTime(editingSession.startTime);
      setEndTime(editingSession.endTime);
      setDurationMinutes(editingSession.durationMinutes);
      setStartPage(editingSession.startPage ? String(editingSession.startPage) : '');
      setEndPage(editingSession.endPage ? String(editingSession.endPage) : '');
      setMcqsAttempted(editingSession.mcqsAttempted ? String(editingSession.mcqsAttempted) : '');
      setMcqsCorrect(editingSession.mcqsCorrect ? String(editingSession.mcqsCorrect) : '');
      setStatus(editingSession.status);
      setNotes(editingSession.notes || '');
    } else {
      if (initialSubjectId) setSubjectId(initialSubjectId);
      if (initialDurationMinutes) setDurationMinutes(initialDurationMinutes);
      setErrorMsg('');
    }
  }, [editingSession, initialSubjectId, initialDurationMinutes, isOpen]);

  // Recalculate duration whenever start or end time changes
  const handleTimeChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    try {
      const [sh, sm] = newStart.split(':').map(Number);
      const [eh, em] = newEnd.split(':').map(Number);
      let diff = eh * 60 + em - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60; // Crosses midnight
      if (diff > 0) setDurationMinutes(diff);
    } catch {
      // Keep existing duration
    }
  };

  // Preview unique pages that will be added
  let previewUnique = 0;
  const numStart = parseInt(startPage, 10);
  const numEnd = parseInt(endPage, 10);
  if (selectedSubject && !isNaN(numStart) && !isNaN(numEnd) && numStart > 0 && numEnd >= numStart) {
    previewUnique = calculateNewUniquePagesAdded(
      selectedSubject.completedIntervals,
      numStart,
      numEnd,
      selectedSubject.totalPages
    );
  }

  // Calculated incorrect and accuracy
  const attemptedNum = parseInt(mcqsAttempted, 10) || 0;
  const correctNum = parseInt(mcqsCorrect, 10) || 0;
  const incorrectNum = Math.max(0, attemptedNum - correctNum);
  const accuracyPct = attemptedNum > 0 ? ((correctNum / attemptedNum) * 100).toFixed(1) : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (durationMinutes <= 0) {
      setErrorMsg('Study duration must be greater than zero.');
      return;
    }

    if (correctNum > attemptedNum) {
      setErrorMsg('Correct MCQs cannot exceed total attempted questions.');
      return;
    }

    if (numStart > 0 && numEnd > 0) {
      if (numEnd < numStart) {
        setErrorMsg('Ending page cannot be less than starting page.');
        return;
      }
      if (selectedSubject?.totalPages && numEnd > selectedSubject.totalPages) {
        setErrorMsg(`Ending page exceeds total pages (${selectedSubject.totalPages}).`);
        return;
      }
    }

    if (editingSession) {
      updateStudySession(editingSession.id, {
        date,
        subjectId,
        topicTitle,
        startTime,
        endTime,
        durationMinutes,
        startPage: numStart > 0 ? numStart : undefined,
        endPage: numEnd > 0 ? numEnd : undefined,
        mcqsAttempted: attemptedNum,
        mcqsCorrect: correctNum,
        mcqsIncorrect: incorrectNum,
        status,
        notes,
      });
    } else {
      logStudySession({
        date,
        subjectId,
        topicTitle,
        startTime,
        endTime,
        durationMinutes,
        startPage: numStart > 0 ? numStart : undefined,
        endPage: numEnd > 0 ? numEnd : undefined,
        mcqsAttempted: attemptedNum,
        mcqsCorrect: correctNum,
        mcqsIncorrect: incorrectNum,
        status,
        notes,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSession ? 'Edit Study Session' : 'Log Daily Study Session'}
      subtitle="Accurate page recording, session duration, and chapter-wise MCQ practice"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        {/* Date and Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Subject / Sub-Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.parentSubjectId ? `[${s.parentSubjectId.toUpperCase()}] ` : ''}
                  {s.name} ({s.totalPages ? `${s.totalPages}p` : 'Unconfigured'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Title */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Chapter / Topic Title</label>
          <input
            type="text"
            placeholder="e.g., সমাস ও প্রত্যয় / Parts of Speech / বাস্তব সংখ্যা"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Time and Duration */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleTimeChange(e.target.value, endTime)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleTimeChange(startTime, e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Duration (Min)</label>
            <input
              type="number"
              min="1"
              max="1440"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold text-teal-400"
              required
            />
          </div>
        </div>

        {/* Page Range Entry */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white">Pages Studied in Book</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Book: {selectedSubject?.bookName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Start Page</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">End Page</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 35"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
          </div>

          {numStart > 0 && numEnd >= numStart && (
            <div className="text-[11px] text-teal-400 font-mono flex items-center justify-between pt-1">
              <span>Selected Span: {numEnd - numStart + 1} pages</span>
              <span>Unique Added to Syllabus: +{previewUnique} pages</span>
            </div>
          )}
        </div>

        {/* MCQ Practice (Immediate Chapter-wise Attachment) */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white">Assurance QBank Practice</span>
            <span className="text-[11px] text-teal-400 font-mono">Accuracy: {accuracyPct}%</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Attempted</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={mcqsAttempted}
                onChange={(e) => setMcqsAttempted(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Correct</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={mcqsCorrect}
                onChange={(e) => setMcqsCorrect(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Incorrect</label>
              <div className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-rose-400 font-mono font-bold">
                {incorrectNum}
              </div>
            </div>
          </div>
        </div>

        {/* Session Status & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SessionStatus)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="completed">Completed (Target Reached)</option>
              <option value="partial">Partial (Interrupted)</option>
              <option value="missed">Missed (Logged for Record)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Personal Notes</label>
            <input
              type="text"
              placeholder="Key concepts memorized, difficult areas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            {editingSession ? 'Update Session' : 'Save Session Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
