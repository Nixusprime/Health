import React, { useState } from 'react';
import { GlassPanel } from './GlassPanel';
import { WorkSession, WorkoutEntry, WorkoutType } from '../types/analytics';
import { Brain, Dumbbell, Plus, Trash2, Check } from 'lucide-react';

interface WorkLedgerProps {
  study: WorkSession;
  workouts: WorkoutEntry[];
  onUpdateStudy: (study: WorkSession) => void;
  onAddWorkout: (workout: WorkoutEntry) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export const WorkLedger: React.FC<WorkLedgerProps> = ({
  study,
  workouts,
  onUpdateStudy,
  onAddWorkout,
  onDeleteWorkout,
}) => {
  const [studyHours, setStudyHours] = useState(study.studyHours);
  const [focusRpe, setFocusRpe] = useState(study.focusQualityRpe);
  const [activeTags, setActiveTags] = useState<string[]>(study.tags);
  const [isSaved, setIsSaved] = useState(false);

  // Sync when date changes
  React.useEffect(() => {
    setStudyHours(study.studyHours);
    setFocusRpe(study.focusQualityRpe);
    setActiveTags(study.tags);
  }, [study]);

  const handleStudyChange = (hours: number, rpe: number, tags: string[]) => {
    setStudyHours(hours);
    setFocusRpe(rpe);
    setActiveTags(tags);
    onUpdateStudy({
      studyHours: hours,
      focusQualityRpe: rpe,
      tags,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const toggleTag = (tag: string) => {
    const nextTags = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    handleStudyChange(studyHours, focusRpe, nextTags);
  };

  // Quick Workout Add state
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [newType, setNewType] = useState<WorkoutType>('Hypertrophy');
  const [newDuration, setNewDuration] = useState(60);
  const [newRpe, setNewRpe] = useState(8);
  const [newBurned, setNewBurned] = useState(380);

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WorkoutEntry = {
      id: `w-manual-${Date.now()}`,
      type: newType,
      durationMin: newDuration,
      intensityRpe: newRpe,
      estimatedKcal: newBurned,
      notes: `${newType} Session`,
      tags: [`#${newType.replace(/\s+/g, '')}`],
    };
    onAddWorkout(entry);
    setShowWorkoutForm(false);
  };

  return (
    <GlassPanel className="p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Work & Physical Output Logging
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cognitive deep work capacity & training volume
          </p>
        </div>

        {isSaved && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-white">
            <Check className="w-3 h-3 text-white" />
            <span>Updated</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
        {/* Study Tracker Pane */}
        <div className="p-3 bg-black/40 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-2">
            <span className="font-semibold text-white">Cognitive Study Session</span>
            <span className="text-[10px] text-neutral-500">RPE: {focusRpe}/10</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">
                Study Duration
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="18"
                  value={studyHours}
                  onChange={(e) => handleStudyChange(Number(e.target.value), focusRpe, activeTags)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-base font-bold font-mono text-white focus:outline-none focus:border-white/30"
                />
                <span className="text-xs font-mono text-neutral-500">hrs</span>
              </div>
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">
                Focus Quality (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={focusRpe}
                onChange={(e) => handleStudyChange(studyHours, Number(e.target.value), activeTags)}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-base font-bold font-mono text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Contextual Environmental Tags */}
          <div className="text-[10px] font-mono text-neutral-400 mb-1.5">
            Environmental Context Tags:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['#SoloDeepWork', '#StudyCall', '#LibrarySession', '#LateNight'].map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    active
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workout Details Pane */}
        <div className="p-3 bg-black/40 rounded-xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-2">
              <span className="font-semibold text-white">Physical Training</span>
              <button
                onClick={() => setShowWorkoutForm(!showWorkoutForm)}
                className="flex items-center gap-1 text-[11px] text-white hover:text-neutral-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Workout</span>
              </button>
            </div>

            {/* List of logged workouts */}
            {workouts.length === 0 ? (
              <div className="p-3 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-lg">
                No training sessions recorded today (Rest/Recovery day)
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                {workouts.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Dumbbell className="w-3 h-3 text-neutral-400" />
                        <span className="font-semibold text-white">{w.type}</span>
                        <span className="text-[10px] text-neutral-500">({w.durationMin} min)</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        RPE: {w.intensityRpe}/10 · Burned ~{w.estimatedKcal} kcal
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-white transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick workout modal/form */}
          {showWorkoutForm && (
            <form
              onSubmit={handleCreateWorkout}
              className="mt-3 pt-3 border-t border-white/[0.08] space-y-2 text-xs font-mono"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400">Modality</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as WorkoutType)}
                    className="w-full bg-black border border-white/20 rounded p-1 text-white text-xs"
                  >
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Zone 2 Cardio">Zone 2 Cardio</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Strength">Strength</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400">Duration (mins)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400">Intensity (RPE 1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRpe}
                    onChange={(e) => setNewRpe(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400">Estimated Burn (kcal)</label>
                  <input
                    type="number"
                    value={newBurned}
                    onChange={(e) => setNewBurned(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowWorkoutForm(false)}
                  className="px-2 py-1 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-white text-black font-semibold rounded hover:bg-neutral-200"
                >
                  Save Workout
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </GlassPanel>
  );
};
