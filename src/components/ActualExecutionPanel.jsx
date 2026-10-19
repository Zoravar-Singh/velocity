import React from 'react';
import { Cpu, Terminal, AlertTriangle, EyeOff, Lock, Unlock } from 'lucide-react';
import { ArrayVisualizer } from './ArrayVisualizer.jsx';

export function ActualExecutionPanel({
  currentStep,
  predictionResult,
  isBlurred = false,
  onReveal = null
}) {
  const { variables, changedIndices, highlightIndices, operationName, conditionText, anomaly } = currentStep;
  const analysis = predictionResult ? predictionResult.analysis : null;

  return (
    <div className={`panel actual-execution-panel ${isBlurred ? 'panel-blurred-state' : ''}`}>
      <div className="panel-header">
        <div className="panel-title-group">
          <Cpu size={18} className="text-accent" />
          <h2 className="panel-title">Actual Execution</h2>
        </div>
        <div className="phase-indicator">
          {isBlurred ? (
            <div className="flex items-center gap-1.5 text-secondary">
              <EyeOff size={14} className="text-secondary" />
              <span className="font-mono text-xs">Prediction Required to View</span>
            </div>
          ) : (
            <>
              <Terminal size={14} className="text-secondary" />
              <span className="font-mono text-xs text-secondary">{operationName}</span>
            </>
          )}
        </div>
      </div>

      <div className="panel-body relative-body">
        {/* Actual Content (blurred if isBlurred is true) */}
        <div className={`actual-content-wrapper ${isBlurred ? 'content-blurred' : ''}`}>
          {/* Actual Array Visualization */}
          <div className="actual-array-section">
            <ArrayVisualizer
              array={currentStep.array}
              pointers={{ i: variables.i, j: variables.j }}
              highlightIndices={highlightIndices}
              changedIndices={changedIndices}
              matchingIndices={analysis ? analysis.matchingIndices : null}
              divergentIndices={analysis ? analysis.divergentIndices : null}
              label="Real Engine Array State"
            />
          </div>

          {/* Real Variables & Condition Grid */}
          <div className="engine-variables-grid">
            <div className="variable-card">
              <span className="var-label">Pointer i (left)</span>
              <span className="var-val font-mono">{variables.i !== null ? variables.i : '—'}</span>
            </div>

            <div className="variable-card">
              <span className="var-label">Pointer j (right)</span>
              <span className="var-val font-mono">{variables.j !== null ? variables.j : '—'}</span>
            </div>

            <div className="variable-card">
              <span className="var-label">temp Storage</span>
              <span className="var-val font-mono text-accent">
                {variables.temp !== null ? variables.temp : '—'}
              </span>
            </div>

            <div className="variable-card condition-card">
              <span className="var-label">Evaluated Condition</span>
              <span className={`var-val font-mono ${currentStep.conditionResult === false ? 'text-danger' : 'text-success'}`}>
                {conditionText || '—'}
              </span>
            </div>
          </div>

          {/* Anomaly Callout if bug mutation triggered a runtime irregularity */}
          {anomaly && (
            <div className="anomaly-alert-card">
              <AlertTriangle size={18} className="text-danger flex-shrink-0" />
              <div className="anomaly-content">
                <span className="anomaly-title">Runtime Anomaly Detected</span>
                <p className="anomaly-msg">{anomaly.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Blur Overlay when student is in Mental Model mode and hasn't committed yet */}
        {isBlurred && (
          <div className="blur-overlay">
            <div className="blur-overlay-card">
              <div className="blur-lock-badge">
                <Lock size={22} className="text-accent" />
              </div>
              <h4 className="blur-overlay-title">Actual Execution Hidden</h4>
              <p className="blur-overlay-desc">
                Predict what will happen in <strong>Your Mental Model</strong> on the left, then click <strong>"Commit Prediction & Compare"</strong> to unblur and verify your thinking!
              </p>
              {onReveal && (
                <button
                  type="button"
                  className="blur-peek-btn"
                  onClick={onReveal}
                  title="Unblur without recording prediction"
                >
                  <Unlock size={14} />
                  <span>Reveal Step Directly</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
