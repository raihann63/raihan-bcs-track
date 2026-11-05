/**
 * BCS PREP TRACKER - Type Definitions
 */

export interface PageInterval {
  id: string;
  startPage: number;
  endPage: number;
  dateCompleted: string; // YYYY-MM-DD
  sessionId?: string;
  notes?: string;
}

export type TopicStatus = 
  | 'not_started' 
  | 'reading_completed' 
  | 'mcq_practiced' 
  | 'revised' 
  | 'mastered';

export interface TopicItem {
  id: string;
  title: string;
  chapterNumber?: number;
  startPage?: number;
  endPage?: number;
  status: TopicStatus;
  lastStudiedDate?: string;
  notes?: string;
}

export interface SubjectConfig {
  id: string;
  name: string;
  bcsMarks: number;
  totalPages: number | null; // null for Ethics until configured
  isSubSubject: boolean;
  parentSubjectId?: 'bangla' | 'english';
  bookName: string;
  completedIntervals: PageInterval[];
  topics: TopicItem[];
}

export type SessionStatus = 'completed' | 'partial' | 'missed';

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  subjectId: string;
  topicTitle?: string;
  startPage?: number;
  endPage?: number;
  pagesCompletedCount: number;
  mcqsAttempted: number;
  mcqsCorrect: number;
  mcqsIncorrect: number;
  notes?: string;
  status: SessionStatus;
  createdAt: number;
}

export interface RevisionTask {
  id: string;
  subjectId: string;
  topicTitle: string;
  firstStudiedDate: string; // YYYY-MM-DD
  stage: 1 | 2 | 3 | 4; // 1: +1d, 2: +3d, 3: +7d, 4: +15d
  scheduledDate: string; // YYYY-MM-DD
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export interface MCQPracticeEntry {
  id: string;
  date: string;
  subjectId: string;
  topicTitle: string;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracyPercentage: number;
  notes?: string;
  repeatedMistakesNotes?: string;
}

export interface ModelTestEntry {
  id: string;
  date: string;
  testName: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  negativeMarkingPerWrong: number;
  obtainedMarks: number;
  percentage: number;
  weakSubjectIds: string[];
  notes?: string;
}

export type DayOfWeek = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
export type TimeSlotId = 'slot1' | 'slot2' | 'slot3' | 'slot4';

export interface RoutineSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  timeRange: string; // e.g. "6:30–10:00"
  slotId: TimeSlotId;
  subjectId: string;
  customLabel?: string;
}

export interface UserPrepProfile {
  examName: string;
  targetRank: string;
  startDate: string; // YYYY-MM-DD
  targetDurationMonths: number;
  dailyHourTarget: number;
  primaryBookSeries: string;
  questionBankSeries: string;
  academicBackground: string;
  cgpa: number;
  monthlyPageTargets: {
    month1: number;
    month2: number;
    month3: number;
    month4: number;
  };
}

export type AppView = 
  | 'dashboard' 
  | 'routine' 
  | 'tracker' 
  | 'subjects' 
  | 'revision' 
  | 'qbank' 
  | 'modelTests' 
  | 'reports' 
  | 'settings';
