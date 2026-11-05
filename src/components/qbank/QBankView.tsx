import React, { useState } from 'react';
import { usePrep } from '../../context/PrepContext';
import { MCQPracticeEntry } from '../../types';
import { getTodayDateString, formatDateDisplay } from '../../utils/dateUtils';
import { Modal } from '../common/Modal';
import { ProgressBar } from '../common/ProgressBar';
import {
  CheckSquare,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const QBankView: React.FC = () => {
  const { mcqPractices, addMCQPractice, deleteMCQPractice, subjects } = usePrep();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');

  // Form State
  const [subjectId, setSubjectId] = useState<string>('bangla_grammar');
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [attempted, setAttempted] = useState<string>('');
  const [correct, setCorrect] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [repeatedMistakesNotes, setRepeatedMistakesNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Global Aggregates
  const totalAttempted = mcqPractices.reduce((acc, m) => acc + m.attempted, 0);
  const totalCorrect = mcqPractices.reduce((acc, m) => acc + m.correct, 0);
  const totalIncorrect = mcqPractices.reduce((acc, m) => acc + m.incorrect, 0);
  const overallAccuracy =
    totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : '0.0';

  // Filtered List
  const filteredDrills = mcqPractices.filter((m) =>
    filterSubjectId === 'all' ? true : m.subjectId === filterSubjectId
  );

  // Subject-wise Performance Grouping
  const subjectPerformanceMap: Record<
    string,
    { attempted: number; correct: number; incorrect: number }
  > = {};

  mcqPractices.forEach((drill) => {
    if (!subjectPerformanceMap[drill.subjectId]) {
      subjectPerformanceMap[drill.subjectId] = { attempted: 0, correct: 0, incorrect: 0 };
    }
    subjectPerformanceMap[drill.subjectId].attempted += drill.attempted;
    subjectPerformanceMap[drill.subjectId].correct += drill.correct;
    subjectPerformanceMap[drill.subjectId].incorrect += drill.incorrect;
  });

  const subjectPerformanceData = Object.entries(subjectPerformanceMap).map(
    ([subId, data]) => {
      const sub = subjects.find((s) => s.id === subId);
      const acc =
        data.attempted > 0 ? Math.round((data.correct / data.attempted) * 1000) / 10 : 0;
      return {
        subjectId: subId,
        name: sub ? sub.name.replace(' Reasoning', '').replace(' and Disaster Management', '') : subId,
        attempted: data.attempted,
        correct: data.correct,
        accuracy: acc,
      };
    }
  );

  const numAttempted = parseInt(attempted, 10) || 0;
  const numCorrect = parseInt(correct, 10) || 0;
  const numIncorrect = Math.max(0, numAttempted - numCorrect);

  const handleSaveDrill = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numAttempted <= 0) {
      setErrorMsg('Please enter a valid number of attempted MCQs.');
      return;
    }
    if (numCorrect > numAttempted) {
      setErrorMsg('Correct answers cannot exceed attempted questions.');
      return;
    }

    addMCQPractice({
      date,
      subjectId,
      topicTitle: topicTitle.trim() || 'General Chapter Drill',
      attempted: numAttempted,
      correct: numCorrect,
      incorrect: numIncorrect,
      notes,
      repeatedMistakesNotes,
    });

    setIsAddModalOpen(false);
    setTopicTitle('');
    setAttempted('');
    setCorrect('');
    setNotes('');
    setRepeatedMistakesNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Assurance Question Bank Chapter Tracking</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            MCQ Accuracy & Mistake Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log chapter drills, track subject-wise accuracy benchmarks, and record repeated conceptual traps
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Record MCQ Drill</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Attempted</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalAttempted}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assurance Question Bank</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-emerald-400 font-medium mb-1">Correct Answers</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {totalCorrect}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified right</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-rose-400 font-medium mb-1">Incorrect Answers</div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {totalIncorrect}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-teal-400 font-medium mb-1">Overall Accuracy</div>
          <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: 80%+ safe zone</div>
        </div>
      </div>

      {/* Subject Performance Breakdown Bar Chart */}
      {subjectPerformanceData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Subject-Wise MCQ Accuracy</h3>
              <p className="text-xs text-slate-400">Assurance drill accuracy by subject discipline</p>
            </div>
            <span className="text-xs font-mono text-teal-400">80% Target Benchmark</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformanceData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.correct}/${item.payload.attempted} correct)`,
                    'Accuracy',
                  ]}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {subjectPerformanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.accuracy >= 80 ? '#10b981' : entry.accuracy >= 65 ? '#14b8a6' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Drill Records & Repeated Mistakes Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">
            Chapter Drill History ({filteredDrills.length})
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredDrills.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="font-bold text-white text-sm">No MCQ Drills Recorded</div>
            <p className="mt-1">
              Record chapter-wise questions from Assurance Question Bank immediately after your study sessions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredDrills.map((drill) => {
              const subject = subjects.find((s) => s.id === drill.subjectId);
              return (
                <div
                  key={drill.id}
                  className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{drill.topicTitle}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                        {subject?.name || drill.subjectId}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDateDisplay(drill.date)}
                      </span>
                    </div>

                    {drill.repeatedMistakesNotes && (
                      <div className="mt-1.5 p-2 bg-rose-950/20 border border-rose-900/40 rounded-lg text-rose-300 text-[11px] flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Repeated Mistake Note:</strong> {drill.repeatedMistakesNotes}
                        </div>
                      </div>
                    )}

                    {drill.notes && (
                      <div className="text-slate-400 text-[11px] mt-1 italic">
                        "{drill.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 self-end lg:self-center font-mono">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white tabular-nums">
                        {drill.correct} / {drill.attempted}{' '}
                        <span className="text-xs text-rose-400">(-{drill.incorrect})</span>
                      </div>
                      <div
                        className={`text-xs font-bold tabular-nums ${
                          drill.accuracyPercentage >= 80
                            ? 'text-emerald-400'
                            : drill.accuracyPercentage >= 60
                            ? 'text-teal-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {drill.accuracyPercentage.toFixed(1)}% Accuracy
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMCQPractice(drill.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Record"
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

      {/* Record Drill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Assurance Question Bank Drill"
        subtitle="Track chapter-wise questions solved immediately after study"
        maxWidth="md"
      >
        <form onSubmit={handleSaveDrill} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
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
              <label className="block text-slate-300 font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Chapter / Topic Title</label>
            <input
              type="text"
              required
              placeholder="e.g., ধ্বনি পরিবর্তন / সমাস / বাস্তব সংখ্যা"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div>
              <label className="block text-slate-400 mb-1">Attempted</label>
              <input
                type="number"
                min="1"
                required
                placeholder="50"
                value={attempted}
                onChange={(e) => setAttempted(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Correct</label>
              <input
                type="number"
                min="0"
                required
                placeholder="42"
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Incorrect</label>
              <div className="px-2.5 py-2 bg-slate-800 rounded-lg text-rose-400 font-mono font-bold text-sm">
                {numIncorrect}
              </div>
            </div>
          </div>

          {numAttempted > 0 && (
            <div className="text-right text-xs font-mono">
              <span className="text-slate-400">Calculated Accuracy: </span>
              <span className="text-teal-400 font-bold">
                {((numCorrect / numAttempted) * 100).toFixed(1)}%
              </span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Repeated Mistakes & Confusion Points
            </label>
            <textarea
              rows={2}
              placeholder="What questions or rules did you get wrong repeatedly? (e.g., অপিনিহিতি vs অভিশ্রুতি rules)"
              value={repeatedMistakesNotes}
              onChange={(e) => setRepeatedMistakesNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
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
              Save Drill Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
