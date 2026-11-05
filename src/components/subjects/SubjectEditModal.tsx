import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SubjectConfig } from '../../types';

interface SubjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectConfig | null;
  onSave: (totalPages: number | null, bookName: string, bcsMarks: number) => void;
}

export const SubjectEditModal: React.FC<SubjectEditModalProps> = ({
  isOpen,
  onClose,
  subject,
  onSave,
}) => {
  const [totalPages, setTotalPages] = useState<string>('');
  const [bookName, setBookName] = useState<string>('');
  const [bcsMarks, setBcsMarks] = useState<string>('');

  useEffect(() => {
    if (subject) {
      setTotalPages(subject.totalPages !== null ? String(subject.totalPages) : '');
      setBookName(subject.bookName);
      setBcsMarks(String(subject.bcsMarks));
    }
  }, [subject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPages = totalPages.trim() === '' ? null : parseInt(totalPages, 10);
    const parsedMarks = parseInt(bcsMarks, 10) || 15;
    onSave(parsedPages && parsedPages > 0 ? parsedPages : null, bookName, parsedMarks);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Subject: ${subject?.name}`}
      subtitle="Adjust total book page count, textbook edition, and marks weight"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Total Pages in Textbook
          </label>
          <input
            type="number"
            min="1"
            placeholder={subject?.id === 'ethics_governance' ? 'Enter exact page count when book is acquired' : 'e.g. 250'}
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-teal-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Leave blank if page count is not yet configured (e.g. Ethics).
          </p>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Book / Publication Name</label>
          <input
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">BCS Preliminary Marks</label>
          <input
            type="number"
            min="1"
            max="200"
            value={bcsMarks}
            onChange={(e) => setBcsMarks(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
            required
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
            Save Configuration
          </button>
        </div>
      </form>
    </Modal>
  );
};
