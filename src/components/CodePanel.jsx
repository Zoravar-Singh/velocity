import React, { useState } from 'react';
import { Code2, Sliders, Check, AlertCircle } from 'lucide-react';
import { ARRAY_PRESETS } from '../data/labs.js';

export function CodePanel({
  mutationDefinition,
  activeLine = null,
  inputArray,
  onUpdateArray
}) {
  const [customInput, setCustomInput] = useState(inputArray.join(', '));
  const [inputError, setInputError] = useState(null);
  const [isEditingArray, setIsEditingArray] = useState(false);

  const handleArraySubmit = (e) => {
    e.preventDefault();
    try {
      const parts = customInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const parsed = parts.map(s => {
        const num = Number(s);
        if (Number.isNaN(num) || !Number.isInteger(num)) {
          throw new Error(`"${s}" is not a valid integer`);
        }
        return num;
      });

      const res = onUpdateArray(parsed);
      if (res.success) {
        setInputError(null);
        setIsEditingArray(false);
      } else {
        setInputError(res.error);
      }
    } catch (err) {
      setInputError(err.message || 'Invalid integer array format');
    }
  };

  const selectPreset = (arr) => {
    setCustomInput(arr.join(', '));
    setInputError(null);
    onUpdateArray(arr);
    setIsEditingArray(false);
  };

  return (
    <div className="panel code-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Code2 size={16} className="text-accent" />
          <h2 className="panel-title">Algorithm & Source Code</h2>
        </div>
        <div className="panel-header-badges">
          <span className={`mutation-pill badge-${mutationDefinition.type}`}>
            {mutationDefinition.badge}
          </span>
        </div>
      </div>

      {/* Code Display with Active Line Highlighting */}
      <div className="code-container">
        <pre className="code-block">
          <code>
            {mutationDefinition.codeLines.map((line, idx) => {
              const lineNumber = idx + 1;
              const isCurrent = activeLine === lineNumber;
              const isBugLine = (mutationDefinition.type === 'danger') && (
                (mutationDefinition.id === 'OFF_BY_ONE' && lineNumber === 3) ||
                (mutationDefinition.id === 'WRONG_DIRECTION' && lineNumber === 3) ||
                (mutationDefinition.id === 'DATA_LOSS_SWAP' && (lineNumber === 5 || lineNumber === 6))
              );

              return (
                <div
                  key={lineNumber}
                  className={`code-line ${isCurrent ? 'line-active' : ''} ${isBugLine ? 'line-bug-marker' : ''}`}
                >
                  <span className="line-number">{lineNumber}</span>
                  <span className="line-indicator">
                    {isCurrent ? '▶' : isBugLine ? '⚠' : ' '}
                  </span>
                  <span className="line-content">{line}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Input Array Configuration Bar */}
      <div className="array-config-bar">
        <div className="array-config-header">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-secondary" />
            <span className="text-xs uppercase font-semibold text-secondary">Test Array Input</span>
          </div>
          <button
            className="text-xs text-accent hover:underline"
            onClick={() => setIsEditingArray(!isEditingArray)}
          >
            {isEditingArray ? 'Hide Presets' : 'Change Array'}
          </button>
        </div>

        {isEditingArray ? (
          <div className="array-edit-section">
            <div className="presets-row">
              <span className="text-xs text-secondary">Presets:</span>
              {ARRAY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  className={`preset-btn ${JSON.stringify(inputArray) === JSON.stringify(preset.array) ? 'active' : ''}`}
                  onClick={() => selectPreset(preset.array)}
                  title={preset.description}
                >
                  [{preset.array.join(', ')}]
                </button>
              ))}
            </div>

            <form onSubmit={handleArraySubmit} className="custom-input-form">
              <div className="input-group">
                <input
                  type="text"
                  className="custom-array-input"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 1, 2, 3, 4, 5 (3 to 8 integers)"
                />
                <button type="submit" className="apply-btn">
                  <Check size={14} /> Apply
                </button>
              </div>
              {inputError && (
                <div className="input-error-msg">
                  <AlertCircle size={13} />
                  <span>{inputError}</span>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="current-array-display">
            <span className="text-xs text-secondary">Current Input:</span>
            <span className="font-mono text-sm text-foreground">[{inputArray.join(', ')}]</span>
            <span className="text-xs text-muted">
              ({inputArray.length} items, {inputArray.length % 2 === 0 ? 'even' : 'odd'} parity)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
