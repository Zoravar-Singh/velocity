import React from 'react';
import { Bug, Wrench, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MUTATIONS, MUTATION_DEFINITIONS } from '../engine/mutations.js';

export function BugControls({
  currentMutation,
  onChangeMutation,
  onOpenRepair
}) {
  const isBugActive = currentMutation !== MUTATIONS.NONE;
  const activeDef = MUTATION_DEFINITIONS[currentMutation];

  return (
    <div className="panel bug-controls-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Bug size={16} className={isBugActive ? 'text-danger' : 'text-success'} />
          <h2 className="panel-title">Intentional Bug Mutations</h2>
        </div>
        <span className="text-xs text-secondary">
          Explore common algorithmic pitfalls
        </span>
      </div>

      <div className="bug-buttons-grid">
        {/* Baseline Button */}
        <button
          className={`bug-option-card ${currentMutation === MUTATIONS.NONE ? 'active-baseline' : ''}`}
          onClick={() => onChangeMutation(MUTATIONS.NONE)}
        >
          <div className="bug-card-top">
            <ShieldCheck size={16} className="text-success" />
            <span className="bug-name">Canonical Algorithm</span>
          </div>
          <p className="bug-desc">Correct two-pointer reversal with strict bounds.</p>
        </button>

        {/* Bug 1: Off-by-One */}
        <button
          className={`bug-option-card ${currentMutation === MUTATIONS.OFF_BY_ONE ? 'active-bug' : ''}`}
          onClick={() => onChangeMutation(MUTATIONS.OFF_BY_ONE)}
        >
          <div className="bug-card-top">
            <AlertTriangle size={16} className="text-danger" />
            <span className="bug-name">1. Off-by-One Bound</span>
          </div>
          <p className="bug-desc">Condition uses &le; midpoint, crossing pointers on even arrays.</p>
        </button>

        {/* Bug 2: Wrong Direction / Full Traversal */}
        <button
          className={`bug-option-card ${currentMutation === MUTATIONS.WRONG_DIRECTION ? 'active-bug' : ''}`}
          onClick={() => onChangeMutation(MUTATIONS.WRONG_DIRECTION)}
        >
          <div className="bug-card-top">
            <AlertTriangle size={16} className="text-danger" />
            <span className="bug-name">2. Full Traversal Over-Swap</span>
          </div>
          <p className="bug-desc">Traverses full length; reverses then un-reverses back.</p>
        </button>

        {/* Bug 3: Data Loss Swap */}
        <button
          className={`bug-option-card ${currentMutation === MUTATIONS.DATA_LOSS_SWAP ? 'active-bug' : ''}`}
          onClick={() => onChangeMutation(MUTATIONS.DATA_LOSS_SWAP)}
        >
          <div className="bug-card-top">
            <AlertTriangle size={16} className="text-danger" />
            <span className="bug-name">3. Missing Temp (Data Loss)</span>
          </div>
          <p className="bug-desc">Overwrites arr[i] with arr[j] before saving, erasing original value.</p>
        </button>
      </div>

      {/* Active Bug Banner with Repair Mode Trigger */}
      {isBugActive && (
        <div className="active-bug-banner">
          <div className="active-bug-info">
            <span className="active-bug-title font-semibold text-danger">
              Active Mutation: {activeDef.name}
            </span>
            <p className="active-bug-explanation text-xs text-secondary mt-1">
              {activeDef.description}
            </p>
          </div>

          <div className="active-bug-actions">
            <button
              className="action-btn repair-trigger-btn"
              onClick={onOpenRepair}
              title="Open Repair Mode to analyze the bug and choose the targeted fix"
            >
              <Wrench size={16} />
              <span>Fix This Bug (Repair Mode)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
