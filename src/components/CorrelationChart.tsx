import React, { useState, useMemo } from 'react';
import { GlassPanel } from './GlassPanel';
import { DailySummary, OverlayType, TimeframeOption } from '../types/analytics';
import { SlidersHorizontal, Info } from 'lucide-react';

interface CorrelationChartProps {
  summaries: DailySummary[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  timeframe: TimeframeOption;
  onChangeTimeframe: (tf: TimeframeOption) => void;
  activeTagFilter: string | null;
  onSelectTagFilter: (tag: string | null) => void;
}

export const CorrelationChart: React.FC<CorrelationChartProps> = ({
  summaries,
  selectedDate,
  onSelectDate,
  timeframe,
  onChangeTimeframe,
  activeTagFilter,
  onSelectTagFilter,
}) => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>('fuel-mass');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Time window slicing based on timeframe option:
  // '1d' shows last 7 days for micro-context with today active
  // '7d' shows last 14 days
  // '14d' shows last 21 days
  // '30d' shows all 30 days
  const displayedData = useMemo(() => {
    let windowSize = 30;
    if (timeframe === '1d') windowSize = 8;
    else if (timeframe === '7d') windowSize = 14;
    else if (timeframe === '14d') windowSize = 21;
    else if (timeframe === '30d') windowSize = 30;

    const slice = summaries.slice(-windowSize);
    return slice;
  }, [summaries, timeframe]);

