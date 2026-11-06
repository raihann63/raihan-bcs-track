import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SubjectConfig,
  StudySession,
  RoutineSlot,
  RevisionTask,
  MCQPracticeEntry,
  ModelTestEntry,
  UserPrepProfile,
  AppView,
  TopicItem,
  PageInterval,
} from '../types';
import {
  INITIAL_SUBJECTS,
  INITIAL_ROUTINE,
  INITIAL_USER_PROFILE,
} from '../constants/initialData';
import {
  calculateNewUniquePagesAdded,
  calculateUniquePages,
} from '../utils/pageCalculations';
import { getTodayDateString, getSpacedRepetitionDate } from '../utils/dateUtils';

interface PrepContextType {
  subjects: SubjectConfig[];
  sessions: StudySession[];
  routine: RoutineSlot[];
  revisions: RevisionTask[];
  mcqPractices: MCQPracticeEntry[];
  modelTests: ModelTestEntry[];
  profile: UserPrepProfile;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Page Intervals
  addPageInterval: (
    subjectId: string,
    startPage: number,
    endPage: number,
    notes?: string,
    dateCompleted?: string
  ) => { uniqueAdded: number };
  updatePageInterval: (
    subjectId: string,
    intervalId: string,
    startPage: number,
    endPage: number,
    notes?: string
  ) => void;
  deletePageInterval: (subjectId: string, intervalId: string) => void;

  // Subject & Topic Management
  updateSubjectTotalPages: (subjectId: string, totalPages: number | null) => void;
  addTopic: (subjectId: string, title: string, chapterNumber?: number, startPage?: number, endPage?: number) => void;
  updateTopic: (subjectId: string, topicId: string, updates: Partial<TopicItem>) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;

  // Study Sessions
  logStudySession: (
    sessionData: Omit<StudySession, 'id' | 'createdAt' | 'pagesCompletedCount'>
  ) => { session: StudySession; newPagesAdded: number };
  updateStudySession: (sessionId: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (sessionId: string) => void;

  // Revision Tracking
  completeRevisionTask: (taskId: string, notes?: string) => void;
  rescheduleRevisionTask: (taskId: string, newDate: string) => void;
  addManualRevisionTask: (subjectId: string, topicTitle: string, scheduledDate: string, notes?: string) => void;

  // MCQ Practice
  addMCQPractice: (entry: Omit<MCQPracticeEntry, 'id' | 'accuracyPercentage'>) => void;
  deleteMCQPractice: (id: string) => void;

  // Model Tests
  addModelTest: (entry: Omit<ModelTestEntry, 'id' | 'obtainedMarks' | 'percentage'>) => void;
  deleteModelTest: (id: string) => void;

  // Routine & Settings
  updateRoutineSlot: (slotId: string, updates: Partial<RoutineSlot>) => void;
  updateProfile: (updates: Partial<UserPrepProfile>) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; error?: string };
  resetToDefaults: () => void;
  loadSampleData: () => void;

