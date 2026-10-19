import React from 'react';
import { MentalModelPanel } from './MentalModelPanel.jsx';
import { ActualExecutionPanel } from './ActualExecutionPanel.jsx';
import { GitCompare, CheckCircle2, AlertOctagon, Brain, Cpu } from 'lucide-react';

export function ComparisonArena({
  currentStep,
  previousStep,
  predictionResult,
  onCommitPrediction,
  onSkipPrediction,
  arrayLength,
  viewMode,
  onChangeViewMode
}) {
  const analysis = predictionResult ? predictionResult.analysis : null;
  const isMentalModelMode = viewMode === 'mental-model';

  return (
    <div className="comparison-arena-wrapper">
      {/* Comparison Arena Header Banner with Mode Selector */}
      <div className="comparison-banner">
        <div className="banner-left">
          <GitCompare size={18} className="text-accent" />
          <span className="banner-title">LAB WORKSPACE:</span>

          {/* Mode Selection Buttons as requested by the user */}
          <div className="view-mode-selector">
            <button
              type="button"
              className={`view-mode-pill ${isMentalModelMode ? 'active' : ''}`}
              onClick={() => onChangeViewMode('mental-model')}
              title="Predict behavior first, then commit to unblur and compare with actual execution"
            >
              <Brain size={15} />
              <span>Mental Model (Predict Mode)</span>
            </button>

            <button
              type="button"
              className={`view-mode-pill ${!isMentalModelMode ? 'active' : ''}`}
              onClick={() => onChangeViewMode('actual-execution')}
              title="Remove mental model and solely observe how the actual JavaScript algorithm executes"
            >
              <Cpu size={15} />
              <span>Actual Execution (Observer Mode)</span>
            </button>
          </div>
        </div>

        {/* Diff Result Badge (visible in Mental Model mode after prediction committed) */}
        {isMentalModelMode && analysis && (
          <div className={`diff-pill ${analysis.isCorrect ? 'diff-success' : 'diff-mismatch'}`}>
            {analysis.isCorrect ? (
              <>
                <CheckCircle2 size={15} />
                <span>Mental Model Aligned (100% Match)</span>
              </>
            ) : (
              <>
                <AlertOctagon size={15} />
                <span>
                  Divergence at Index [{analysis.firstDivergenceIndex}]: Expected vs Reality
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Arena Grid: Changes based on viewMode */}
      {isMentalModelMode ? (
        <div className="comparison-grid two-column-grid">
          {/* Mental Model Panel on the Left */}
          <MentalModelPanel
            key={currentStep.stepNumber}
            currentStep={currentStep}
            previousStep={previousStep}
            predictionResult={predictionResult}
            onCommitPrediction={onCommitPrediction}
            onSkipPrediction={onSkipPrediction}
            arrayLength={arrayLength}
          />

          {/* Actual Execution Panel on the Right - BLURRED until user commits prediction */}
          <ActualExecutionPanel
            currentStep={currentStep}
            predictionResult={predictionResult}
            isBlurred={!predictionResult}
            onReveal={onSkipPrediction}
          />
        </div>
      ) : (
        /* Actual Execution Only - Removes Mental Model, Full Width */
        <div className="comparison-grid single-column-grid">
          <ActualExecutionPanel
            currentStep={currentStep}
            predictionResult={null}
            isBlurred={false}
          />
        </div>
      )}
    </div>
  );
}
