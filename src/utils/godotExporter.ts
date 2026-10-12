import { DailyRecord, GodotExportPayload } from '../types/analytics';
import { deriveDailySummary } from './tefEngine';

/**
 * Serializes the application timeseries into an optimized JSON schema
 * targeted for 3D spatial visualization engines (Godot 4.x / Three.js).
 */
export function exportTimeseriesToGodotJSON(records: DailyRecord[]): void {
  const timeseries = records.map((record) => {
    const summary = deriveDailySummary(record);
    const dateObj = new Date(record.date);

    const totalWorkoutMinutes = record.workouts.reduce((acc, w) => acc + w.durationMin, 0);
    const totalWorkoutKcal = record.workouts.reduce((acc, w) => acc + w.estimatedKcal, 0);

    return {
      date: record.date,
      timestamp_unix: Math.floor(dateObj.getTime() / 1000),
      nutrition: {
        gross_kcal: summary.grossCalories,
        net_kcal: summary.netCalories,
        tef_kcal: summary.tefCalories,
        tef_ratio: summary.grossCalories > 0 ? Number((summary.tefCalories / summary.grossCalories).toFixed(4)) : 0,
        protein_g: summary.proteinG,
        carbs_g: summary.carbsG,
        fat_g: summary.fatG,
        fiber_g: summary.fiberG,
      },
      biometrics: {
        resting_bpm: summary.restingBpm,
        sleep_hours: summary.sleepHours,
        sleep_quality_pct: summary.sleepQualityPct,
        steps: summary.steps,
        weight_kg: summary.weightKg,
        bloat_index: summary.bloatIndex,
      },
      output: {
        study_hours: summary.studyHours,
        focus_rpe: record.study.focusQualityRpe,
        workout_minutes_total: totalWorkoutMinutes,
        workout_burned_kcal: totalWorkoutKcal,
      },
      tags: summary.tags,
    };
  });

  const payload: GodotExportPayload = {
    export_version: '1.0',
    spatial_target: 'godot_3d_engine',
    generated_at: new Date().toISOString(),
    app_meta: {
      system: 'Metabolic Glass Analytics Engine',
      engine_version: '2.4.0',
    },
    metrics_schema: {
      nutrition: ['gross_kcal', 'net_kcal', 'tef_kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g'],
      biometrics: ['resting_bpm', 'sleep_hours', 'sleep_quality_pct', 'steps', 'weight_kg', 'bloat_index'],
      output: ['study_hours', 'focus_rpe', 'workout_minutes_total', 'workout_burned_kcal'],
    },
    records_count: timeseries.length,
    timeseries,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `metabolic_glass_timeseries_godot3d_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