  // Extract all unique tags across the dataset for the filter bar
  const allTags = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [summaries]);

  // Dimensions for SVG plotting
  const width = 800;
  const height = 300;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const dataCount = displayedData.length;
  const barWidth = Math.max(12, Math.min(32, (chartW / dataCount) * 0.5));

  // Compute Scales based on active overlay:
  const chartMetrics = useMemo(() => {
    if (activeOverlay === 'fuel-mass') {
      const maxKcal = Math.max(...displayedData.map((d) => d.grossCalories), 3200);
      const minWeight = Math.min(...displayedData.map((d) => d.weightKg), 74);
      const maxWeight = Math.max(...displayedData.map((d) => d.weightKg), 78);
      return {
        primaryLabel: 'Net / Gross Kcal',
        primaryMin: 0,
        primaryMax: maxKcal * 1.1,
        secondaryLabel: 'Weight (kg)',
        secondaryMin: minWeight - 0.5,
        secondaryMax: maxWeight + 0.5,
      };
    } else if (activeOverlay === 'recovery-output') {
      const maxStudy = Math.max(...displayedData.map((d) => d.studyHours), 10);
      const minBpm = Math.min(...displayedData.map((d) => d.restingBpm), 45);
      const maxBpm = Math.max(...displayedData.map((d) => d.restingBpm), 70);
      return {
        primaryLabel: 'Study Hours',
        primaryMin: 0,
        primaryMax: Math.ceil(maxStudy + 1),
        secondaryLabel: 'Resting BPM / Sleep hrs',
        secondaryMin: minBpm - 5,
        secondaryMax: maxBpm + 5,
      };
    } else {
      // Digestive Load vs Productivity
      const maxKcal = Math.max(...displayedData.map((d) => d.grossCalories), 3200);
      const maxStudy = Math.max(...displayedData.map((d) => d.studyHours), 10);
      return {
        primaryLabel: 'Gross Calorie Intake',
        primaryMin: 0,
        primaryMax: maxKcal * 1.1,
        secondaryLabel: 'Study Hours (Output)',
        secondaryMin: 0,
        secondaryMax: Math.ceil(maxStudy + 1),
      };
    }
  }, [activeOverlay, displayedData]);

  // Coordinate helper functions
  const getX = (index: number) => {
    if (dataCount <= 1) return padding.left + chartW / 2;
    return padding.left + (index / (dataCount - 1)) * chartW;
  };

  const getYPrimary = (val: number) => {
    const range = chartMetrics.primaryMax - chartMetrics.primaryMin;
    const norm = (val - chartMetrics.primaryMin) / (range || 1);
    return padding.top + chartH * (1 - Math.max(0, Math.min(1, norm)));
  };

  const getYSecondary = (val: number) => {
    const range = chartMetrics.secondaryMax - chartMetrics.secondaryMin;
    const norm = (val - chartMetrics.secondaryMin) / (range || 1);
    return padding.top + chartH * (1 - Math.max(0, Math.min(1, norm)));
  };

  // Generate SVG path points
  const secondaryLinePoints = useMemo(() => {
    return displayedData.map((d, i) => {
      let val = d.weightKg;
      if (activeOverlay === 'recovery-output') val = d.restingBpm;
      if (activeOverlay === 'digestive-productivity') val = d.studyHours;
      return `${getX(i)},${getYSecondary(val)}`;
    });
  }, [displayedData, activeOverlay, chartMetrics]);

  const sleepLinePoints = useMemo(() => {
    if (activeOverlay !== 'recovery-output') return [];
    return displayedData.map((d, i) => {
      // Map sleep hours (0-10) across secondary scale
      const normalizedSleep = 45 + (d.sleepHours / 10) * 25; // map to bpm scale roughly for dual line
      return `${getX(i)},${getYSecondary(normalizedSleep)}`;
    });
  }, [displayedData, activeOverlay, chartMetrics]);

  const selectedItem = hoveredIdx !== null ? displayedData[hoveredIdx] : displayedData.find((d) => d.date === selectedDate) || displayedData[displayedData.length - 1];

  return (
    <GlassPanel className="p-4 flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Empirical Correlation Matrix
            </h2>
            <span className="text-[11px] font-mono text-neutral-400">
              {displayedData.length} observation points
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {activeOverlay === 'fuel-mass' && 'Cross-plot: Net Absorbed Energy (bars) vs Body Weight Trajectory (white trend line).'}
            {activeOverlay === 'recovery-output' && 'Cross-plot: Deep Study Hours (bars) vs Resting HR (line) & Sleep Duration.'}
            {activeOverlay === 'digestive-productivity' && 'Food Coma Assay: Caloric Spike Load & Bloat vs Subsequent Deep Study Hours.'}
          </p>
        </div>

        {/* Rolling Averages Selector (1d, 7d default, 14d, 30d) */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-black/40 p-1 rounded-xl border border-white/10">
          {(['1d', '7d', '14d', '30d'] as TimeframeOption[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onChangeTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 my-3">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveOverlay('fuel-mass')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeOverlay === 'fuel-mass'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            01. Fuel vs. Mass
          </button>
          <button
            onClick={() => setActiveOverlay('recovery-output')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeOverlay === 'recovery-output'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            02. Recovery vs. Output
          </button>
          <button
            onClick={() => setActiveOverlay('digestive-productivity')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeOverlay === 'digestive-productivity'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            03. Digestive Load vs. Productivity
          </button>
        </div>

        {/* Environmental Context Filter Bar */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
            Context:
          </span>
          <button
            onClick={() => onSelectTagFilter(null)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap transition-colors ${
              activeTagFilter === null
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white bg-white/[0.04]'
            }`}
          >
            All
          </button>
          {['#HostelMess', '#RoomSnack', '#SoloDeepWork', '#StudyCall'].map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTagFilter(activeTagFilter === tag ? null : tag)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap transition-colors ${
                activeTagFilter === tag
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white bg-white/[0.04]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[280px] bg-black/60 rounded-xl border border-white/[0.06] overflow-hidden p-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          preserveAspectRatio="none"
        >
          {/* Subtle Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartH * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="2 3"
                />
              </g>
            );
          })}

          {/* Left Axis Label */}
          <text
            x={15}
            y={height / 2}
            fill="#71717A"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            {chartMetrics.primaryLabel}
          </text>

          {/* Right Axis Label */}
          <text
            x={width - 12}
            y={height / 2}
            fill="#71717A"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            transform={`rotate(90, ${width - 12}, ${height / 2})`}
          >
            {chartMetrics.secondaryLabel}
          </text>

          {/* Plot Bars */}
          {displayedData.map((d, i) => {
            const x = getX(i);
            const isMatchTag = !activeTagFilter || d.tags.includes(activeTagFilter);
            const isSelected = d.date === selectedDate;
            const isHovered = hoveredIdx === i;

            let barVal = d.netCalories;
            if (activeOverlay === 'recovery-output') barVal = d.studyHours;
            if (activeOverlay === 'digestive-productivity') barVal = d.grossCalories;

            const y = getYPrimary(barVal);
            const barH = padding.top + chartH - y;

            const baseOpacity = !isMatchTag ? 0.15 : isSelected || isHovered ? 0.9 : 0.45;

            return (
              <g
                key={`bar-${d.date}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectDate(d.date)}
              >
                {/* Secondary Gross bar when viewing fuel-mass */}
                {activeOverlay === 'fuel-mass' && (
                  <rect
                    x={x - barWidth / 2}
                    y={getYPrimary(d.grossCalories)}
                    width={barWidth}
                    height={padding.top + chartH - getYPrimary(d.grossCalories)}
                    fill="rgba(255, 255, 255, 0.12)"
                    rx={2}
                  />
                )}

                {/* Primary Metric Bar */}
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barH)}
                  fill={isSelected ? '#FFFFFF' : `rgba(255, 255, 255, ${baseOpacity})`}
                  rx={2}
                  className="transition-all duration-150"
                />

                {/* Bloat Index Dot overlay when in digestive-productivity mode */}
                {activeOverlay === 'digestive-productivity' && (
                  <circle
                    cx={x}
                    cy={padding.top + chartH - (d.bloatIndex / 5) * (chartH * 0.85)}
                    r={d.bloatIndex >= 4 ? 4 : 2.5}
                    fill={d.bloatIndex >= 4 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'}
                    stroke="#000000"
                    strokeWidth={1}
                  />
                )}

                {/* X Axis Date Label */}
                {(i === 0 || i === Math.floor(dataCount / 2) || i === dataCount - 1 || isSelected) && (
                  <text
                    x={x}
                    y={height - 12}
                    fill={isSelected ? '#FFFFFF' : '#71717A'}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {d.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Secondary Trend Line (White specular high-contrast line) */}
          {secondaryLinePoints.length > 1 && (
            <polyline
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={secondaryLinePoints.join(' ')}
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            />
          )}

          {/* Tertiary Sleep Line if in recovery mode */}
          {sleepLinePoints.length > 1 && (
            <polyline
              fill="none"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              points={sleepLinePoints.join(' ')}
            />
          )}

          {/* Trend points dots */}
          {displayedData.map((d, i) => {
            const x = getX(i);
            let val = d.weightKg;
            if (activeOverlay === 'recovery-output') val = d.restingBpm;
            if (activeOverlay === 'digestive-productivity') val = d.studyHours;

            const y = getYSecondary(val);
            const isHovered = hoveredIdx === i || d.date === selectedDate;

            return (
              <circle
                key={`dot-${d.date}`}
                cx={x}
                cy={y}
                r={isHovered ? 4.5 : 2.5}
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth={1.5}
                className="transition-all duration-150 cursor-pointer pointer-events-none"
              />
            );
          })}
        </svg>

        {/* Selected Data Crosshair Strip */}
        {selectedItem && (
          <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-black/85 backdrop-blur-md rounded-lg border border-white/15 text-[11px] font-mono text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{selectedItem.date}</span>
              <span className="text-neutral-500">|</span>
              <span>Net: <strong className="text-white">{selectedItem.netCalories} kcal</strong></span>
              <span>(Gross: {selectedItem.grossCalories})</span>
              <span className="text-neutral-500">|</span>
              <span>Weight: <strong className="text-white">{selectedItem.weightKg} kg</strong></span>
              <span className="text-neutral-500">|</span>
              <span>Study: <strong className="text-white">{selectedItem.studyHours}h</strong></span>
              <span className="text-neutral-500">|</span>
              <span>RHR: <strong className="text-white">{selectedItem.restingBpm} bpm</strong></span>
              <span className="text-neutral-500">|</span>
              <span>Bloat: <strong className="text-white">{selectedItem.bloatIndex}/5</strong></span>
            </div>

            <div className="flex items-center gap-1">
              {selectedItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.2 text-[10px] bg-white/10 text-neutral-300 rounded border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-white/[0.06] mt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-white rounded-xs inline-block" />
            <span>Primary Yield (Bars)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-[2px] bg-white inline-block shadow-[0_0_4px_white]" />
            <span>Trajectory Line</span>
          </div>
          {activeOverlay === 'digestive-productivity' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              <span>Bloat Indicator (Distension)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-neutral-500">
          <Info className="w-3 h-3" />
          <span>Click any bar to lock telemetry day</span>
        </div>
      </div>
    </GlassPanel>
  );
};
