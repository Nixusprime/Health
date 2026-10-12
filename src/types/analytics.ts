export type MacroNutrients = {
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
};

export type FoodItem = MacroNutrients & {
  id: string;
  name: string;
  servingSize: string;
  category: 'Protein' | 'Carbohydrate' | 'Lipid' | 'Prepared Meal' | 'Snack';
  defaultGrossKcal?: number;
};

export type LoggedMeal = MacroNutrients & {
  id: string;
  foodItemId?: string;
  name: string;
  timestamp: string; // "13:30"
  servings: number;
  grossKcal: number;
  tefKcal: number;
  netKcal: number;
  tags: string[]; // e.g. ["#HostelMess", "#RoomSnack"]
};

export type Biometrics = {
  restingBpm: number;
  sleepHours: number;
  sleepQualityPct: number;
  steps: number;
  weightKg: number;
  bloatIndex: number; // 1 (optimal flat/light) to 5 (severe distension/coma)
};

export type WorkoutType = 'Hypertrophy' | 'Zone 2 Cardio' | 'HIIT' | 'Strength' | 'Mobility';

export type WorkoutEntry = {
  id: string;
  type: WorkoutType;
  durationMin: number;
  intensityRpe: number; // 1-10
  estimatedKcal: number;
  notes?: string;
  tags: string[];
};

export type WorkSession = {
  studyHours: number;
  focusQualityRpe: number; // 1-10
  tags: string[]; // e.g. ["#SoloDeepWork", "#StudyCall"]
  notes?: string;
};

export type DailyRecord = {
  date: string; // "YYYY-MM-DD"
  meals: LoggedMeal[];
  biometrics: Biometrics;
  study: WorkSession;
  workouts: WorkoutEntry[];
};

export type DailySummary = {
  date: string;
  grossCalories: number;
  netCalories: number;
  tefCalories: number;
  tefEfficiencyPct: number; // (net / gross) * 100
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  studyHours: number;
  sleepHours: number;
  sleepQualityPct: number;
  restingBpm: number;
  steps: number;
  weightKg: number;
  bloatIndex: number;
  tags: string[];
};

export type TimeframeOption = '1d' | '7d' | '14d' | '30d';

export type OverlayType = 'fuel-mass' | 'recovery-output' | 'digestive-productivity';

export type GodotExportPayload = {
  export_version: string;
  spatial_target: string;
  generated_at: string;
  app_meta: {
    system: string;
    engine_version: string;
  };
  metrics_schema: {
    nutrition: string[];
    biometrics: string[];
    output: string[];
  };
  records_count: number;
  timeseries: Array<{
    date: string;
    timestamp_unix: number;
    nutrition: {
      gross_kcal: number;
      net_kcal: number;
      tef_kcal: number;
      tef_ratio: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g: number;
    };
    biometrics: {
      resting_bpm: number;
      sleep_hours: number;
      sleep_quality_pct: number;
      steps: number;
      weight_kg: number;
      bloat_index: number;
    };
    output: {
      study_hours: number;
      focus_rpe: number;
      workout_minutes_total: number;
      workout_burned_kcal: number;
    };
    tags: string[];
  }>;
};
