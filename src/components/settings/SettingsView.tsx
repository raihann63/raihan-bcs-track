import React, { useState } from 'react';
import { usePrep } from '../../context/PrepContext';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Save,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    subjects,
    profile,
    updateProfile,
    updateSubjectTotalPages,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
    loadSampleData,
  } = usePrep();

  // Profile Form State
  const [dailyHourTarget, setDailyHourTarget] = useState<number>(profile.dailyHourTarget);
  const [startDate, setStartDate] = useState<string>(profile.startDate);
  const [m1Target, setM1Target] = useState<number>(profile.monthlyPageTargets.month1);
  const [m2Target, setM2Target] = useState<number>(profile.monthlyPageTargets.month2);
  const [m3Target, setM3Target] = useState<number>(profile.monthlyPageTargets.month3);
  const [m4Target, setM4Target] = useState<number>(profile.monthlyPageTargets.month4);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Subject Page Count Editing Map
  const [pageMap, setPageMap] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    subjects.forEach((s) => {
      init[s.id] = s.totalPages !== null ? String(s.totalPages) : '';
    });
    return init;
  });
  const [pagesSavedMsg, setPagesSavedMsg] = useState(false);

  // Backup / Restore State
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      dailyHourTarget: Number(dailyHourTarget) || 12,
      startDate,
      monthlyPageTargets: {
        month1: Number(m1Target) || 750,
        month2: Number(m2Target) || 1200,
        month3: Number(m3Target) || 500,
        month4: Number(m4Target) || 200,
      },
    });
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  const handleSaveAllPages = () => {
    Object.entries(pageMap).forEach(([subId, pageVal]) => {
      const parsed = pageVal.trim() === '' ? null : parseInt(pageVal, 10);
      updateSubjectTotalPages(subId, parsed && parsed > 0 ? parsed : null);
    });
    setPagesSavedMsg(true);
    setTimeout(() => setPagesSavedMsg(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bcs_prep_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importDataJSON(importJsonText);
    if (res.success) {
      setImportStatus({ success: true, msg: 'Backup restored successfully!' });
      setImportJsonText('');
    } else {
      setImportStatus({ success: false, msg: res.error || 'Failed to restore backup.' });
    }
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono mb-1">
            <Settings className="w-4 h-4" />
            <span>Profile Configuration & Data Management</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">System Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure candidate targets, textbook page counts (Ethics), and export/import offline JSON snapshots
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* <button
            onClick={loadSampleData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg font-medium border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button> */}
          <button
            onClick={() => {
              if (window.confirm('Reset all progress back to fresh zero state?')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg font-medium border border-rose-900/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Section 1: Candidate Preparation Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Candidate Preparation Parameters</span>
          {profileSavedMsg && (
            <span className="text-xs text-teal-400 flex items-center gap-1 font-mono">
              <CheckCircle className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Daily Study Target (Hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={dailyHourTarget}
                onChange={(e) => setDailyHourTarget(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm font-bold focus:border-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Sprint Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Academic Background</label>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono">
                {profile.academicBackground} (CGPA {profile.cgpa})
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-slate-400 font-medium mb-1.5">
              4-Month Strategic Page Milestones
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Month 1 (Foundation)</span>
                <input
                  type="number"
                  min="0"
                  value={m1Target}
                  onChange={(e) => setM1Target(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs mt-1"
                />
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Month 2 (Syllabus)</span>
                <input
                  type="number"
                  min="0"
                  value={m2Target}
                  onChange={(e) => setM2Target(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs mt-1"
                />
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Month 3 (Past Papers)</span>
                <input
                  type="number"
                  min="0"
                  value={m3Target}
                  onChange={(e) => setM3Target(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs mt-1"
                />
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Month 4 (Simulation)</span>
                <input
                  type="number"
                  min="0"
                  value={m4Target}
                  onChange={(e) => setM4Target(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs mt-1"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Update Parameters</span>
          </button>
        </form>
      </div>

      {/* Section 2: Subject Page Counts & Ethics Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Textbook Page Counts & Ethics Setup</h3>
            <p className="text-[11px] text-slate-400">
              Update book page totals when new editions arrive or configure Ethics, Values and Good Governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pagesSavedMsg && (
              <span className="text-xs text-teal-400 flex items-center gap-1 font-mono">
                <CheckCircle className="w-3.5 h-3.5" /> Pages Saved!
              </span>
            )}
            <button
              onClick={handleSaveAllPages}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Page Counts</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((sub) => {
            const isEthics = sub.id === 'ethics_governance';
            return (
              <div
                key={sub.id}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                  isEthics
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate flex items-center gap-1.5">
                    <span>{sub.name}</span>
                    {isEthics && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{sub.bookName}</div>
                </div>

                <div className="w-24 shrink-0">
                  <input
                    type="number"
                    min="1"
                    placeholder="Unset"
                    value={pageMap[sub.id] || ''}
                    onChange={(e) =>
                      setPageMap((prev) => ({ ...prev, [sub.id]: e.target.value }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-center font-bold focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Data Backup, Restore & Offline Snapshots */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-2">Offline Data Backup & Restore</h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Your preparation data is stored locally in your browser. Download full JSON snapshots to keep backups safe or restore across devices.
        </p>

        {importStatus && (
          <div
            className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
              importStatus.success
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {importStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{importStatus.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Box */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white text-xs mb-1">Export Backup File</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Downloads a `.json` backup file containing your subjects, study intervals, MCQs, and model test history.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold rounded-lg border border-slate-700 transition-colors w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
            <div>
              <h4 className="font-bold text-white text-xs mb-1">Restore from Backup</h4>
              <p className="text-[11px] text-slate-400">
                Upload a backup `.json` file or paste JSON contents below.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer border border-slate-700 font-medium">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {importJsonText && (
                <span className="text-[11px] text-teal-400 font-mono">JSON Loaded</span>
              )}
            </div>

            <textarea
              rows={2}
              placeholder="Or paste backup JSON text here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[10px] focus:outline-none"
            />

            <button
              onClick={handleImportSubmit}
              disabled={!importJsonText.trim()}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${
                importJsonText.trim()
                  ? 'bg-teal-600 hover:bg-teal-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Restore Snapshot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
