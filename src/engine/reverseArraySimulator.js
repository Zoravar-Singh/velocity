import { MUTATIONS } from './mutations.js';

/**
 * Deterministic simulator for array reversal algorithms and their mutations.
 * Produces a full step-by-step execution trace suitable for visualization and prediction.
 */
export function generateExecutionTrace(inputArray, mutationType = MUTATIONS.NONE) {
  // Defensive clone of input
  const arr = Array.isArray(inputArray) ? [...inputArray] : [1, 2, 3, 4, 5];
  const n = arr.length;
  const halfLen = Math.floor(n / 2);
  const trace = [];

  let stepCount = 0;

  const pushStep = (data) => {
    trace.push({
      stepNumber: stepCount++,
      mutationType,
      array: [...arr],
      ...data
    });
  };

  // Step 0: Function call & initialization
  pushStep({
    activeLine: 1,
    phase: 'INIT',
    isPredictableCheckpoint: false,
    iteration: null,
    variables: { i: null, j: null, temp: null, length: n, halfLen },
    conditionResult: null,
    conditionText: 'function reverseArray(arr)',
    changedIndices: [],
    highlightIndices: [],
    operationName: 'Function Entry',
    description: `Function reverseArray called with array of length ${n} (${n % 2 === 0 ? 'even' : 'odd'} length). Initial array: [${arr.join(', ')}].`,
    anomaly: null
  });

  // Determine loop bounds based on mutation
  let useLeqCondition = false;

  if (mutationType === MUTATIONS.OFF_BY_ONE) {
    useLeqCondition = true;
  }

  // Simulator loop execution
  let i = 0;
  const loopLimit = mutationType === MUTATIONS.WRONG_DIRECTION ? n : (useLeqCondition ? halfLen + 1 : halfLen);

  for (i = 0; i <= loopLimit; i++) {
    // Condition check
    let conditionPasses = false;
    let conditionFormula = '';

    if (mutationType === MUTATIONS.OFF_BY_ONE) {
      conditionPasses = i <= halfLen;
      conditionFormula = `${i} <= ${halfLen} (${halfLen} is Math.floor(${n}/2)) → ${conditionPasses}`;
    } else if (mutationType === MUTATIONS.WRONG_DIRECTION) {
      conditionPasses = i < n;
      conditionFormula = `${i} < ${n} (full array length) → ${conditionPasses}`;
    } else {
      conditionPasses = i < halfLen;
      conditionFormula = `${i} < ${halfLen} (midpoint Math.floor(${n}/2)) → ${conditionPasses}`;
    }

    pushStep({
      activeLine: 2,
      phase: 'LOOP_CHECK',
      isPredictableCheckpoint: conditionPasses, // If passes, this is a prime prediction point for the upcoming iteration
      iteration: i,
      variables: { i, j: null, temp: null, length: n, halfLen },
      conditionResult: conditionPasses,
      conditionText: conditionFormula,
      changedIndices: [],
      highlightIndices: conditionPasses ? [i] : [],
      operationName: `Loop Condition Check (i = ${i})`,
      description: conditionPasses
        ? `Condition evaluated to TRUE. Loop proceeds into iteration i = ${i}.`
        : `Condition evaluated to FALSE (${conditionFormula}). Loop terminates.`,
      anomaly: (mutationType === MUTATIONS.OFF_BY_ONE && i === halfLen)
        ? {
            type: 'OFF_BY_ONE_EXTRA_ITERATION',
            message: n % 2 !== 0
              ? `BUG EVENT: Condition "${i} <= ${halfLen}" evaluated to TRUE. On odd length (${n}), this enters a redundant iteration for the middle element.`
              : `BUG EVENT: Condition "${i} <= ${halfLen}" evaluated to TRUE. On even length (${n}), pointers cross (i=${i}, j=${n - 1 - i}), swapping the middle elements back!`
          }
        : (mutationType === MUTATIONS.WRONG_DIRECTION && i >= halfLen && conditionPasses)
        ? {
            type: 'OVER_SWAP_CROSSING',
            message: `BUG EVENT: i (${i}) has crossed the midpoint (${halfLen}). Continuing to swap will undo earlier swaps!`
          }
        : null
    });

    if (!conditionPasses) {
      break;
    }

    // Step: Calculate j
    const j = n - 1 - i;
    pushStep({
      activeLine: 3,
      phase: 'CALC_J',
      isPredictableCheckpoint: false,
      iteration: i,
      variables: { i, j, temp: null, length: n, halfLen },
      conditionResult: true,
      conditionText: `j = ${n} - 1 - ${i} = ${j}`,
      changedIndices: [],
      highlightIndices: [i, j],
      operationName: `Compute Mirror Index j = ${j}`,
      description: `Calculated opposite index j = arr.length - 1 - i = ${n} - 1 - ${i} = ${j}. Looking at arr[${i}] (${arr[i]}) and arr[${j}] (${arr[j]}).`,
      anomaly: (i === j)
        ? {
            type: 'SELF_SWAP',
            message: `Notice i === j (${i} === ${j}). The algorithm is targeting the exact same middle element!`
          }
        : (i > j)
        ? {
            type: 'CROSSED_POINTERS',
            message: `Pointers have crossed! Left pointer i (${i}) is now greater than right pointer j (${j}).`
          }
        : null
    });

    // Step: Swapping behavior
    if (mutationType === MUTATIONS.DATA_LOSS_SWAP) {
      // Overwrite without temp
      const valBeforeI = arr[i];
      const valBeforeJ = arr[j];

      // Line 4: arr[i] = arr[j]
      arr[i] = arr[j];
      pushStep({
        activeLine: 4,
        phase: 'DATA_LOSS_OVERWRITE',
        isPredictableCheckpoint: false,
        iteration: i,
        variables: { i, j, temp: null, length: n, halfLen },
        conditionResult: true,
        conditionText: `arr[${i}] = arr[${j}] (${valBeforeJ})`,
        changedIndices: [i],
        highlightIndices: [i, j],
        operationName: `Overwrite arr[${i}] with arr[${j}] (Data Loss!)`,
        description: `Overwrote arr[${i}] with arr[${j}] (${valBeforeJ}). Notice: original value of arr[${i}] (${valBeforeI}) was not saved to any temp variable and is permanently lost!`,
        anomaly: {
          type: 'DATA_LOSS',
          lostValue: valBeforeI,
          overwrittenIndex: i,
          message: `CRITICAL BUG: Value "${valBeforeI}" at index ${i} was overwritten before being saved. It is gone forever!`
        }
      });

      // Line 5: arr[j] = arr[i]
      arr[j] = arr[i]; // (which is already arr[j])
      pushStep({
        activeLine: 5,
        phase: 'DATA_LOSS_DUPLICATE',
        isPredictableCheckpoint: false,
        iteration: i,
        variables: { i, j, temp: null, length: n, halfLen },
        conditionResult: true,
        conditionText: `arr[${j}] = arr[${i}] (${arr[i]})`,
        changedIndices: [j],
        highlightIndices: [i, j],
        operationName: `Copy arr[${i}] to arr[${j}]`,
        description: `Executed arr[${j}] = arr[${i}]. Because arr[${i}] was already overwritten to ${arr[i]}, arr[${j}] stays ${arr[j]}. Array now has duplicate value ${arr[j]}.`,
        anomaly: {
          type: 'DUPLICATE_CORRUPTION',
          message: `Both index ${i} and index ${j} now hold ${arr[j]}. Original ${valBeforeI} was replaced.`
        }
      });

    } else {
      // Standard swap with temp
      const originalJ = arr[j];

      // Line 4: const temp = arr[i]
      const temp = arr[i];
      pushStep({
        activeLine: 4,
        phase: 'STORE_TEMP',
        isPredictableCheckpoint: false,
        iteration: i,
        variables: { i, j, temp, length: n, halfLen },
        conditionResult: true,
        conditionText: `temp = arr[${i}] (${temp})`,
        changedIndices: [],
        highlightIndices: [i],
        operationName: `Preserve arr[${i}] in temp`,
        description: `Safely stored value ${temp} from arr[${i}] into temporary variable 'temp'.`,
        anomaly: null
      });

      // Line 5: arr[i] = arr[j]
      arr[i] = arr[j];
      pushStep({
        activeLine: 5,
        phase: 'ASSIGN_I',
        isPredictableCheckpoint: false,
        iteration: i,
        variables: { i, j, temp, length: n, halfLen },
        conditionResult: true,
        conditionText: `arr[${i}] = arr[${j}] (${originalJ})`,
        changedIndices: [i],
        highlightIndices: [i, j],
        operationName: `Move arr[${j}] to arr[${i}]`,
        description: `Assigned arr[${j}] (${originalJ}) into arr[${i}]. Index ${i} now holds ${originalJ}.`,
        anomaly: null
      });

      // Line 6: arr[j] = temp
      arr[j] = temp;
      pushStep({
        activeLine: 6,
        phase: 'ASSIGN_J',
        isPredictableCheckpoint: false,
        iteration: i,
        variables: { i, j, temp, length: n, halfLen },
        conditionResult: true,
        conditionText: `arr[${j}] = temp (${temp})`,
        changedIndices: [j],
        highlightIndices: [i, j],
        operationName: `Restore temp into arr[${j}]`,
        description: `Assigned preserved temp (${temp}) into arr[${j}]. Swap of indices ${i} and ${j} is complete.`,
        anomaly: (i === j)
          ? {
              type: 'SELF_SWAP_COMPLETED',
              message: `Element at index ${i} (${arr[i]}) was swapped with itself. No change occurred, but an extra operation was executed.`
            }
          : (i > j)
          ? {
              type: 'INVERTED_SWAP_COMPLETED',
              message: `Indices ${i} and ${j} were swapped after crossing. This reversed elements back to their initial state!`
            }
          : null
      });
    }

    // Iteration complete summary step
    pushStep({
      activeLine: 7,
      phase: 'ITERATION_COMPLETE',
      isPredictableCheckpoint: false,
      iteration: i,
      variables: { i, j, temp: null, length: n, halfLen },
      conditionResult: true,
      conditionText: `Iteration i = ${i} finished`,
      changedIndices: i === j ? [] : [i, j],
      highlightIndices: [i, j],
      operationName: `End of Iteration ${i}`,
      description: `Iteration ${i} finished. Current array state: [${arr.join(', ')}]. Next: loop will increment i to ${i + 1}.`,
      anomaly: null
    });
  }

  // Return step
  const returnLine = mutationType === MUTATIONS.DATA_LOSS_SWAP ? 7 : 8;
  pushStep({
    activeLine: returnLine,
    phase: 'RETURN',
    isPredictableCheckpoint: false,
    iteration: null,
    variables: { i: null, j: null, temp: null, length: n, halfLen },
    conditionResult: null,
    conditionText: 'return arr;',
    changedIndices: [],
    highlightIndices: [],
    operationName: 'Return Statement',
    description: `Reached return statement. Returning array: [${arr.join(', ')}].`,
    anomaly: null
  });

  // Final Finished step
  const expectedReversed = [...inputArray].reverse();
  const isCorrectlyReversed = JSON.stringify(arr) === JSON.stringify(expectedReversed);

  pushStep({
    activeLine: null,
    phase: 'FINISHED',
    isPredictableCheckpoint: false,
    iteration: null,
    variables: { i: null, j: null, temp: null, length: n, halfLen },
    conditionResult: null,
    conditionText: 'Execution Finished',
    changedIndices: [],
    highlightIndices: [],
    operationName: 'Algorithm Completed',
    description: isCorrectlyReversed
      ? `Success! The array was correctly reversed: [${arr.join(', ')}].`
      : `Algorithm completed, but the result [${arr.join(', ')}] does NOT match the expected reversed array [${expectedReversed.join(', ')}] due to active bug mutation.`,
    isCorrectlyReversed,
    finalArray: [...arr],
    expectedReversed,
    anomaly: isCorrectlyReversed ? null : {
      type: 'INCORRECT_FINAL_OUTPUT',
      message: `Final output is [${arr.join(', ')}], expected [${expectedReversed.join(', ')}].`
    }
  });

  return trace;
}

/**
 * Filter the execution trace to only key iteration checkpoints
 * (useful for simplified stepping and prediction challenges)
 */
export function getMajorCheckpoints(trace) {
  return trace.filter(step => 
    step.phase === 'INIT' || 
    step.phase === 'ITERATION_COMPLETE' || 
    step.phase === 'FINISHED'
  );
}
