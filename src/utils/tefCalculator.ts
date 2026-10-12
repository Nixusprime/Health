/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyRecord, MealLogEntry, NutritionTotals, RollingTimeframe } from '../types/analytics';

/**
 * Thermic Effect of Food (TEF) coefficients:
 * - Protein: ~25% metabolic energy expenditure for digestion, breakdown, and ureagenesis
 * - Carbohydrates: ~8% metabolic energy expenditure for glycogen conversion and insulin release
 * - Fats / Lipids: ~3% metabolic energy expenditure for passive intestinal chylomicron assembly
 */
export const TEF_RATES = {
  PROTEIN: 0.25,
  CARBS: 0.08,
  FAT: 0.03,
} as const;

/**
 * Standard Atwater caloric densities:
 * - Protein: 4 kcal / gram
 * - Carbohydrate: 4 kcal / gram
 * - Fat: 9 kcal / gram
 */
export const ATWATER_DENSITY = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
} as const;

export function computeMealTef(
  proteinG: number,
  carbsG: number,
  fatG: number
): {
  grossKcal: number;
  proteinTefKcal: number;
  carbsTefKcal: number;
  fatTefKcal: number;
  totalTefKcal: number;
  netKcal: number;
  absorptionRatePct: number;
} {
  const proteinKcal = proteinG * ATWATER_DENSITY.PROTEIN;
  const carbsKcal = carbsG * ATWATER_DENSITY.CARBS;
  const fatKcal = fatG * ATWATER_DENSITY.FAT;

  const grossKcal = proteinKcal + carbsKcal + fatKcal;

  const proteinTefKcal = proteinKcal * TEF_RATES.PROTEIN;
  const carbsTefKcal = carbsKcal * TEF_RATES.CARBS;
  const fatTefKcal = fatKcal * TEF_RATES.FAT;

  const totalTefKcal = proteinTefKcal + carbsTefKcal + fatTefKcal;
  const netKcal = Math.max(0, grossKcal - totalTefKcal);
  const absorptionRatePct = grossKcal > 0 ? (netKcal / grossKcal) * 100 : 0;

  return {
    grossKcal: Math.round(grossKcal * 10) / 10,
    proteinTefKcal: Math.round(proteinTefKcal * 10) / 10,
    carbsTefKcal: Math.round(carbsTefKcal * 10) / 10,
    fatTefKcal: Math.round(fatTefKcal * 10) / 10,
    totalTefKcal: Math.round(totalTefKcal * 10) / 10,
    netKcal: Math.round(netKcal * 10) / 10,
    absorptionRatePct: Math.round(absorptionRatePct * 10) / 10,
  };
}

export function computeDailyNutritionTotals(meals: MealLogEntry[]): NutritionTotals {
  let grossKcal = 0;
  let netKcal = 0;
  let totalTefKcal = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatG = 0;
  let fiberG = 0;
  let proteinTefKcal = 0;
  let carbsTefKcal = 0;
  let fatTefKcal = 0;

  for (const meal of meals) {
    proteinG += meal.proteinG;
    carbsG += meal.carbsG;
    fatG += meal.fatG;
    fiberG += meal.fiberG;
    grossKcal += meal.grossKcal;
    netKcal += meal.netKcal;
    totalTefKcal += meal.totalTefKcal;
    proteinTefKcal += meal.proteinTefKcal;
    carbsTefKcal += meal.carbsTefKcal;
    fatTefKcal += meal.fatTefKcal;
  }

  const proteinKcal = proteinG * ATWATER_DENSITY.PROTEIN;
  const carbsKcal = carbsG * ATWATER_DENSITY.CARBS;
  const fatKcal = fatG * ATWATER_DENSITY.FAT;
  const absorptionRatePct = grossKcal > 0 ? (netKcal / grossKcal) * 100 : 0;

  return {
    grossKcal: Math.round(grossKcal),
    netKcal: Math.round(netKcal),
    totalTefKcal: Math.round(totalTefKcal),
    proteinG: Math.round(proteinG * 10) / 10,
    carbsG: Math.round(carbsG * 10) / 10,
    fatG: Math.round(fatG * 10) / 10,
    fiberG: Math.round(fiberG * 10) / 10,
    proteinKcal: Math.round(proteinKcal),
    carbsKcal: Math.round(carbsKcal),
    fatKcal: Math.round(fatKcal),
    proteinTefKcal: Math.round(proteinTefKcal),
    carbsTefKcal: Math.round(carbsTefKcal),
    fatTefKcal: Math.round(fatTefKcal),
    absorptionRatePct: Math.round(absorptionRatePct * 10) / 10,
  };
}

export function getRollingSlice(
  records: DailyRecord[],
  targetDate: string,
  timeframe: RollingTimeframe
): DailyRecord[] {
  const targetIndex = records.findIndex((r) => r.date === targetDate);
  if (targetIndex === -1) return records.slice(-7);

  const daysCount = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30;
  const startIndex = Math.max(0, targetIndex - daysCount + 1);
  return records.slice(startIndex, targetIndex + 1);
}

export function computeRollingAverages(recordsSlice: DailyRecord[]) {
  if (recordsSlice.length === 0) {
    return {
      netKcal: 0,
      grossKcal: 0,
      proteinG: 0,
      studyHours: 0,
      sleepHours: 0,
      restingBpm: 0,
      steps: 0,
      weightKg: 0,
      absorptionRatePct: 0,
    };
  }

  let totalNetKcal = 0;
  let totalGrossKcal = 0;
  let totalProteinG = 0;
  let totalStudyHours = 0;
  let totalSleepHours = 0;
  let totalRestingBpm = 0;
  let totalSteps = 0;
  let totalWeightKg = 0;

  for (const record of recordsSlice) {
    const nutrition = computeDailyNutritionTotals(record.meals);
    totalNetKcal += nutrition.netKcal;
    totalGrossKcal += nutrition.grossKcal;
    totalProteinG += nutrition.proteinG;
    totalStudyHours += record.output.studyHours;
    totalSleepHours += record.biometrics.sleepHours;
    totalRestingBpm += record.biometrics.restingBpm;
    totalSteps += record.biometrics.steps;
    totalWeightKg += record.biometrics.weightKg;
  }

  const n = recordsSlice.length;
  const avgGross = totalGrossKcal / n;
  const avgNet = totalNetKcal / n;

  return {
    netKcal: Math.round(avgNet),
    grossKcal: Math.round(avgGross),
    proteinG: Math.round((totalProteinG / n) * 10) / 10,
    studyHours: Math.round((totalStudyHours / n) * 10) / 10,
    sleepHours: Math.round((totalSleepHours / n) * 10) / 10,
    restingBpm: Math.round(totalRestingBpm / n),
    steps: Math.round(totalSteps / n),
    weightKg: Math.round((totalWeightKg / n) * 100) / 100,
    absorptionRatePct: avgGross > 0 ? Math.round((avgNet / avgGross) * 1000) / 10 : 0,
  };
}
