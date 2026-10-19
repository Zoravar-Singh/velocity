import React, { useState } from 'react';
import { Sparkles, ArrowRightLeft, Lock, Check, FastForward } from 'lucide-react';
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

  // Staged prediction state before committing
  const [predictedArray, setPredictedArray] = useState(() => [...baseArray]);
  const [swapIndexA, setSwapIndexA] = useState(defaultI);
  const [swapIndexB, setSwapIndexB] = useState(defaultJ);
  const [expectedOp] = useState('swap'); // 'swap'
  const [predictedI, setPredictedI] = useState(defaultI);
  const [predictedJ, setPredictedJ] = useState(defaultJ);
  const [predictionMode, setPredictionMode] = useState('quick'); // 'quick' | 'cell-by-cell'

  // Handle quick swap execution on the staged mental model
  const applyQuickSwap = () => {
    const nextArr = [...baseArray];
    if (swapIndexA >= 0 && swapIndexA < nextArr.length && swapIndexB >= 0 && swapIndexB < nextArr.length) {
      const temp = nextArr[swapIndexA];
      nextArr[swapIndexA] = nextArr[swapIndexB];
      nextArr[swapIndexB] = temp;
    }
    setPredictedArray(nextArr);
  };

  const handleCellClick = (index) => {
    if (predictionResult) return;
    if (swapIndexA !== index) {
      setSwapIndexB(index);
      const nextArr = [...baseArray];
      const temp = nextArr[swapIndexA];
      nextArr[swapIndexA] = nextArr[index];
      nextArr[index] = temp;
      setPredictedArray(nextArr);
    }
  };

  const handleValueChange = (idx, val) => {
    const nextArr = [...predictedArray];
    nextArr[idx] = val === '' ? '' : Number(val);
    setPredictedArray(nextArr);
  };

  const handleCommit = (e) => {
    if (e) e.preventDefault();

    // Prepare prediction object
    let finalArray = [...predictedArray];
    // sanitize any empty strings to 0
    finalArray = finalArray.map((v, i) => (typeof v === 'number' && Number.isFinite(v) ? v : baseArray[i]));

    const predictionData = {
      predictedArray: finalArray,
      predictedSwapIndices: expectedOp === 'swap' ? [swapIndexA, swapIndexB] : [],
      predictedI: Number(predictedI),
      predictedJ: Number(predictedJ),
      expectedOp
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
            <Lock size={16} className="text-secondary" />
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
                <span className="meta-label">Expected Operation:</span>
                <span className="meta-val font-mono">
                  {committed.expectedOp === 'swap'
                    ? `Swap [${committed.predictedSwapIndices[0]}] ↔ [${committed.predictedSwapIndices[1]}]`
                    : 'No swap / unchanged'}
                </span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Predicted Pointers:</span>
                <span className="meta-val font-mono">
                  i = {committed.predictedI}, j = {committed.predictedJ}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interactive Prediction Mode (Before committing)
  return (
    <div className="panel mental-model-panel staging">
      <div className="panel-header">
        <div className="panel-title-group">
          <Sparkles size={16} className="text-accent animate-pulse" />
          <h2 className="panel-title">Your Mental Model</h2>
        </div>
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${predictionMode === 'quick' ? 'active' : ''}`}
            onClick={() => setPredictionMode('quick')}
          >
            Quick Swap
          </button>
          <button
            type="button"
            className={`mode-btn ${predictionMode === 'cell-by-cell' ? 'active' : ''}`}
            onClick={() => setPredictionMode('cell-by-cell')}
          >
            Detailed Cells
          </button>
        </div>
      </div>

      <div className="panel-body">
        <p className="prediction-prompt">
          Before inspecting the computer's actual output, predict what will happen after this step:
        </p>

        {predictionMode === 'quick' ? (
          <div className="quick-prediction-form">
            <div className="swap-selector-row">
              <div className="selector-group">
                <label className="input-label">Swap Left Index:</label>
                <select
                  value={swapIndexA}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSwapIndexA(idx);
                    setPredictedI(idx);
                  }}
                  className="dropdown-select"
                >
                  {baseArray.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Index [{idx}] (value: {baseArray[idx]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="swap-icon-container">
                <ArrowRightLeft size={16} className="text-accent" />
              </div>

              <div className="selector-group">
                <label className="input-label">With Right Index:</label>
                <select
                  value={swapIndexB}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSwapIndexB(idx);
                    setPredictedJ(idx);
                  }}
                  className="dropdown-select"
                >
                  {baseArray.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Index [{idx}] (value: {baseArray[idx]})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="preview-swap-btn"
                onClick={applyQuickSwap}
                title="Preview this swap in the cells below"
              >
                Apply Swap
              </button>
            </div>

            <div className="visual-preview-section">
              <ArrayVisualizer
                array={predictedArray}
                pointers={{ i: predictedI, j: predictedJ }}
                highlightIndices={[swapIndexA, swapIndexB]}
                label="Predicted Resulting Array (Click cells to swap)"
                isInteractive={true}
                onCellClick={handleCellClick}
              />
            </div>
          </div>
        ) : (
          <div className="cell-by-cell-form">
            <p className="text-xs text-secondary mb-2">
              Enter the exact integer you predict will be at each index:
            </p>
            <div className="cell-inputs-track">
              {predictedArray.map((val, idx) => (
                <div key={idx} className="cell-input-box">
                  <span className="cell-input-index">[{idx}]</span>
                  <input
                    type="number"
                    className="cell-num-input"
                    value={val}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="pointer-inputs-row">
              <div className="pointer-input-group">
                <label className="text-xs text-secondary">Predicted i:</label>
                <input
                  type="number"
                  value={predictedI}
                  onChange={(e) => setPredictedI(e.target.value)}
                  className="dropdown-select w-20"
                />
              </div>
              <div className="pointer-input-group">
                <label className="text-xs text-secondary">Predicted j:</label>
                <input
                  type="number"
                  value={predictedJ}
                  onChange={(e) => setPredictedJ(e.target.value)}
                  className="dropdown-select w-20"
                />
              </div>
            </div>
          </div>
        )}

        <div className="prediction-actions-bar">
          <button
            type="button"
            className="action-btn commit-btn"
            onClick={handleCommit}
          >
            <Check size={16} />
            <span>Commit Prediction & Compare</span>
          </button>

          <button
            type="button"
            className="action-btn skip-btn"
            onClick={onSkipPrediction}
            title="Reveal actual step without recording a prediction"
          >
            <FastForward size={14} />
            <span>Reveal Without Predicting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
