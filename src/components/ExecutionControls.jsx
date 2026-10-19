import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export function ExecutionControls({
  currentStepIndex,
  totalSteps,
  isPlaying,
  playbackSpeed,
  currentStep,
  onStepForward,
  onStepBackward,
  onTogglePlay,
  onReset,
  onGoToStep,
  onChangeSpeed
}) {
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < totalSteps - 1;

  return (
    <div className="panel execution-controls-panel">
      <div className="controls-row">
        {/* Main Transport Buttons */}
        <div className="transport-buttons">
          <button
            className="control-btn"
            onClick={onStepBackward}
            disabled={!canGoBack}
            title="Step Backward (Previous line / state)"
          >
            <SkipBack size={18} />
            <span className="btn-label">Step Back</span>
          </button>

          <button
            className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause auto-advancement' : 'Run execution trace'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span className="btn-label">{isPlaying ? 'Pause' : 'Run'}</span>
          </button>

          <button
            className="control-btn"
            onClick={onStepForward}
            disabled={!canGoForward}
            title="Step Forward (Next line / state)"
          >
            <SkipForward size={18} />
            <span className="btn-label">Step Forward</span>
          </button>

          <button
            className="control-btn reset-btn"
            onClick={onReset}
            title="Reset execution to step 0"
          >
            <RotateCcw size={16} />
            <span className="btn-label">Reset</span>
          </button>
        </div>

        {/* Step Progress Scrubber */}
        <div className="step-scrubber-container">
          <div className="scrubber-header">
            <span className="step-count-text">
              Step <span className="font-mono text-accent">{currentStepIndex + 1}</span> of{' '}
              <span className="font-mono">{totalSteps}</span>
            </span>
            <span className="step-phase-badge">
              {currentStep.operationName}
            </span>
          </div>

          <div className="scrubber-track">
            <input
              type="range"
              min="0"
              max={Math.max(0, totalSteps - 1)}
              value={currentStepIndex}
              onChange={(e) => onGoToStep(Number(e.target.value))}
              className="scrubber-slider"
            />
          </div>
        </div>

        {/* Playback Speed Controls */}
        <div className="speed-selector">
          <span className="text-xs text-secondary">Speed:</span>
          <div className="speed-pills">
            {[
              { label: '0.5x', speed: 2000 },
              { label: '1x', speed: 1200 },
              { label: '2x', speed: 600 }
            ].map(({ label, speed }) => (
              <button
                key={label}
                className={`speed-pill ${playbackSpeed === speed ? 'active' : ''}`}
                onClick={() => onChangeSpeed(speed)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
