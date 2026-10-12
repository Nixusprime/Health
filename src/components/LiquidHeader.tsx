/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Activity, Layers } from 'lucide-react';
import { RollingTimeframe } from '../types/analytics';

interface LiquidHeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  rollingTimeframe: RollingTimeframe;
  onRollingChange: (timeframe: RollingTimeframe) => void;
  onOpenQuickLog: () => void;
  availableDates: string[];
}

export const LiquidHeader: React.FC<LiquidHeaderProps> = ({
  currentDate,
  onDateChange,
  rollingTimeframe,
  onRollingChange,
  onOpenQuickLog,
  availableDates,
}) => {
  const currentIndex = availableDates.indexOf(currentDate);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < availableDates.length - 1;

  const handlePrevDay = () => {
    if (canGoPrev) {
      onDateChange(availableDates[currentIndex - 1]);
    }
  };

  const handleNextDay = () => {
    if (canGoNext) {
      onDateChange(availableDates[currentIndex + 1]);
    }
  };

  const handleToday = () => {
    if (availableDates.length > 0) {
      onDateChange(availableDates[availableDates.length - 1]);
    }
  };

  // Format date display (e.g., "SAT · OCT 10, 2026")
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      const year = d.getFullYear();
      return `${weekday} · ${month} ${day}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  const timeframes: { id: RollingTimeframe; label: string }[] = [
    { id: '1d', label: '1D' },
    { id: '7d', label: '7D' },
    { id: '14d', label: '14D' },
    { id: '30d', label: '30D' },
  ];

  return (
    <header className="liquid-glass sticky top-0 z-40 w-full px-4 md:px-8 py-3 transition-all duration-200">
      <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        {/* Brand Zone */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg liquid-glass-elevated flex items-center justify-center border border-white/20">
              <Activity className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">KINETIC</span>
                <span className="text-[10px] tracking-widest text-white/40 font-tabular uppercase border-l border-white/10 pl-2">
                  TELEMETRY
                </span>
              </div>
            </div>
          </div>

          {/* Quick Log Mobile Trigger */}
          <button
            onClick={onOpenQuickLog}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-glass-elevated text-xs font-medium text-white hover:border-white/30 active:scale-95 transition-all"
            aria-label="Quick Log Entry"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Log</span>
          </button>
        </div>

        {/* Center Zone: Date Stepper & Rolling Frame Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          {/* Date Controls */}
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass-subtle border border-white/10">
            <button
              onClick={handlePrevDay}
              disabled={!canGoPrev}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs font-semibold text-white tracking-wider font-tabular whitespace-nowrap">
                {formatDateDisplay(currentDate)}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              disabled={!canGoNext}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {currentIndex !== availableDates.length - 1 && (
              <button
                onClick={handleToday}
                className="px-2 py-0.5 ml-1 text-[10px] font-semibold tracking-wider uppercase rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
              >
                Today
              </button>
            )}
          </div>

          {/* Rolling Window Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass-subtle border border-white/10">
            <span className="text-[10px] text-white/40 font-mono tracking-wider px-2 hidden sm:inline-block">
              ROLLING:
            </span>
            {timeframes.map((tf) => {
              const isActive = rollingTimeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  onClick={() => onRollingChange(tf.id)}
                  className={`px-2.5 py-1 text-xs font-tabular font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  aria-pressed={isActive}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Zone: Primary Workstation Action */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>LOG RAW ENTRY</span>
          </button>
        </div>
      </div>
    </header>
  );
};
