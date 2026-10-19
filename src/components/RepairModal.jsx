import React, { useState } from 'react';
import { Wrench, X, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { MUTATION_DEFINITIONS } from '../engine/mutations.js';

export function RepairModal({
  isOpen,
  onClose,
  mutationType,
  onApplyRepair,
  onResetToBaseline
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [repairFeedback, setRepairFeedback] = useState(null);

  if (!isOpen) return null;

  const mutDef = MUTATION_DEFINITIONS[mutationType] || {};

  const handleTestRepair = () => {
    if (!selectedOption) return;
    const res = onApplyRepair(selectedOption);
    setRepairFeedback(res);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog repair-modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <Wrench size={20} className="text-accent" />
            <h3 className="modal-title">Repair Mode: Fix Algorithm Bug</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="bug-summary-box">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-danger" />
              <span className="font-semibold text-danger">Bug Identified: {mutDef.name}</span>
            </div>
            <p className="text-xs text-secondary">{mutDef.description}</p>
            {mutDef.bugExplanation && (
              <div className="fix-hint-box mt-2">
                <span className="text-xs font-semibold text-accent">Educational Hint: </span>
                <span className="text-xs text-secondary">{mutDef.bugExplanation.fixHint}</span>
              </div>
            )}
          </div>

          <div className="repair-options-section mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
              Select the Correct Targeted Code Repair:
            </h4>

            <div className="options-list">
              {mutDef.repairOptions ? (
                mutDef.repairOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`repair-option-card ${selectedOption === opt.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="repair-fix"
                      value={opt.id}
                      checked={selectedOption === opt.id}
                      onChange={() => {
                        setSelectedOption(opt.id);
                        setRepairFeedback(null);
                      }}
                      className="option-radio"
                    />
                    <div className="option-content">
                      <span className="option-label font-mono text-sm">{opt.label}</span>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-xs text-secondary">
                  No explicit repair options. You can reset to the canonical baseline.
                </p>
              )}
            </div>

            {repairFeedback && (
              <div className={`repair-result-card ${repairFeedback.success ? 'success' : 'failure'}`}>
                {repairFeedback.success ? (
                  <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="text-danger flex-shrink-0" />
                )}
                <div>
                  <h5 className={`font-semibold text-sm ${repairFeedback.success ? 'text-success' : 'text-danger'}`}>
                    {repairFeedback.success ? 'Bug Successfully Repaired!' : 'Repair Ineffective'}
                  </h5>
                  <p className="text-xs text-secondary mt-1">{repairFeedback.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={onResetToBaseline}
          >
            <ShieldCheck size={16} />
            <span>Apply Canonical Baseline</span>
          </button>

          <button
            type="button"
            className="action-btn primary-btn"
            disabled={!selectedOption}
            onClick={handleTestRepair}
          >
            <span>Apply Selected Repair & Rerun</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
