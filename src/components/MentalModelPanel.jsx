import React, { useState } from 'react';
import { Sparkles, Lock, Check, FastForward, ArrowRightLeft } from 'lucide-react';
import { ArrayVisualizer } from './ArrayVisualizer.jsx';

export function MentalModelPanel({
  currentStep,
  previousStep,
  predictionResult,
  onCommitPrediction,
  onSkipPrediction,
  arrayLength
}) {
  const baseArray = previousStep ? previousStep.array : currentStep.array;
  const defaultI = currentStep.variables.i != null ? currentStep.variables.i : 0;
  const defaultJ = Math.max(0, arrayLength - 1 - defaultI);

  // Staged prediction state before committing (strictly detailed cells mode)
  const [predictedArray, setPredictedArray] = useState(() => [...baseArray]);
  const [selectedCellA, setSelectedCellA] = useState(null);
  const [predictedI, setPredictedI] = useState(defaultI);
  const [predictedJ, setPredictedJ] = useState(defaultJ);

  // Directly edit a cell value
  const handleValueChange = (idx, val) => {
    const nextArr = [...predictedArray];
    if (val === '' || val === '-') {
      nextArr[idx] = val;
    } else {
      const parsed = parseInt(val, 10);
      nextArr[idx] = Number.isNaN(parsed) ? '' : parsed;
    }
    setPredictedArray(nextArr);
  };

  // Click cells to swap them easily within the detailed array
  const handleCellClick = (index) => {
    if (predictionResult) return;
    if (selectedCellA === null) {
      setSelectedCellA(index);
    } else if (selectedCellA === index) {
      setSelectedCellA(null);
    } else {
      const nextArr = [...predictedArray];
      const temp = nextArr[selectedCellA];
      nextArr[selectedCellA] = nextArr[index];
      nextArr[index] = temp;
      setPredictedArray(nextArr);
      setSelectedCellA(null);
    }
  };

  // Reset to original base array
  const handleResetToCurrent = () => {
    setPredictedArray([...baseArray]);
    setSelectedCellA(null);
    setPredictedI(defaultI);
    setPredictedJ(defaultJ);
  };

  const handleCommit = (e) => {
    if (e) e.preventDefault();

    // Ensure all array elements are strictly Numbers
    const finalArray = predictedArray.map((v, i) => {
      const num = Number(v);
      return Number.isFinite(num) ? num : baseArray[i];
    });

    const pI = Number(predictedI);
    const pJ = Number(predictedJ);

    const predictionData = {
      predictedArray: finalArray,
      predictedSwapIndices: [],
      predictedI: Number.isFinite(pI) ? pI : null,
      predictedJ: Number.isFinite(pJ) ? pJ : null,
      expectedOp: 'swap'
    };

    onCommitPrediction(predictionData);
  };

  // If a prediction is already committed for this step
  if (predictionResult) {
    const analysis = predictionResult.analysis;
    const committed = predictionResult.prediction;

    return (
      <div className="panel mental-model-panel committed">
        <div className="panel-header">
          <div className="panel-title-group">
            <Lock size={18} className="text-secondary" />
            <h2 className="panel-title">Your Mental Model</h2>
          </div>
          <span className={`status-badge ${analysis.isCorrect ? 'badge-success' : 'badge-danger'}`}>
            {analysis.isCorrect ? 'Prediction Verified ✓' : 'Discrepancy Found ⚠'}
          </span>
        </div>

        <div className="panel-body">
          <div className="mental-model-summary">
            <div className="summary-field">
              <span className="field-label">Predicted Array:</span>
              <ArrayVisualizer
                array={committed.predictedArray}
                pointers={{ i: committed.predictedI, j: committed.predictedJ }}
                matchingIndices={analysis.matchingIndices}
                divergentIndices={analysis.divergentIndices}
                label="Your Predicted Cells"
              />
            </div>

            <div className="prediction-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Predicted Outcome:</span>
                <span className="meta-val font-mono">
                  [{committed.predictedArray.join(', ')}]
                </span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Predicted Pointers:</span>
                <span className="meta-val font-mono">
                  i = {committed.predictedI != null ? committed.predictedI : '—'}, j = {committed.predictedJ != null ? committed.predictedJ : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interactive Detailed Prediction Mode (Before committing)
  return (
    <div className="panel mental-model-panel staging">
      <div className="panel-header">
        <div className="panel-title-group">
          <Sparkles size={18} className="text-accent animate-pulse" />
          <h2 className="panel-title">Your Mental Model</h2>
        </div>
        <span className="text-xs text-secondary font-mono">Detailed Prediction</span>
      </div>

      <div className="panel-body">
        <p className="prediction-prompt">
          Predict what the array and pointers will look like. Type the values below or click two cells to swap them:
        </p>

        {/* Detailed Cell-by-Cell Interactive Inputs */}
        <div className="detailed-prediction-section">
          <div className="cell-inputs-track">
            {predictedArray.map((val, idx) => {
              const isSelected = selectedCellA === idx;
              return (
                <div
                  key={idx}
                  className={`cell-input-box ${isSelected ? 'cell-input-selected' : ''}`}
                  onClick={() => handleCellClick(idx)}
                >
                  <span className="cell-input-index">[{idx}]</span>
                  <input
                    type="number"
                    className="cell-num-input"
                    value={val}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isSelected && <span className="cell-swap-hint">Swap</span>}
                </div>
              );
            })}
          </div>

          <div className="swap-hint-bar">
            <span className="text-xs text-muted flex items-center gap-1.5">
              <ArrowRightLeft size={13} className="text-accent" />
              <span>Click any two cells to swap their values, or type new integers directly into the boxes.</span>
            </span>
            <button
              type="button"
              className="text-xs text-secondary hover:text-foreground underline ml-auto"
              onClick={handleResetToCurrent}
            >
              Reset Inputs
            </button>
          </div>

          {/* Pointer Prediction Inputs */}
          <div className="pointer-inputs-row">
            <div className="pointer-input-group">
              <label className="text-xs text-secondary font-semibold">Predicted i (left):</label>
              <input
                type="number"
                value={predictedI}
                onChange={(e) => setPredictedI(e.target.value)}
                className="dropdown-select w-20"
                placeholder="i"
              />
            </div>
            <div className="pointer-input-group">
              <label className="text-xs text-secondary font-semibold">Predicted j (right):</label>
              <input
                type="number"
                value={predictedJ}
                onChange={(e) => setPredictedJ(e.target.value)}
                className="dropdown-select w-20"
                placeholder="j"
              />
            </div>
          </div>

          {/* Visual Array Preview of the staged Mental Model */}
          <div className="visual-preview-section mt-2">
            <ArrayVisualizer
              array={predictedArray.map(v => (v === '' || Number.isNaN(Number(v)) ? '?' : Number(v)))}
              pointers={{ i: Number(predictedI), j: Number(predictedJ) }}
              label="Staged Mental Model Preview"
            />
          </div>
        </div>

        <div className="prediction-actions-bar">
          <button
            type="button"
            className="action-btn commit-btn"
            onClick={handleCommit}
          >
            <Check size={18} />
            <span>Commit Prediction & Compare</span>
          </button>

          <button
            type="button"
            className="action-btn skip-btn"
            onClick={onSkipPrediction}
            title="Reveal actual step without recording a prediction"
          >
            <FastForward size={16} />
            <span>Reveal Without Predicting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
