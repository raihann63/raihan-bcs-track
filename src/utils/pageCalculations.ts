import { SubjectConfig, PageInterval } from '../types';

export interface MergedRange {
  start: number;
  end: number;
}

/**
 * Merges overlapping and contiguous page intervals to find disjoint unique ranges.
 * E.g., [1, 20] and [15, 35] => [1, 35]
 * [1, 10] and [11, 20] => [1, 20]
 */
export function mergeIntervals(intervals: PageInterval[], maxLimit?: number | null): MergedRange[] {
  if (!intervals || intervals.length === 0) return [];

  // Filter and normalize ranges
  const valid = intervals
    .map((i) => {
      const start = Math.min(Number(i.startPage) || 0, Number(i.endPage) || 0);
      let end = Math.max(Number(i.startPage) || 0, Number(i.endPage) || 0);
      if (maxLimit && maxLimit > 0) {
        end = Math.min(end, maxLimit);
      }
      return { start, end };
    })
    .filter((r) => r.start > 0 && r.end >= r.start);

  if (valid.length === 0) return [];

  // Sort by start ascending, then by end descending
  valid.sort((a, b) => (a.start !== b.start ? a.start - b.start : b.end - a.end));

  const merged: MergedRange[] = [valid[0]];

  for (let i = 1; i < valid.length; i++) {
    const current = valid[i];
    const prev = merged[merged.length - 1];

    if (current.start <= prev.end + 1) {
      // Overlapping or consecutive: merge
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/**
 * Calculates the exact count of unique completed pages without double-counting.
 */
export function calculateUniquePages(intervals: PageInterval[], maxLimit?: number | null): number {
  const merged = mergeIntervals(intervals, maxLimit);
  return merged.reduce((acc, curr) => acc + (curr.end - curr.start + 1), 0);
}

/**
 * Calculates how many new unique pages a proposed interval would add
 */
export function calculateNewUniquePagesAdded(
  existingIntervals: PageInterval[],
  startPage: number,
  endPage: number,
  maxLimit?: number | null
): number {
  const beforeCount = calculateUniquePages(existingIntervals, maxLimit);
  const tempInterval: PageInterval = {
    id: 'temp',
    startPage,
    endPage,
    dateCompleted: new Date().toISOString().split('T')[0],
  };
  const afterCount = calculateUniquePages([...existingIntervals, tempInterval], maxLimit);
  return Math.max(0, afterCount - beforeCount);
}

export interface SubjectStats {
  subjectId: string;
  name: string;
  isConfigured: boolean;
  totalPages: number | null;
  completedPages: number;
  remainingPages: number | null;
  percentage: number | null;
  lastStudiedDate: string | null;
  mergedRanges: MergedRange[];
  intervalCount: number;
}

export function getSubjectStats(subject: SubjectConfig): SubjectStats {
  const isConfigured = subject.totalPages !== null && subject.totalPages > 0;
  const mergedRanges = mergeIntervals(subject.completedIntervals, subject.totalPages);
  const completedPages = calculateUniquePages(subject.completedIntervals, subject.totalPages);

  let remainingPages: number | null = null;
  let percentage: number | null = null;

  if (isConfigured && subject.totalPages !== null) {
    remainingPages = Math.max(0, subject.totalPages - completedPages);
    percentage = Math.min(100, Math.round((completedPages / subject.totalPages) * 1000) / 10);
  }

  // Find latest studied date from intervals
  let lastStudiedDate: string | null = null;
  if (subject.completedIntervals.length > 0) {
    const dates = subject.completedIntervals
      .map((i) => i.dateCompleted)
      .filter(Boolean)
      .sort();
    if (dates.length > 0) {
      lastStudiedDate = dates[dates.length - 1];
    }
  }

  return {
    subjectId: subject.id,
    name: subject.name,
    isConfigured,
    totalPages: subject.totalPages,
    completedPages,
    remainingPages,
    percentage,
    lastStudiedDate,
    mergedRanges,
    intervalCount: subject.completedIntervals.length,
  };
}

export interface CombinedGroupStats {
  groupId: 'bangla' | 'english';
  title: string;
  totalPages: number;
  completedPages: number;
  remainingPages: number;
  percentage: number;
  lastStudiedDate: string | null;
  subSubjects: SubjectStats[];
}

export function getCombinedSubjectStats(
  subjects: SubjectConfig[],
  parentId: 'bangla' | 'english'
): CombinedGroupStats {
  const subSubjects = subjects
    .filter((s) => s.parentSubjectId === parentId)
    .map(getSubjectStats);

  const totalPages = subSubjects.reduce((acc, curr) => acc + (curr.totalPages || 0), 0);
  const completedPages = subSubjects.reduce((acc, curr) => acc + curr.completedPages, 0);
  const remainingPages = Math.max(0, totalPages - completedPages);
  const percentage = totalPages > 0 ? Math.min(100, Math.round((completedPages / totalPages) * 1000) / 10) : 0;

  const validDates = subSubjects
    .map((s) => s.lastStudiedDate)
    .filter((d): d is string => d !== null)
    .sort();
  const lastStudiedDate = validDates.length > 0 ? validDates[validDates.length - 1] : null;

  return {
    groupId: parentId,
    title: parentId === 'bangla' ? 'Combined Bangla (Grammar + Literature)' : 'Combined English (Language + Literature)',
    totalPages,
    completedPages,
    remainingPages,
    percentage,
    lastStudiedDate,
    subSubjects,
  };
}

export interface OverallSyllabusStats {
  totalConfiguredPages: number;
  totalCompletedPages: number;
  totalRemainingPages: number;
  overallPercentage: number;
  unconfiguredSubjectsCount: number;
  totalSubjectsCount: number;
}

export function getOverallSyllabusStats(subjects: SubjectConfig[]): OverallSyllabusStats {
  let totalConfiguredPages = 0;
  let totalCompletedPages = 0;
  let unconfiguredSubjectsCount = 0;

  for (const sub of subjects) {
    if (sub.totalPages === null || sub.totalPages <= 0) {
      unconfiguredSubjectsCount++;
    } else {
      totalConfiguredPages += sub.totalPages;
      totalCompletedPages += calculateUniquePages(sub.completedIntervals, sub.totalPages);
    }
  }

  const totalRemainingPages = Math.max(0, totalConfiguredPages - totalCompletedPages);
  const overallPercentage =
    totalConfiguredPages > 0
      ? Math.min(100, Math.round((totalCompletedPages / totalConfiguredPages) * 1000) / 10)
      : 0;

  return {
    totalConfiguredPages,
    totalCompletedPages,
    totalRemainingPages,
    overallPercentage,
    unconfiguredSubjectsCount,
    totalSubjectsCount: subjects.length,
  };
}
