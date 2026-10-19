import React from 'react';
import { RotateCcw, Brain, HelpCircle, Trophy } from 'lucide-react';

export function Header({
  labName = 'Reverse an Array',
  stats,
  onReset,
  onOpenTransfer,
  onOpenGuide
}) {
  const accuracyPercent = stats.totalPredictions > 0
    ? Math.round((stats.correctPredictions / stats.totalPredictions) * 100)
    : null;

  return (
    <header className="app-header">
      <div className="header-brand-section">
        <div className="brand-logo-wrapper">
          <Brain className="brand-icon" size={24} />
          <span className="brand-pulse"></span>
        </div>
        <div className="brand-titles">
          <div className="brand-title-row">
            <h1 className="brand-name">MindTrace</h1>
            <span className="brand-badge">INTERACTIVE CS LAB</span>
          </div>
          <p className="brand-tagline">See what you think. See what actually happens.</p>
        </div>
      </div>

      <div className="header-lab-info">
        <span className="lab-label">ACTIVE LAB:</span>
        <span className="lab-title">{labName}</span>
      </div>

      <div className="header-actions-section">
        {/* Real Learning Progress Indicator */}
        <div className="learning-stats-pill" title="Predictions made and accuracy based on your actual inputs">
          <div className="stat-unit">
            <span className="stat-value">{stats.totalPredictions}</span>
            <span className="stat-name">Predictions</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-unit">
            <span className={`stat-value ${accuracyPercent !== null && accuracyPercent >= 70 ? 'text-success' : ''}`}>
              {accuracyPercent !== null ? `${accuracyPercent}%` : '—'}
            </span>
            <span className="stat-name">Accuracy</span>
          </div>

          {stats.bugsRepaired.size > 0 && (
            <>
              <div className="stat-divider"></div>
              <div className="stat-unit">
                <span className="stat-value text-success">{stats.bugsRepaired.size}</span>
                <span className="stat-name">Fixed</span>
              </div>
            </>
          )}
        </div>

        {/* Transfer Test Button */}
        <button
          className={`action-btn challenge-btn ${stats.challengeCompleted ? 'completed' : ''}`}
          onClick={onOpenTransfer}
          title="Demonstrate learning transfer on a brand new array"
        >
          <Trophy size={16} />
          <span>{stats.challengeCompleted ? 'Transfer Test ✓' : 'Transfer Test'}</span>
        </button>

        {/* Lab Guide Button */}
        <button
          className="action-btn icon-btn"
          onClick={onOpenGuide}
          title="Interactive CS Lab Guide & Mental Model Concepts"
        >
          <HelpCircle size={18} />
        </button>

        {/* Reset Button */}
        <button
          className="action-btn reset-btn"
          onClick={onReset}
          title="Reset Lab to initial step"
        >
          <RotateCcw size={16} />
          <span>Reset Lab</span>
        </button>
      </div>
    </header>
  );
}
