import React, { useState } from 'react';
import { PrepProvider, usePrep } from './context/PrepContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoutineView } from './components/routine/RoutineView';
import { DailyTrackerView } from './components/tracker/DailyTrackerView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { RevisionView } from './components/revision/RevisionView';
import { QBankView } from './components/qbank/QBankView';
import { ModelTestsView } from './components/modelTests/ModelTestsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { SessionModal } from './components/tracker/SessionModal';
import { ActiveTimerModal } from './components/tracker/ActiveTimerModal';
import { StudySession } from './types';

const MainApp: React.FC = () => {
  const { currentView, setCurrentView } = usePrep();

  // Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Session Modal
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionModalSubjectId, setSessionModalSubjectId] = useState<string | undefined>(undefined);
  const [sessionModalDuration, setSessionModalDuration] = useState<number | undefined>(undefined);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Global Active Timer Modal
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  const handleOpenQuickLog = () => {
    setEditingSession(null);
    setSessionModalSubjectId(undefined);
    setSessionModalDuration(undefined);
    setIsSessionModalOpen(true);
  };

  const handleStartSessionFromSlot = (subjectId: string, label: string) => {
    setEditingSession(null);
    setSessionModalSubjectId(subjectId);
    setSessionModalDuration(210); // Standard 3.5h slot duration default
    setIsSessionModalOpen(true);
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setSessionModalSubjectId(session.subjectId);
    setSessionModalDuration(session.durationMinutes);
    setIsSessionModalOpen(true);
  };

  const handleOpenSessionWithDuration = (subjectId: string, durationMinutes: number) => {
    setEditingSession(null);
    setSessionModalSubjectId(subjectId);
    setSessionModalDuration(durationMinutes);
    setIsSessionModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#090D16] text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenQuickLog={handleOpenQuickLog}
          onOpenTimerModal={() => setIsTimerModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'dashboard' && (
            <DashboardView
              onOpenQuickLog={handleOpenQuickLog}
              onOpenTimerModal={() => setIsTimerModalOpen(true)}
            />
          )}

          {currentView === 'routine' && (
            <RoutineView onStartSessionFromSlot={handleStartSessionFromSlot} />
          )}

          {currentView === 'tracker' && (
            <DailyTrackerView
              onOpenNewSessionModal={(date) => {
                setEditingSession(null);
                setSessionModalSubjectId(undefined);
                setSessionModalDuration(undefined);
                setIsSessionModalOpen(true);
              }}
              onEditSession={handleEditSession}
            />
          )}

          {currentView === 'subjects' && <SubjectsView />}

          {currentView === 'revision' && <RevisionView />}

          {currentView === 'qbank' && <QBankView />}

          {currentView === 'modelTests' && <ModelTestsView />}

          {currentView === 'reports' && <ReportsView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
        }}
        initialSubjectId={sessionModalSubjectId}
        initialDurationMinutes={sessionModalDuration}
        editingSession={editingSession}
      />

      <ActiveTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onOpenSessionWithDuration={handleOpenSessionWithDuration}
      />
    </div>
  );
};

export default function App() {
  return (
    <PrepProvider>
      <MainApp />
    </PrepProvider>
  );
}
