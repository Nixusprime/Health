import React from 'react';
import { Activity, Utensils, HeartPulse, Brain, Plus } from 'lucide-react';

export type MobileTab = 'engine' | 'nutrition' | 'biometrics' | 'output';

interface MobileBottomDockProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onQuickLogClick: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  activeTab,
  onSelectTab,
  onQuickLogClick,
}) => {
  const tabs = [
    { id: 'engine' as MobileTab, label: 'Engine', icon: Activity },
    { id: 'nutrition' as MobileTab, label: 'Nutrition', icon: Utensils },
    { id: 'biometrics' as MobileTab, label: 'Recovery', icon: HeartPulse },
    { id: 'output' as MobileTab, label: 'Output', icon: Brain },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pt-2 bg-black/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Specular hairline top accent */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${
                isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
              <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'font-bold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-white rounded-full mt-0.5 shadow-[0_0_6px_white]" />
              )}
            </button>
          );
        })}

        {/* Central Quick Log Action Trigger (Strict >= 48x48px Hitbox) */}
        <div className="flex items-center justify-center px-1">
          <button
            onClick={onQuickLogClick}
            aria-label="Quick Log Entry"
            className="min-h-[48px] min-w-[48px] h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.35)] active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${
                isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
              <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'font-bold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-white rounded-full mt-0.5 shadow-[0_0_6px_white]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
