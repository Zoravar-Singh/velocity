import React, { useState } from 'react';
import { Trophy, X, CheckCircle2, AlertOctagon, RotateCcw, Award, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TRANSFER_CHALLENGE, CORE_CONCEPTS } from '../data/labs.js';

export function TransferChallenge({
  isOpen,
  onClose,
  stats,
  onRecordResult
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // qId -> optionIndex
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const question = TRANSFER_CHALLENGE.questions[currentQIndex];
  const totalQuestions = TRANSFER_CHALLENGE.questions.length;

  const handleSelect = (optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [question.id]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Final submission
      let correctCount = 0;
      TRANSFER_CHALLENGE.questions.forEach(q => {
        const chosenIdx = selectedAnswers[q.id];
        if (chosenIdx !== undefined && q.options[chosenIdx]?.isCorrect) {
          correctCount++;
        }
      });

      setIsSubmitted(true);
      onRecordResult(correctCount, totalQuestions);

      if (correctCount >= 2) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if canvas not supported
        }
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQIndex(0);
  };

  // Calculate score if submitted
  const score = isSubmitted
    ? TRANSFER_CHALLENGE.questions.reduce((acc, q) => {
        const chosenIdx = selectedAnswers[q.id];
        return chosenIdx !== undefined && q.options[chosenIdx]?.isCorrect ? acc + 1 : acc;
      }, 0)
    : 0;

  const challengePercent = Math.round((score / totalQuestions) * 100);
  const initialAccuracy = stats.totalPredictions > 0
    ? Math.round((stats.correctPredictions / stats.totalPredictions) * 100)
    : null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog transfer-modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <Trophy size={20} className="text-accent" />
            <h3 className="modal-title">Learning Transfer Challenge</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Target Array Card */}
          <div className="challenge-hero-card">
            <span className="text-xs uppercase text-secondary font-semibold">Test Challenge Array</span>
            <div className="challenge-array-cells mt-2">
              {TRANSFER_CHALLENGE.targetArray.map((num, idx) => (
                <div key={idx} className="challenge-cell">
                  <span className="cell-num">{num}</span>
                  <span className="cell-sub">[{idx}]</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              4 elements (even parity). Predict the exact execution behavior without simulator clues.
            </p>
          </div>

          {!isSubmitted ? (
            <div className="challenge-active-question mt-4">
              <div className="question-header">
                <span className="text-xs font-semibold text-accent">
                  Question {currentQIndex + 1} of {totalQuestions}
                </span>
                <h4 className="question-title mt-1">{question.prompt}</h4>
              </div>

              <div className="options-grid mt-3">
                {question.options.map((opt, idx) => {
                  const isChosen = selectedAnswers[question.id] === idx;
                  return (
                    <button
                      key={idx}
                      className={`option-btn ${isChosen ? 'chosen' : ''}`}
                      onClick={() => handleSelect(idx)}
                    >
                      <span className="option-circle">{String.fromCharCode(65 + idx)}</span>
                      <span className="option-text font-mono">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="question-nav-bar mt-4">
                <button
                  className="action-btn secondary-btn"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                >
                  Previous
                </button>

                <button
                  className="action-btn primary-btn"
                  disabled={selectedAnswers[question.id] === undefined}
                  onClick={handleNext}
                >
                  {currentQIndex === totalQuestions - 1 ? 'Submit & Review Challenge' : 'Next Question'}
                </button>
              </div>
            </div>
          ) : (
            <div className="challenge-results-section mt-4">
              {/* Score Banner */}
              <div className={`score-card ${challengePercent >= 70 ? 'score-high' : 'score-med'}`}>
                <div className="score-badge">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-bold">
                    Challenge Score: {score} / {totalQuestions} ({challengePercent}%)
                  </h4>
                  <p className="text-xs text-secondary mt-0.5">
                    {challengePercent === 100
                      ? 'Mastery demonstrated! Your mental model transferred with 100% accuracy.'
                      : 'Good effort! Review the detailed question explanations below to solidify your understanding.'}
                  </p>
                </div>
              </div>

              {/* Learning Summary Session Statistics as required by Section 13 */}
              <div className="session-summary-box mt-3">
                <h5 className="summary-box-title">Session Learning Diagnostic Summary</h5>
                <div className="summary-stats-grid mt-2">
                  <div className="summary-stat-cell">
                    <span className="stat-label">Initial Lab Prediction Accuracy</span>
                    <span className="stat-number">
                      {initialAccuracy !== null ? `${initialAccuracy}%` : 'N/A'}
                    </span>
                    <span className="stat-sub">({stats.correctPredictions}/{stats.totalPredictions} correct)</span>
                  </div>

                  <div className="summary-stat-cell">
                    <span className="stat-label">Transfer Test Accuracy</span>
                    <span className="stat-number">{challengePercent}%</span>
                    <span className="stat-sub">({score}/{totalQuestions} correct)</span>
                  </div>

                  <div className="summary-stat-cell">
                    <span className="stat-label">Bug Mutations Explored</span>
                    <span className="stat-number">{stats.bugsExplored.size} / 3</span>
                    <span className="stat-sub">Off-by-one, Loop direction, Data loss</span>
                  </div>

                  <div className="summary-stat-cell">
                    <span className="stat-label">Bugs Repaired</span>
                    <span className="stat-number">{stats.bugsRepaired.size}</span>
                    <span className="stat-sub">Fixes applied</span>
                  </div>
                </div>

                {/* Concepts Practiced */}
                <div className="concepts-practiced-section mt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen size={14} className="text-accent" />
                    <span className="text-xs font-semibold text-secondary">Concepts Practiced This Session:</span>
                  </div>
                  <div className="concepts-tags-row">
                    {CORE_CONCEPTS.map(c => (
                      <span key={c.id} className="concept-tag" title={c.description}>
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="question-review-list mt-3">
                <h5 className="text-xs font-semibold text-secondary uppercase mb-2">
                  Question Breakdown & Explanations:
                </h5>
                {TRANSFER_CHALLENGE.questions.map((q, qIdx) => {
                  const chosenIdx = selectedAnswers[q.id];
                  const chosenOpt = q.options[chosenIdx];
                  const correctOpt = q.options.find(o => o.isCorrect);
                  const isCorrect = chosenOpt?.isCorrect;

                  return (
                    <div key={q.id} className={`review-card ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          Q{qIdx + 1}: {q.prompt}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                        ) : (
                          <AlertOctagon size={16} className="text-danger flex-shrink-0" />
                        )}
                      </div>
                      <div className="review-answers-row mt-1 text-xs">
                        <span>Your answer: <strong className="font-mono">{chosenOpt?.label}</strong></span>
                        {!isCorrect && (
                          <span className="ml-3 text-success">
                            Correct: <strong className="font-mono">{correctOpt?.label}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary mt-1">{chosenOpt?.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <div className="challenge-footer mt-4 flex justify-between">
                <button className="action-btn secondary-btn" onClick={handleRetry}>
                  <RotateCcw size={14} />
                  <span>Retry Challenge</span>
                </button>
                <button className="action-btn primary-btn" onClick={onClose}>
                  <span>Done / Return to Lab</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
