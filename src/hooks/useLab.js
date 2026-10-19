import { useState, useEffect, useMemo, useCallback } from 'react';
import { MUTATIONS, MUTATION_DEFINITIONS } from '../engine/mutations.js';
import { generateExecutionTrace } from '../engine/reverseArraySimulator.js';
import { analyzePrediction } from '../engine/explanationEngine.js';
import { DEFAULT_ARRAY } from '../data/labs.js';

export function useLab() {
  const [inputArray, setInputArray] = useState(DEFAULT_ARRAY);
  const [mutationType, setMutationType] = useState(MUTATIONS.NONE);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200); // ms per step

  const [predictionHistory, setPredictionHistory] = useState({}); // stepIndex -> { prediction, analysis }

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

  // Step controls
  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(prev + 1, executionTrace.length - 1));
  }, [executionTrace.length]);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((index) => {
    setIsPlaying(false);
    if (index >= 0 && index < executionTrace.length) {
      setCurrentStepIndex(index);
    }
  }, [executionTrace.length]);

  const togglePlay = useCallback(() => {
    if (currentStepIndex >= executionTrace.length - 1) {
      // Loop or restart from step 0
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [currentStepIndex, executionTrace.length]);

  const resetLab = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  // Set mutation
  const changeMutation = useCallback((newMutation) => {
    setIsPlaying(false);
    setMutationType(newMutation);
    setCurrentStepIndex(0);

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

    setIsPlaying(false);
    setInputArray(newArr);
    setCurrentStepIndex(0);
    return { success: true };
  }, []);

  // Submit student prediction for the upcoming/current step
  const submitPrediction = useCallback((predData) => {
    // Target step is the current step
    const targetStep = currentStep;
    const analysis = analyzePrediction(predData, targetStep, previousStep, mutationType);

    setPredictionHistory(prev => ({
      ...prev,
      [currentStepIndex]: {
        prediction: predData,
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

    return analysis;
  }, [currentStep, previousStep, mutationType, currentStepIndex]);

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
