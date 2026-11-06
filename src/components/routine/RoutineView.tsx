import React, { useState } from 'react';
import { usePrep } from '../../context/PrepContext';
import { RoutineSlot, DayOfWeek, TimeSlotId } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  Edit2,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';
import { INITIAL_ROUTINE } from '../../constants/initialData';

interface RoutineViewProps {
  onStartSessionFromSlot: (subjectId: string, label: string) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ onStartSessionFromSlot }) => {
  const { routine, updateRoutineSlot, subjects } = usePrep();
  const [editingSlot, setEditingSlot] = useState<RoutineSlot | null>(null);
  const [slotSubjectId, setSlotSubjectId] = useState<string>('');
  const [slotCustomLabel, setSlotCustomLabel] = useState<string>('');

  const days: DayOfWeek[] = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  const timeSlots: { id: TimeSlotId; timeRange: string; label: string; duration: string }[] = [
    { id: 'slot1', timeRange: '6:30 AM–12:30 PM', label: 'Morning (সকাল)', duration: '6 Hours' },
    { id: 'slot2', timeRange: '2:00 PM–6:00 PM', label: 'Afternoon (বিকাল)', duration: '4 Hours' },
    { id: 'slot3', timeRange: '7:00 PM–11:00 PM', label: 'Night (রাত)', duration: '4 Hours' },
  ];

  const handleEditClick = (slot: RoutineSlot) => {
    setEditingSlot(slot);
    setSlotSubjectId(slot.subjectId);
    setSlotCustomLabel(slot.customLabel || '');
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    updateRoutineSlot(editingSlot.id, {
      subjectId: slotSubjectId,
      customLabel: slotCustomLabel.trim() || undefined,
    });

    setEditingSlot(null);
  };

  const handleResetToDefaultRoutine = () => {
    if (window.confirm('Reset the study timetable back to the original Uttoron BCS routine?')) {
      INITIAL_ROUTINE.forEach((slot) => {
        updateRoutineSlot(slot.id, slot);
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono mb-1">
            <Clock className="w-4 h-4" />
            <span>11.5–12.0 Hours Daily Scheduled Study Blocks</span>
            
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Weekly BCS Study Routine (Saturday – Friday)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            3 Core Subject Blocks daily + Evening Revision · Friday dedicated to 200-Mark Model Test & Analysis
          </p>
        </div>

        <button
          onClick={handleResetToDefaultRoutine}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Routine Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <th className="p-4 w-32 font-bold text-white">Day</th>
                {timeSlots.map((ts) => (
                  <th key={ts.id} className="p-4 min-w-50">
                    <div className="font-bold text-teal-400">{ts.timeRange}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {ts.label} ({ts.duration})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {days.map((day) => {
                const isFriday = day === 'Friday';
                return (
                  <tr
                    key={day}
                    className={`transition-colors ${
                      isFriday ? 'bg-teal-950/20 hover:bg-teal-950/30' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Day Column */}
                    <td className="p-4 align-top font-bold text-white border-r border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        {isFriday && <Award className="w-3.5 h-3.5 text-teal-400" />}
                        <span>{day}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5 font-mono">
                        {isFriday ? 'Assessment Day' : '11.5h Routine'}
                      </div>
                    </td>

                    {/* 4 Time Slots */}
                    {timeSlots.map((ts) => {
                      const slot = routine.find(
                        (r) => r.dayOfWeek === day && r.timeRange === ts.timeRange
                      );
                      const assignedSubject = subjects.find((s) => s.id === slot?.subjectId);
                      const displayTitle = slot?.customLabel || assignedSubject?.name || slot?.subjectId || 'Open';

                      return (
                        <td key={ts.id} className="p-3 align-top border-r border-slate-800/80 last:border-r-0">
                          {slot ? (
                            <div className="bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg p-2.5 transition-all group flex flex-col justify-between h-24">
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-semibold text-white truncate text-xs">
                                    {displayTitle}
                                  </span>
                                  <button
                                    onClick={() => handleEditClick(slot)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-opacity"
                                    title="Edit routine slot"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                  {assignedSubject?.bookName || (isFriday ? 'BCS Simulation' : 'Self Revision')}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                                <span className="text-slate-400 font-mono">{ts.duration}</span>
                                <button
                                  onClick={() =>
                                    onStartSessionFromSlot(
                                      assignedSubject?.id || 'bangla_grammar',
                                      displayTitle
                                    )
                                  }
                                  className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                                  title="Log or start session for this block"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Log</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-600 text-center py-6 text-xs font-mono">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Routine Guidelines Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-2">
        <h3 className="font-bold text-white text-sm">Execution Guidelines for 12-Hour Daily Routine:</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>
            <strong className="text-white">Strict Chapter-wise MCQs:</strong> Immediately after finishing each chapter in Uttoron books, solve the corresponding questions from Assurance Question Bank in the same study slot.
          </li>
          <li>
            <strong className="text-white">Sub-Subject Rotation:</strong> Alternate Bangla Grammar and Bangla Literature on Saturday/Monday/Wednesday morning slots.
          </li>
          <li>
            <strong className="text-white">Friday Assessment Law:</strong> Friday 6:30–10:00 is strictly reserved for full 200-mark Preliminary Model Test simulation with negative marking (-0.50 per wrong answer).
          </li>
          <li>
            <strong className="text-white">Ethics Integration:</strong> Ethics, Values and Good Governance can be scheduled into Slot 2 or Slot 3 once your preparation book arrives.
          </li>
        </ul>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <Modal
          isOpen={Boolean(editingSlot)}
          onClose={() => setEditingSlot(null)}
          title={`Edit Routine Slot: ${editingSlot.dayOfWeek}`}
          subtitle={`Time Block: ${editingSlot.timeRange}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned Subject</label>
              <select
                value={slotSubjectId}
                onChange={(e) => setSlotSubjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
              >
                <optgroup label="BCS Subjects">
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.bcsMarks} Marks)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Special Sessions">
                  <option value="revision">Revision & Problem Solving</option>
                  <option value="model_test">Full Model Test (200 Marks)</option>
                  <option value="model_test_analysis">Model Test Analysis</option>
                  <option value="planning">Weekly Planning & Goal Setup</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Custom Block Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Bangla (Grammar & Lit) or Mathematics Practice"
                value={slotCustomLabel}
                onChange={(e) => setSlotCustomLabel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-sm"
              >
                Save Schedule Slot
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
