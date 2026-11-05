import React, { useState } from 'react';
import { usePrep } from '../../context/PrepContext';
import { ModelTestEntry } from '../../types';
import { getTodayDateString, formatDateDisplay } from '../../utils/dateUtils';
import { Modal } from '../common/Modal';
import {
  Award,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const ModelTestsView: React.FC = () => {
  const { modelTests, addModelTest, deleteModelTest, subjects } = usePrep();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [testName, setTestName] = useState('Uttoron Full Model Test 01');
  const [date, setDate] = useState(getTodayDateString());
  const [totalQuestions, setTotalQuestions] = useState<string>('200');
  const [correctCount, setCorrectCount] = useState<string>('');
  const [incorrectCount, setIncorrectCount] = useState<string>('');
  const [negativeMarkingPerWrong, setNegativeMarkingPerWrong] = useState<string>('0.50');
  const [selectedWeakSubjects, setSelectedWeakSubjects] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const numTotal = parseInt(totalQuestions, 10) || 200;
  const numCorrect = parseInt(correctCount, 10) || 0;
  const numIncorrect = parseInt(incorrectCount, 10) || 0;
  const numNegative = parseFloat(negativeMarkingPerWrong) || 0.5;
  const numUnanswered = Math.max(0, numTotal - numCorrect - numIncorrect);
  const calculatedObtained = Math.max(
    0,
    Math.round((numCorrect - numIncorrect * numNegative) * 100) / 100
  );
  const calculatedPct = numTotal > 0 ? ((calculatedObtained / numTotal) * 100).toFixed(1) : '0.0';

  // Sort model tests chronologically for progression chart
  const sortedTests = [...modelTests].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sortedTests.map((t, index) => ({
    name: t.testName.replace('Full Model Test ', 'MT ').replace('Uttoron ', ''),
    date: formatDateDisplay(t.date),
    marks: t.obtainedMarks,
    percentage: t.percentage,
    correct: t.correctCount,
  }));

  const handleToggleWeakSubject = (subId: string) => {
    setSelectedWeakSubjects((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numTotal <= 0) {
      setErrorMsg('Total questions must be greater than zero.');
      return;
    }
    if (numCorrect + numIncorrect > numTotal) {
      setErrorMsg('Sum of correct and incorrect questions cannot exceed total questions.');
      return;
    }

    addModelTest({
      date,
      testName: testName.trim(),
      totalQuestions: numTotal,
      correctCount: numCorrect,
      incorrectCount: numIncorrect,
      unansweredCount: numUnanswered,
      negativeMarkingPerWrong: numNegative,
      weakSubjectIds: selectedWeakSubjects,
      notes,
    });

    setIsModalOpen(false);
    setCorrectCount('');
    setIncorrectCount('');
    setSelectedWeakSubjects([]);
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono mb-1">
            <Award className="w-4 h-4" />
            <span>200-Mark BCS Preliminary Exam Simulation</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Model Test Scores & Diagnostic Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Standard negative marking (-0.50 per wrong answer), score progression trajectory, and weak subject detection
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Record Model Test</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1">Tests Completed</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {modelTests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Friday benchmark runs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-teal-400 font-medium mb-1">Average Score</div>
          <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
            {modelTests.length > 0
              ? (
                  modelTests.reduce((acc, t) => acc + t.obtainedMarks, 0) / modelTests.length
                ).toFixed(1)
              : '0.0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Out of 200 Marks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-emerald-400 font-medium mb-1">Highest Score</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {modelTests.length > 0
              ? Math.max(...modelTests.map((t) => t.obtainedMarks)).toFixed(1)
              : '0.0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Personal best mark</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-blue-400 font-medium mb-1">Preliminary Safe Cutoff</div>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">120+</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: 130–140 Top Rank</div>
        </div>
      </div>

      {/* Score Progression Line Chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Score Progression Trajectory</h3>
              <p className="text-xs text-slate-400">Net obtained marks with -0.50 negative marking</p>
            </div>
            <span className="text-xs font-mono text-teal-400">Cutoff Reference: 120</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[50, 200]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} Marks`, 'Obtained Marks']}
                />
                <Line
                  type="monotone"
                  dataKey="marks"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Model Test History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">
            Model Test History ({modelTests.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Standard 200 Questions</span>
        </div>

        {modelTests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="font-bold text-white text-sm">No Model Tests Logged Yet</div>
            <p className="mt-1">
              Take your full 200-mark model tests on Fridays and record your scores here to diagnose weak subjects.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {modelTests.map((test) => (
              <div
                key={test.id}
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{test.testName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateDisplay(test.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300 mt-1">
                    <span>Correct: <strong className="text-emerald-400">{test.correctCount}</strong></span>
                    <span>Wrong: <strong className="text-rose-400">{test.incorrectCount}</strong></span>
                    <span>Unanswered: <strong className="text-slate-400">{test.unansweredCount}</strong></span>
                    <span>Penalty: <strong className="text-rose-400">-{test.incorrectCount * test.negativeMarkingPerWrong}</strong></span>
                  </div>

                  {test.weakSubjectIds.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[11px] text-rose-300 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        Weak Areas:
                      </span>
                      {test.weakSubjectIds.map((sid) => {
                        const sub = subjects.find((s) => s.id === sid);
                        return (
                          <span
                            key={sid}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/40"
                          >
                            {sub?.name || sid}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {test.notes && (
                    <div className="text-slate-400 text-[11px] mt-1 italic">"{test.notes}"</div>
                  )}
                </div>

                <div className="flex items-center gap-6 self-end lg:self-center font-mono">
                  <div className="text-right">
                    <div className="text-xl font-bold text-teal-400 tabular-nums">
                      {test.obtainedMarks} <span className="text-xs text-slate-400 font-normal">/ {test.totalQuestions}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-bold tabular-nums">
                      {test.percentage.toFixed(1)}% Score
                    </div>
                  </div>

                  <button
                    onClick={() => deleteModelTest(test.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Model Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Full Model Test"
        subtitle="Automatic negative marking deduction (-0.50/wrong) for BCS Preliminary"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Test Name</label>
              <input
                type="text"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
              />
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

          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div>
              <label className="block text-slate-400 mb-1">Total MCQs</label>
              <input
                type="number"
                min="1"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Correct</label>
              <input
                type="number"
                min="0"
                required
                placeholder="140"
                value={correctCount}
                onChange={(e) => setCorrectCount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Wrong</label>
              <input
                type="number"
                min="0"
                required
                placeholder="25"
                value={incorrectCount}
                onChange={(e) => setIncorrectCount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-rose-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Unanswered</label>
              <div className="px-2.5 py-1.5 bg-slate-800 rounded-lg text-slate-400 font-mono">
                {numUnanswered}
              </div>
            </div>
          </div>

          {/* Calculated Score Breakdown */}
          <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-lg flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-slate-400">Penalty (-0.50 ea): </span>
              <span className="text-rose-400 font-bold">
                -{(numIncorrect * numNegative).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Net Obtained Marks: </span>
              <span className="text-teal-400 font-bold text-base">
                {calculatedObtained} / {numTotal} ({calculatedPct}%)
              </span>
            </div>
          </div>

          {/* Weak Subjects Multi-Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Weak Subjects Diagnosed in this Test (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
              {subjects.map((sub) => {
                const isSelected = selectedWeakSubjects.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleToggleWeakSubject(sub.id)}
                    className={`p-1.5 rounded text-left truncate text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Test Notes & Analysis</label>
            <input
              type="text"
              placeholder="e.g. Lost marks in English Literature eras and International summits..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm"
            >
              Save Model Test
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
