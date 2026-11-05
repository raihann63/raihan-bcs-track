import React, { useState } from 'react';
import { usePrep } from '../../context/PrepContext';
import { RevisionTask } from '../../types';
import { getTodayDateString, formatDateDisplay, getRevisionTaskStatus } from '../../utils/dateUtils';
import { Modal } from '../common/Modal';
import {
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';

export const RevisionView: React.FC = () => {
  const {
    revisions,
    completeRevisionTask,
    rescheduleRevisionTask,
    addManualRevisionTask,
    subjects,
  } = usePrep();

  const [activeTab, setActiveTab] = useState<'due' | 'upcoming' | 'completed'>('due');

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState('bangla_grammar');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newScheduledDate, setNewScheduledDate] = useState(getTodayDateString());
  const [newNotes, setNewNotes] = useState('');

  // Reschedule Modal
  const [reschedulingTask, setReschedulingTask] = useState<RevisionTask | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(getTodayDateString());

  const todayStr = getTodayDateString();

  // Categorize revisions
  const overdueTasks: RevisionTask[] = [];
  const dueTodayTasks: RevisionTask[] = [];
  const upcomingTasks: RevisionTask[] = [];
  const completedTasks: RevisionTask[] = [];

  revisions.forEach((task) => {
    if (task.status === 'completed') {
      completedTasks.push(task);
    } else {
      const status = getRevisionTaskStatus(task.scheduledDate, false);
      if (status === 'overdue') overdueTasks.push(task);
      else if (status === 'due_today') dueTodayTasks.push(task);
      else upcomingTasks.push(task);
    }
  });

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    addManualRevisionTask(newSubjectId, newTopicTitle.trim(), newScheduledDate, newNotes);
    setIsAddModalOpen(false);
    setNewTopicTitle('');
    setNewNotes('');
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingTask) return;
    rescheduleRevisionTask(reschedulingTask.id, rescheduleDate);
    setReschedulingTask(null);
  };

  const stageLabels = {
    1: '1st Rev (+1d)',
    2: '2nd Rev (+3d)',
    3: '3rd Rev (+7d)',
    4: '4th Rev (+15d)',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Spaced Repetition Algorithm: 1d · 3d · 7d · 15d</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            BCS Preliminary Spaced Revision Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Never forget critical dates, vocabulary, and formulas through scientifically timed revision intervals
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Revision Task</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-rose-400 font-medium mb-1">Overdue Revisions</div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {overdueTasks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">High priority review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-amber-400 font-medium mb-1">Due Today</div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {dueTodayTasks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scheduled for today</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-teal-400 font-medium mb-1">Upcoming Revisions</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {upcomingTasks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scheduled next 15 days</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-emerald-400 font-medium mb-1">Completed Cycles</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {completedTasks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Successfully revised</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab('due')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'due'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Due & Overdue</span>
          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
            {overdueTasks.length + dueTodayTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Upcoming Pipeline</span>
          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            {upcomingTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Completed History</span>
          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* Revision Task List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {activeTab === 'due' && (
          <div className="divide-y divide-slate-800/80">
            {overdueTasks.length === 0 && dueTodayTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <div className="font-bold text-white text-sm">All Revisions Cleared!</div>
                <p className="mt-1">
                  You have no pending or overdue revisions today. New revisions will populate automatically when you complete study sessions.
                </p>
              </div>
            ) : (
              <>
                {/* Overdue Section */}
                {overdueTasks.length > 0 && (
                  <div className="bg-rose-950/20 p-3 px-4 border-b border-rose-900/40 text-xs font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Overdue Revisions ({overdueTasks.length}) — High Priority</span>
                  </div>
                )}
                {overdueTasks.map((task) => renderTaskRow(task, true))}

                {/* Due Today Section */}
                {dueTodayTasks.length > 0 && (
                  <div className="bg-amber-950/20 p-3 px-4 border-b border-amber-900/40 text-xs font-bold text-amber-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Scheduled for Today ({dueTodayTasks.length})</span>
                  </div>
                )}
                {dueTodayTasks.map((task) => renderTaskRow(task, false))}
              </>
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="divide-y divide-slate-800/80">
            {upcomingTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No upcoming revisions scheduled yet.
              </div>
            ) : (
              upcomingTasks.map((task) => renderTaskRow(task, false))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="divide-y divide-slate-800/80">
            {completedTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No revisions completed yet. Mark a revision done using the green checkmark button.
              </div>
            ) : (
              completedTasks.map((task) => renderTaskRow(task, false))
            )}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Spaced Revision Task"
        subtitle="Manually schedule a revision date for high-yield BCS concepts"
        maxWidth="md"
      >
        <form onSubmit={handleCreateManual} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Subject</label>
            <select
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Topic / Concept Name</label>
            <input
              type="text"
              required
              placeholder="e.g., সংবিধানের অনুচ্ছেদসমূহ (১-৪৭) / Shakespeare's Major Tragedies"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Scheduled Revision Date</label>
            <input
              type="date"
              value={newScheduledDate}
              onChange={(e) => setNewScheduledDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Revision Focus Notes</label>
            <input
              type="text"
              placeholder="Key tricky formulas or exceptions to review..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm"
            >
              Add Revision
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      {reschedulingTask && (
        <Modal
          isOpen={Boolean(reschedulingTask)}
          onClose={() => setReschedulingTask(null)}
          title="Reschedule Revision Date"
          subtitle={`Topic: ${reschedulingTask.topicTitle}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">New Revision Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReschedulingTask(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg"
              >
                Save Date
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );

  function renderTaskRow(task: RevisionTask, isOverdue: boolean) {
    const subject = subjects.find((s) => s.id === task.subjectId);
    const isCompleted = task.status === 'completed';

    return (
      <div
        key={task.id}
        className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${
          isOverdue ? 'bg-rose-950/10' : 'hover:bg-slate-800/30'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          {!isCompleted ? (
            <button
              onClick={() => completeRevisionTask(task.id)}
              className="mt-0.5 w-6 h-6 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-colors shrink-0"
              title="Mark Revision Complete"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="mt-0.5 w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">{task.topicTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                {subject?.name || task.subjectId}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {stageLabels[task.stage]}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
              <span>Scheduled: {formatDateDisplay(task.scheduledDate)}</span>
              <span aria-hidden="true">·</span>
              <span>First studied: {formatDateDisplay(task.firstStudiedDate)}</span>
              {task.completedDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold">
                    Completed: {formatDateDisplay(task.completedDate)}
                  </span>
                </>
              )}
            </div>

            {task.notes && (
              <div className="text-[11px] text-slate-400 italic mt-0.5">"{task.notes}"</div>
            )}
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                setReschedulingTask(task);
                setRescheduleDate(task.scheduledDate);
              }}
              className="px-2.5 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change Date</span>
            </button>

            <button
              onClick={() => completeRevisionTask(task.id)}
              className="px-3 py-1 bg-teal-600/90 hover:bg-teal-500 text-white rounded text-xs font-semibold"
            >
              Mark Done
            </button>
          </div>
        )}
      </div>
    );
  }
};
