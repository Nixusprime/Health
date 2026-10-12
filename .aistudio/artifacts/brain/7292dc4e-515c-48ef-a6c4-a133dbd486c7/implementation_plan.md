# Personal Analytics Engine — Thin Liquid Glass Clinical Workstation

A high-density, OLED-black personal analytics workstation and mobile-responsive dashboard designed with an iOS-inspired Thin Liquid Glass aesthetic. The system computes raw biometrics, work output, a Thermic Effect of Food (TEF) metabolic absorption engine, subjective bio-feedback, contextual tagging, and a Godot 3D engine JSON export pipeline.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction incorporates all user feedback and specifications:
> - **Visual Palette**: Strict monochrome high-contrast dark mode (absolute OLED #000000 canvas, stark pure white #FFFFFF, specular liquid glass highlights, and nuanced silver/zinc tiers).
> - **Workspace Layout**: High-density workstation multi-pane layout on desktop with fluid responsive adaptation and mobile bottom dock for touch devices.
> - **Subjective Bio-Feedback**: Integer-based `bloatIndex` (1–5 scale) integrated into biometrics to directly correlate digestive load spikes with mental output.
> - **Contextual Tagging System**: Multi-tag tagging system (e.g. `#HostelMess`, `#RoomSnack`, `#SoloDeepWork`, `#StudyCall`) to filter and correlate productivity by environment.
> - **3D Environment Data Export**: Dedicated one-click JSON export utility in the App Root packaging the 30-day timeseries formatted for spatial visualization in Godot.
> - **Mobile Touch Ergonomics**: Absolute minimum 48×48px interactive hitboxes on bottom dock elements and navigation triggers.
> - **Rolling Timeframes**: 1-Day, 7-Day (default), 14-Day, and 30-Day moving averages.
> - **Cross-Metric Analytical Overlays**:
>   1. *Fuel vs. Mass*: Net Absorbed Calories vs. Body Weight trajectory.
>   2. *Recovery vs. Output*: Sleep Duration & Resting HR vs. Study Hours.
>   3. *Digestive Load vs. Productivity*: Caloric spikes & Bloat Index vs. Deep Work hours, filterable by contextual tags.

---

## 1. Overview & Core Concept

### What It Does
An uncompromising, clinical personal analytics workstation that strips away all gamification and cheerleading in favor of high-fidelity data, physiological models, and empirical correlations. It provides:
1. **Advanced Nutrition & TEF Absorption Engine**: Computes Gross Intake alongside estimated Net Calories Absorbed by modeling nutrient-specific thermic tax ($25\%$ protein, $8\%$ carbohydrate, $3\%$ lipid).
2. **Biometric & Recovery Tracker**: Logs Resting Heart Rate (BPM), Sleep duration & quality, daily steps, body mass, and subjective `bloatIndex` (1–5 scale).
3. **Cognitive & Physical Output Logging**: Tracks Deep Study Hours and workout details (modality, intensity RPE, expenditure) tagged with environmental context.
4. **The "Engine" Core & Correlation Matrix**: Live multi-pane plots visualizing rolling trends (1d/7d/14d/30d) and physiological causality overlays with environmental tag filtering.
5. **Godot Spatial Data Export**: Serializes the multi-dimensional dataset into an optimized JSON format ready for 3D engine ingestion.

---

## 2. User Experience & Visual Design

### Liquid Glass Aesthetic & Sensory Rules
- **Canvas**: Absolute OLED black (`#000000` / `#030303`).
- **Liquid Glass Materials**: Translucent panels (`bg-white/[0.03]` to `bg-white/[0.06]`), heavy backdrop refraction blur (`backdrop-blur-2xl`), specular top rim highlights (`border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`).
- **Interactive Refraction**: Dynamic hover and touch micro-reactions, subtle specular glare tracking pointer movement, and iOS-grade spring transitions (`motion`).
- **Monochrome Contrast**: Pure stark white (`#FFFFFF`) for primary data numerals and active indicators; muted silver (`#94A3B8`, `#71717A`) for units and metadata; pitch black for deep contrast.
- **Tabular Rigor**: Monospace tabular numerals (`font-mono tabular-nums`) across all metrics, timestamps, and charts to prevent layout jitter.
- **Zero-Pill Discipline**: Unboxed metadata separated by typographic mid-dots (`·`); segmented controls styled as functional recessed glass switches.
- **Mobile Ergonomics**: Strict $\ge 48 \times 48\text{px}$ touch target hitboxes on mobile dock controls with thumb-friendly reach geometry.

### Viewport & Spatial Composition
- **Desktop Workstation Mode (≥ 1024px)**:
  - Top Glass Control Bar: Contextual date switcher, rolling average selector (1d, 7d default, 14d, 30d), Godot 3D JSON Export button, quick entry trigger.
  - Primary Engine HUD: 6-metric high-density telemetry strip (Net Calories, Protein g, Study Hours, Sleep Hours, Resting HR, Bloat Index).
  - Multi-Pane Workstation Split:
    - *Pane 1 (Left 60%)*: Multi-Metric Correlation Engine with Context Tag filter chips (Fuel vs Mass, Recovery vs Output, Digestive Load & Bloat vs Productivity).
    - *Pane 2 (Right 40%)*: Advanced Nutrition & TEF Absorption Breakdown (gross vs net waterfall, macronutrient ratios, active meal ledger with environmental tags).
    - *Bottom Workstation Grid*: Biometric Recovery ledger (including Bloat Index) & Output/Workout log.
- **Mobile Touch Mode (< 1024px)**:
  - Ergonomic thumb-zone navigation via a translucent liquid glass bottom dock ($\ge 48 \times 48\text{px}$ per destination).
  - Seamless tab switching between HUD Engine, Nutrition & TEF, Biometrics, and Work logs.
  - Quick-log floating action drawer accessible within 1 tap.

---

## 3. Mathematical Logic & Data Model

### TEF Absorption Engine
$$\text{TEF}_{\text{protein}} = \text{Protein (g)} \times 4 \times 0.25$$
$$\text{TEF}_{\text{carbs}} = \text{Carbs (g)} \times 4 \times 0.08$$
$$\text{TEF}_{\text{fat}} = \text{Fat (g)} \times 9 \times 0.03$$
$$\text{Total TEF} = \text{TEF}_{\text{protein}} + \text{TEF}_{\text{carbs}} + \text{TEF}_{\text{fat}}$$
$$\text{Net Calories Absorbed} = \text{Gross Calories} - \text{Total TEF}$$
$$\text{Absorption Efficiency} = \left(\frac{\text{Net Calories}}{\text{Gross Calories}}\right) \times 100\%$$

### Subjective Bio-Feedback
- `bloatIndex`: Integer from 1 (optimal/flat/zero distension) to 5 (severe food coma / acute lethargy). Plotted directly against study hours and calorie volume.

### Contextual Tagging System
- Meal tags: `#HostelMess`, `#RoomSnack`, `#CookedMeal`, `#Restaurant`, `#CleanBulk`.
- Work tags: `#SoloDeepWork`, `#StudyCall`, `#LibrarySession`, `#LateNight`.
- Workout tags: `#Hypertrophy`, `#Zone2Cardio`, `#HIIT`, `#HeavySquats`.

### Godot 3D Spatial JSON Schema
```json
{
  "export_version": "1.0",
  "spatial_target": "godot_3d_engine",
  "generated_at": "2026-10-10T07:40:00Z",
  "timeseries": [
    {
      "date": "2026-10-10",
      "timestamp_unix": 1791617400,
      "nutrition": {
        "gross_kcal": 2840,
        "net_kcal": 2490,
        "tef_kcal": 350,
        "protein_g": 210,
        "carbs_g": 310,
        "fat_g": 65
      },
      "biometrics": {
        "resting_bpm": 52,
        "sleep_hours": 7.8,
        "sleep_quality_pct": 88,
        "steps": 11420,
        "weight_kg": 76.4,
        "bloat_index": 2
      },
      "output": {
        "study_hours": 6.5,
        "workout_minutes": 75,
        "workout_rpe": 8.5
      },
      "tags": ["#SoloDeepWork", "#HostelMess"]
    }
  ]
}
```

---

## 4. Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Root (State & Time)                         │
│  - Active Date (YYYY-MM-DD)    - Rolling Average (1d | 7d | 14d | 30d)  │
│  - Timeseries Store (30 days)  - Active Context Tags filter            │
│  - Godot 3D Export Utility     - Food Library Catalog                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   HUD Summary    │     │ Correlation View │     │ Nutrition Engine │
│ 6 Key Metrics    │     │ 3 Deep Overlays: │     │ - Gross vs Net   │
│ - Net Absorbed   │     │ • Fuel vs Mass   │     │ - TEF Waterfall  │
│ - Protein Yield  │     │ • Recovery/Study │     │ - Macro Ledger   │
│ - Sleep, HR      │     │ • Food Coma Cost │     │ - Tagged Meals   │
│ - Bloat Index    │     │   (Bloat vs Study)     - Add Food Modal │
└──────────────────┘     └──────────────────┘     └──────────────────┘
      │                            │                            │
      └────────────────────────────┼────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Biometric & Output Ledgers (Logging Drawers)               │
│ - Resting HR, Sleep Duration & Quality, Daily Steps, Bloat Index       │
│ - Deep Study Sessions, Workout Modality & RPE, Contextual Tags         │
└────────────────────────────────────────────────────────────────────────┘
```

### Verification & Testing Plan
1. **Compilation Check**: Run `compile_applet` to ensure zero TypeScript errors or CSS bundling issues.
2. **TEF Mathematical Verification**: Unit validation in the calculation utilities ensuring exact caloric yields and TEF deductions.
3. **Godot JSON Export**: Trigger download and verify JSON payload structure matches schema.
4. **Touch Ergonomics**: Inspect DOM for all mobile dock buttons to guarantee minimum `min-h-[48px] min-w-[48px]` hitboxes.
5. **Context Tag Filtering**: Filter correlation charts by tags and verify reactive updates.
