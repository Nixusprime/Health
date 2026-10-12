import React, { useState } from 'react';
import { GlassPanel } from './GlassPanel';
import { Biometrics } from '../types/analytics';
import { HeartPulse, Moon, Footprints, Scale, Activity, Check } from 'lucide-react';

interface BiometricsLedgerProps {
  biometrics: Biometrics;
  onUpdateBiometrics: (updated: Biometrics) => void;
}

export const BiometricsLedger: React.FC<BiometricsLedgerProps> = ({
  biometrics,
  onUpdateBiometrics,
}) => {
  const [formData, setFormData] = useState<Biometrics>(biometrics);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync if selected date changes
  React.useEffect(() => {
    setFormData(biometrics);
  }, [biometrics]);

  const handleChange = (field: keyof Biometrics, value: number) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdateBiometrics(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 1500);
  };

  const bloatLevels = [
    { level: 1, label: '1 - Optimal', desc: 'Flat, fast motility, zero distension' },
    { level: 2, label: '2 - Nominal', desc: 'Light satiety, normal cognitive speed' },
    { level: 3, label: '3 - Moderate', desc: 'Full abdominal volume, mild lethargy' },
    { level: 4, label: '4 - Heavy', desc: 'Distended, noticeable brain fog' },
    { level: 5, label: '5 - Coma', desc: 'Acute food coma, severe fatigue' },
  ];

  return (
    <GlassPanel className="p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Biometric & Autonomic Recovery
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cardiovascular tone, sleep architecture & digestive distension
          </p>
        </div>

        {isSavedRecently && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-white animate-fade-in">
            <Check className="w-3 h-3 text-white" />
            <span>Updated</span>
          </span>
        )}
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
        {/* Resting Heart Rate */}
        <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-mono">Resting BPM</span>
            <HeartPulse className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="35"
              max="140"
              value={formData.restingBpm}
              onChange={(e) => handleChange('restingBpm', Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold font-mono text-white focus:outline-none focus:ring-1 focus:ring-white/30 rounded px-1 tabular-nums"
            />
            <span className="text-xs font-mono text-neutral-500">bpm</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Parasympathetic index</div>
        </div>

        {/* Total Sleep */}
        <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-mono">Total Sleep</span>
            <Moon className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              min="0"
              max="16"
              value={formData.sleepHours}
              onChange={(e) => handleChange('sleepHours', Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold font-mono text-white focus:outline-none focus:ring-1 focus:ring-white/30 rounded px-1 tabular-nums"
            />
            <span className="text-xs font-mono text-neutral-500">hrs</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
            Quality: {formData.sleepQualityPct}% score
          </div>
        </div>

        {/* Daily Steps */}
        <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-mono">Daily Steps</span>
            <Footprints className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="100"
              min="0"
              max="60000"
              value={formData.steps}
              onChange={(e) => handleChange('steps', Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold font-mono text-white focus:outline-none focus:ring-1 focus:ring-white/30 rounded px-1 tabular-nums"
            />
            <span className="text-xs font-mono text-neutral-500">steps</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Non-exercise activity</div>
        </div>

        {/* Body Weight */}
        <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-mono">Body Mass</span>
            <Scale className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.05"
              min="40"
              max="200"
              value={formData.weightKg}
              onChange={(e) => handleChange('weightKg', Number(e.target.value))}
              className="w-full bg-transparent text-xl font-bold font-mono text-white focus:outline-none focus:ring-1 focus:ring-white/30 rounded px-1 tabular-nums"
            />
            <span className="text-xs font-mono text-neutral-500">kg</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Fasted morning weigh-in</div>
        </div>
      </div>

      {/* Subjective Bloat Index Selector (1 - 5) */}
      <div className="pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
            Subjective Bloat & Gastrointestinal Load
          </span>
          <span className="text-neutral-400 font-bold">
            Score: {formData.bloatIndex}/5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {bloatLevels.map((item) => (
            <button
              key={item.level}
              type="button"
              onClick={() => handleChange('bloatIndex', item.level)}
              className={`p-2 rounded-xl text-left border transition-all ${
                formData.bloatIndex === item.level
                  ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'bg-black/40 text-neutral-400 border-white/[0.06] hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold font-mono leading-none mb-1">
                {item.level}
              </div>
              <div className="text-[10px] font-mono leading-tight truncate">
                {item.label.split(' - ')[1]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
};
