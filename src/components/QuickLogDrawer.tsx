import React, { useState } from 'react';
import { DailyRecord, Biometrics, WorkSession, WorkoutEntry, LoggedMeal, WorkoutType } from '../types/analytics';
import { calculateMacrosKcal } from '../utils/tefEngine';
import { X, Utensils, HeartPulse, Brain, Dumbbell } from 'lucide-react';

interface QuickLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: DailyRecord;
  onSaveDailyRecord: (updated: DailyRecord) => void;
  onOpenFoodLibrary: () => void;
}

export const QuickLogDrawer: React.FC<QuickLogDrawerProps> = ({
  isOpen,
  onClose,
  currentRecord,
  onSaveDailyRecord,
  onOpenFoodLibrary,
}) => {
  const [activeMode, setActiveMode] = useState<'biometrics' | 'study' | 'workout'>('biometrics');

  // Biometrics state
  const [bpm, setBpm] = useState(currentRecord.biometrics.restingBpm);
  const [sleep, setSleep] = useState(currentRecord.biometrics.sleepHours);
  const [sleepScore, setSleepScore] = useState(currentRecord.biometrics.sleepQualityPct);
  const [steps, setSteps] = useState(currentRecord.biometrics.steps);
  const [weight, setWeight] = useState(currentRecord.biometrics.weightKg);
  const [bloat, setBloat] = useState(currentRecord.biometrics.bloatIndex);

  // Study state
  const [studyH, setStudyH] = useState(currentRecord.study.studyHours);
  const [studyRpe, setStudyRpe] = useState(currentRecord.study.focusQualityRpe);
  const [studyTags, setStudyTags] = useState<string[]>(currentRecord.study.tags);

  // Workout state
  const [woType, setWoType] = useState<WorkoutType>('Hypertrophy');
  const [woDuration, setWoDuration] = useState(60);
  const [woRpe, setWoRpe] = useState(8);
  const [woKcal, setWoKcal] = useState(400);

  if (!isOpen) return null;

  const handleSaveBiometrics = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDailyRecord({
      ...currentRecord,
      biometrics: {
        restingBpm: bpm,
        sleepHours: sleep,
        sleepQualityPct: sleepScore,
        steps,
        weightKg: weight,
        bloatIndex: bloat,
      },
    });
    onClose();
  };

  const handleSaveStudy = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDailyRecord({
      ...currentRecord,
      study: {
        studyHours: studyH,
        focusQualityRpe: studyRpe,
        tags: studyTags,
      },
    });
    onClose();
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const newWorkout: WorkoutEntry = {
      id: `w-quick-${Date.now()}`,
      type: woType,
      durationMin: woDuration,
      intensityRpe: woRpe,
      estimatedKcal: woKcal,
      tags: [`#${woType.replace(/\s+/g, '')}`],
    };
    onSaveDailyRecord({
      ...currentRecord,
      workouts: [...currentRecord.workouts, newWorkout],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in p-0 sm:p-4">
      <div className="relative w-full sm:max-w-md bg-black border border-white/15 rounded-t-3xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Quick Telemetry Entry</span>
            <span className="text-[10px] font-mono text-neutral-400">· {currentRecord.date}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Selectors */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-white/[0.02] border-b border-white/[0.06] text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFoodLibrary();
            }}
            className="py-2 px-1 flex flex-col items-center gap-1 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.05]"
          >
            <Utensils className="w-4 h-4" />
            <span className="text-[10px]">Food</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('biometrics')}
            className={`py-2 px-1 flex flex-col items-center gap-1 rounded-xl transition-all ${
              activeMode === 'biometrics'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span className="text-[10px]">Biometrics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('study')}
            className={`py-2 px-1 flex flex-col items-center gap-1 rounded-xl transition-all ${
              activeMode === 'study'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="text-[10px]">Study</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('workout')}
            className={`py-2 px-1 flex flex-col items-center gap-1 rounded-xl transition-all ${
              activeMode === 'workout'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span className="text-[10px]">Workout</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 overflow-y-auto">
          {activeMode === 'biometrics' && (
            <form onSubmit={handleSaveBiometrics} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-400">Resting BPM</label>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400">Total Sleep (hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-400">Steps</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">
                  Subjective Bloat Index (1-5)
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setBloat(lvl)}
                      className={`p-2 rounded-lg text-center font-bold text-xs border ${
                        bloat === lvl
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-neutral-400 border-white/10'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200"
                >
                  Save Biometrics
                </button>
              </div>
            </form>
          )}

          {activeMode === 'study' && (
            <form onSubmit={handleSaveStudy} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-neutral-400">Deep Study Duration (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={studyH}
                  onChange={(e) => setStudyH(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400">Focus Quality RPE (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={studyRpe}
                  onChange={(e) => setStudyRpe(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Session Context</label>
                <div className="flex flex-wrap gap-1">
                  {['#SoloDeepWork', '#StudyCall', '#LibrarySession', '#LateNight'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setStudyTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        studyTags.includes(tag)
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/5 text-neutral-400 border border-white/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200"
                >
                  Save Study Output
                </button>
              </div>
            </form>
          )}

          {activeMode === 'workout' && (
            <form onSubmit={handleAddWorkout} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-neutral-400">Workout Type</label>
                <select
                  value={woType}
                  onChange={(e) => setWoType(e.target.value as WorkoutType)}
                  className="w-full bg-black border border-white/20 rounded p-2 text-white"
                >
                  <option value="Hypertrophy">Hypertrophy</option>
                  <option value="Zone 2 Cardio">Zone 2 Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Strength">Strength</option>
                  <option value="Mobility">Mobility</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400">Duration (mins)</label>
                  <input
                    type="number"
                    value={woDuration}
                    onChange={(e) => setWoDuration(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400">RPE (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={woRpe}
                    onChange={(e) => setWoRpe(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400">Burned Calories (est. kcal)</label>
                <input
                  type="number"
                  value={woKcal}
                  onChange={(e) => setWoKcal(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 rounded p-1.5 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-neutral-200"
                >
                  Commit Workout
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
