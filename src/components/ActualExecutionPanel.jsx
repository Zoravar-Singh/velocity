import React from 'react';
import { Cpu, Terminal, AlertTriangle } from 'lucide-react';
import { ArrayVisualizer } from './ArrayVisualizer.jsx';

export function ActualExecutionPanel({
  currentStep,
  predictionResult
}) {
  const { variables, changedIndices, highlightIndices, operationName, conditionText, anomaly } = currentStep;
  const analysis = predictionResult ? predictionResult.analysis : null;

  return (
    <div className="panel actual-execution-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Cpu size={16} className="text-accent" />
          <h2 className="panel-title">Actual Execution</h2>
        </div>
        <div className="phase-indicator">
          <Terminal size={14} className="text-secondary" />
          <span className="font-mono text-xs text-secondary">{operationName}</span>
        </div>
      </div>

      <div className="panel-body">
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
            <span className={`var-val font-mono text-xs ${currentStep.conditionResult === false ? 'text-danger' : 'text-success'}`}>
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
    </div>
  );
}
