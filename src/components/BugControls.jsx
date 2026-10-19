import React from 'react';
import { Wrench, ShieldCheck, ChevronDown, AlertTriangle } from 'lucide-react';
import { MUTATIONS, MUTATION_DEFINITIONS } from '../engine/mutations.js';

export function BugControls({
  currentMutation,
  onChangeMutation,
  onOpenRepair
}) {
  const isBugActive = currentMutation !== MUTATIONS.NONE;
  const activeDef = MUTATION_DEFINITIONS[currentMutation];

  return (
    <div className="panel bug-dropdown-panel">
      <div className="bug-dropdown-header">
        <div className="bug-title-wrap">
          <div className="flex items-center gap-2">
            {isBugActive ? (
              <AlertTriangle size={18} className="text-danger flex-shrink-0" />
            ) : (
              <ShieldCheck size={18} className="text-success flex-shrink-0" />
            )}
            <span className="bug-header-label">ALGORITHM MUTATION / BUG LAB:</span>
          </div>

          <div className="bug-select-wrapper">
            <select
              value={currentMutation}
              onChange={(e) => onChangeMutation(e.target.value)}
              className={`bug-select-dropdown ${isBugActive ? 'select-bug-active' : 'select-baseline'}`}
            >
              <option value={MUTATIONS.NONE}>
                ✓ Baseline: Canonical Algorithm (Correct)
              </option>
              <option value={MUTATIONS.OFF_BY_ONE}>
                ⚠ Mutation 1: Off-by-One Loop Bound (i &le; Math.floor(n/2))
              </option>
              <option value={MUTATIONS.WRONG_DIRECTION}>
                ⚠ Mutation 2: Full Traversal Over-Swap (i &lt; arr.length)
              </option>
              <option value={MUTATIONS.DATA_LOSS_SWAP}>
                ⚠ Mutation 3: Missing Temp Variable (Data Loss Overwrite)
              </option>
            </select>
            <ChevronDown size={16} className="select-chevron-icon" />
          </div>
        </div>

        {isBugActive && (
          <button
            className="action-btn repair-header-btn"
            onClick={onOpenRepair}
            title="Open Repair Mode to analyze the bug and choose the targeted fix"
          >
            <Wrench size={16} />
            <span>Fix This Bug</span>
          </button>
        )}
      </div>

      {isBugActive && (
        <div className="bug-dropdown-desc-bar">
          <span className="bug-desc-badge badge-danger">BUG ACTIVE</span>
          <p className="bug-desc-text">
            <strong>{activeDef.name}:</strong> {activeDef.description}
          </p>
        </div>
      )}
    </div>
  );
}
