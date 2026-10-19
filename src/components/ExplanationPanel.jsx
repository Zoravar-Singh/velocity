import React from 'react';
import { Lightbulb, CheckCircle2, AlertCircle, Compass } from 'lucide-react';

export function ExplanationPanel({
  currentStep,
  predictionResult
}) {
  const analysis = predictionResult ? predictionResult.analysis : null;

  return (
    <div className="panel explanation-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Lightbulb size={16} className="text-accent" />
          <h2 className="panel-title">Explanation & Mental Model Diagnostics</h2>
        </div>
        <span className="text-xs text-secondary">
          Bridging the gap between theory and actual execution
        </span>
      </div>

      <div className="panel-body">
        {analysis ? (
          <div className="diagnostics-container">
            {/* Header Status */}
            <div className={`diagnostics-status-banner ${analysis.isCorrect ? 'status-correct' : 'status-divergent'}`}>
              {analysis.isCorrect ? (
                <>
                  <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-success">Accurate Prediction!</h4>
                    <p className="text-xs text-secondary mt-0.5">
                      Your mental model matches the deterministic execution logic.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={18} className="text-danger flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-danger">Mental Model Divergence Identified</h4>
                    <p className="text-xs text-secondary mt-0.5">
                      A misconception occurred between your prediction and the actual runtime behavior.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* The 5 Key Explanation Elements required by Section 11 */}
            <div className="explanation-elements-grid">
              {/* 1. What student expected */}
              <div className="explanation-card">
                <span className="card-tag tag-expected">1. What You Expected</span>
                <p className="card-text">{analysis.studentExpectation}</p>
              </div>

              {/* 2. What actually happened */}
              <div className="explanation-card">
                <span className="card-tag tag-actual">2. What Actually Happened</span>
                <p className="card-text">{analysis.actualOccurrence}</p>
              </div>

              {/* 3. Relevant index, variable, condition, or assignment */}
              <div className="explanation-card">
                <span className="card-tag tag-variable">3. Relevant Code / Variable</span>
                <p className="card-text font-mono text-accent">{analysis.keyVariableOrCondition}</p>
              </div>

              {/* 4. Why the behavior differs */}
              <div className="explanation-card col-span-2">
                <span className="card-tag tag-cause">4. Root Cause (Why It Differs)</span>
                <p className="card-text">{analysis.whyItDiffers}</p>
              </div>

              {/* 5. What student should inspect next */}
              <div className="explanation-card col-span-2 highlight-inspection">
                <div className="flex items-center gap-1.5 mb-1">
                  <Compass size={14} className="text-accent" />
                  <span className="card-tag tag-next">5. What To Inspect Next</span>
                </div>
                <p className="card-text text-secondary">{analysis.nextInspectionTip}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-explanation-state">
            <div className="empty-explanation-content">
              <Compass size={24} className="text-secondary mb-2" />
              <h4 className="text-sm font-semibold text-foreground">Step Narrative</h4>
              <p className="text-xs text-secondary mt-1 max-w-md">
                {currentStep.description}
              </p>
              <div className="tip-box mt-3">
                <span className="font-semibold text-accent">Pro Tip: </span>
                <span>
                  Submit a prediction in the "Your Mental Model" panel above before stepping to unlock deep diagnostic comparisons.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
