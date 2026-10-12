import React, { useState } from 'react';
import { GlassPanel } from './GlassPanel';
import { DailyRecord, LoggedMeal } from '../types/analytics';
import { deriveDailySummary, KCAL_PER_GRAM, TEF_RATES } from '../utils/tefEngine';
import { Utensils, Plus, Trash2, ArrowRight } from 'lucide-react';

interface NutritionEngineProps {
  currentRecord: DailyRecord;
  onAddMealClick: () => void;
  onDeleteMeal: (mealId: string) => void;
}

export const NutritionEngine: React.FC<NutritionEngineProps> = ({
  currentRecord,
  onAddMealClick,
  onDeleteMeal,
}) => {
  const summary = deriveDailySummary(currentRecord);

  // Compute exact TEF breakdown for the day
  const proteinKcal = summary.proteinG * KCAL_PER_GRAM.protein;
  const carbsKcal = summary.carbsG * KCAL_PER_GRAM.carbs;
  const fatKcal = summary.fatG * KCAL_PER_GRAM.fat;

  const proteinTef = Math.round(proteinKcal * TEF_RATES.protein);
  const carbsTef = Math.round(carbsKcal * TEF_RATES.carbs);
  const fatTef = Math.round(fatKcal * TEF_RATES.fat);

  const netProteinKcal = proteinKcal - proteinTef;
  const netCarbsKcal = carbsKcal - carbsTef;
  const netFatKcal = fatKcal - fatTef;

  return (
    <GlassPanel className="p-4 flex flex-col justify-between">
      {/* Module Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Metabolic Absorption Engine (TEF)
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Thermic tax applied: 25% Protein · 8% Carbohydrate · 3% Lipid
          </p>
        </div>

        <button
          onClick={onAddMealClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-xl transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)] active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Food</span>
        </button>
      </div>

      {/* Gross vs Net Metabolic Waterfall */}
      <div className="my-4 p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-neutral-400 uppercase tracking-wider text-[10px]">
            Thermic Extraction Dynamic
          </span>
          <span className="text-white font-bold">
            {summary.tefEfficiencyPct}% Caloric Yield
          </span>
        </div>

        {/* Dynamic Waterfall Bar */}
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 bg-black/60 p-2 rounded-lg border border-white/10 text-center">
            <div className="text-[10px] font-mono text-neutral-500 uppercase">Gross Intake</div>
            <div className="text-lg font-bold font-mono text-neutral-300">
              {summary.grossCalories} <span className="text-xs font-normal text-neutral-500">kcal</span>
            </div>
          </div>

          <div className="text-neutral-500 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex-1 bg-white/[0.04] p-2 rounded-lg border border-white/10 text-center">
            <div className="text-[10px] font-mono text-neutral-500 uppercase">TEF Metabolic Tax</div>
            <div className="text-lg font-bold font-mono text-neutral-400">
              -{summary.tefCalories} <span className="text-xs font-normal text-neutral-500">kcal</span>
            </div>
          </div>

          <div className="text-neutral-500 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex-1 bg-white/10 p-2 rounded-lg border border-white/20 text-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <div className="text-[10px] font-mono text-white/80 uppercase">Net Absorbed</div>
            <div className="text-lg font-bold font-mono text-white">
              {summary.netCalories} <span className="text-xs font-normal text-white/70">kcal</span>
            </div>
          </div>
        </div>

        {/* Nutrient-specific Tax Breakdown */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
          <div>
            <div className="text-neutral-400">Protein Tax (-25%)</div>
            <div className="text-white font-semibold">-{proteinTef} kcal</div>
            <div className="text-[10px] text-neutral-500">yield: {netProteinKcal} kcal</div>
          </div>
          <div>
            <div className="text-neutral-400">Carbs Tax (-8%)</div>
            <div className="text-white font-semibold">-{carbsTef} kcal</div>
            <div className="text-[10px] text-neutral-500">yield: {netCarbsKcal} kcal</div>
          </div>
          <div>
            <div className="text-neutral-400">Fat Tax (-3%)</div>
            <div className="text-white font-semibold">-{fatTef} kcal</div>
            <div className="text-[10px] text-neutral-500">yield: {netFatKcal} kcal</div>
          </div>
        </div>
      </div>

      {/* Macronutrient Distribution Bars */}
      <div className="space-y-2.5 my-3">
        {/* Protein */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-white font-medium">Protein</span>
            <span className="text-neutral-400">
              <strong className="text-white">{summary.proteinG}g</strong> · {proteinKcal} gross / {netProteinKcal} net kcal
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (summary.proteinG / 220) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbohydrates */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-neutral-300 font-medium">Carbohydrates</span>
            <span className="text-neutral-400">
              <strong className="text-white">{summary.carbsG}g</strong> · {carbsKcal} gross / {netCarbsKcal} net kcal
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-300 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (summary.carbsG / 350) * 100)}%` }}
            />
          </div>
        </div>

        {/* Lipids / Fats */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-neutral-300 font-medium">Fats (Lipids)</span>
            <span className="text-neutral-400">
              <strong className="text-white">{summary.fatG}g</strong> · {fatKcal} gross / {netFatKcal} net kcal
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (summary.fatG / 90) * 100)}%` }}
            />
          </div>
        </div>

        {/* Dietary Fiber */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
          <span>Dietary Fiber: <strong className="text-white">{summary.fiberG}g</strong></span>
          <span>Macronutrient Ratio: {summary.grossCalories > 0 ? `${Math.round((proteinKcal/summary.grossCalories)*100)}% P · ${Math.round((carbsKcal/summary.grossCalories)*100)}% C · ${Math.round((fatKcal/summary.grossCalories)*100)}% F` : '0% P · 0% C · 0% F'}</span>
        </div>
      </div>

      {/* Active Day Food Ledger */}
      <div className="mt-2 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white tracking-wide">
            Logged Meals ({currentRecord.meals.length})
          </span>
          <span className="text-[11px] font-mono text-neutral-400">
            {currentRecord.date}
          </span>
        </div>

        {currentRecord.meals.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
            Zero food entries recorded for this date. Click 'Log Food' above.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {currentRecord.meals.map((meal) => (
              <div
                key={meal.id}
                className="group flex items-center justify-between p-2 rounded-lg bg-black/40 hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-all text-xs font-mono"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500 text-[10px]">{meal.timestamp}</span>
                    <span className="font-semibold text-white truncate">{meal.name}</span>
                    {meal.servings !== 1 && (
                      <span className="text-[10px] text-neutral-500">×{meal.servings}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                    <span>{meal.proteinG}g P</span>
                    <span>·</span>
                    <span>{meal.carbsG}g C</span>
                    <span>·</span>
                    <span>{meal.fatG}g F</span>
                    {meal.tags.map((t) => (
                      <span key={t} className="text-neutral-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-white tabular-nums">
                      {meal.netKcal} <span className="text-[10px] text-neutral-400">net</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 tabular-nums">
                      {meal.grossKcal} gross (-{meal.tefKcal})
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-white transition-opacity"
                    title="Remove meal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassPanel>
  );
};
