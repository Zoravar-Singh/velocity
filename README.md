# MindTrace — Interactive Computer Science Learning Through Prediction and Debugging

> *"See what you think. See what actually happens."*

**MindTrace** is an interactive CS learning laboratory designed to bridge the gap between what students **think** code does and what the JavaScript runtime **actually** executes.

---

## 🚀 Quick Start

### 1. Installation & Start Development Server
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Run Verification Test Suite
```bash
# Run simulator unit tests (20/20 test assertions)
node test-simulator.js

# Lint the codebase
npm run lint

# Build production bundle
npm run build
```

---

## 🧠 The Core Learning Loop

MindTrace implements the educational cycle:

```
PREDICT ➔ EXECUTE ➔ COMPARE ➔ UNDERSTAND ➔ REPAIR ➔ RETEST
```

1. **PREDICT**: Before executing a step, the student commits their prediction of the array values, pointers (`i`, `j`), and swap targets.
2. **EXECUTE**: The deterministic engine advances one discrete step in the execution trace.
3. **COMPARE**: Side-by-side comparison between **Your Mental Model** (left) and **Actual Execution** (right) with real-time visual cell diffing and first-point-of-divergence highlights.
4. **UNDERSTAND**: The 5-point rule-based Explanation Engine breaks down expectations, actual runtime behavior, the involved variables/condition, root cause, and next inspection hints.
5. **REPAIR**: Deliberately investigate 3 algorithmic bugs, enter interactive **Repair Mode**, choose targeted fixes, and re-run.
6. **RETEST**: Prove concept transfer on a new array (`[7, 2, 9, 4]`) in the **Transfer Challenge**, with real session statistics.

---

## 🎯 Features & Architectural Highlights

### 1. Two-Column Comparison Arena
- **Left: Your Mental Model** — Displays student predictions locked in place.
- **Right: Actual Execution** — Deterministic engine state, variables (`i`, `j`, `temp`), evaluated conditions (e.g. `0 < 2 → true`), and runtime anomalies.
- Visual cell states:
  - 🟢 **Match**: Emerald highlight when mental model matches reality.
  - 🔴 **Divergence**: Rose red highlight with divergence callouts.
  - 🟡 **Changed**: Amber pulse for modified memory locations.
  - 🟣 **Active**: Purple border for active pointers.

### 2. 3 Intentional Algorithmic Bug Mutations
- **Bug 1: Off-by-One Boundary (`i <= Math.floor(n/2)`)**
  - Odd arrays: Redundant self-swap at the center pivot (`i === j`).
  - Even arrays: Pointers cross (`i > j`), swapping the middle elements back and corrupting the array!
- **Bug 2: Full Traversal Over-Swap (`i < n`)**
  - Traverses the whole array instead of stopping at the midpoint. Reverses elements, then swaps them right back to their initial unreversed state.
- **Bug 3: Missing Temp Variable (Data Loss)**
  - Overwrites `arr[i]` with `arr[j]` without saving `arr[i]` into a temporary variable, permanently destroying values.

### 3. Interactive Repair Mode
- Click **"Fix This Bug (Repair Mode)"** on any active bug.
- View the buggy code line and select from targeted repair options.
- Instant validation explaining why the correct fix solves the root cause and restores canonical behavior.

### 4. Learning Transfer Test
- Dedicated challenge using input array `[7, 2, 9, 4]`.
- Tests prediction of intermediate iterations, total swap count, and final array state.
- Generates an authentic session diagnostic summary:
  - Initial prediction accuracy
  - Transfer test accuracy
  - Bug mutations explored
  - Core concepts practiced

### 5. Flexible Array Configuration
- Switch between Odd-length (`[1, 2, 3, 4, 5]`, `[9, 5, 1]`) and Even-length (`[1, 2, 3, 4]`, `[10, 20, 30, 40, 50, 60]`) presets.
- Enter custom integer arrays with real-time validation.

---

## 🛠️ Tech Stack & Philosophy
- **Frontend**: React 19, Vite 8, JavaScript (ESM).
- **Styling**: Tailored Dark Developer-Tool Design System in pure CSS (optimized for 1366×768 screens).
- **Icons**: Lucide React.
- **Confetti**: Canvas-confetti for transfer test completion celebrations.
- **No external AI runtime / No backend**: 100% deterministic, instant, privacy-respecting, and offline-capable.
