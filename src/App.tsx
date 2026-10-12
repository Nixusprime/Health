import React, { useState, useEffect, useMemo } from 'react';
import { generateSeedTimeseries } from './data/seedData';
import { DailyRecord, TimeframeOption, LoggedMeal, Biometrics, WorkSession, WorkoutEntry } from './types/analytics';
import { deriveDailySummary, calculateRollingAverage } from './utils/tefEngine';
import { exportTimeseriesToGodotJSON } from './utils/godotExporter';

import { EngineHUD } from './components/EngineHUD';
import { CorrelationChart } from './components/CorrelationChart';
import { NutritionEngine } from './components/NutritionEngine';
import { BiometricsLedger } from './components/BiometricsLedger';
import { WorkLedger } from './components/WorkLedger';
import { LogFoodModal } from './components/LogFoodModal';
import { QuickLogDrawer } from './components/QuickLogDrawer';
import { MobileBottomDock, MobileTab } from './components/MobileBottomDock';

import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Plus,
  Layers,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'metabolic_glass_data_v1';

export default function App() {
  // Load timeseries from localStorage or initialize with 30-day seed dataset
  const [timeseries, setTimeseries] = useState<DailyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return generateSeedTimeseries();
  });

  // Save to localStorage whenever timeseries changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timeseries));
    } catch (err) {
      console.error('Failed to save timeseries:', err);
    }
  }, [timeseries]);

  // Active Date selection (defaults to latest recorded day)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return timeseries[timeseries.length - 1]?.date || '2026-10-10';
  });

  // Rolling Averages timeframe option (default to 7-day view as requested)
  const [timeframe, setTimeframe] = useState<TimeframeOption>('7d');

  // Contextual Tag Filter
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Mobile Active Tab
  const [mobileTab, setMobileTab] = useState<MobileTab>('engine');

  // Modals state
  const [isLogFoodOpen, setIsLogFoodOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // Derive summaries for all 30 days
  const summaries = useMemo(() => {
    return timeseries.map(deriveDailySummary);
  }, [timeseries]);

  // Current active daily record
  const currentRecord = useMemo(() => {
    return (
      timeseries.find((r) => r.date === selectedDate) ||
      timeseries[timeseries.length - 1]
    );
  }, [timeseries, selectedDate]);

  // Current active daily summary
  const currentSummary = useMemo(() => {
    return deriveDailySummary(currentRecord);
  }, [currentRecord]);

  // Calculate rolling baseline for the active timeframe
  const timeframeDays = useMemo(() => {
    switch (timeframe) {
      case '1d':
        return 1;
      case '7d':
        return 7;
      case '14d':
        return 14;
      case '30d':
        return 30;
      default:
        return 7;
    }
  }, [timeframe]);

  const rollingAvg = useMemo(() => {
    return calculateRollingAverage(summaries, timeframeDays, selectedDate);
  }, [summaries, timeframeDays, selectedDate]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const idx = timeseries.findIndex((r) => r.date === selectedDate);
    if (idx > 0) {
      setSelectedDate(timeseries[idx - 1].date);
    }
  };

  const handleNextDay = () => {
    const idx = timeseries.findIndex((r) => r.date === selectedDate);
    if (idx < timeseries.length - 1 && idx !== -1) {
      setSelectedDate(timeseries[idx + 1].date);
    }
  };

  // State Mutators
  const handleAddMeal = (meal: LoggedMeal) => {
    setTimeseries((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          return {
            ...rec,
            meals: [meal, ...rec.meals],
          };
        }
        return rec;
      })
    );
  };

  const handleDeleteMeal = (mealId: string) => {
    setTimeseries((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          return {
            ...rec,
            meals: rec.meals.filter((m) => m.id !== mealId),
          };
        }
        return rec;
      })
    );
  };

  const handleUpdateBiometrics = (updated: Biometrics) => {
    setTimeseries((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          return {
            ...rec,
            biometrics: updated,
          };
        }
        return rec;
      })
    );
  };

  const handleUpdateStudy = (updated: WorkSession) => {
    setTimeseries((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          return {
            ...rec,
            study: updated,
          };
        }
        return rec;
      })
    );
  };

  const handleAddWorkout = (workout: WorkoutEntry) => {
    setTimeseries((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          return {
            ...rec,
            workouts: [...rec.workouts, workout],
          };
        }
        return rec;
      })
    );
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setTimeseries((prev) =>
      prev.map((rec) => {
        if (rec.date === selectedDate) {
          return {
            ...rec,
            workouts: rec.workouts.filter((w) => w.id !== workoutId),
          };
        }
        return rec;
      })
    );
  };

  const handleSaveDailyRecord = (updatedRecord: DailyRecord) => {
    setTimeseries((prev) =>
      prev.map((rec) => (rec.date === updatedRecord.date ? updatedRecord : rec))
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset all analytics records to baseline 30-day clinical timeseries?')) {
      const fresh = generateSeedTimeseries();
      setTimeseries(fresh);
      setSelectedDate(fresh[fresh.length - 1].date);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportGodot = () => {
    exportTimeseriesToGodotJSON(timeseries);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white/20 pb-20 lg:pb-8">
      {/* Liquid Glass Background Sheen Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[350px] bg-white/[0.015] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[400px] bg-white/[0.01] rounded-full blur-[160px]" />
      </div>

      {/* Top Header Bar (Strict 3-zone contract) */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 bg-black/75 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider text-white uppercase whitespace-nowrap">
                METABOLIC GLASS
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Clinical Bio-Engine v2.4
              </span>
            </div>
          </div>

          {/* Zone 2: Date Selector & Moving Average Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={handlePrevDay}
                aria-label="Previous Day"
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 text-xs font-mono font-semibold text-white tracking-wide">
                {selectedDate}
              </span>

              <button
                onClick={handleNextDay}
                aria-label="Next Day"
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(timeseries[timeseries.length - 1].date)}
              className="hidden md:inline-flex px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-colors"
            >
              Today
            </button>
          </div>

          {/* Zone 3: Primary Action & Export Utility */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 3D Godot JSON Export Trigger */}
            <button
              onClick={handleExportGodot}
              title="Export 30-Day Timeseries for Godot 3D Engine"
              aria-label="Export dataset for Godot 3D visualization"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono rounded-xl border border-white/10 transition-all active:scale-95 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Godot 3D</span>
            </button>

            {/* Reset Seed Button */}
            <button
              onClick={handleResetData}
              title="Reset baseline dataset"
              aria-label="Reset telemetry data"
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Quick Log Action */}
            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.25)] active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Log</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* 1. HUD Strip: The 6 Core Telemetry Vectors */}
        <section aria-label="Engine Dashboard HUD">
          <EngineHUD
            summary={currentSummary}
            rollingAvg={rollingAvg}
            timeframeLabel={timeframe}
          />
        </section>

        {/* Desktop Multi-Pane Workstation View (≥ 1024px) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 items-start">
          {/* Left Column (7 cols): Correlation Matrix */}
          <div className="col-span-7 space-y-4">
            <CorrelationChart
              summaries={summaries}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              timeframe={timeframe}
              onChangeTimeframe={setTimeframe}
              activeTagFilter={activeTagFilter}
              onSelectTagFilter={setActiveTagFilter}
            />

            <BiometricsLedger
              biometrics={currentRecord.biometrics}
              onUpdateBiometrics={handleUpdateBiometrics}
            />
          </div>

          {/* Right Column (5 cols): Nutrition & Work Ledger */}
          <div className="col-span-5 space-y-4">
            <NutritionEngine
              currentRecord={currentRecord}
              onAddMealClick={() => setIsLogFoodOpen(true)}
              onDeleteMeal={handleDeleteMeal}
            />

            <WorkLedger
              study={currentRecord.study}
              workouts={currentRecord.workouts}
              onUpdateStudy={handleUpdateStudy}
              onAddWorkout={handleAddWorkout}
              onDeleteWorkout={handleDeleteWorkout}
            />
          </div>
        </div>

        {/* Mobile View with Bottom Tab Switching (< 1024px) */}
        <div className="lg:hidden space-y-4">
          {mobileTab === 'engine' && (
            <CorrelationChart
              summaries={summaries}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              timeframe={timeframe}
              onChangeTimeframe={setTimeframe}
              activeTagFilter={activeTagFilter}
              onSelectTagFilter={setActiveTagFilter}
            />
          )}

          {mobileTab === 'nutrition' && (
            <NutritionEngine
              currentRecord={currentRecord}
              onAddMealClick={() => setIsLogFoodOpen(true)}
              onDeleteMeal={handleDeleteMeal}
            />
          )}

          {mobileTab === 'biometrics' && (
            <BiometricsLedger
              biometrics={currentRecord.biometrics}
              onUpdateBiometrics={handleUpdateBiometrics}
            />
          )}

          {mobileTab === 'output' && (
            <WorkLedger
              study={currentRecord.study}
              workouts={currentRecord.workouts}
              onUpdateStudy={handleUpdateStudy}
              onAddWorkout={handleAddWorkout}
              onDeleteWorkout={handleDeleteWorkout}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Dock (Minimum 48x48px touch targets) */}
      <MobileBottomDock
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        onQuickLogClick={() => setIsQuickLogOpen(true)}
      />

      {/* Log Food Modal */}
      <LogFoodModal
        isOpen={isLogFoodOpen}
        onClose={() => setIsLogFoodOpen(false)}
        onAddMeal={handleAddMeal}
        defaultDate={selectedDate}
      />

      {/* Unified Quick Log Drawer */}
      <QuickLogDrawer
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        currentRecord={currentRecord}
        onSaveDailyRecord={handleSaveDailyRecord}
        onOpenFoodLibrary={() => setIsLogFoodOpen(true)}
      />
    </div>
  );
}
