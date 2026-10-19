import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLab } from './hooks/useLab.js';
import { Header } from './components/Header.jsx';
import { CodePanel } from './components/CodePanel.jsx';
import { ComparisonArena } from './components/ComparisonArena.jsx';
import { ExecutionControls } from './components/ExecutionControls.jsx';
import { BugControls } from './components/BugControls.jsx';
import { ExplanationPanel } from './components/ExplanationPanel.jsx';
import { RepairModal } from './components/RepairModal.jsx';
import { TransferChallenge } from './components/TransferChallenge.jsx';
import { LabGuideModal } from './components/LabGuideModal.jsx';
import { LinkedListLab } from './components/LinkedListLab.jsx';
import { MUTATIONS } from './engine/mutations.js';

const SIDEBAR_MIN = 360;
const SIDEBAR_MAX = 760;
const SIDEBAR_DEFAULT = 480;
const SIDEBAR_STORAGE_KEY = 'mindtrace.sidebarWidth';

function clampSidebar(width) {
  return Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, width));
}

export function App() {
  const [activeLab, setActiveLab] = useState('array');
  // View mode: 'mental-model' (Predict & Compare with gated stepping) or 'actual-execution' (Observer mode)
  const [viewMode, setViewMode] = useState('mental-model');

  // Enable the prediction gate whenever the Mental Model mode is active:
  // Run pauses at EVERY step until the user commits a prediction or reveals.
  const {
    inputArray,
    mutationType,
    mutationDefinition,
    executionTrace,
    currentStepIndex,
    currentStep,
    previousStep,
    isPlaying,
    playbackSpeed,
    stats,
    currentPredictionResult,
    isRepairOpen,
    isTransferOpen,
    setPlaybackSpeed,
    setIsRepairOpen,
    setIsTransferOpen,
    stepForward,
    stepBackward,
    goToStep,
    togglePlay,
    resetLab,
    changeMutation,
    updateInputArray,
    submitPrediction,
    repairBug,
    recordChallengeResult
  } = useLab(viewMode === 'mental-model');

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  /* ------------------------------------------------------------------
     Resizable code panel (drag the divider between left & right columns)
     ------------------------------------------------------------------ */
  const [isWideScreen, setIsWideScreen] = useState(
    () => window.matchMedia('(min-width: 1181px)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1181px)');
    const handler = (event) => setIsWideScreen(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = Number(window.localStorage.getItem(SIDEBAR_STORAGE_KEY));
    return Number.isFinite(saved) && saved > 0 ? clampSidebar(saved) : SIDEBAR_DEFAULT;
  });
  const sidebarWidthRef = useRef(sidebarWidth);
  sidebarWidthRef.current = sidebarWidth;

  const handleResizeStart = useCallback((event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidthRef.current;

    const resizer = event.currentTarget;
    resizer.classList.add('dragging');
    document.body.classList.add('workspace-resizing');

    const handleMove = (moveEvent) => {
      setSidebarWidth(clampSidebar(startWidth + (moveEvent.clientX - startX)));
    };

    const handleUp = () => {
      resizer.classList.remove('dragging');
      document.body.classList.remove('workspace-resizing');
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidthRef.current));
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, []);

  const handleResizeReset = useCallback(() => {
    setSidebarWidth(SIDEBAR_DEFAULT);
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(SIDEBAR_DEFAULT));
  }, []);

  // Full reset: wipes all lab state AND local UI state so it feels like a fresh window
  const handleResetAll = () => {
    resetLab();
    setViewMode('mental-model');
    setIsGuideOpen(false);
  };

  // Helper when student clicks "Reveal Without Predicting"
  const handleSkipPrediction = () => {
    stepForward();
  };

  return (
    <div className="app-layout">
      {/* Top Application Header */}
      <Header
        labName={activeLab === 'array' ? 'Reverse an Array' : 'Reverse a Linked List'}
        stats={stats}
        onReset={handleResetAll}
        onOpenTransfer={() => setIsTransferOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        activeLab={activeLab}
        onChangeLab={setActiveLab}
      />

      {activeLab === 'linked-list' ? <LinkedListLab /> : <>

      {/* Main Workspace Layout (left column width is user-resizable) */}
      <main
        className="main-workspace"
        style={isWideScreen ? { gridTemplateColumns: `${sidebarWidth}px auto minmax(0, 1fr)` } : undefined}
      >
        {/* Left Column: Bug Mutation Dropdown at Top + Expanded Code Box Below */}
        <div className="workspace-column sidebar-column">
          {/* Intentional Bug Mutations Dropdown Menu above the code */}
          <BugControls
            currentMutation={mutationType}
            onChangeMutation={changeMutation}
            onOpenRepair={() => setIsRepairOpen(true)}
          />

          {/* Bigger Code Box on the left side */}
          <CodePanel
            mutationDefinition={mutationDefinition}
            activeLine={currentStep.activeLine}
            inputArray={inputArray}
            onUpdateArray={updateInputArray}
          />
        </div>

        {/* Drag to resize the code panel (double-click to reset width) */}
        {isWideScreen && (
          <div
            className="workspace-resizer"
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize the code panel · double-click to reset"
            onMouseDown={handleResizeStart}
            onDoubleClick={handleResizeReset}
          />
        )}

        {/* Right / Center Column: Comparison Arena, Controls & Explanation */}
        <div className="workspace-column main-content-column">
          {/* Comparison Arena with Mode Selector (Mental Model vs Actual Execution) */}
          <ComparisonArena
            currentStep={currentStep}
            previousStep={previousStep}
            predictionResult={currentPredictionResult}
            onCommitPrediction={submitPrediction}
            onSkipPrediction={handleSkipPrediction}
            arrayLength={inputArray.length}
            scenarioKey={`${mutationType}:${inputArray.join(',')}`}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
          />

          {/* Step-by-Step Execution Transport Controls (gated in Mental Model mode) */}
          <ExecutionControls
            currentStepIndex={currentStepIndex}
            totalSteps={executionTrace.length}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            currentStep={currentStep}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onTogglePlay={togglePlay}
            onReset={handleResetAll}
            onGoToStep={goToStep}
            onChangeSpeed={setPlaybackSpeed}
            isPredictionGate={viewMode === 'mental-model'}
          />

          {/* Structured Rule-Based Explanation Panel (shows "Continue" after a prediction error halts the run) */}
          <ExplanationPanel
            currentStep={currentStep}
            predictionResult={currentPredictionResult}
            onContinueAfterError={stepForward}
          />
        </div>
      </main>

      {/* Interactive Modals */}
      <RepairModal
        isOpen={isRepairOpen}
        onClose={() => setIsRepairOpen(false)}
        mutationType={mutationType}
        onApplyRepair={repairBug}
        onResetToBaseline={() => {
          changeMutation(MUTATIONS.NONE);
          setIsRepairOpen(false);
        }}
      />

      <TransferChallenge
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        stats={stats}
        onRecordResult={recordChallengeResult}
      />

      <LabGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
      </>}
    </div>
  );
}

export default App;
