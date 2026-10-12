import React from 'react';
import { GlassPanel } from './GlassPanel';
import { DailySummary } from '../types/analytics';
import { Flame, Dumbbell, Brain, Moon, HeartPulse, Activity } from 'lucide-react';

interface EngineHUDProps {
  summary: DailySummary;
  rollingAvg: {
    avgNetKcal: number;
    avgProteinG: number;
    avgStudyHours: number;
    avgSleepHours: number;
    avgRestingBpm: number;
    avgBloatIndex: number;
  };
  timeframeLabel: string;
}

export const EngineHUD: React.FC<EngineHUDProps> = ({ summary, rollingAvg, timeframeLabel }) => {
  const getBloatLabel = (index: number) => {
    switch (index) {
      case 1:
        return 'Optimal (Flat)';
      case 2:
        return 'Nominal';
      case 3:
        return 'Moderate Fullness';
      case 4:
        return 'Heavy Distension';
      case 5:
        return 'Acute Food Coma';
      default:
        return 'Nominal';
    }
  };

  const hudMetrics = [
    {
      id: 'net-calories',
      label: 'Net Absorbed',
      unit: 'kcal',
      value: summary.netCalories.toLocaleString(),
      subValue: `Gross: ${summary.grossCalories.toLocaleString()} (TEF -${summary.tefCalories})`,
      delta: summary.netCalories - rollingAvg.avgNetKcal,
      deltaLabel: `vs ${timeframeLabel} avg (${rollingAvg.avgNetKcal})`,
      icon: Flame,
      efficiency: `${summary.tefEfficiencyPct}% yield`,
    },
    {
      id: 'protein',
      label: 'Protein Assimilated',
      unit: 'g',
      value: summary.proteinG.toString(),
      subValue: `${Math.round(summary.proteinG * 4)} kcal gross (25% TEF tax)`,
      delta: summary.proteinG - rollingAvg.avgProteinG,
      deltaLabel: `vs ${timeframeLabel} avg (${rollingAvg.avgProteinG}g)`,
      icon: Dumbbell,
      efficiency: `~${Math.round(summary.proteinG * 3)} net kcal`,
    },
    {
      id: 'study-hours',
      label: 'Deep Work Output',
      unit: 'hrs',
      value: summary.studyHours.toFixed(1),
      subValue: `High-cognitive focus`,
      delta: Number((summary.studyHours - rollingAvg.avgStudyHours).toFixed(1)),
      deltaLabel: `vs ${timeframeLabel} avg (${rollingAvg.avgStudyHours}h)`,
      icon: Brain,
      efficiency: null,
    },
    {
      id: 'sleep',
      label: 'Sleep Recovery',
      unit: 'hrs',
      value: summary.sleepHours.toFixed(1),
      subValue: `Score: ${summary.sleepQualityPct}% recovery`,
      delta: Number((summary.sleepHours - rollingAvg.avgSleepHours).toFixed(1)),
      deltaLabel: `vs ${timeframeLabel} avg (${rollingAvg.avgSleepHours}h)`,
      icon: Moon,
      efficiency: null,
    },
    {
      id: 'resting-hr',
      label: 'Resting Heart Rate',
      unit: 'bpm',
      value: summary.restingBpm.toString(),
      subValue: 'Autonomic tone biomarker',
      delta: summary.restingBpm - rollingAvg.avgRestingBpm,
      deltaLabel: `vs ${timeframeLabel} avg (${rollingAvg.avgRestingBpm})`,
      icon: HeartPulse,
      inverseDelta: true, // lower RHR is better
      efficiency: null,
    },
    {
      id: 'bloat-index',
      label: 'Digestive Bloat Index',
      unit: '1-5',
      value: `${summary.bloatIndex}/5`,
      subValue: getBloatLabel(summary.bloatIndex),
      delta: summary.bloatIndex - rollingAvg.avgBloatIndex,
      deltaLabel: `vs ${timeframeLabel} avg (${rollingAvg.avgBloatIndex})`,
      icon: Activity,
      inverseDelta: true, // lower bloat is better
      efficiency: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {hudMetrics.map((metric) => {
        const Icon = metric.icon;
        const deltaVal = metric.delta;
        const isBetter = metric.inverseDelta ? deltaVal <= 0 : deltaVal >= 0;

        return (
          <GlassPanel
            key={metric.id}
            variant="interactive"
            className="p-3.5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
                <span className="font-medium tracking-wide uppercase text-[10px] text-neutral-400">
                  {metric.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                  {metric.value}
                </span>
                <span className="text-xs font-mono text-neutral-400">{metric.unit}</span>
              </div>

              <div className="text-[11px] text-neutral-400 font-mono truncate">
                {metric.subValue}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/[0.07] flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-500 truncate" title={metric.deltaLabel}>
                {metric.deltaLabel}
              </span>
              <span
                className={`font-semibold shrink-0 ml-1 ${
                  deltaVal === 0
                    ? 'text-neutral-400'
                    : isBetter
                    ? 'text-white'
                    : 'text-neutral-400'
                }`}
              >
                {deltaVal > 0 ? `+${deltaVal}` : `${deltaVal}`}
              </span>
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
};
