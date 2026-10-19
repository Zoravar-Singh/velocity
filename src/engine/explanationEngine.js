import { MUTATIONS } from './mutations.js';

/**
 * Explanation Engine for MindTrace.
 * Compares student mental model predictions against actual simulator state,
 * producing structured, rule-based feedback and educational explanations.
 */

export function analyzePrediction(prediction, actualStep, previousStep, mutationType) {
  if (!prediction) {
    return null;
  }

  const actualArray = actualStep.array || [];
  const prevArray = previousStep ? previousStep.array : actualArray;
  const predictedArray = prediction.predictedArray || [];

  // Cell-by-cell comparison
  const matchingIndices = [];
  const divergentIndices = [];

  const maxLen = Math.max(actualArray.length, predictedArray.length);
  for (let k = 0; k < maxLen; k++) {
    if (predictedArray[k] === actualArray[k]) {
      matchingIndices.push(k);
    } else {
      divergentIndices.push(k);
    }
  }

  const isArrayMatch = divergentIndices.length === 0;
  const firstDivergenceIndex = divergentIndices.length > 0 ? divergentIndices[0] : null;

  // Swap target comparison (if student entered swap prediction)
  let swapMatch = true;
  if (prediction.predictedSwapIndices && prediction.predictedSwapIndices.length > 0) {
    const pSwaps = [...prediction.predictedSwapIndices].sort((a, b) => a - b);
    const actualSwaps = [...(actualStep.changedIndices || [])].sort((a, b) => a - b);

    if (pSwaps.length !== actualSwaps.length || !pSwaps.every((val, idx) => val === actualSwaps[idx])) {
      swapMatch = false;
    }
  }

  // Pointer prediction comparison
  const iMatch = prediction.predictedI == null || prediction.predictedI === actualStep.variables.i;
  const jMatch = prediction.predictedJ == null || prediction.predictedJ === actualStep.variables.j;

  const isFullyCorrect = isArrayMatch && swapMatch && iMatch && jMatch;
  const accuracyScore = Math.round((matchingIndices.length / maxLen) * 100);

  // Generate structured breakdown
  let studentExpectation = '';
  let actualOccurrence = '';
  let keyVariableOrCondition = '';
  let whyItDiffers = '';
  let nextInspectionTip = '';

  const { i, j } = actualStep.variables;
  const n = actualArray.length;
  const halfLen = Math.floor(n / 2);

  if (isFullyCorrect) {
    studentExpectation = `You expected the array to become [${predictedArray.join(', ')}] after this step.`;
    actualOccurrence = `The computer executed ${actualStep.operationName} and produced [${actualArray.join(', ')}].`;
    keyVariableOrCondition = actualStep.conditionText || `i = ${i}, j = ${j}`;
    whyItDiffers = 'Your mental model perfectly aligns with the deterministic execution trace!';
    nextInspectionTip = 'Advance to the next step or explore what happens when an intentional bug mutation is enabled.';

    return {
      isCorrect: true,
      accuracyScore: 100,
      matchingIndices,
      divergentIndices,
      firstDivergenceIndex: null,
      studentExpectation,
      actualOccurrence,
      keyVariableOrCondition,
      whyItDiffers,
      nextInspectionTip
    };
  }

  // Case 1: Data Loss Bug Mutation triggered, but student predicted normal swap
  if (mutationType === MUTATIONS.DATA_LOSS_SWAP && actualStep.phase.includes('DATA_LOSS')) {
    studentExpectation = `You predicted a regular symmetric swap of values at index ${i} and ${j}.`;
    actualOccurrence = `arr[${i}] was overwritten directly with arr[${j}] (${actualArray[i]}), without saving the original value into a temporary variable.`;
    keyVariableOrCondition = 'Missing: const temp = arr[i];';
    whyItDiffers = `Because line 4 overwrites arr[${i}] before line 5 runs, the original value (${prevArray[i]}) was erased from memory. Index ${j} then copied the already overwritten value.`;
    nextInspectionTip = 'Inspect lines 4 and 5 in the Code Panel to see why a temporary variable is required to swap two memory locations.';
  }
  // Case 2: Off-by-one Bug Mutation on Even or Odd array
  else if (mutationType === MUTATIONS.OFF_BY_ONE && actualStep.phase === 'LOOP_CHECK' && actualStep.anomaly) {
    studentExpectation = 'You expected the loop to terminate when i reached the midpoint.';
    actualOccurrence = `The loop condition is "i <= Math.floor(arr.length / 2)", which evaluated to ${actualStep.conditionResult} at i = ${i}.`;
    keyVariableOrCondition = actualStep.conditionText;
    whyItDiffers = n % 2 === 0
      ? `On this even-length array (${n} elements), Math.floor(${n}/2) = ${halfLen}. The <= operator causes the loop to run at i = ${halfLen}, crossing pointers and swapping elements back!`
      : `On this odd-length array (${n} elements), Math.floor(${n}/2) = ${halfLen}. The <= operator causes an unnecessary self-swap at the middle index ${halfLen}.`;
    nextInspectionTip = 'Check the evaluated condition in the Actual Execution panel and notice how <= differs from <.';
  }
  // Case 3: Off-by-one during extra swap
  else if (mutationType === MUTATIONS.OFF_BY_ONE && (actualStep.phase === 'ASSIGN_J' || actualStep.phase === 'ITERATION_COMPLETE') && i >= halfLen) {
    studentExpectation = `You predicted array [${predictedArray.join(', ')}].`;
    actualOccurrence = `The extra loop iteration swapped arr[${i}] and arr[${j}], modifying elements after the midpoint.`;
    keyVariableOrCondition = `Loop bound <= ${halfLen} vs < ${halfLen}`;
    whyItDiffers = `The loop did not stop at index ${halfLen - 1}. Because of the <= condition, an extra swap occurred.`;
    nextInspectionTip = 'Observe the "Your Mental Model" vs "Actual Execution" comparison to see which cells were corrupted.';
  }
  // Case 4: Full Traversal Over-swap
  else if (mutationType === MUTATIONS.WRONG_DIRECTION && i >= halfLen) {
    studentExpectation = `You expected the reversed array to remain intact.`;
    actualOccurrence = `The loop continued running past the midpoint because the condition is "i < ${n}", swapping indices ${i} and ${j}.`;
    keyVariableOrCondition = `for (let i = 0; i < ${n}; i++)`;
    whyItDiffers = `Since the loop traverses the full length instead of stopping at halfLen (${halfLen}), it visits elements that were already swapped and swaps them back!`;
    nextInspectionTip = 'Watch how each pair gets reversed twice, ending back in the initial unreversed state.';
  }
  // Case 5: Wrong Swap Target (miscalculating j)
  else if (prediction.predictedSwapIndices && prediction.predictedSwapIndices.length > 0 && !swapMatch) {
    const studentJ = prediction.predictedSwapIndices.find(idx => idx !== i) ?? prediction.predictedSwapIndices[1];
    studentExpectation = `You expected index ${i} to swap with index ${studentJ}.`;
    actualOccurrence = `The algorithm swapped index ${i} with index ${j}.`;
    keyVariableOrCondition = `j = arr.length - 1 - i = ${n} - 1 - ${i} = ${j}`;
    whyItDiffers = `The mirror index j is derived dynamically from the end of the array using formula (length - 1 - i). For length ${n} and i = ${i}, j is exactly ${j}.`;
    nextInspectionTip = 'Check the formula on line 3: const j = arr.length - 1 - i.';
  }
  // Case 6: Divergent array cells
  else if (!isArrayMatch) {
    const mismatchValExpected = predictedArray[firstDivergenceIndex];
    const mismatchValActual = actualArray[firstDivergenceIndex];

    studentExpectation = `You predicted index ${firstDivergenceIndex} would be ${mismatchValExpected}.`;
    actualOccurrence = `Index ${firstDivergenceIndex} is actually ${mismatchValActual}.`;
    keyVariableOrCondition = actualStep.operationName || `arr[${firstDivergenceIndex}]`;
    whyItDiffers = `During this step, the operation performed was "${actualStep.operationName}". Only indices [${(actualStep.changedIndices || []).join(', ')}] were modified.`;
    nextInspectionTip = `Inspect cell ${firstDivergenceIndex} in the comparison panel to verify when its value actually changes.`;
  }
  // Generic fallback
  else {
    studentExpectation = `You predicted: [${predictedArray.join(', ')}].`;
    actualOccurrence = `Actual result: [${actualArray.join(', ')}].`;
    keyVariableOrCondition = actualStep.operationName;
    whyItDiffers = 'The predicted values diverged from the step-by-step simulator trace.';
    nextInspectionTip = 'Step backward to re-examine the previous variables and trace line by line.';
  }

  return {
    isCorrect: false,
    accuracyScore,
    matchingIndices,
    divergentIndices,
    firstDivergenceIndex,
    studentExpectation,
    actualOccurrence,
    keyVariableOrCondition,
    whyItDiffers,
    nextInspectionTip
  };
}

