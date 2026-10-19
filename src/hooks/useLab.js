import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MUTATIONS, MUTATION_DEFINITIONS } from '../engine/mutations.js';
import { generateExecutionTrace } from '../engine/reverseArraySimulator.js';
import { analyzePrediction } from '../engine/explanationEngine.js';
import { DEFAULT_ARRAY } from '../data/labs.js';

/**
 * @param {boolean} isMentalGateMode true while the user is in "Mental Model (Predict Mode)".
 * In this mode auto-run pauses at EVERY step: the trace only advances once the user
 * commits a prediction (or clicks Reveal Without Predicting / Run again).
 */
export function useLab(isMentalGateMode = false) {
  const [inputArray, setInputArray] = useState(DEFAULT_ARRAY);
  const [mutationType, setMutationType] = useState(MUTATIONS.NONE);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200); // ms per step

  const [predictionHistory, setPredictionHistory] = useState({}); // stepIndex -> { prediction, analysis }

  // Timer that resumes auto-play after a committed prediction (gate mode)
  const advanceTimerRef = useRef(null);
  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // Play-session bookkeeping: index from which the current run started.
  // The gate must never pause the very step the user launched from — only once we
  // arrive at a NEW step that has no committed prediction.
  const playStartIndexRef = useRef(null);

  // Session stats (calculated strictly from actual interactions)
  const [stats, setStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    bugsExplored: new Set(),
    bugsRepaired: new Set(),
    challengeCompleted: false,
    challengeScore: null
  });

  // Active repair modal state
  const [isRepairOpen, setIsRepairOpen] = useState(false);

  // Active transfer test modal state
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Generate deterministic trace whenever inputArray or mutationType changes
  const executionTrace = useMemo(() => {
    return generateExecutionTrace(inputArray, mutationType);
  }, [inputArray, mutationType]);

  // Current step snapshot
  const currentStep = executionTrace[currentStepIndex] || executionTrace[0];
  const previousStep = currentStepIndex > 0 ? executionTrace[currentStepIndex - 1] : null;

  // Handle auto-advancement playback
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= executionTrace.length - 1) {
      const stopTimer = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stopTimer);
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => {
        if (prev >= executionTrace.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, executionTrace.length, playbackSpeed]);

  // Mental-Model gate: while playing, halt whenever we land on a step that has no
  // committed prediction. The user must Commit a Prediction or Reveal to continue.
  useEffect(() => {
    if (!isMentalGateMode || !isPlaying) return undefined;

    const startIndex = playStartIndexRef.current;
    if (startIndex === null || currentStepIndex === startIndex) return undefined;

    if (!predictionHistory[currentStepIndex]) {
      const stopTimer = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stopTimer);
    }

    return undefined;
  }, [isMentalGateMode, isPlaying, currentStepIndex, predictionHistory]);

  // Step controls
  const stepForward = useCallback(() => {
    clearAdvanceTimer();
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(prev + 1, executionTrace.length - 1));
  }, [executionTrace.length, clearAdvanceTimer]);

  const stepBackward = useCallback(() => {
    clearAdvanceTimer();
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, [clearAdvanceTimer]);

  const goToStep = useCallback((index) => {
    clearAdvanceTimer();
    setIsPlaying(false);
    if (index >= 0 && index < executionTrace.length) {
      setCurrentStepIndex(index);
    }
  }, [executionTrace.length, clearAdvanceTimer]);

  const togglePlay = useCallback(() => {
    clearAdvanceTimer();

    if (isMentalGateMode) {
      // Gate mode: run to the next step, then hold there waiting for the
      // user's prediction / reveal. (Commit also auto-advances one step.)
      const targetIndex = currentStepIndex >= executionTrace.length - 1 ? 0 : currentStepIndex;
      playStartIndexRef.current = targetIndex;
      setCurrentStepIndex(targetIndex);
      setIsPlaying(true);
      return;
    }

    if (currentStepIndex >= executionTrace.length - 1) {
      // Loop or restart from step 0
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [currentStepIndex, executionTrace.length, isMentalGateMode, clearAdvanceTimer]);

  const resetLab = useCallback(() => {
    clearAdvanceTimer();
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setMutationType(MUTATIONS.NONE);
    setInputArray(DEFAULT_ARRAY);
    setPredictionHistory({});
    setIsRepairOpen(false);
    setIsTransferOpen(false);
    setStats({
      totalPredictions: 0,
      correctPredictions: 0,
      bugsExplored: new Set(),
      bugsRepaired: new Set(),
      challengeCompleted: false,
      challengeScore: null
    });
  }, [clearAdvanceTimer]);

  // Set mutation
  const changeMutation = useCallback((newMutation) => {
    clearAdvanceTimer();
    setIsPlaying(false);
    setMutationType(newMutation);
    setCurrentStepIndex(0);
    // Predictions belong to the previous trace. Keeping them would make the
    // comparison panel show a stale committed mental model for this new run.
    setPredictionHistory({});

    if (newMutation !== MUTATIONS.NONE) {
      setStats(prev => ({
        ...prev,
        bugsExplored: new Set([...prev.bugsExplored, newMutation])
      }));
    }
  }, []);

  // Update input array with validation
  const updateInputArray = useCallback((newArr) => {
    if (!Array.isArray(newArr) || newArr.length < 3 || newArr.length > 8) {
      return { success: false, error: 'Array length must be between 3 and 8 elements for optimal visualization.' };
    }
    const hasInvalid = newArr.some(v => typeof v !== 'number' || !Number.isFinite(v));
    if (hasInvalid) {
      return { success: false, error: 'All elements must be valid finite integers.' };
    }

    clearAdvanceTimer();
    setIsPlaying(false);
    // Copy the values so React receives a new scenario even if a caller
    // happens to reuse and mutate an existing array reference.
    setInputArray([...newArr]);
    setCurrentStepIndex(0);
    setPredictionHistory({});
    return { success: true };
  }, [clearAdvanceTimer]);

  // Submit student prediction for the upcoming/current step
  const submitPrediction = useCallback((predData) => {
    // Normalise predictedArray to strict numbers so === comparisons never fail due to "5" vs 5
    const normalisedPredData = {
      ...predData,
      predictedArray: (predData.predictedArray || []).map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : v;
      }),
      predictedI: predData.predictedI != null ? Number(predData.predictedI) : null,
      predictedJ: predData.predictedJ != null ? Number(predData.predictedJ) : null,
    };

    // Target step is the current step — what the student was observing before committing
    const targetStep = currentStep;
    const analysis = analyzePrediction(normalisedPredData, targetStep, previousStep, mutationType);

    setPredictionHistory(prev => ({
      ...prev,
      [currentStepIndex]: {
        prediction: normalisedPredData,
        analysis,
        stepIndex: currentStepIndex,
        stepSnapshot: targetStep
      }
    }));

    // Update real session statistics
    setStats(prev => ({
      ...prev,
      totalPredictions: prev.totalPredictions + 1,
      correctPredictions: analysis.isCorrect ? prev.correctPredictions + 1 : prev.correctPredictions
    }));

    // Mental-Model gate: after committing, resume the run only when the prediction
    // was ACCURATE. If a divergence/error is detected, the run STOPS right here —
    // the user must read the error explanation and press "Continue" to move on.
    clearAdvanceTimer();
    if (analysis.isCorrect) {
      advanceTimerRef.current = setTimeout(() => {
        playStartIndexRef.current = currentStepIndex;
        setIsPlaying(true);
      }, 900);
    } else {
      // Halt the run at the divergence step
      playStartIndexRef.current = null;
      setIsPlaying(false);
    }

    return analysis;
  }, [currentStep, previousStep, mutationType, currentStepIndex, isMentalGateMode, playbackSpeed, clearAdvanceTimer]);


  // Apply a targeted bug repair
  const repairBug = useCallback((repairOptionId) => {
    const mutDef = MUTATION_DEFINITIONS[mutationType];
    const option = mutDef?.repairOptions?.find(opt => opt.id === repairOptionId);

    if (option && option.isCorrect) {
      setStats(prev => ({
        ...prev,
        bugsRepaired: new Set([...prev.bugsRepaired, mutationType])
      }));
      setMutationType(MUTATIONS.NONE);
      setCurrentStepIndex(0);
      setPredictionHistory({});
      setIsRepairOpen(false);
      return { success: true, message: option.explanation };
    } else {
      return {
        success: false,
        message: option?.explanation || 'That does not fix the root cause. Try another repair option!'
      };
    }
  }, [mutationType]);

  // Record transfer test completion
  const recordChallengeResult = useCallback((score, total) => {
    setStats(prev => ({
      ...prev,
      challengeCompleted: true,
      challengeScore: { score, total, percentage: Math.round((score / total) * 100) }
    }));
  }, []);

  // Active prediction for current step (if any was recorded)
  const currentPredictionResult = predictionHistory[currentStepIndex] || null;

  return {
    inputArray,
    mutationType,
    mutationDefinition: MUTATION_DEFINITIONS[mutationType],
    executionTrace,
    currentStepIndex,
    currentStep,
    previousStep,
    isPlaying,
    playbackSpeed,
    stats,
    currentPredictionResult,
    predictionHistory,
    isRepairOpen,
    isTransferOpen,
    setPlaybackSpeed,
    setIsRepairOpen,
    setIsTransferOpen,
    stepForward,
    stepBackward,
    goToStep,
    togglePlay,
    resetLab,
    changeMutation,
    updateInputArray,
    submitPrediction,
    repairBug,
    recordChallengeResult
  };
}
