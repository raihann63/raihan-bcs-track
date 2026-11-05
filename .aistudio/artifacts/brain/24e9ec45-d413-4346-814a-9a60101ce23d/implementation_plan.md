# BCS PREP TRACKER — Architectural Implementation Plan

A high-precision personal preparation management system for the Bangladesh Civil Service (BCS) Preliminary Examination, built with mathematical page-range tracking, interval-merging deduplication, daily study logging, spaced repetition, MCQ performance analysis, and 4-month syllabus forecasting.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the alignment phase and are formally embedded into the system architecture:

- **Confirmed Decision 1 (Session Tracking Mode)**: Both an active live stopwatch/countdown study timer (with start/pause/resume/log) AND manual retrospective session entry will be provided. Sessions recorded via the timer automatically populate study duration and start/end timestamps.
- **Confirmed Decision 2 (Preparation Timeline Start)**: The 4-month preparation countdown allows selecting a custom start date (defaulting to current date), dynamically computing elapsed days, remaining days, daily page pace requirements, and projected syllabus completion date.
- **Confirmed Decision 3 (Ethics & Unconfigured Subjects)**: *Ethics, Values and Good Governance* remains fully visible in the syllabus and subject list with a distinct configuration banner ("Page count not set"). It is excluded from total page denominators until configured, preserving 100% mathematical accuracy without invented page counts.
- **Confirmed Decision 4 (Interval Page Deduplication)**: Page-based progress uses mathematical interval merging $[a, b] \cup [c, d]$ to calculate exact unique completed pages. Overlapping entries (e.g., studying pages 1–25 and later 20–40) contribute exactly 40 unique pages, never 45.

---

## 1. Overview & Core Concept

