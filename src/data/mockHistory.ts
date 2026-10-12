/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyRecord, MealLogEntry, WorkoutSession } from '../types/analytics';
import { computeMealTef } from '../utils/tefCalculator';

function createMeal(
  id: string,
  timestamp: string,
  foodItemId: string,
  foodName: string,
  servings: number,
  baseProtein: number,
  baseCarbs: number,
  baseFat: number,
  baseFiber: number
): MealLogEntry {
  const proteinG = Math.round(baseProtein * servings * 10) / 10;
  const carbsG = Math.round(baseCarbs * servings * 10) / 10;
  const fatG = Math.round(baseFat * servings * 10) / 10;
  const fiberG = Math.round(baseFiber * servings * 10) / 10;

  const tef = computeMealTef(proteinG, carbsG, fatG);

  return {
    id,
    timestamp,
    foodItemId,
    foodName,
    servings,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    grossKcal: tef.grossKcal,
    proteinTefKcal: tef.proteinTefKcal,
    carbsTefKcal: tef.carbsTefKcal,
    fatTefKcal: tef.fatTefKcal,
    totalTefKcal: tef.totalTefKcal,
    netKcal: tef.netKcal,
  };
}

export function generate30DayHistory(endDateStr = '2026-10-10'): DailyRecord[] {
  const records: DailyRecord[] = [];
  const endDate = new Date(endDateStr);

  // Baseline variables
  let currentWeight = 78.1;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Day profiles to model correlations:
    // Some days represent high digestive load spikes (Food Comas),
    // Some represent peak recovery days, some represent heavy training days.
    const isHeavyDigestiveSpike = i % 7 === 2; // e.g., massive food coma days
    const isPeakRecoveryDay = i % 5 === 0;
    const isLowSleepDay = i % 6 === 3;

    // Biometrics
    let sleepHours = 7.5;
    let sleepQualityPct = 85;
    let restingBpm = 54;
    let steps = 11200;

    if (isPeakRecoveryDay) {
      sleepHours = 8.6;
      sleepQualityPct = 94;
      restingBpm = 49;
      steps = 9800;
    } else if (isLowSleepDay) {
      sleepHours = 5.9;
      sleepQualityPct = 68;
      restingBpm = 62;
      steps = 8400;
    } else {
      sleepHours = 7.1 + ((i * 13) % 9) * 0.1;
      sleepQualityPct = 80 + ((i * 7) % 15);
      restingBpm = 52 + ((i * 3) % 7);
      steps = 10000 + ((i * 543) % 4000);
    }

    // Work & Output
    // Study hours strongly correlates with sleep and inversely with digestive spikes
    let studyHours = 5.0;
    let studyQualityRpe = 8;
    if (isHeavyDigestiveSpike) {
      // Acute food coma productivity dip
      studyHours = 2.4;
      studyQualityRpe = 5;
    } else if (isPeakRecoveryDay) {
      studyHours = 7.2;
      studyQualityRpe = 9;
    } else if (isLowSleepDay) {
      studyHours = 3.6;
      studyQualityRpe = 6;
    } else {
      studyHours = Math.round((4.5 + (sleepHours - 7.0) * 0.8 + ((i * 17) % 7) * 0.2) * 10) / 10;
      studyQualityRpe = 7 + (i % 3);
    }

    // Workout
    const workouts: WorkoutSession[] = [];
    if (i % 7 !== 0) { // 6 days training, 1 rest day
      const workoutTypes: WorkoutSession['type'][] = [
        'Hypertrophy',
        'Strength',
        'Zone 2 Cardio',
        'Hypertrophy',
        'Zone 2 Cardio',
        'Strength',
      ];
      const type = workoutTypes[i % workoutTypes.length];
      const duration = type === 'Zone 2 Cardio' ? 50 : 65;
      const rpe = type === 'Zone 2 Cardio' ? 6 : 8;
      const burn = type === 'Zone 2 Cardio' ? 440 : 380;
      workouts.push({
        id: `wo_${dateStr}_1`,
        type,
        durationMins: duration,
        intensityRpe: rpe,
        estBurnKcal: burn,
        notes: `${type} protocol completed at RPE ${rpe}`,
      });
    }

    // Meals
    const meals: MealLogEntry[] = [];
    if (isHeavyDigestiveSpike) {
      // Massive calorie spike day: 3,400+ gross kcal with heavy fat and carb spike at noon
      meals.push(
        createMeal(`m_${dateStr}_1`, '08:00', 'food_rolled_oats', 'Organic Rolled Oats (Raw)', 1.5, 10.4, 54.4, 5.2, 8.2),
        createMeal(`m_${dateStr}_2`, '08:15', 'food_whey_isolate', 'Whey Protein Isolate (Unflavored)', 1.5, 28.0, 0.8, 0.4, 0),
        // Monster lunch causing acute lethargy
        createMeal(`m_${dateStr}_3`, '12:30', 'food_beef_sirloin', 'Grass-Fed Sirloin Steak (Trimmed)', 2.5, 48.2, 0, 12.6, 0),
        createMeal(`m_${dateStr}_4`, '12:45', 'food_sourdough', 'Artisan Sourdough (Fermented)', 3.0, 7.2, 38.0, 1.1, 2.0),
        createMeal(`m_${dateStr}_5`, '13:00', 'food_dark_chocolate', 'Dark Chocolate 85% Cacao', 2.0, 2.8, 13.5, 14.0, 3.3),
        createMeal(`m_${dateStr}_6`, '19:30', 'food_wild_salmon', 'Wild Atlantic Salmon (Baked)', 1.2, 40.0, 0, 17.6, 0),
        createMeal(`m_${dateStr}_7`, '19:45', 'food_jasmine_rice', 'Jasmine Rice (Steamed)', 1.5, 4.8, 56.4, 0.6, 0.8)
      );
      currentWeight += 0.12; // Surplus converts to mass
    } else {
      // High-protein clean metabolic day (~2,400-2,650 gross kcal)
      meals.push(
        createMeal(`m_${dateStr}_1`, '08:30', 'food_whole_eggs', 'Pasture-Raised Eggs (Large, 2 pcs)', 1.5, 12.6, 0.7, 9.9, 0),
        createMeal(`m_${dateStr}_2`, '08:30', 'food_rolled_oats', 'Organic Rolled Oats (Raw)', 1.0, 10.4, 54.4, 5.2, 8.2),
        createMeal(`m_${dateStr}_3`, '08:45', 'food_blueberries', 'Organic Wild Blueberries (Fresh)', 1.0, 1.1, 21.8, 0.5, 3.6),
        createMeal(`m_${dateStr}_4`, '13:00', 'food_chicken_breast', 'Chicken Breast (Skinless, Cooked)', 1.5, 46.5, 0, 5.4, 0),
        createMeal(`m_${dateStr}_5`, '13:00', 'food_jasmine_rice', 'Jasmine Rice (Steamed)', 1.2, 4.8, 56.4, 0.6, 0.8),
        createMeal(`m_${dateStr}_6`, '13:15', 'food_steamed_broccoli', 'Broccoli Florets (Steamed)', 1.0, 4.2, 10.8, 0.9, 3.9),
        createMeal(`m_${dateStr}_7`, '17:00', 'food_greek_yogurt_0', 'Greek Yogurt 0% Plain (Strained)', 1.2, 20.6, 7.2, 0.8, 0),
        createMeal(`m_${dateStr}_8`, '20:00', 'food_wild_salmon', 'Wild Atlantic Salmon (Baked)', 1.0, 40.0, 0, 17.6, 0),
        createMeal(`m_${dateStr}_9`, '20:15', 'food_sweet_potato', 'Sweet Potato (Baked w/ Skin)', 1.2, 4.0, 41.4, 0.3, 6.6)
      );
      // Slight gentle drift
      currentWeight += (Math.sin(i * 0.4) * 0.04);
    }

    records.push({
      date: dateStr,
      meals,
      biometrics: {
        restingBpm: Math.round(restingBpm),
        sleepHours: Math.round(sleepHours * 10) / 10,
        sleepQualityPct: Math.round(sleepQualityPct),
        steps: Math.round(steps),
        weightKg: Math.round(currentWeight * 100) / 100,
      },
      output: {
        studyHours: Math.round(studyHours * 10) / 10,
        studyQualityRpe: Math.round(studyQualityRpe),
        workouts,
      },
    });
  }

  return records;
}
