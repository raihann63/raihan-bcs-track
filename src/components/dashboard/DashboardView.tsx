import React from 'react';
import { usePrep } from '../../context/PrepContext';
import { MetricCard } from '../common/MetricCard';
import { ProgressBar } from '../common/ProgressBar';
import { getOverallSyllabusStats, getSubjectStats } from '../../utils/pageCalculations';
import { getTodayDateString, estimateCompletionDate } from '../../utils/dateUtils';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
  FileCheck,
  TrendingUp,
  Play,
  Plus,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  onOpenQuickLog: () => void;
  onOpenTimerModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickLog,
  onOpenTimerModal,
}) => {
  const { subjects, sessions, mcqPractices, modelTests, profile, setCurrentView } = usePrep();

  const todayStr = getTodayDateString();

  const overallStats = getOverallSyllabusStats(subjects);

  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayHours = (todayMinutes / 60).toFixed(1);
  const todayTargetAchievement = Math.min(
    100,
    Math.round(((todayMinutes / (profile.dailyHourTarget * 60)) * 1000) / 10)
  );

  const totalMCQs = mcqPractices.reduce((acc, m) => acc + m.attempted, 0);
  const totalCorrectMCQs = mcqPractices.reduce((acc, m) => acc + m.correct, 0);
  const mcqAccuracy = totalMCQs > 0 ? ((totalCorrectMCQs / totalMCQs) * 100).toFixed(1) : '0.0';

  const completedModelTestsCount = modelTests.length;
  const avgTestScore =
    completedModelTestsCount > 0
      ? (
          modelTests.reduce((acc, t) => acc + t.obtainedMarks, 0) /
          completedModelTestsCount
        ).toFixed(1)
      : '0.0';


  // Subject-wise progress list
  const subjectProgress = subjects
    .filter((s) => s.totalPages !== null)
    .map((s) => {
      const stats = getSubjectStats(s);
      return {
        id: s.id,
        name: s.name,
        completed: stats.completedPages,
        total: stats.totalPages || 0,
        percentage: stats.percentage || 0,
      };
    });

  // Daily Study Hours (Last 7 days)
  const last7DaysMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    last7DaysMap[ds] = 0;
  }
  sessions.forEach((s) => {
    if (last7DaysMap[s.date] !== undefined) {
      last7DaysMap[s.date] += s.durationMinutes / 60;
    }
  });

  const dailyHoursData = Object.entries(last7DaysMap).map(([date, hours]) => {
    const d = new Date(date);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date,
      day: dayLabel,
      hours: Math.round(hours * 10) / 10,
      target: profile.dailyHourTarget,
    };
  });

  const daysSinceStart = Math.max(
    1,
    Math.ceil((Date.now() - new Date(profile.startDate).getTime()) / (1000 * 3600 * 24))
  );
  const avgPagesPerDay = Math.round((overallStats.totalCompletedPages / daysSinceStart) * 10) / 10;
  const { projectedDate } = estimateCompletionDate(
    overallStats.totalRemainingPages,
    avgPagesPerDay > 0 ? avgPagesPerDay : 25
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Hero Strip */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-teal-400 mb-1">
            <Flame className="w-4 h-4" />
            <span>4-Month Sprint · Day {daysSinceStart} of 120</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            BCS Preliminary Preparation Command
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Uttoron Series books · Assurance Question Bank · 14-Hour Daily Benchmark · Top Rank Target
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenTimerModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-teal-400 fill-current" />
            <span>Focus Timer</span>
          </button>

          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-900/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Study Record</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Syllabus Completion"
          value={`${overallStats.overallPercentage.toFixed(1)}%`}
          subtext={`${overallStats.totalCompletedPages} of ${overallStats.totalConfiguredPages} pages`}
          accent="teal"
          icon={<BookOpen className="w-4 h-4" />}
          trend={{ text: `${overallStats.totalRemainingPages}p remain` }}
          onClick={() => setCurrentView('subjects')}
        />

        <MetricCard
          label="Completed Pages"
          value={overallStats.totalCompletedPages}
          unit="unique pages"
          subtext="Interval deduplicated"
          accent="teal"
          icon={<CheckCircle2 className="w-4 h-4" />}
          onClick={() => setCurrentView('subjects')}
        />

        <MetricCard
          label="Remaining Pages"
          value={overallStats.totalRemainingPages}
          unit="pages"
          subtext={projectedDate ? `Est: ${projectedDate}` : 'Set pace'}
          accent="blue"
          icon={<Target className="w-4 h-4" />}
          onClick={() => setCurrentView('reports')}
        />

        <MetricCard
          label="Total Study Hours"
          value={totalStudyHours}
          unit="hours"
          subtext={`${sessions.length} sessions logged`}
          accent="blue"
          icon={<Clock className="w-4 h-4" />}
          onClick={() => setCurrentView('tracker')}
        />

        <MetricCard
          label="Today's Study Progress"
          value={`${todayHours}h`}
          unit={`/ ${profile.dailyHourTarget}h`}
          subtext={`${todayTargetAchievement}% achieved`}
          accent={todayMinutes >= profile.dailyHourTarget * 60 ? 'emerald' : 'amber'}
          icon={<Flame className="w-4 h-4" />}
          trend={{
            text: todayMinutes >= profile.dailyHourTarget * 60 ? 'Goal Met' : 'In Progress',
            positive: todayMinutes >= profile.dailyHourTarget * 60,
          }}
          onClick={() => setCurrentView('tracker')}
        />

        <MetricCard
          label="MCQs Solved"
          value={totalMCQs}
          unit="questions"
          subtext="Assurance Question Bank"
          accent="teal"
          icon={<CheckCircle2 className="w-4 h-4" />}
          onClick={() => setCurrentView('qbank')}
        />

        <MetricCard
          label="MCQ Accuracy"
          value={`${mcqAccuracy}%`}
          subtext={`${totalCorrectMCQs} correct answers`}
          accent="emerald"
          icon={<TrendingUp className="w-4 h-4" />}
          trend={{ text: totalMCQs > 0 ? 'Verified' : 'No drills' }}
          onClick={() => setCurrentView('qbank')}
        />

        <MetricCard
          label="Model Tests"
          value={completedModelTestsCount}
          unit="completed"
          subtext={`Avg score: ${avgTestScore}`}
          accent="slate"
          icon={<FileCheck className="w-4 h-4" />}
          onClick={() => setCurrentView('modelTests')}
        />
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Subject Progress</h3>
              <p className="text-xs text-slate-400">Completed pages per subject</p>
            </div>
            <button
              onClick={() => setCurrentView('subjects')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
            >
              <span>Manage Pages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {subjectProgress.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-200 font-medium truncate pr-3">{s.name}</span>
                  <span className="font-mono tabular-nums text-slate-400 whitespace-nowrap">
                    <span className="text-white">{s.completed}</span> / {s.total} pages
                    <span className="text-teal-400 font-bold ml-2">{s.percentage.toFixed(1)}%</span>
                  </span>
                </div>
                <ProgressBar percentage={s.percentage} color="teal" height="md" />
              </div>
            ))}
          </div>
        </div>

        {/* Daily Study Consistency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Study Consistency</h3>
                <p className="text-xs text-slate-400">Last 7 Days vs 12h Benchmark</p>
              </div>
              <span className="text-xs text-teal-400 font-mono font-bold">12h Goal</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 14]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} Hours`, 'Studied']}
                  />
                  <Bar dataKey="hours" fill="#0d9488" radius={[4, 4, 0, 0]}>
                    {dailyHoursData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.hours >= 12 ? '#10b981' : entry.hours >= 6 ? '#14b8a6' : '#64748b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Today's Total:</span>
            <span className="font-mono font-bold text-white">{todayHours} / 12 Hours</span>
          </div>
        </div>
      </div>

      {/* 4-Month Plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">4-Month Strategic Preparation Plan</h3>
            <p className="text-xs text-slate-400">Milestone benchmarks and monthly page targets</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Start: {profile.startDate} · Target: Top Merit Rank
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Month 1</span>
              <span className="text-[11px] font-mono text-slate-400">Target: {profile.monthlyPageTargets.month1}p</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Foundation & First Reading</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Complete initial reading of Bangla Grammar, Math formulas, and basic MCQ practice.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Month 2</span>
              <span className="text-[11px] font-mono text-slate-400">Target: {profile.monthlyPageTargets.month2}p</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Syllabus Coverage Completion</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Finish Bangladesh Affairs, International Affairs, Science, and intensive Assurance drills.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Month 3</span>
              <span className="text-[11px] font-mono text-slate-400">Target: {profile.monthlyPageTargets.month3}p</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Previous BCS Questions & Models</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              10th to 46th BCS question analysis, weekly Friday full model tests, and error elimination.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Month 4</span>
              <span className="text-[11px] font-mono text-slate-400">Target: {profile.monthlyPageTargets.month4}p</span>
            </div>
            <h4 className="text-xs font-semibold text-white">Final Revision & Simulation</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              High-yield short notes, 2-hour exam hall simulation, and weak subject reinforcement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};