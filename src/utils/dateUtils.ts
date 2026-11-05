/**
 * Date and Spaced Repetition Helpers
 */

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return 'Not yet studied';
  try {
    const today = getTodayDateString();
    if (dateStr === today) return 'Today';

    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;

    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function addDaysToDate(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  const p1 = fromDateStr.split('-');
  const p2 = toDateStr.split('-');
  const d1 = new Date(Number(p1[0]), Number(p1[1]) - 1, Number(p1[2]));
  const d2 = new Date(Number(p2[0]), Number(p2[1]) - 1, Number(p2[2]));
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates revision target date based on spaced repetition stages
 * 1st revision: 1 day later
 * 2nd revision: 3 days later
 * 3rd revision: 7 days later
 * 4th revision: 15 days later
 */
export function getSpacedRepetitionDate(firstStudiedDate: string, stage: 1 | 2 | 3 | 4): string {
  const intervalMap: Record<number, number> = {
    1: 1,
    2: 3,
    3: 7,
    4: 15,
  };
  return addDaysToDate(firstStudiedDate, intervalMap[stage]);
}

/**
 * Categorize revision task status relative to today
 */
export function getRevisionTaskStatus(
  scheduledDate: string,
  isCompleted: boolean
): 'completed' | 'due_today' | 'overdue' | 'upcoming' {
  if (isCompleted) return 'completed';
  const today = getTodayDateString();
  if (scheduledDate < today) return 'overdue';
  if (scheduledDate === today) return 'due_today';
  return 'upcoming';
}

/**
 * Estimates syllabus completion date based on total remaining pages and daily pace
 */
export function estimateCompletionDate(
  remainingPages: number,
  pagesPerDayPace: number
): { projectedDate: string | null; daysRemaining: number | null } {
  if (remainingPages <= 0) {
    return { projectedDate: 'Syllabus Completed', daysRemaining: 0 };
  }
  if (!pagesPerDayPace || pagesPerDayPace <= 0) {
    return { projectedDate: null, daysRemaining: null };
  }

  const daysNeeded = Math.ceil(remainingPages / pagesPerDayPace);
  const today = getTodayDateString();
  const projectedDate = addDaysToDate(today, daysNeeded);

  return { projectedDate, daysRemaining: daysNeeded };
}