- **What It Does**: BCS PREP TRACKER is a dedicated, production-grade web application engineered specifically for the intense 4-month BCS Preliminary candidate workflow. It replaces superficial check-boxes with an exact page-level syllabus progress engine across 11 configured subject disciplines (with granular sub-subjects for Bangla Literature/Grammar and English Language/Literature), an interactive daily study logger against a 12-hour daily benchmark, automated 4-stage spaced repetition alerts (1, 3, 7, and 15 days), an Assurance Question Bank chapter-wise MCQ tracker, and full Model Test score analytics with negative marking support.
- **Target Persona**: Competitive BCS candidates (specifically Computer Science & Engineering graduate aiming for top merit rank in general/technical cadre) requiring strict accountability, granular tracking across Uttoron preparation books, and realistic completion forecasting without synthetic or fabricated metrics.
- **Key Value**: Delivers absolute data integrity. Zero progress is claimed unless verified through validated page intervals or completed sessions. All charts, completion dates, and accuracy rates derive exclusively from user records.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard & Daily Command**: The user arrives at an executive dashboard displaying 8 primary KPI metrics (Overall Syllabus Completion %, Unique Completed Pages, Remaining Pages, Total Study Hours, Today's 12-Hour Target Gauge, Solved MCQs, Average MCQ Accuracy %, and Model Tests Completed). A "Quick Study Log" action opens a session logger or toggles the floating Study Stopwatch.
2. **Page-Range Syllabus Logging**: In the *Subjects & Syllabus* module, selecting any subject displays book specifications (Uttoron series), current unique pages completed, and an interactive page-range logger. The candidate enters ranges like `1-35, 42-60` or edits existing intervals. The visual progress bar updates instantly with deduplicated counts.
3. **Daily Routine & Timetable Execution**: The *Weekly Routine* view displays the Saturday–Friday time slots (`06:30–10:00`, `10:30–14:00`, `15:30–19:00`, `20:00–21:00`). Clicking any scheduled block allows initiating a live study session or logging hours, page ranges, and solved MCQs directly into the day's record.
4. **Spaced Revision Execution**: When topics or chapters are completed, the system automatically schedules 4 revision intervals (+1 day, +3 days, +7 days, +15 days). The *Revision Tracker* categorizes items into Overdue, Today's Due, and Upcoming, allowing 1-click completion or manual reschedule.
5. **MCQ & Model Test Diagnostics**: The candidate logs post-chapter Assurance Question Bank practice (attempted, correct, wrong) and Friday Model Tests (subject breakdowns, negative score deductions). The diagnostics module highlights weak subject clusters for targeted remediation.

### Visual Identity & Theme (SaaS Dashboard Guidelines)

- **Canvas & Tone**: Deep dark navy canvas (`#090D16` / `#0F172A`) with subdued structural surfaces (`#131C31` / `#1E293B`) and crisp hairline dividers (`rgba(255, 255, 255, 0.07)`).
- **Accents**: Focused energetic teal (`#14B8A6` / `#0D9488`) for syllabus completion and primary actions, cobalt blue (`#3B82F6`) for study hours, amber (`#F59E0B`) for pending revisions, and crimson (`#EF4444`) for errors and overdue tasks.
- **Typography**: 
  - Display & Headings: `Plus Jakarta Sans` (weights 600, 700) with balanced headline wrapping (`text-wrap: balance`).
  - Body Prose: `Public Sans` / `DM Sans` (weight 400, 500) for dense tabular scannability.
  - Data Numerals: Monospace tabular numbers (`font-mono tabular-nums`) across all tables, KPI cards, page tallies, and timestamps.
- **Zero-Pill Discipline**: All status metadata, chapter counts, and timestamps use clean typographic separators (`·` or `/`) instead of nested pill badges. Only interactive segmented tabs and functional filter buttons have button backgrounds.
- **Spatial Composition**: Desktop-first 1440px viewport presence with a clean collapsible 260px sidebar navigation, one-row top breadcrumb header with live study timer pill, and zero cards-within-cards nesting.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Why | Alternatives Considered |
|---|---|---|---|
| **Page Progress Engine** | Disjoint Interval Union Algorithm | Guarantees mathematically pure unique page counts regardless of how many times a candidate re-reads overlapping page spans. | Simple arithmetic addition (leads to >100% false progress on re-reading) or bitsets (heavy memory overhead). |
| **Data Persistence** | Structured LocalStorage with IndexedDB fallback & JSON Backup/Restore | Instant zero-latency loading, operates 100% offline without network reliance, easily exported as full JSON backup. | Remote database (unnecessary latency and auth barrier for personal single-user prep system). |
| **Sub-subject Architecture** | First-class entities with independent page counts, topics, and MCQs, coupled with automated parent rollups | Bangla and English have completely different books, question patterns, and faculty preparations in BCS. | Treating them as generic tags (prevents individual page tracking for Bangla Grammar vs Bangla Lit). |
| **Ethics Subject Handling** | Active subject with `totalPages: null` and explicit configuration prompt | Respects the user constraint: "Do not invent the page count for Ethics" while allowing full inclusion once book arrives. | Assigning a placeholder number (violates requirement) or omitting the subject entirely. |
| **MCQ Practice Linking** | Immediate chapter-wise attachment + standalone Question Bank view | Directly reflects the user's workflow: "QBank is not a separate study session. I solve chapter-wise MCQs immediately after studying each chapter." | Isolating MCQs to an external disconnected module. |

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BCS PREP TRACKER (Frontend)                           │
│                                                                                 │
│  ┌─────────────────────────── Top Navigation Bar ────────────────────────────┐  │
│  │ Breadcrumb / Section Title  │  Live Timer Bar  │  Quick Log CTA  │ Backup │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│  │     Sidebar      │  │                 Active Main View                    │  │
│  │ ──────────────── │  │ ┌─────────────────────────────────────────────────┐ │  │
│  │ • Dashboard      │  │ │ 1. Dashboard View (8 KPIs, 4 Recharts, Pace)    │ │  │
│  │ • Weekly Routine │  │ │ 2. Weekly Routine View (Sat-Fri, Editable Grid) │ │  │
│  │ • Daily Tracker  │  │ │ 3. Daily Tracker View (Sessions, Timers, MCQs)  │ │  │
│  │ • Subjects & Syl │  │ │ 4. Subjects & Syllabus (Interval Union Tracker) │ │  │
│  │ • Revision Track │  │ │ 5. Revision Tracker (1-3-7-15 Day Spaced Rep)   │ │  │
│  │ • Question Bank  │  │ │ 6. Question Bank (Assurance MCQ Analytics)       │ │  │
│  │ • Model Tests    │  │ │ 7. Model Tests (BCS Marks, Negative Penalties)  │ │  │
│  │ • Reports & Pace │  │ │ 8. Reports & Analytics (Projections, Trends)    │ │  │
│  │ • Settings/Data  │  │ │ 9. Settings (Page Counts, Targets, JSON Export) │ │  │
│  │                  │  │ └─────────────────────────────────────────────────┘ │  │
│  └──────────────────┘  └─────────────────────────────────────────────────────┘  │
│                                           │                                     │
│                                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                 Core Logic & Mathematical Processing Engines              │  │
│  │  ┌────────────────────────┐  ┌─────────────────────┐  ┌────────────────┐  │  │
│  │  │ Page Interval Union    │  │ Spaced Repetition   │  │ Pace & Forecast│  │  │
│  │  │ [1-20] U [15-35] = 35  │  │ +1, +3, +7, +15 Days│  │ Linear Proj.   │  │  │
│  │  └────────────────────────┘  └─────────────────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                           │                                     │
│                                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │            Persistence Layer: LocalStorage + Reactive Event Bus           │  │
│  │    Schema v1.0 • Auto-Save • JSON Export / Import • Safe Validation       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Core Data Models & TypeScript Interfaces

```typescript
// --- Subjects & Sub-Subjects ---
export interface PageInterval {
  id: string;
  startPage: number;
  endPage: number;
  dateCompleted: string; // ISO format YYYY-MM-DD
  sessionId?: string;
  notes?: string;
}

export type TopicStatus = 'not_started' | 'reading_completed' | 'mcq_practiced' | 'revised' | 'mastered';

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
  totalPages: number | null; // null for unconfigured (Ethics)
  isSubSubject: boolean;
  parentSubjectId?: 'bangla' | 'english';
  bookName: string;
  completedIntervals: PageInterval[];
  topics: TopicItem[];
}

// --- Daily Study Sessions ---
export type SessionStatus = 'completed' | 'partial' | 'missed';

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  subjectId: string; // sub-subject ID if applicable
  topicId?: string;
  topicTitle?: string;
  startPage?: number;
  endPage?: number;
  pagesCompletedCount: number; // unique pages attributed to this session
  mcqsAttempted: number;
  mcqsCorrect: number;
  mcqsIncorrect: number;
  notes?: string;
  status: SessionStatus;
  createdAt: number;
}

// --- Spaced Repetition ---
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

// --- Question Bank (Assurance) ---
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

// --- Model Test ---
export interface ModelTestEntry {
  id: string;
  date: string;
  testName: string; // e.g. "Full Model Test 01 - Uttoron"
  totalQuestions: number; // typically 200 for BCS
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  negativeMarkingPerWrong: number; // default 0.50
  obtainedMarks: number; // correct - (incorrect * negativeMarkingPerWrong)
  percentage: number;
  weakSubjectIds: string[];
  notes?: string;
}

// --- Routine Time Slot ---
export interface RoutineSlot {
  id: string;
  dayOfWeek: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: '6:30–10:00' | '10:30–2:00' | '3:30–7:00' | '8:00–9:00';
  assignedSubjectId: string;
  activityLabel: string;
}

// --- Global User Profile & Settings ---
export interface UserPrepProfile {
  examName: string;
  targetRank: string;
  startDate: string; // YYYY-MM-DD
  targetDurationMonths: number; // 4
  dailyHourTarget: number; // 12
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
```

### Mathematical Algorithms & Validation Invariants

1. **Page Interval Union Algorithm**:
   ```typescript
   export function calculateUniquePages(intervals: PageInterval[], maxLimit?: number | null): number {
     if (!intervals || intervals.length === 0) return 0;
     // 1. Filter and normalize intervals
     const validIntervals = intervals
       .map(i => ({
         start: Math.min(i.startPage, i.endPage),
         end: Math.max(i.startPage, i.endPage)
       }))
       .filter(i => i.start > 0 && (!maxLimit || i.start <= maxLimit))
       .map(i => ({
         start: i.start,
         end: maxLimit ? Math.min(i.end, maxLimit) : i.end
       }))
       .sort((a, b) => a.start - b.start);

     if (validIntervals.length === 0) return 0;

     // 2. Merge overlapping or adjacent intervals
     const merged: { start: number; end: number }[] = [validIntervals[0]];
     for (let i = 1; i < validIntervals.length; i++) {
       const current = validIntervals[i];
       const last = merged[merged.length - 1];
       if (current.start <= last.end + 1) {
         last.end = Math.max(last.end, current.end);
       } else {
         merged.push(current);
       }
     }

     // 3. Sum unique pages: (end - start + 1)
     return merged.reduce((acc, curr) => acc + (curr.end - curr.start + 1), 0);
   }
   ```
2. **Sub-Subject Rollup Calculation**:
   - For Bangla:
     $$\text{Unique Pages}_{\text{Bangla}} = \text{Unique Pages}_{\text{Grammar}} + \text{Unique Pages}_{\text{Lit}}$$
     $$\text{Total Pages}_{\text{Bangla}} = 200 + 250 = 450$$
   - For English:
     $$\text{Unique Pages}_{\text{English}} = \text{Unique Pages}_{\text{Language}} + \text{Unique Pages}_{\text{Lit}}$$
     $$\text{Total Pages}_{\text{English}} = 266 + 169 = 435$$
3. **Spaced Repetition Schedule Generator**:
   - Stage 1: Studied Date $+ 1\text{ day}$
   - Stage 2: Studied Date $+ 3\text{ days}$
   - Stage 3: Studied Date $+ 7\text{ days}$
   - Stage 4: Studied Date $+ 15\text{ days}$
4. **Estimated Completion Forecasting**:
   $$\text{Daily Pace} = \frac{\text{Total Unique Pages Completed}}{\max(1, \text{Days Since Start Date})}$$
   $$\text{Days to Finish} = \frac{\text{Total Remaining Pages}}{\max(0.1, \text{Recent 7-Day Average Daily Pace})}$$
   $$\text{Projected Completion Date} = \text{Today} + \text{Days to Finish}$$

---

## 5. Proposed Project Structure

```
src/
├── types/
│   ├── index.ts               # Complete interfaces (Subjects, Sessions, MCQs, Tests, etc.)
│   └── routine.ts             # Routine time slot types
├── constants/
│   ├── initialSubjects.ts     # Initial 11 subjects + Ethics unconfigured metadata
│   ├── defaultRoutine.ts      # Saturday-Friday timetable structure
│   └── defaultProfile.ts      # CSE background, 12h target, 4-month milestones
├── utils/
│   ├── pageCalculations.ts    # Interval union, deduplication, progress percentages
│   ├── dates.ts               # Date math, formatters, spaced repetition dates
│   └── storage.ts             # LocalStorage manager, JSON export/import schema validator
├── context/
│   ├── PrepContext.tsx        # Centralized state provider with local persistence
│   └── TimerContext.tsx       # Live study stopwatch & countdown ticker
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Sidebar, top breadcrumb bar, active stopwatch pill
│   │   ├── Sidebar.tsx        # Navigation menu with active item indicators
│   │   └── Header.tsx         # Quick action buttons, timer trigger, date indicator
│   ├── common/
│   │   ├── MetricCard.tsx     # Tabular KPI card with trend & progress line
│   │   ├── ProgressBar.tsx    # Styled linear progress bar with percentage readout
│   │   ├── Modal.tsx          # Accessible modal dialog
│   │   └── EmptyState.tsx     # Clean empty state with primary CTA
│   ├── dashboard/
│   │   ├── KPIGrid.tsx        # 8 KPI metric cards
│   │   ├── SyllabusChart.tsx  # Recharts subject completion horizontal bar
│   │   ├── WeeklyHoursChart.tsx# Daily study consistency chart
│   │   └── MonthlyTargetCard.tsx # 4-month milestone progress comparison
│   ├── subjects/
│   │   ├── SubjectList.tsx    # Subject cards with combined Bangla/English rollups
│   │   ├── SubjectDetailModal.tsx # Page range logger, topic manager, intervals table
│   │   ├── PageRangeForm.tsx  # Manual interval entry with instant preview
│   │   └── TopicList.tsx      # 5-stage topic progress list
│   ├── routine/
│   │   ├── RoutineTable.tsx   # Saturday–Friday editable grid
│   │   └── SlotEditModal.tsx  # Modal to adjust schedule slots
│   ├── tracker/
│   │   ├── DailyTrackerView.tsx # Logged sessions table with day selector
│   │   ├── SessionModal.tsx   # Comprehensive session entry / edit form
│   │   └── ActiveTimerModal.tsx # Stopwatch popup with direct logging
│   ├── revision/
│   │   ├── RevisionView.tsx   # Overdue, Today, Upcoming tabs
│   │   └── RevisionCard.tsx   # 1-click complete / reschedule
│   ├── qbank/
│   │   ├── QBankView.tsx      # Assurance MCQ accuracy by subject & topic
│   │   └── MCQEntryModal.tsx  # Log new MCQ drill session
│   ├── modelTests/
│   │   ├── ModelTestsView.tsx # Score progression chart & test records
│   │   └── ModelTestModal.tsx # Record test with negative score calculation
│   ├── reports/
│   │   ├── ReportsView.tsx    # Pacing analysis, syllabus forecast date, trend charts
│   │   └── PacingGauge.tsx    # Required vs actual pages/day gauge
│   └── settings/
│       ├── SettingsView.tsx   # Page count configuration (including Ethics), JSON export/import
│       └── BackupRestore.tsx  # JSON file uploader & snapshot generator
└── App.tsx                    # Root routing & view switcher
```

---

## 6. Stage-by-Stage Implementation Roadmap

### Stage 1: Foundation, Data Models & Dashboard Shell
- Install `recharts` for charts.
- Define complete TypeScript types, initial subject configurations, and localStorage persistence layer.
- Build `AppLayout`, `Sidebar`, top bar, and responsive navigation across all 9 views.
- Implement the `Dashboard` view with 8 KPI cards, empty state safety, and basic data listeners.
- *Verification*: Verify layout responsiveness, zero console errors, and correct initial empty KPI calculations.

### Stage 2: Page-Range Progress Engine & Subject Management
- Implement the disjoint interval union algorithm in `pageCalculations.ts` with automated unit tests for edge cases (adjacent ranges, completely overlapping ranges, out-of-order ranges).
- Build the `Subjects & Syllabus` view showing:
  - Exact total pages, unique completed pages, remaining pages, and percentages.
  - Granular sub-subjects for Bangla (Grammar 200, Literature 250) and English (Language 266, Literature 169) with combined parent rollups.
  - Prominent alert badge for *Ethics, Values and Good Governance* (not configured).
- Add modal to log manual page ranges (e.g., 1–25, 30–50), edit/delete intervals, and manage topic statuses (Not Started → Mastered).
- *Verification*: Test entering overlapping ranges (e.g. 1-20 then 15-30) and confirm unique page total equals 30, not 35.

### Stage 3: Daily Study Tracker, Stopwatch & Weekly Routine
- Build `TimerContext` with background-resilient stopwatch (start, pause, resume, reset) and persistent state.
- Create `DailyTrackerView` with date picker, session summary (hours, pages, MCQs), and full session form:
  - Subject/Sub-subject picker.
  - Page range entry (automatically feeding into the subject's completed intervals).
  - MCQ accuracy calculation.
  - Status (Completed / Partial / Missed).
- Implement the editable Saturday–Friday weekly routine with predefined schedule slots and slot editor.
- *Verification*: Log a 2-hour session with pages 50-70; verify that the subject's completed pages, dashboard hours, and daily gauge immediately update.

### Stage 4: Spaced Repetition Engine & Question Bank Tracker
- Implement automated spaced repetition task creation (+1d, +3d, +7d, +15d) triggered upon completing topics or study sessions.
- Build `RevisionTracker` view with Overdue, Due Today, and Upcoming lists, plus completion toggles and date adjustments.
- Build `Question Bank` module for Assurance MCQ drills:
  - Subject-wise and chapter-wise accuracy rates.
  - Repeat mistake notes tracker.
- *Verification*: Mark a topic revised; confirm the next stage (+3d) is scheduled and accuracy percentages compute correctly.

### Stage 5: Model Test Management & Analytics/Reports
- Build `ModelTestsView` with 200-mark BCS standard calculations, negative mark deductions (0.50 per wrong answer), and score progression line charts.
- Build `ReportsView` with:
  - Estimated syllabus completion date based on actual 7-day average daily page pace.
  - Pages completed per day/week breakdown.
  - 4-month milestone target comparison (Month 1 Foundation vs Month 4 Final Simulation).
- *Verification*: Add 2 mock model tests; verify negative marking math `obtained = correct - (incorrect * 0.5)` and score trend line.

### Stage 6: Data Backup/Restore, Polish & Comprehensive Testing
- Implement JSON Backup export and Restore with strict schema validation.
- Provide "Reset to Default" and "Load Demo Data" options in Settings for instant evaluation.
- Optimize dark navy/teal aesthetic, tabular numerals, mobile viewports, and keyboard accessibility.
- Run `compile_applet` and test all edge cases.

---

## 7. Edge Cases & Validation Rules

1. **Page Range Invariants**:
   - `startPage > 0` and `endPage >= startPage`.
   - If `totalPages` is configured, `endPage <= totalPages`.
   - Empty or negative intervals are rejected with clear user error messages.
2. **Duplicate Range Prevention**:
   - If an entered range is a subset of an already recorded interval, notify the user while cleanly deduplicating so the progress percentage is unaffected.
3. **Unconfigured Subjects**:
   - Subjects with `totalPages = null` (like Ethics) cannot display a percentage; they display `"Configure page count"` and are excluded from the global syllabus total.
4. **Time & Duration Consistency**:
   - Session durations cannot be negative; endTime must be after startTime or duration is directly recorded in minutes.
5. **Data Corruption Protection**:
   - JSON import validates mandatory fields before writing to localStorage, rolling back if format is invalid.
