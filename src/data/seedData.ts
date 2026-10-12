import { DailyRecord, LoggedMeal } from '../types/analytics';
import { calculateMacrosKcal } from '../utils/tefEngine';

function createMeal(
  id: string,
  name: string,
  timestamp: string,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  tags: string[],
  servings = 1
): LoggedMeal {
  const macros = {
    proteinG: Math.round(proteinG * servings),
    carbsG: Math.round(carbsG * servings),
    fatG: Math.round(fatG * servings),
    fiberG: Math.round(fiberG * servings),
  };
  const { grossKcal, tefKcal, netKcal } = calculateMacrosKcal(macros);

  return {
    id,
    name,
    timestamp,
    servings,
    proteinG: macros.proteinG,
    carbsG: macros.carbsG,
    fatG: macros.fatG,
    fiberG: macros.fiberG,
    grossKcal,
    tefKcal,
    netKcal,
    tags,
  };
}

/**
 * Generates 30 days of high-fidelity, empirically correlated biometric and output records.
 * Base date is 2026-10-10.
 */
export function generateSeedTimeseries(): DailyRecord[] {
  const records: DailyRecord[] = [];
  const baseDate = new Date('2026-10-10T12:00:00Z');

  // Daily archetypes to give real empirical trends and variance:
  // Day types:
  // 0: High recovery, clean bulk, solo deep work (High sleep, low RHR, high study, low bloat)
  // 1: Heavy hostel mess feast, acute food coma (High calories spike, high bloat 4-5, study hours crash)
  // 2: Training day + Study Call (Moderate calories, solid training, study call tags)
  // 3: Fasted morning, room snacks, late night grind
  // 4: Optimal equilibrium

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const cycle = (29 - i) % 5;
    // Gradual lean mass surplus trajectory: 75.8kg up to 76.55kg
    const weightBase = 75.8 + (29 - i) * 0.026 + (Math.sin(i) * 0.15);

    let meals: LoggedMeal[] = [];
    let restingBpm = 52;
    let sleepHours = 7.6;
    let sleepQualityPct = 86;
    let steps = 10400;
    let bloatIndex = 2;
    let studyHours = 6.2;
    let focusQualityRpe = 8;
    let studyTags = ['#SoloDeepWork'];
    let workouts = [];

    if (cycle === 0) {
      // High recovery + pristine digestion
      sleepHours = 8.2;
      sleepQualityPct = 92;
      restingBpm = 50;
      bloatIndex = 1;
      studyHours = 7.5;
      focusQualityRpe = 9;
      studyTags = ['#SoloDeepWork'];
      steps = 11200;

      meals = [
        createMeal(`m-${i}-1`, 'Rolled Oats & Whey Isolate', '08:30', 42, 58, 7, 6, ['#CleanBulk', '#RoomSnack']),
        createMeal(`m-${i}-2`, 'Grilled Chicken Breast & Jasmine Rice', '13:00', 54, 75, 8, 3, ['#CleanBulk']),
        createMeal(`m-${i}-3`, 'Non-Fat Greek Yogurt & Blueberries', '17:00', 25, 20, 1, 4, ['#RoomSnack']),
        createMeal(`m-${i}-4`, 'Atlantic Salmon, Sweet Potato & Greens', '20:15', 46, 52, 16, 7, ['#CleanBulk']),
      ];

      workouts.push({
        id: `w-${i}-1`,
        type: 'Hypertrophy' as const,
        durationMin: 70,
        intensityRpe: 8.5,
        estimatedKcal: 420,
        notes: 'Upper Body Hypertrophy Focus - High mechanical tension',
        tags: ['#Hypertrophy'],
      });
    } else if (cycle === 1) {
      // Acute hostel mess spike -> heavy digestive load -> bloatIndex 4-5 -> study crash (Food Coma)
      sleepHours = 6.8;
      sleepQualityPct = 74;
      restingBpm = 57;
      bloatIndex = 5; // Severe food coma
      studyHours = 2.8; // Crashed output
      focusQualityRpe = 4;
      studyTags = ['#SoloDeepWork'];
      steps = 8200;

      meals = [
        createMeal(`m-${i}-1`, 'Mess Fried Parathas & Sweet Chai', '09:00', 14, 95, 34, 4, ['#HostelMess']),
        createMeal(`m-${i}-2`, 'Hostel Mess Full Thali with Paneer Extra', '13:30', 36, 155, 48, 11, ['#HostelMess'], 1.3),
        createMeal(`m-${i}-3`, 'Fried Samosas & Sugary Cold Coffee', '17:30', 8, 72, 26, 2, ['#HostelMess', '#RoomSnack']),
        createMeal(`m-${i}-4`, 'Hostel Mess Butter Roti & Dal Makhani', '21:00', 26, 120, 38, 8, ['#HostelMess']),
      ];

      workouts.push({
        id: `w-${i}-1`,
        type: 'Zone 2 Cardio' as const,
        durationMin: 35,
        intensityRpe: 5.5,
        estimatedKcal: 230,
        notes: 'Low intensity recovery walk/jog to mitigate lethargy',
        tags: ['#Zone2Cardio'],
      });
    } else if (cycle === 2) {
      // Study Call + Solid Gym session
      sleepHours = 7.4;
      sleepQualityPct = 84;
      restingBpm = 53;
      bloatIndex = 2;
      studyHours = 5.8;
      focusQualityRpe = 7.5;
      studyTags = ['#StudyCall', '#SoloDeepWork'];
      steps = 12800;

      meals = [
        createMeal(`m-${i}-1`, '3 Whole Eggs & Sourdough Toast', '08:45', 28, 45, 23, 3, ['#CleanBulk']),
        createMeal(`m-${i}-2`, 'Mess Yellow Dal & Steamed Rice', '13:00', 22, 92, 14, 8, ['#HostelMess']),
        createMeal(`m-${i}-3`, 'Clean Macro Whey Crisp Bar', '16:45', 20, 22, 6, 10, ['#RoomSnack']),
        createMeal(`m-${i}-4`, 'Grilled Chicken, Jasmine Rice & Olive Oil', '20:30', 50, 78, 15, 4, ['#CleanBulk']),
      ];

      workouts.push({
        id: `w-${i}-1`,
        type: 'Strength' as const,
        durationMin: 75,
        intensityRpe: 9.0,
        estimatedKcal: 480,
        notes: 'Lower body squat heavy progression session',
        tags: ['#Strength'],
      });
    } else if (cycle === 3) {
      // Room snacks & late night grind
      sleepHours = 6.2;
      sleepQualityPct = 70;
      restingBpm = 56;
      bloatIndex = 3;
      studyHours = 4.5;
      focusQualityRpe = 6;
      studyTags = ['#StudyCall', '#LateNight'];
      steps = 7400;

      meals = [
        createMeal(`m-${i}-1`, 'Whey Shake & Peanut Butter Toast', '10:00', 36, 42, 18, 4, ['#RoomSnack']),
        createMeal(`m-${i}-2`, 'Mess Dal Rice with Curd', '14:00', 24, 88, 15, 6, ['#HostelMess']),
        createMeal(`m-${i}-3`, 'Instant Ramen with 2 Boiled Eggs', '23:30', 22, 70, 28, 3, ['#RoomSnack', '#LateNight']),
      ];

      workouts.push({
        id: `w-${i}-1`,
        type: 'Mobility' as const,
        durationMin: 30,
        intensityRpe: 4.0,
        estimatedKcal: 110,
        notes: 'Thoracic and hip decompression',
        tags: ['#Mobility'],
      });
    } else {
      // High volume balanced day
      sleepHours = 7.8;
      sleepQualityPct = 88;
      restingBpm = 51;
      bloatIndex = 2;
      studyHours = 6.8;
      focusQualityRpe = 8.5;
      studyTags = ['#SoloDeepWork'];
      steps = 11800;

      meals = [
        createMeal(`m-${i}-1`, 'Egg White Scramble, Avocado & Oats', '08:15', 38, 55, 16, 8, ['#CleanBulk']),
        createMeal(`m-${i}-2`, 'Lean Ground Beef & Jasmine Rice', '13:15', 48, 80, 12, 3, ['#CleanBulk']),
        createMeal(`m-${i}-3`, 'Greek Yogurt & Almonds', '17:00', 23, 12, 15, 4, ['#RoomSnack']),
        createMeal(`m-${i}-4`, 'Chicken Breast with Sweet Potato', '20:45', 52, 60, 6, 7, ['#CleanBulk']),
      ];

      workouts.push({
        id: `w-${i}-1`,
        type: 'Hypertrophy' as const,
        durationMin: 65,
        intensityRpe: 8.0,
        estimatedKcal: 390,
        notes: 'Pull session: Back & Biceps hypertrophy',
        tags: ['#Hypertrophy'],
      });
    }

    records.push({
      date: dateStr,
      meals,
      biometrics: {
        restingBpm,
        sleepHours,
        sleepQualityPct,
        steps,
        weightKg: Number(weightBase.toFixed(2)),
        bloatIndex,
      },
      study: {
        studyHours,
        focusQualityRpe,
        tags: studyTags,
      },
      workouts,
    });
  }

  return records;
}
