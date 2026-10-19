import React from 'react';
import { X, Brain, Bug, GitCompare, Wrench, Trophy } from 'lucide-react';

export function LabGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog guide-modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <Brain size={20} className="text-accent" />
            <h3 className="modal-title">MindTrace CS Lab Guide</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body guide-body">
          {/* Tagline Callout */}
          <div className="guide-hero-banner">
            <span className="text-xs uppercase font-bold text-accent tracking-wider">PRODUCT VISION</span>
            <h4 className="text-base font-bold text-foreground mt-1">
              "See what you think. See what actually happens."
            </h4>
            <p className="text-xs text-secondary mt-1">
              MindTrace bridges the crucial gap between a student's mental model and actual computer execution through deliberate prediction and debugging.
            </p>
          </div>

          {/* The 6-Step Learning Loop */}
          <div className="learning-loop-section mt-4">
            <h5 className="section-subtitle">The Core Learning Loop</h5>
            <div className="loop-steps-track">
              <div className="loop-step-badge">
                <span className="step-num">1</span>
                <span className="step-label">PREDICT</span>
              </div>
              <span className="loop-arrow">→</span>
              <div className="loop-step-badge">
                <span className="step-num">2</span>
                <span className="step-label">EXECUTE</span>
              </div>
              <span className="loop-arrow">→</span>
              <div className="loop-step-badge">
                <span className="step-num">3</span>
                <span className="step-label">COMPARE</span>
              </div>
              <span className="loop-arrow">→</span>
              <div className="loop-step-badge">
                <span className="step-num">4</span>
                <span className="step-label">UNDERSTAND</span>
              </div>
              <span className="loop-arrow">→</span>
              <div className="loop-step-badge">
                <span className="step-num">5</span>
                <span className="step-label">REPAIR</span>
              </div>
              <span className="loop-arrow">→</span>
              <div className="loop-step-badge">
                <span className="step-num">6</span>
                <span className="step-label">RETEST</span>
              </div>
            </div>
          </div>

          {/* Key Features Overview */}
          <div className="guide-features-grid mt-4">
            <div className="guide-feature-card">
              <div className="flex items-center gap-2 mb-1">
                <GitCompare size={16} className="text-accent" />
                <span className="font-semibold text-sm">Two-Column Comparison</span>
              </div>
              <p className="text-xs text-secondary">
                View your locked prediction on the left and the real deterministic JS execution on the right, with instant visual cell diffing.
              </p>
            </div>

            <div className="guide-feature-card">
              <div className="flex items-center gap-2 mb-1">
                <Bug size={16} className="text-danger" />
                <span className="font-semibold text-sm">3 Intentional Mutations</span>
              </div>
              <p className="text-xs text-secondary">
                Deliberately inject off-by-one errors, full traversal over-swapping, and data-loss variable overwrites to understand how bugs behave.
              </p>
            </div>

            <div className="guide-feature-card">
              <div className="flex items-center gap-2 mb-1">
                <Wrench size={16} className="text-accent" />
                <span className="font-semibold text-sm">Interactive Repair Mode</span>
              </div>
              <p className="text-xs text-secondary">
                Diagnose buggy code lines and apply targeted repairs to restore canonical algorithm execution.
              </p>
            </div>

            <div className="guide-feature-card">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={16} className="text-accent" />
                <span className="font-semibold text-sm">Learning Transfer Test</span>
              </div>
              <p className="text-xs text-secondary">
                Validate concept retention with a new 4-element array [7, 2, 9, 4] and review authentic session diagnostic stats.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="action-btn primary-btn w-full" onClick={onClose}>
            <span>Got it, let's explore!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