  // Live Timer
  timerSeconds: number;
  isTimerRunning: boolean;
  timerSubjectId: string;
  timerTopicTitle: string;
  startTimer: (subjectId: string, topicTitle?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}

const STORAGE_KEY = 'bcs_prep_tracker_v1';

// ✱ CHANGED: initialData.ts-এ subject/topic/page count বদলালে এই সংখ্যাটা +1 করো
const SCHEMA_VERSION = 2;

// ✱ CHANGED: saved subjects-কে নতুন default-এর সাথে merge করে, user-এর progress অক্ষত রাখে
const migrateSubjects = (parsed: SubjectConfig[]): SubjectConfig[] => {
  const merged = INITIAL_SUBJECTS.map((def) => {
    const old = parsed.find((s) => s.id === def.id);
    if (!old) return def;

    const validPages = !!old.totalPages && old.totalPages > 0;

    // default topic-গুলো নাও, কিন্তু saved status/অন্য field রাখো
    const topics = def.topics.map((t) => {
      const oldTopic = old.topics?.find((x) => x.id === t.id);
      return oldTopic ? { ...t, ...oldTopic, title: t.title } : t;
    });
    // user নিজে যোগ করা topic রেখে দাও
    const custom = (old.topics || []).filter(
      (t) => !def.topics.some((d) => d.id === t.id)
    );

    return {
      ...def,
      totalPages: validPages ? old.totalPages : def.totalPages,
      completedIntervals: old.completedIntervals || [],
      topics: [...topics, ...custom],
    };
  });

  // user-এর নিজের বানানো subject থাকলে রেখে দাও
  const extra = parsed.filter((s) => !INITIAL_SUBJECTS.some((d) => d.id === s.id));

  return [...merged, ...extra];
};

// ✱ CHANGED: subjects লোড করার নতুন ফাংশন
const loadSubjects = (): SubjectConfig[] => {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
    if (!saved) {
      localStorage.setItem(`${STORAGE_KEY}_schema`, String(SCHEMA_VERSION));
      return INITIAL_SUBJECTS;
    }

    const parsed: SubjectConfig[] = JSON.parse(saved);
    const savedVersion = Number(localStorage.getItem(`${STORAGE_KEY}_schema`) || 1);
    if (savedVersion >= SCHEMA_VERSION) return parsed;

    const migrated = migrateSubjects(parsed);
    localStorage.setItem(`${STORAGE_KEY}_schema`, String(SCHEMA_VERSION));
    return migrated;
  } catch {
    return INITIAL_SUBJECTS;
  }
};

const PrepContext = createContext<PrepContextType | undefined>(undefined);

