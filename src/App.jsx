import React, { useState } from 'react';
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
import { MUTATIONS } from './engine/mutations.js';

export function App() {
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
  } = useLab();

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Helper when student clicks "Reveal Without Predicting"
  const handleSkipPrediction = () => {
    stepForward();
  };

  return (
    <div className="app-layout">
      {/* Top Application Header */}
      <Header
        labName="Reverse an Array"
        stats={stats}
        onReset={resetLab}
        onOpenTransfer={() => setIsTransferOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="main-workspace">
        {/* Left Column: Code, Custom Input & Bug Mutation Controls */}
        <div className="workspace-column sidebar-column">
          <CodePanel
            mutationDefinition={mutationDefinition}
            activeLine={currentStep.activeLine}
            inputArray={inputArray}
            onUpdateArray={updateInputArray}
          />

          <BugControls
            currentMutation={mutationType}
            onChangeMutation={changeMutation}
            onOpenRepair={() => setIsRepairOpen(true)}
          />
        </div>

        {/* Right / Center Column: Comparison Arena, Controls & Explanation */}
        <div className="workspace-column main-content-column">
          {/* Defining Comparison Feature: Mental Model vs Actual Execution */}
          <ComparisonArena
            currentStep={currentStep}
            previousStep={previousStep}
            predictionResult={currentPredictionResult}
            onCommitPrediction={submitPrediction}
            onSkipPrediction={handleSkipPrediction}
            arrayLength={inputArray.length}
          />

          {/* Step-by-Step Execution Transport Controls */}
          <ExecutionControls
            currentStepIndex={currentStepIndex}
            totalSteps={executionTrace.length}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            currentStep={currentStep}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onTogglePlay={togglePlay}
            onReset={resetLab}
            onGoToStep={goToStep}
            onChangeSpeed={setPlaybackSpeed}
          />

          {/* Structured Rule-Based Explanation Panel */}
          <ExplanationPanel
            currentStep={currentStep}
            predictionResult={currentPredictionResult}
            mutationType={mutationType}
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
    </div>
  );
}

export default App;
