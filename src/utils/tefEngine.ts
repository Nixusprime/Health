import { LoggedMeal, MacroNutrients, DailyRecord, DailySummary } from '../types/analytics';

export const TEF_RATES = {
  protein: 0.25, // 25% metabolic cost to digest and assimilate
  carbs: 0.08,   // 8% metabolic cost for carbohydrate oxidation/glycogenesis
  fat: 0.03,     // 3% metabolic cost for lipid storage/oxidation
};

export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

/**
 * Calculates Gross Calories, TEF Burned Calories, and Net Absorbed Calories for given macronutrients.
 */
export function calculateMacrosKcal(macros: MacroNutrients): {
  grossKcal: number;
  tefKcal: number;
  netKcal: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  tefProteinKcal: number;
  tefCarbsKcal: number;
  tefFatKcal: number;
} {
  const proteinKcal = Math.round(macros.proteinG * KCAL_PER_GRAM.protein);
  const carbsKcal = Math.round(macros.carbsG * KCAL_PER_GRAM.carbs);
  const fatKcal = Math.round(macros.fatG * KCAL_PER_GRAM.fat);

  const grossKcal = proteinKcal + carbsKcal + fatKcal;

  const tefProteinKcal = Number((proteinKcal * TEF_RATES.protein).toFixed(1));
  const tefCarbsKcal = Number((carbsKcal * TEF_RATES.carbs).toFixed(1));
  const tefFatKcal = Number((fatKcal * TEF_RATES.fat).toFixed(1));

  const tefKcal = Number((tefProteinKcal + tefCarbsKcal + tefFatKcal).toFixed(1));
  const netKcal = Math.round(grossKcal - tefKcal);

  return {
    grossKcal,
    tefKcal,
    netKcal,
    proteinKcal,
    carbsKcal,
    fatKcal,
    tefProteinKcal,
    tefCarbsKcal,
    tefFatKcal,
  };
}

/**
 * Derives the daily aggregated nutrition and summary metrics from a DailyRecord
 */
export function deriveDailySummary(record: DailyRecord): DailySummary {
  let grossCalories = 0;
  let tefCalories = 0;
  let netCalories = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatG = 0;
  let fiberG = 0;

  const allTags = new Set<string>();

  // Aggregate meals
  for (const meal of record.meals) {
    grossCalories += meal.grossKcal;
    tefCalories += meal.tefKcal;
    netCalories += meal.netKcal;
    proteinG += meal.proteinG;
    carbsG += meal.carbsG;
    fatG += meal.fatG;
    fiberG += meal.fiberG;
    meal.tags.forEach((t) => allTags.add(t));
  }

  record.study.tags.forEach((t) => allTags.add(t));
  record.workouts.forEach((w) => w.tags.forEach((t) => allTags.add(t)));

  const tefEfficiencyPct = grossCalories > 0 ? (netCalories / grossCalories) * 100 : 100;

  return {
    date: record.date,
    grossCalories: Math.round(grossCalories),
    netCalories: Math.round(netCalories),
    tefCalories: Math.round(tefCalories),
    tefEfficiencyPct: Number(tefEfficiencyPct.toFixed(1)),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
    fiberG: Math.round(fiberG),
    studyHours: record.study.studyHours,
    sleepHours: record.biometrics.sleepHours,
    sleepQualityPct: record.biometrics.sleepQualityPct,
    restingBpm: record.biometrics.restingBpm,
    steps: record.biometrics.steps,
    weightKg: record.biometrics.weightKg,
    bloatIndex: record.biometrics.bloatIndex,
    tags: Array.from(allTags),
  };
}

/**
 * Calculates rolling average for a window of days
 */
export function calculateRollingAverage(
  summaries: DailySummary[],
  windowDays: number,
  selectedDate: string
): {
  avgNetKcal: number;
  avgGrossKcal: number;
  avgProteinG: number;
  avgSleepHours: number;
  avgRestingBpm: number;
  avgStudyHours: number;
  avgWeightKg: number;
  avgBloatIndex: number;
  avgSteps: number;
  sampleCount: number;
} {
  const targetIdx = summaries.findIndex((s) => s.date === selectedDate);
  const endIdx = targetIdx >= 0 ? targetIdx : summaries.length - 1;
  const startIdx = Math.max(0, endIdx - windowDays + 1);
  const windowSubset = summaries.slice(startIdx, endIdx + 1);

  if (windowSubset.length === 0) {
    return {
      avgNetKcal: 0,
      avgGrossKcal: 0,
      avgProteinG: 0,
      avgSleepHours: 0,
      avgRestingBpm: 0,
      avgStudyHours: 0,
      avgWeightKg: 0,
      avgBloatIndex: 0,
      avgSteps: 0,
      sampleCount: 0,
    };
  }

  const sum = windowSubset.reduce(
    (acc, curr) => ({
      netKcal: acc.netKcal + curr.netCalories,
      grossKcal: acc.grossKcal + curr.grossCalories,
      protein: acc.protein + curr.proteinG,
      sleep: acc.sleep + curr.sleepHours,
      bpm: acc.bpm + curr.restingBpm,
      study: acc.study + curr.studyHours,
      weight: acc.weight + curr.weightKg,
      bloat: acc.bloat + curr.bloatIndex,
      steps: acc.steps + curr.steps,
    }),
    { netKcal: 0, grossKcal: 0, protein: 0, sleep: 0, bpm: 0, study: 0, weight: 0, bloat: 0, steps: 0 }
  );

  const count = windowSubset.length;
  return {
    avgNetKcal: Math.round(sum.netKcal / count),
    avgGrossKcal: Math.round(sum.grossKcal / count),
    avgProteinG: Math.round(sum.protein / count),
    avgSleepHours: Number((sum.sleep / count).toFixed(1)),
    avgRestingBpm: Math.round(sum.bpm / count),
    avgStudyHours: Number((sum.study / count).toFixed(1)),
    avgWeightKg: Number((sum.weight / count).toFixed(2)),
    avgBloatIndex: Number((sum.bloat / count).toFixed(1)),
    avgSteps: Math.round(sum.steps / count),
    sampleCount: count,
  };
}
