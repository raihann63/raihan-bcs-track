import React from 'react';
import { usePrep } from '../../context/PrepContext';
import {
  getOverallSyllabusStats,
  getSubjectStats,
} from '../../utils/pageCalculations';
import {
  getTodayDateString,
  formatDateDisplay,
  estimateCompletionDate,
} from '../../utils/dateUtils';
import {
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { subjects, sessions, mcqPractices, modelTests, profile } = usePrep();

  const todayStr = getTodayDateString();
  const overallStats = getOverallSyllabusStats(subjects);

  // 1. Calculate Daily Page Pace & Forecasting
  const daysSinceStart = Math.max(
    1,
    Math.ceil((Date.now() - new Date(profile.startDate).getTime()) / (1000 * 3600 * 24))
  );

  const avgPagesPerDay =
    Math.round((overallStats.totalCompletedPages / daysSinceStart) * 10) / 10;

  // Pages needed per day to finish within remaining days of the 4-month (120-day) plan
  const totalPlanDays = profile.targetDurationMonths * 30; // 120 days
  const remainingPlanDays = Math.max(1, totalPlanDays - daysSinceStart);
  const requiredPacePerDay =
    Math.round((overallStats.totalRemainingPages / remainingPlanDays) * 10) / 10;

  const { projectedDate, daysRemaining } = estimateCompletionDate(
    overallStats.totalRemainingPages,
    avgPagesPerDay > 0 ? avgPagesPerDay : 0
  );

  // 2. Subject Ranking Table Data
  const subjectRankings = subjects
    .filter((s) => s.totalPages !== null)
    .map((s) => {
      const stats = getSubjectStats(s);
      return {
        id: s.id,
        name: s.name,
        bookName: s.bookName,
        completed: stats.completedPages,
        total: stats.totalPages || 0,
        remaining: stats.remainingPages || 0,
        percentage: stats.percentage || 0,
        lastStudied: stats.lastStudiedDate,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // 3. Weekly Pages Completed Breakdown
  const weekDayMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    weekDayMap[ds] = 0;
  }

  sessions.forEach((s) => {
    if (weekDayMap[s.date] !== undefined && s.pagesCompletedCount > 0) {
      weekDayMap[s.date] += s.pagesCompletedCount;
    }
  });

  const dailyPageTrendData = Object.entries(weekDayMap).map(([date, pages]) => {
    const d = new Date(date);
    return {
      date,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pages,
    };
  });

  // 4. MCQ Accuracy Trend over recent drills
  const recentMCQDrills = [...mcqPractices]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((d, index) => ({
      index: index + 1,
      topic: d.topicTitle.split(' ')[0],
      accuracy: d.accuracyPercentage,
      attempted: d.attempted,
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Preparation Pacing & Completion Forecasting</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Analytics & Strategic Performance Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pacing projections, daily page velocity, syllabus completion dates, and performance rankings
          </p>
        </div>

        <div className="text-left md:text-right font-mono text-xs">
          <span className="text-slate-400">Preparation Sprint: </span>
          <span className="text-white font-bold">
            Day {daysSinceStart} of {totalPlanDays}
          </span>
          <div className="text-[11px] text-teal-400">
            {remainingPlanDays} Days Remaining
          </div>
        </div>
      </div>

      {/* Pacing Diagnostic Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual Daily Pace */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1">Current Study Velocity</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {avgPagesPerDay}
            </span>
            <span className="text-xs text-slate-400">pages / day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Based on {overallStats.totalCompletedPages} unique pages
          </div>
        </div>

        {/* Required Pace for 4-Month Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1">Required Pace for 4 Months</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
              {requiredPacePerDay}
            </span>
            <span className="text-xs text-slate-400">pages / day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            To finish all {overallStats.totalRemainingPages} remaining pages
          </div>
        </div>

        {/* Forecasted Completion Date */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Forecasted Completion</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white tracking-tight">
            {projectedDate ? formatDateDisplay(projectedDate) : 'Pending Pace'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {daysRemaining !== null ? `${daysRemaining} days from now` : 'Log continuous study'}
          </div>
        </div>

        {/* Pacing Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400 mb-1">Sprint Status</div>
          <div
            className={`text-xl font-bold font-mono ${
              avgPagesPerDay >= requiredPacePerDay
                ? 'text-emerald-400'
                : avgPagesPerDay > 0
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {avgPagesPerDay >= requiredPacePerDay
              ? 'On Track / Ahead'
              : avgPagesPerDay > 0
              ? 'Pace Adjustment Needed'
              : 'Initial Sprint'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {avgPagesPerDay >= requiredPacePerDay
              ? 'Meeting 12h benchmark'
              : `Increase by ${(requiredPacePerDay - avgPagesPerDay).toFixed(1)}p/day`}
          </div>
        </div>
      </div>

      {/* Daily Page Velocity Chart (Last 14 Days) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Daily Page Completion Velocity (Last 14 Days)</h3>
            <p className="text-xs text-slate-400">Unique pages covered daily across all textbooks</p>
          </div>
          <span className="text-xs font-mono text-teal-400">
            Target Pace: {requiredPacePerDay}p/day
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyPageTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} Pages`, 'Pages Completed']}
              />
              <Bar dataKey="pages" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                {dailyPageTrendData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pages >= requiredPacePerDay ? '#10b981' : entry.pages > 0 ? '#14b8a6' : '#334155'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject-Wise Completion Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">Subject-Wise Completion Ranking</h3>
            <p className="text-xs text-slate-400">Ranked by percentage of total book pages completed</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {subjectRankings.length} Configured Subjects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <th className="p-3 pl-4">Rank</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Book</th>
                <th className="p-3 text-right">Unique Done</th>
                <th className="p-3 text-right">Remaining</th>
                <th className="p-3 text-right">Progress %</th>
                <th className="p-3 text-right pr-4">Last Studied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {subjectRankings.map((sub, index) => (
                <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                  <td className="p-3 pl-4 font-bold text-slate-500">#{index + 1}</td>
                  <td className="p-3 font-semibold text-white font-sans">{sub.name}</td>
                  <td className="p-3 text-slate-400 font-sans truncate max-w-xs">{sub.bookName}</td>
                  <td className="p-3 text-right text-teal-400 font-bold tabular-nums">
                    {sub.completed}p
                  </td>
                  <td className="p-3 text-right text-slate-400 tabular-nums">{sub.remaining}p</td>
                  <td className="p-3 text-right tabular-nums">
                    <span
                      className={`font-bold ${
                        sub.percentage >= 70
                          ? 'text-emerald-400'
                          : sub.percentage >= 30
                          ? 'text-teal-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {sub.percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-right pr-4 text-slate-400">
                    {formatDateDisplay(sub.lastStudied)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
