import React, { useState, useMemo } from 'react';
import { GlassPanel } from './GlassPanel';
import { FoodItem, LoggedMeal } from '../types/analytics';
import { FOOD_LIBRARY } from '../data/foodLibrary';
import { calculateMacrosKcal } from '../utils/tefEngine';
import { X, Search, Plus, Utensils } from 'lucide-react';

interface LogFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: LoggedMeal) => void;
  defaultDate: string;
}

export const LogFoodModal: React.FC<LogFoodModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  defaultDate,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'custom'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(FOOD_LIBRARY[0]);
  const [servings, setServings] = useState<number>(1);
  const [timestamp, setTimestamp] = useState<string>('13:00');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#CleanBulk']);

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customProtein, setCustomProtein] = useState(30);
  const [customCarbs, setCustomCarbs] = useState(40);
  const [customFat, setCustomFat] = useState(10);
  const [customFiber, setCustomFiber] = useState(4);

  // Filter food library
  const filteredFoods = useMemo(() => {
    return FOOD_LIBRARY.filter((f) => {
      const matchQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  // Active calculation preview
  const currentMacros = selectedFood
    ? {
        proteinG: Math.round(selectedFood.proteinG * servings),
        carbsG: Math.round(selectedFood.carbsG * servings),
        fatG: Math.round(selectedFood.fatG * servings),
        fiberG: Math.round(selectedFood.fiberG * servings),
      }
    : {
        proteinG: customProtein,
        carbsG: customCarbs,
        fatG: customFat,
        fiberG: customFiber,
      };

  const calculatedYield = calculateMacrosKcal(currentMacros);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let mealEntry: LoggedMeal;
    if (activeTab === 'library' && selectedFood) {
      mealEntry = {
        id: `m-lib-${Date.now()}`,
        foodItemId: selectedFood.id,
        name: selectedFood.name,
        timestamp,
        servings,
        proteinG: currentMacros.proteinG,
        carbsG: currentMacros.carbsG,
        fatG: currentMacros.fatG,
        fiberG: currentMacros.fiberG,
        grossKcal: calculatedYield.grossKcal,
        tefKcal: calculatedYield.tefKcal,
        netKcal: calculatedYield.netKcal,
        tags: selectedTags,
      };
    } else {
      if (!customName.trim()) return;
      mealEntry = {
        id: `m-custom-${Date.now()}`,
        name: customName.trim(),
        timestamp,
        servings: 1,
        proteinG: customProtein,
        carbsG: customCarbs,
        fatG: customFat,
        fiberG: customFiber,
        grossKcal: calculatedYield.grossKcal,
        tefKcal: calculatedYield.tefKcal,
        netKcal: calculatedYield.netKcal,
        tags: selectedTags,
      };
    }

    onAddMeal(mealEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-xl bg-black border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-white" />
            <h3 className="text-sm font-semibold text-white">Log Nutrition Entry</h3>
            <span className="text-[10px] font-mono text-neutral-400">· {defaultDate}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 p-2 bg-white/[0.02] border-b border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'library'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Localized Food Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'custom'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Custom Macronutrient Entry
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          {activeTab === 'library' ? (
            <>
              {/* Search & Categories */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search library (chicken, oats, mess thali, salmon...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                  {['All', 'Protein', 'Carbohydrate', 'Lipid', 'Prepared Meal', 'Snack'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-white/20 text-white font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food List Grid */}
              <div className="max-h-40 overflow-y-auto border border-white/[0.08] rounded-xl p-1 divide-y divide-white/[0.04]">
                {filteredFoods.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500 font-mono">
                    No matching food found in library
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs font-mono ${
                        selectedFood?.id === food.id
                          ? 'bg-white/10 border border-white/20 text-white'
                          : 'hover:bg-white/[0.03] text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white">{food.name}</div>
                        <div className="text-[10px] text-neutral-400">
                          {food.servingSize} · {food.proteinG}P · {food.carbsG}C · {food.fatG}F
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono">
                        <span className="text-white font-bold">
                          {Math.round(food.proteinG * 4 + food.carbsG * 4 + food.fatG * 9)} kcal
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Servings Adjuster */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                    Portion / Servings Multiplier
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServings(s)}
                        className={`px-2 py-1 text-xs font-mono rounded ${
                          servings === s ? 'bg-white text-black font-bold' : 'bg-white/5 text-neutral-400'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-16 bg-black border border-white/20 rounded p-1 text-xs font-mono text-white text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                    Time Eaten
                  </label>
                  <input
                    type="time"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Custom Food Form */
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                  Food Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Campus Canteen Chicken Curry"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block">Fat (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block">Fiber (g)</label>
                  <input
                    type="number"
                    value={customFiber}
                    onChange={(e) => setCustomFiber(Number(e.target.value))}
                    className="w-full bg-black border border-white/20 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contextual Environmental Tags */}
          <div className="pt-2 border-t border-white/[0.08]">
            <label className="text-[10px] font-mono text-neutral-400 block mb-1.5">
              Contextual Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['#HostelMess', '#RoomSnack', '#CleanBulk', '#LateNight', '#Restaurant'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedTags.includes(t)
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/5 text-neutral-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Real-Time TEF Absorption Preview Box */}
          <div className="p-3 bg-white/[0.03] border border-white/15 rounded-xl font-mono text-xs">
            <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase mb-1">
              <span>Metabolic Absorption Yield Preview</span>
              <span className="text-white">
                {calculatedYield.grossKcal > 0
                  ? `${Math.round((calculatedYield.netKcal / calculatedYield.grossKcal) * 100)}% Absorbed`
                  : '0%'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1">
              <div>
                Gross Intake: <strong className="text-neutral-300">{calculatedYield.grossKcal} kcal</strong>
              </div>
              <div>
                TEF Tax: <strong className="text-neutral-400">-{calculatedYield.tefKcal} kcal</strong>
              </div>
              <div>
                Net Yield: <strong className="text-white text-base font-bold">{calculatedYield.netKcal} kcal</strong>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95"
            >
              Commit to Daily Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