/**
 * Generate quick transfer challenge feedback
 */
export function evaluateChallengeAnswer(questionType, studentAnswer, correctAnswer, metadata = {}) {
  const isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer);

  if (isCorrect) {
    return {
      isCorrect: true,
      message: 'Spot on! You correctly predicted the algorithm outcome under the specified conditions.',
      tip: 'You have demonstrated solid understanding of two-pointer array reversal!'
    };
  }

  let hint = 'Review how indices i and j mirror each other across the midpoint.';
  if (questionType === 'FIRST_SWAP') {
    hint = `In the first iteration (i = 0), j is length - 1 = ${metadata.length - 1}. Only indices 0 and ${metadata.length - 1} are swapped.`;
  } else if (questionType === 'SWAP_COUNT') {
    hint = `Total swaps is Math.floor(array.length / 2). For length ${metadata.length}, floor(${metadata.length} / 2) = ${Math.floor(metadata.length / 2)}.`;
  } else if (questionType === 'FINAL_ARRAY') {
    hint = `All pairs from both ends meet at the midpoint. Reverse every element from outer pairs inward.`;
  }

  return {
    isCorrect: false,
    message: `Not quite. You answered ${JSON.stringify(studentAnswer)}, but the correct answer is ${JSON.stringify(correctAnswer)}.`,
    tip: hint
  };
}