export const PrepProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ✱ CHANGED: আগের try/catch ব্লকের বদলে loadSubjects
  const [subjects, setSubjects] = useState<SubjectConfig[]>(loadSubjects);

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [routine, setRoutine] = useState<RoutineSlot[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_routine`);
      return saved ? JSON.parse(saved) : INITIAL_ROUTINE;
    } catch {
      return INITIAL_ROUTINE;
    }
  });

  const [revisions, setRevisions] = useState<RevisionTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_revisions`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mcqPractices, setMcqPractices] = useState<MCQPracticeEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_mcqs`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [modelTests, setModelTests] = useState<ModelTestEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tests`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [profile, setProfile] = useState<UserPrepProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Live Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSubjectId, setTimerSubjectId] = useState<string>('mathematical_reasoning');
  const [timerTopicTitle, setTimerTopicTitle] = useState<string>('');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const startTimer = (subjectId: string, topicTitle = '') => {
    setTimerSubjectId(subjectId);
    setTimerTopicTitle(topicTitle);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => setIsTimerRunning(false);
  const resumeTimer = () => setIsTimerRunning(true);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
    } catch (e) {
      console.error('Storage write error: subjects', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
    } catch (e) {
      console.error('Storage write error: sessions', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_routine`, JSON.stringify(routine));
    } catch (e) {
      console.error('Storage write error: routine', e);
    }
  }, [routine]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_revisions`, JSON.stringify(revisions));
    } catch (e) {
      console.error('Storage write error: revisions', e);
    }
  }, [revisions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_mcqs`, JSON.stringify(mcqPractices));
    } catch (e) {
      console.error('Storage write error: mcqs', e);
    }
  }, [mcqPractices]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(modelTests));
    } catch (e) {
      console.error('Storage write error: tests', e);
    }
  }, [modelTests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
    } catch (e) {
      console.error('Storage write error: profile', e);
    }
  }, [profile]);

  // --- Interval & Page Management ---
  const addPageInterval = (
    subjectId: string,
    startPage: number,
    endPage: number,
    notes?: string,
    dateCompleted = getTodayDateString()
  ): { uniqueAdded: number } => {
    let uniqueAdded = 0;
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;

        const start = Math.min(startPage, endPage);
        const end = Math.max(startPage, endPage);
        uniqueAdded = calculateNewUniquePagesAdded(sub.completedIntervals, start, end, sub.totalPages);

        const newInterval: PageInterval = {
          id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          startPage: start,
          endPage: end,
          dateCompleted,
          notes,
        };

        return {
          ...sub,
          completedIntervals: [...sub.completedIntervals, newInterval],
        };
      })
    );
    return { uniqueAdded };
  };

  const updatePageInterval = (
    subjectId: string,
    intervalId: string,
    startPage: number,
    endPage: number,
    notes?: string
  ) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          completedIntervals: sub.completedIntervals.map((i) =>
            i.id === intervalId
              ? {
                  ...i,
                  startPage: Math.min(startPage, endPage),
                  endPage: Math.max(startPage, endPage),
                  notes: notes ?? i.notes,
                }
              : i
          ),
        };
      })
    );
  };

  const deletePageInterval = (subjectId: string, intervalId: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          completedIntervals: sub.completedIntervals.filter((i) => i.id !== intervalId),
        };
      })
    );
  };

  // --- Subject & Topic Management ---
  const updateSubjectTotalPages = (subjectId: string, totalPages: number | null) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          totalPages: totalPages && totalPages > 0 ? totalPages : null,
        };
      })
    );
  };

  const addTopic = (
    subjectId: string,
    title: string,
    chapterNumber?: number,
    startPage?: number,
    endPage?: number
  ) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const newTopic: TopicItem = {
          id: `top-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title,
          chapterNumber,
          startPage,
          endPage,
          status: 'not_started',
        };
        return {
          ...sub,
          topics: [...sub.topics, newTopic],
        };
      })
    );
  };

  const updateTopic = (subjectId: string, topicId: string, updates: Partial<TopicItem>) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          topics: sub.topics.map((t) => {
            if (t.id !== topicId) return t;
            const updated = { ...t, ...updates };

            // If topic is marked revised or reading_completed, automatically create or schedule spaced revision
            if (updates.status === 'reading_completed' && t.status !== 'reading_completed') {
              createSpacedRevisionChain(subjectId, t.title, getTodayDateString());
            }

            return updated;
          }),
        };
      })
    );
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        return {
          ...sub,
          topics: sub.topics.filter((t) => t.id !== topicId),
        };
      })
    );
  };

  // Automatically spawn the 4-stage spaced repetition schedule
  const createSpacedRevisionChain = (subjectId: string, topicTitle: string, studiedDate: string) => {
    const stage1Date = getSpacedRepetitionDate(studiedDate, 1);
    const stage2Date = getSpacedRepetitionDate(studiedDate, 2);
    const stage3Date = getSpacedRepetitionDate(studiedDate, 3);
    const stage4Date = getSpacedRepetitionDate(studiedDate, 4);

    const newTasks: RevisionTask[] = [
      {
        id: `rev-${Date.now()}-1`,
        subjectId,
        topicTitle,
        firstStudiedDate: studiedDate,
        stage: 1,
        scheduledDate: stage1Date,
        status: 'pending',
      },
      {
        id: `rev-${Date.now()}-2`,
        subjectId,
        topicTitle,
        firstStudiedDate: studiedDate,
        stage: 2,
        scheduledDate: stage2Date,
        status: 'pending',
      },
      {
        id: `rev-${Date.now()}-3`,
        subjectId,
        topicTitle,
        firstStudiedDate: studiedDate,
        stage: 3,
        scheduledDate: stage3Date,
        status: 'pending',
      },
      {
        id: `rev-${Date.now()}-4`,
        subjectId,
        topicTitle,
        firstStudiedDate: studiedDate,
        stage: 4,
        scheduledDate: stage4Date,
        status: 'pending',
      },
    ];

    setRevisions((prev) => [...prev, ...newTasks]);
  };

  // --- Study Sessions ---
  const logStudySession = (
    sessionData: Omit<StudySession, 'id' | 'createdAt' | 'pagesCompletedCount'>
  ) => {
    let pagesCompletedCount = 0;

    // If page range was provided, also record the interval directly into the subject
    if (sessionData.startPage && sessionData.endPage && sessionData.startPage > 0) {
      const subject = subjects.find((s) => s.id === sessionData.subjectId);
      if (subject) {
        const start = Math.min(sessionData.startPage, sessionData.endPage);
        const end = Math.max(sessionData.startPage, sessionData.endPage);
        pagesCompletedCount = calculateNewUniquePagesAdded(
          subject.completedIntervals,
          start,
          end,
          subject.totalPages
        );

        const newInterval: PageInterval = {
          id: `int-${Date.now()}`,
          startPage: start,
          endPage: end,
          dateCompleted: sessionData.date,
          notes: sessionData.notes,
        };

        setSubjects((prev) =>
          prev.map((s) =>
            s.id === sessionData.subjectId
              ? { ...s, completedIntervals: [...s.completedIntervals, newInterval] }
              : s
          )
        );
      }
    }

    // If MCQs were attempted in this session, also add to Question Bank records
    if (sessionData.mcqsAttempted > 0) {
      const accuracy =
        Math.round((sessionData.mcqsCorrect / sessionData.mcqsAttempted) * 1000) / 10;
      const mcqEntry: MCQPracticeEntry = {
        id: `mcq-${Date.now()}`,
        date: sessionData.date,
        subjectId: sessionData.subjectId,
        topicTitle: sessionData.topicTitle || 'General Chapter Drill',
        attempted: sessionData.mcqsAttempted,
        correct: sessionData.mcqsCorrect,
        incorrect: sessionData.mcqsIncorrect,
        accuracyPercentage: accuracy,
        notes: sessionData.notes,
      };
      setMcqPractices((prev) => [mcqEntry, ...prev]);
    }

    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      pagesCompletedCount,
      createdAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);

    // If a topic title was provided and status is completed, create spaced revision
    if (sessionData.topicTitle && sessionData.status === 'completed') {
      createSpacedRevisionChain(sessionData.subjectId, sessionData.topicTitle, sessionData.date);
    }

    return { session: newSession, newPagesAdded: pagesCompletedCount };
  };

  const updateStudySession = (sessionId: string, updates: Partial<StudySession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  const deleteStudySession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // --- Revision Management ---
  const completeRevisionTask = (taskId: string, notes?: string) => {
    setRevisions((prev) =>
      prev.map((r) =>
        r.id === taskId
          ? {
              ...r,
              status: 'completed',
              completedDate: getTodayDateString(),
              notes: notes || r.notes,
            }
          : r
      )
    );
  };

  const rescheduleRevisionTask = (taskId: string, newDate: string) => {
    setRevisions((prev) =>
      prev.map((r) =>
        r.id === taskId ? { ...r, scheduledDate: newDate, status: 'pending' } : r
      )
    );
  };

  const addManualRevisionTask = (
    subjectId: string,
    topicTitle: string,
    scheduledDate: string,
    notes?: string
  ) => {
    const newTask: RevisionTask = {
      id: `rev-man-${Date.now()}`,
      subjectId,
      topicTitle,
      firstStudiedDate: getTodayDateString(),
      stage: 1,
      scheduledDate,
      status: 'pending',
      notes,
    };
    setRevisions((prev) => [newTask, ...prev]);
  };

  // --- MCQ Practice ---
  const addMCQPractice = (entry: Omit<MCQPracticeEntry, 'id' | 'accuracyPercentage'>) => {
    const accuracy =
      entry.attempted > 0
        ? Math.round((entry.correct / entry.attempted) * 1000) / 10
        : 0;

    const newEntry: MCQPracticeEntry = {
      ...entry,
      id: `mcq-${Date.now()}`,
      accuracyPercentage: accuracy,
    };

    setMcqPractices((prev) => [newEntry, ...prev]);
  };

  const deleteMCQPractice = (id: string) => {
    setMcqPractices((prev) => prev.filter((m) => m.id !== id));
  };

  // --- Model Tests ---
  const addModelTest = (
    entry: Omit<ModelTestEntry, 'id' | 'obtainedMarks' | 'percentage'>
  ) => {
    const obtainedMarks = Math.max(
      0,
      Math.round(
        (entry.correctCount - entry.incorrectCount * entry.negativeMarkingPerWrong) * 100
      ) / 100
    );
    const percentage =
      entry.totalQuestions > 0
        ? Math.round((obtainedMarks / entry.totalQuestions) * 1000) / 10
        : 0;

    const newTest: ModelTestEntry = {
      ...entry,
      id: `mt-${Date.now()}`,
      obtainedMarks,
      percentage,
    };

    setModelTests((prev) => [newTest, ...prev]);
  };

  const deleteModelTest = (id: string) => {
    setModelTests((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Routine & Settings ---
  const updateRoutineSlot = (slotId: string, updates: Partial<RoutineSlot>) => {
    setRoutine((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot))
    );
  };

  const updateProfile = (updates: Partial<UserPrepProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const exportDataJSON = (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects,
      sessions,
      routine,
      revisions,
      mcqPractices,
      modelTests,
      profile,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.subjects)) {
        return { success: false, error: 'Invalid backup file format: missing subjects array.' };
      }

      // ✱ CHANGED: import করা পুরনো backup-এও migration চলবে
      setSubjects(migrateSubjects(data.subjects));
      localStorage.setItem(`${STORAGE_KEY}_schema`, String(SCHEMA_VERSION));
      if (Array.isArray(data.sessions)) setSessions(data.sessions);
      if (Array.isArray(data.routine)) setRoutine(data.routine);
      if (Array.isArray(data.revisions)) setRevisions(data.revisions);
      if (Array.isArray(data.mcqPractices)) setMcqPractices(data.mcqPractices);
      if (Array.isArray(data.modelTests)) setModelTests(data.modelTests);
      if (data.profile) setProfile(data.profile);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'JSON parsing failed' };
    }
  };

  const resetToDefaults = () => {
    // ✱ CHANGED: reset-এর পর schema version আপ-টু-ডেট রাখো
    localStorage.setItem(`${STORAGE_KEY}_schema`, String(SCHEMA_VERSION));
    setSubjects(INITIAL_SUBJECTS);
    setSessions([]);
    setRoutine(INITIAL_ROUTINE);
    setRevisions([]);
    setMcqPractices([]);
    setModelTests([]);
    setProfile(INITIAL_USER_PROFILE);
    resetTimer();
  };

  const loadSampleData = () => {
    const today = getTodayDateString();
    // Populate realistic study progress
    const demoSubjects = INITIAL_SUBJECTS.map((sub) => {
      if (sub.id === 'bangla_grammar') {
        return {
          ...sub,
          completedIntervals: [
            { id: 'di-1', startPage: 1, endPage: 35, dateCompleted: today, notes: 'ধ্বনি ও বর্ণ প্রকরণ' },
            { id: 'di-2', startPage: 50, endPage: 75, dateCompleted: today, notes: 'সন্ধি ও প্রত্যয়' },
          ],
        };
      }
      if (sub.id === 'bangla_literature') {
        return {
          ...sub,
          completedIntervals: [
            { id: 'di-3', startPage: 1, endPage: 40, dateCompleted: today, notes: 'চর্যাপদ ও মধ্যযুগ' },
          ],
        };
      }
      if (sub.id === 'mathematical_reasoning') {
        return {
          ...sub,
          completedIntervals: [
            { id: 'di-4', startPage: 1, endPage: 45, dateCompleted: today, notes: 'বাস্তব সংখ্যা ও লসাগু' },
            { id: 'di-5', startPage: 60, endPage: 90, dateCompleted: today, notes: 'শতকরা ও লাভ-ক্ষতি' },
          ],
        };
      }
      if (sub.id === 'english_language') {
        return {
          ...sub,
          completedIntervals: [
            { id: 'di-6', startPage: 1, endPage: 50, dateCompleted: today, notes: 'Parts of Speech & Clauses' },
          ],
        };
      }
      return sub;
    });

    const demoSessions: StudySession[] = [
      {
        id: 'ds-1',
        date: today,
        startTime: '06:30',
        endTime: '10:00',
        durationMinutes: 210,
        subjectId: 'bangla_grammar',
        topicTitle: 'ধ্বনি ও বর্ণ প্রকরণ',
        startPage: 1,
        endPage: 35,
        pagesCompletedCount: 35,
        mcqsAttempted: 50,
        mcqsCorrect: 44,
        mcqsIncorrect: 6,
        status: 'completed',
        notes: 'Thoroughly covered vowel & consonant changes.',
        createdAt: Date.now() - 3600000 * 5,
      },
      {
        id: 'ds-2',
        date: today,
        startTime: '10:30',
        endTime: '14:00',
        durationMinutes: 210,
        subjectId: 'mathematical_reasoning',
        topicTitle: 'বাস্তব সংখ্যা ও লসাগু-গসাগু',
        startPage: 1,
        endPage: 45,
        pagesCompletedCount: 45,
        mcqsAttempted: 60,
        mcqsCorrect: 56,
        mcqsIncorrect: 4,
        status: 'completed',
        notes: 'Assurance chapter-wise questions solved.',
        createdAt: Date.now() - 3600000 * 2,
      },
    ];

    const demoMCQs: MCQPracticeEntry[] = [
      {
        id: 'dm-1',
        date: today,
        subjectId: 'bangla_grammar',
        topicTitle: 'ধ্বনি পরিবর্তন ও বর্ণ',
        attempted: 50,
        correct: 44,
        incorrect: 6,
        accuracyPercentage: 88,
        notes: 'Weakness in অপিনিহিতি ও অভিশ্রুতি rules.',
      },
      {
        id: 'dm-2',
        date: today,
        subjectId: 'mathematical_reasoning',
        topicTitle: 'বাস্তব সংখ্যা ও মৌলিক সংখ্যা',
        attempted: 60,
        correct: 56,
        incorrect: 4,
        accuracyPercentage: 93.3,
        notes: 'Mastered co-prime numbers.',
      },
    ];

    const demoTests: ModelTestEntry[] = [
      {
        id: 'dt-1',
        date: today,
        testName: 'Uttoron Special Model Test 01',
        totalQuestions: 200,
        correctCount: 142,
        incorrectCount: 30,
        unansweredCount: 28,
        negativeMarkingPerWrong: 0.5,
        obtainedMarks: 127,
        percentage: 63.5,
        weakSubjectIds: ['international_affairs', 'general_science'],
        notes: 'Good score in Math and Bangla. Need to revise International Treaties.',
      },
    ];

    const demoRevisions: RevisionTask[] = [
      {
        id: 'dr-1',
        subjectId: 'bangla_grammar',
        topicTitle: 'ধ্বনি পরিবর্তন ও বর্ণ',
        firstStudiedDate: today,
        stage: 1,
        scheduledDate: today,
        status: 'pending',
        notes: 'Quick morning 20-min review.',
      },
      {
        id: 'dr-2',
        subjectId: 'mathematical_reasoning',
        topicTitle: 'বাস্তব সংখ্যা ও লসাগু',
        firstStudiedDate: today,
        stage: 2,
        scheduledDate: today,
        status: 'pending',
        notes: 'Formula recap.',
      },
    ];

    setSubjects(demoSubjects);
    setSessions(demoSessions);
    setMcqPractices(demoMCQs);
    setModelTests(demoTests);
    setRevisions(demoRevisions);
  };

  return (
    <PrepContext.Provider
      value={{
        subjects,
        sessions,
        routine,
        revisions,
        mcqPractices,
        modelTests,
        profile,
        currentView,
        setCurrentView,
        addPageInterval,
        updatePageInterval,
        deletePageInterval,
        updateSubjectTotalPages,
        addTopic,
        updateTopic,
        deleteTopic,
        logStudySession,
        updateStudySession,
        deleteStudySession,
        completeRevisionTask,
        rescheduleRevisionTask,
        addManualRevisionTask,
        addMCQPractice,
        deleteMCQPractice,
        addModelTest,
        deleteModelTest,
        updateRoutineSlot,
        updateProfile,
        exportDataJSON,
        importDataJSON,
        resetToDefaults,
        loadSampleData,
        timerSeconds,
        isTimerRunning,
        timerSubjectId,
        timerTopicTitle,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
      }}
    >
      {children}
    </PrepContext.Provider>
  );
};

export const usePrep = () => {
  const context = useContext(PrepContext);
  if (!context) {
    throw new Error('usePrep must be used within a PrepProvider');
  }
  return context;
};