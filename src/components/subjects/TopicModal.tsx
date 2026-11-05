import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TopicItem, TopicStatus } from '../../types';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  editingTopic?: TopicItem | null;
  onSave: (title: string, chapterNumber?: number, startPage?: number, endPage?: number, status?: TopicStatus) => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  subjectName,
  editingTopic,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<string>('');
  const [startPage, setStartPage] = useState<string>('');
  const [endPage, setEndPage] = useState<string>('');
  const [status, setStatus] = useState<TopicStatus>('not_started');

  useEffect(() => {
    if (editingTopic) {
      setTitle(editingTopic.title);
      setChapterNumber(editingTopic.chapterNumber ? String(editingTopic.chapterNumber) : '');
      setStartPage(editingTopic.startPage ? String(editingTopic.startPage) : '');
      setEndPage(editingTopic.endPage ? String(editingTopic.endPage) : '');
      setStatus(editingTopic.status);
    } else {
      setTitle('');
      setChapterNumber('');
      setStartPage('');
      setEndPage('');
      setStatus('not_started');
    }
  }, [editingTopic, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      title.trim(),
      chapterNumber ? parseInt(chapterNumber, 10) : undefined,
      startPage ? parseInt(startPage, 10) : undefined,
      endPage ? parseInt(endPage, 10) : undefined,
      status
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTopic ? 'Edit Topic' : `Add Chapter / Topic: ${subjectName}`}
      subtitle="Organize chapter checkpoints and mastery status"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Topic Title / Name</label>
          <input
            type="text"
            required
            placeholder="e.g. বাক্য রূপান্তর ও বাচ্য"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1">Chapter #</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Start Page</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 25"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">End Page</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 45"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Topic Progress Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TopicStatus)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
          >
            <option value="not_started">Not Started</option>
            <option value="reading_completed">Reading Completed</option>
            <option value="mcq_practiced">MCQ Practiced</option>
            <option value="revised">Revised</option>
            <option value="mastered">Mastered</option>
          </select>
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
            Save Topic
          </button>
        </div>
      </form>
    </Modal>
  );
};
