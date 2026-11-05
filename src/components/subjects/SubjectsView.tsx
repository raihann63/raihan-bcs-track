import React, { useState } from 'react';
import { usePrep } from '../../context/PrepContext';
import { ProgressBar } from '../common/ProgressBar';
import { PageIntervalModal } from './PageIntervalModal';
import { TopicModal } from './TopicModal';
import { SubjectEditModal } from './SubjectEditModal';
import {
  getSubjectStats,
  getCombinedSubjectStats,
  getOverallSyllabusStats,
} from '../../utils/pageCalculations';
import { formatDateDisplay } from '../../utils/dateUtils';
import { SubjectConfig, PageInterval, TopicItem, TopicStatus } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Settings,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    addPageInterval,
    updatePageInterval,
    deletePageInterval,
    updateSubjectTotalPages,
    addTopic,
    updateTopic,
    deleteTopic,
  } = usePrep();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'language' | 'gk' | 'stem'>('all');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>('bangla_grammar');

  // Modals state
  const [intervalModalSubject, setIntervalModalSubject] = useState<SubjectConfig | null>(null);
  const [editingInterval, setEditingInterval] = useState<PageInterval | null>(null);

  const [topicModalSubject, setTopicModalSubject] = useState<SubjectConfig | null>(null);
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);

  const [configModalSubject, setConfigModalSubject] = useState<SubjectConfig | null>(null);

  const overallStats = getOverallSyllabusStats(subjects);
  const banglaStats = getCombinedSubjectStats(subjects, 'bangla');
  const englishStats = getCombinedSubjectStats(subjects, 'english');

  // Categorize subjects for filtering
  const filteredSubjects = subjects.filter((s) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'language') {
      return ['bangla_grammar', 'bangla_literature', 'english_language', 'english_literature'].includes(
        s.id
      );
    }
    if (selectedFilter === 'gk') {
      return ['bangladesh_affairs', 'international_affairs', 'geography_environment', 'ethics_governance'].includes(
        s.id
      );
    }
    if (selectedFilter === 'stem') {
      return ['mathematical_reasoning', 'mental_ability', 'general_science', 'computer_ict'].includes(
        s.id
      );
    }
    return true;
  });

  const handleSaveInterval = (start: number, end: number, notes?: string, date?: string) => {
    if (!intervalModalSubject) return;
    if (editingInterval) {
      updatePageInterval(intervalModalSubject.id, editingInterval.id, start, end, notes);
    } else {
      addPageInterval(intervalModalSubject.id, start, end, notes, date);
    }
    setEditingInterval(null);
  };

  const handleSaveTopic = (
    title: string,
    chapterNumber?: number,
    startPage?: number,
    endPage?: number,
    status?: TopicStatus
  ) => {
    if (!topicModalSubject) return;
    if (editingTopic) {
      updateTopic(topicModalSubject.id, editingTopic.id, {
        title,
        chapterNumber,
        startPage,
        endPage,
        status: status || 'not_started',
      });
    } else {
      addTopic(topicModalSubject.id, title, chapterNumber, startPage, endPage);
    }
    setEditingTopic(null);
  };

  const statusColors: Record<TopicStatus, string> = {
    not_started: 'text-slate-400 border-slate-700 bg-slate-800/40',
    reading_completed: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    mcq_practiced: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    revised: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    mastered: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  };

  const statusLabels: Record<TopicStatus, string> = {
    not_started: 'Not Started',
    reading_completed: 'Read',
    mcq_practiced: 'MCQs Done',
    revised: 'Revised',
    mastered: 'Mastered',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Overview Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Subject Specifications & Page Progress
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            11 Subjects · Interval Deduplication · Separate Bangla & English Sub-disciplines
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">Total Unique Pages: </span>
            <span className="text-teal-400 font-bold tabular-nums">
              {overallStats.totalCompletedPages} / {overallStats.totalConfiguredPages}p
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">Progress: </span>
            <span className="text-teal-400 font-bold tabular-nums">
              {overallStats.overallPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bangla & English Combined Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bangla Combined */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-xs font-bold text-white">Bangla Combined</span>
              <span className="text-[11px] text-slate-400 ml-2">(Grammar 15m + Literature 20m)</span>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 tabular-nums">
              {banglaStats.completedPages} / {banglaStats.totalPages}p ({banglaStats.percentage.toFixed(1)}%)
            </span>
          </div>
          <ProgressBar percentage={banglaStats.percentage} color="teal" height="sm" />
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Grammar: 200p · Lit: 250p</span>
            <span>Remaining: {banglaStats.remainingPages}p</span>
          </div>
        </div>

        {/* English Combined */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-xs font-bold text-white">English Combined</span>
              <span className="text-[11px] text-slate-400 ml-2">(Language 20m + Literature 15m)</span>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 tabular-nums">
              {englishStats.completedPages} / {englishStats.totalPages}p ({englishStats.percentage.toFixed(1)}%)
            </span>
          </div>
          <ProgressBar percentage={englishStats.percentage} color="teal" height="sm" />
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Language: 266p · Lit: 169p</span>
            <span>Remaining: {englishStats.remainingPages}p</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Subjects ({subjects.length})
        </button>
        <button
          onClick={() => setSelectedFilter('language')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'language'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bangla & English (4)
        </button>
        <button
          onClick={() => setSelectedFilter('gk')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'gk'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          General Knowledge & Ethics (4)
        </button>
        <button
          onClick={() => setSelectedFilter('stem')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'stem'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Science, Math & ICT (4)
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div className="space-y-4">
        {filteredSubjects.map((subject) => {
          const stats = getSubjectStats(subject);
          const isExpanded = expandedSubjectId === subject.id;
          const isConfigured = stats.isConfigured;

          return (
            <div
              key={subject.id}
              className={`bg-slate-900 border rounded-xl transition-all duration-150 overflow-hidden ${
                isConfigured ? 'border-slate-800' : 'border-amber-500/40 bg-amber-950/10'
              }`}
            >
              {/* Card Header Row */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {subject.parentSubjectId && (
                      <span className="text-[10px] font-mono font-bold text-teal-400 px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                        {subject.parentSubjectId.toUpperCase()} SUB-SUBJECT
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400">
                      BCS: {subject.bcsMarks} Marks
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {subject.bookName}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{subject.name}</span>
                    {!isConfigured && (
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Page Count Pending
                      </span>
                    )}
                  </h3>
                </div>

                {/* Right Side Stats & Action Buttons */}
                <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto justify-between lg:justify-end shrink-0">
                  {isConfigured ? (
                    <div className="text-right font-mono">
                      <div className="text-lg font-bold text-white tabular-nums">
                        {stats.completedPages}{' '}
                        <span className="text-xs text-slate-400 font-normal">/ {stats.totalPages}p</span>
                      </div>
                      <div className="text-xs text-teal-400 font-bold tabular-nums">
                        {stats.percentage?.toFixed(1)}% Completed
                      </div>
                    </div>
                  ) : (
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-amber-400 font-mono">Unconfigured</span>
                      <div className="text-[10px] text-slate-400">Page denominator null</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isConfigured && (
                      <button
                        onClick={() => {
                          setIntervalModalSubject(subject);
                          setEditingInterval(null);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Pages</span>
                      </button>
                    )}

                    <button
                      onClick={() => setConfigModalSubject(subject)}
                      title="Configure Subject / Page Count"
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand topics & history'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar Strip */}
              {isConfigured && (
                <div className="px-5 pb-3">
                  <ProgressBar percentage={stats.percentage || 0} color="teal" height="sm" />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                    <span>Remaining: {stats.remainingPages} pages</span>
                    <span>Last studied: {formatDateDisplay(stats.lastStudiedDate)}</span>
                  </div>
                </div>
              )}

              {/* Expanded Section: Intervals History & Topic List */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950/50 p-5 space-y-6">
                  {/* Part A: Unique Completed Intervals History */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Completed Page Intervals History ({subject.completedIntervals.length})
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Non-overlapping ranges are merged automatically for 100% accurate deduplication.
                        </p>
                      </div>

                      {isConfigured && (
                        <button
                          onClick={() => {
                            setIntervalModalSubject(subject);
                            setEditingInterval(null);
                          }}
                          className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Interval</span>
                        </button>
                      )}
                    </div>

                    {subject.completedIntervals.length === 0 ? (
                      <div className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-400">
                        No page intervals logged yet. Click "Log Pages" to add your completed page ranges (e.g., 1–35, 40–60).
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {subject.completedIntervals.map((interval) => (
                          <div
                            key={interval.id}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-mono font-bold text-white">
                                pp. {interval.startPage} – {interval.endPage}{' '}
                                <span className="text-[11px] font-normal text-teal-400">
                                  ({interval.endPage - interval.startPage + 1}p)
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                {formatDateDisplay(interval.dateCompleted)}
                                {interval.notes && ` · ${interval.notes}`}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                onClick={() => {
                                  setIntervalModalSubject(subject);
                                  setEditingInterval(interval);
                                }}
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                                title="Edit interval"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deletePageInterval(subject.id, interval.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                                title="Delete interval"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Part B: Topic & Chapter Checklist */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Syllabus Topics & Chapters ({subject.topics.length})
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Track conceptual mastery status independently from raw page counts.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setTopicModalSubject(subject);
                          setEditingTopic(null);
                        }}
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Topic</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {subject.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start sm:items-center gap-2.5">
                            <span className="font-mono text-slate-500 font-bold">
                              {topic.chapterNumber ? `#${topic.chapterNumber}` : '•'}
                            </span>
                            <div>
                              <span className="font-semibold text-white">{topic.title}</span>
                              {topic.startPage && topic.endPage && (
                                <span className="text-[11px] text-slate-400 font-mono ml-2">
                                  (pp. {topic.startPage}–{topic.endPage})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {/* Topic Status Selector */}
                            <select
                              value={topic.status}
                              onChange={(e) =>
                                updateTopic(subject.id, topic.id, {
                                  status: e.target.value as TopicStatus,
                                })
                              }
                              className={`px-2 py-1 rounded-md text-[11px] font-medium border focus:outline-none ${statusColors[topic.status]}`}
                            >
                              <option value="not_started">Not Started</option>
                              <option value="reading_completed">Reading Completed</option>
                              <option value="mcq_practiced">MCQ Practiced</option>
                              <option value="revised">Revised</option>
                              <option value="mastered">Mastered</option>
                            </select>

                            <button
                              onClick={() => {
                                setTopicModalSubject(subject);
                                setEditingTopic(topic);
                              }}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                              title="Edit topic"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTopic(subject.id, topic.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                              title="Delete topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interval Modal */}
      <PageIntervalModal
        isOpen={Boolean(intervalModalSubject)}
        onClose={() => {
          setIntervalModalSubject(null);
          setEditingInterval(null);
        }}
        subject={intervalModalSubject}
        editingInterval={editingInterval}
        onSave={handleSaveInterval}
      />

      {/* Topic Modal */}
      <TopicModal
        isOpen={Boolean(topicModalSubject)}
        onClose={() => {
          setTopicModalSubject(null);
          setEditingTopic(null);
        }}
        subjectName={topicModalSubject?.name || ''}
        editingTopic={editingTopic}
        onSave={handleSaveTopic}
      />

      {/* Subject Config Modal */}
      <SubjectEditModal
        isOpen={Boolean(configModalSubject)}
        onClose={() => setConfigModalSubject(null)}
        subject={configModalSubject}
        onSave={(totalPages, bookName, bcsMarks) => {
          if (!configModalSubject) return;
          updateSubjectTotalPages(configModalSubject.id, totalPages);
        }}
      />
    </div>
  );
};
