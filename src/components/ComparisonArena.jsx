import React from 'react';
import { MentalModelPanel } from './MentalModelPanel.jsx';
import { ActualExecutionPanel } from './ActualExecutionPanel.jsx';
import { GitCompare, CheckCircle2, AlertOctagon } from 'lucide-react';

export function ComparisonArena({
  currentStep,
  previousStep,
  predictionResult,
  onCommitPrediction,
  onSkipPrediction,
  arrayLength
}) {
  const analysis = predictionResult ? predictionResult.analysis : null;

  return (
    <div className="comparison-arena-wrapper">
      {/* Comparison Arena Header Banner */}
      <div className="comparison-banner">
        <div className="banner-left">
          <GitCompare size={16} className="text-accent" />
          <span className="banner-title">Mental Model vs. Actual Execution</span>
          <span className="banner-tag">The Core Learning Loop</span>
        </div>

        {analysis && (
          <div className={`diff-pill ${analysis.isCorrect ? 'diff-success' : 'diff-mismatch'}`}>
            {analysis.isCorrect ? (
              <>
                <CheckCircle2 size={14} />
                <span>Mental Model Aligned (100% Match)</span>
              </>
            ) : (
              <>
                <AlertOctagon size={14} />
                <span>
                  Divergence at Index [{analysis.firstDivergenceIndex}]: Expected vs Reality
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Two-Column Arena Grid */}
      <div className="comparison-grid">
        <MentalModelPanel
          key={currentStep.stepNumber}
          currentStep={currentStep}
          previousStep={previousStep}
          predictionResult={predictionResult}
          onCommitPrediction={onCommitPrediction}
          onSkipPrediction={onSkipPrediction}
          arrayLength={arrayLength}
        />

        <ActualExecutionPanel
          currentStep={currentStep}
          predictionResult={predictionResult}
        />
      </div>
    </div>
  );
}
