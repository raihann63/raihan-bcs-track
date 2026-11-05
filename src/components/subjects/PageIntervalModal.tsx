import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SubjectConfig, PageInterval } from '../../types';
import { calculateNewUniquePagesAdded } from '../../utils/pageCalculations';
import { getTodayDateString } from '../../utils/dateUtils';

interface PageIntervalModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectConfig | null;
  editingInterval?: PageInterval | null;
  onSave: (start: number, end: number, notes?: string, date?: string) => void;
}

export const PageIntervalModal: React.FC<PageIntervalModalProps> = ({
  isOpen,
  onClose,
  subject,
  editingInterval,
  onSave,
}) => {
  const [startPage, setStartPage] = useState<string>(
    editingInterval ? String(editingInterval.startPage) : ''
  );
  const [endPage, setEndPage] = useState<string>(
    editingInterval ? String(editingInterval.endPage) : ''
  );
  const [date, setDate] = useState<string>(
    editingInterval ? editingInterval.dateCompleted : getTodayDateString()
  );
  const [notes, setNotes] = useState<string>(editingInterval?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync state if editingInterval changes
  React.useEffect(() => {
    if (editingInterval) {
      setStartPage(String(editingInterval.startPage));
      setEndPage(String(editingInterval.endPage));
      setDate(editingInterval.dateCompleted);
      setNotes(editingInterval.notes || '');
    } else {
      setStartPage('');
      setEndPage('');
      setDate(getTodayDateString());
      setNotes('');
      setErrorMsg('');
    }
  }, [editingInterval, isOpen]);

  const numStart = parseInt(startPage, 10);
  const numEnd = parseInt(endPage, 10);

  let newUnique = 0;
  if (subject && !isNaN(numStart) && !isNaN(numEnd) && numStart > 0 && numEnd >= numStart) {
    newUnique = calculateNewUniquePagesAdded(
      subject.completedIntervals.filter((i) => (editingInterval ? i.id !== editingInterval.id : true)),
      numStart,
      numEnd,
      subject.totalPages
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isNaN(numStart) || isNaN(numEnd) || numStart <= 0) {
      setErrorMsg('Please enter valid positive page numbers.');
      return;
    }
    if (numEnd < numStart) {
      setErrorMsg('Ending page cannot be smaller than starting page.');
      return;
    }
    if (subject?.totalPages && numEnd > subject.totalPages) {
      setErrorMsg(
        `Ending page (${numEnd}) exceeds total pages in ${subject.name} (${subject.totalPages}).`
      );
      return;
    }

    onSave(numStart, numEnd, notes, date);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingInterval ? 'Edit Page Interval' : `Record Completed Pages: ${subject?.name}`}
      subtitle={`Book: ${subject?.bookName || 'Preparation Book'} · Non-Overlapping Math`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Start Page</label>
            <input
              type="number"
              min="1"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              placeholder="e.g. 1"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">End Page</label>
            <input
              type="number"
              min="1"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              placeholder="e.g. 35"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Deduplication Live Calculation Card */}
        {numStart > 0 && numEnd >= numStart && (
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Total Span in Range:</span>
              <span className="font-bold text-white">{numEnd - numStart + 1} pages</span>
            </div>
            <div className="flex justify-between text-teal-400">
              <span>New Unique Pages Added:</span>
              <span className="font-bold">+{newUnique} pages</span>
            </div>
            {numEnd - numStart + 1 > newUnique && (
              <div className="text-[10px] text-amber-400/90 pt-1 border-t border-slate-800">
                Note: {numEnd - numStart + 1 - newUnique} pages were already recorded in previous intervals and won't be double-counted.
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-slate-300 font-medium mb-1">Date Completed</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Chapter or Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g., অধ্যায় ২: সন্ধি ও উপসর্গ"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm"
          >
            {editingInterval ? 'Update Interval' : 'Save Interval'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
