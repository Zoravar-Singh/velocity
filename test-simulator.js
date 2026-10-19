import { generateExecutionTrace } from './src/engine/reverseArraySimulator.js';
import { MUTATIONS } from './src/engine/mutations.js';
import { analyzePrediction } from './src/engine/explanationEngine.js';
import { TRANSFER_CHALLENGE } from './src/data/labs.js';

console.log('=== MindTrace Test Suite Starting ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Test Baseline Odd Array [1, 2, 3, 4, 5]
const traceOdd = generateExecutionTrace([1, 2, 3, 4, 5], MUTATIONS.NONE);
const finalOdd = traceOdd[traceOdd.length - 1];
assert(
  JSON.stringify(finalOdd.finalArray) === JSON.stringify([5, 4, 3, 2, 1]),
  'Baseline odd array [1, 2, 3, 4, 5] correctly reverses to [5, 4, 3, 2, 1]'
);
assert(finalOdd.isCorrectlyReversed === true, 'Odd array marked as correctly reversed');

// 2. Test Baseline Even Array [1, 2, 3, 4]
const traceEven = generateExecutionTrace([1, 2, 3, 4], MUTATIONS.NONE);
const finalEven = traceEven[traceEven.length - 1];
assert(
  JSON.stringify(finalEven.finalArray) === JSON.stringify([4, 3, 2, 1]),
  'Baseline even array [1, 2, 3, 4] correctly reverses to [4, 3, 2, 1]'
);
assert(finalEven.isCorrectlyReversed === true, 'Even array marked as correctly reversed');

// 3. Test Mutation 1: Off-by-One on Even Array [1, 2, 3, 4]
// Math.floor(4/2) = 2. Loop runs i=0, 1, 2. At i=2, j=1. Swaps 1 and 2 again!
const traceOffByOneEven = generateExecutionTrace([1, 2, 3, 4], MUTATIONS.OFF_BY_ONE);
const finalOffByOneEven = traceOffByOneEven[traceOffByOneEven.length - 1];
assert(
  JSON.stringify(finalOffByOneEven.finalArray) === JSON.stringify([4, 2, 3, 1]),
  `Off-by-One on even array produces corrupted middle [4, 2, 3, 1] (got ${JSON.stringify(finalOffByOneEven.finalArray)})`
);
assert(finalOffByOneEven.isCorrectlyReversed === false, 'Off-by-One recognized as incorrect final output');

// 4. Test Mutation 2: Full Traversal Over-Swap [1, 2, 3, 4, 5]
// Traverses all elements i=0..4, undoing the reversal!
const traceWrongDir = generateExecutionTrace([1, 2, 3, 4, 5], MUTATIONS.WRONG_DIRECTION);
const finalWrongDir = traceWrongDir[traceWrongDir.length - 1];
assert(
  JSON.stringify(finalWrongDir.finalArray) === JSON.stringify([1, 2, 3, 4, 5]),
  `Full Traversal reverses and un-reverses back to [1, 2, 3, 4, 5] (got ${JSON.stringify(finalWrongDir.finalArray)})`
);
assert(finalWrongDir.isCorrectlyReversed === false, 'Full traversal recognized as unreversed output');

// 5. Test Mutation 3: Data Loss Swap without temp
// [1, 2, 3, 4, 5] -> at i=0, arr[0]=arr[4] (5), then arr[4]=arr[0] (5). Original 1 is lost!
const traceDataLoss = generateExecutionTrace([1, 2, 3, 4, 5], MUTATIONS.DATA_LOSS_SWAP);
const finalDataLoss = traceDataLoss[traceDataLoss.length - 1];
assert(
  finalDataLoss.finalArray.includes(1) === false,
  `Data loss swap permanently erased element 1 (final: [${finalDataLoss.finalArray.join(', ')}])`
);
assert(finalDataLoss.finalArray[0] === 5 && finalDataLoss.finalArray[4] === 5, 'Duplicate value 5 at both ends');

// 6. Test Prediction Analysis (Correct Match)
const correctAnalysis = analyzePrediction(
  {
    predictedArray: [5, 2, 3, 4, 1],
    predictedSwapIndices: [0, 4],
    predictedI: 0,
    predictedJ: 4
  },
  traceOdd.find(s => s.phase === 'ITERATION_COMPLETE' && s.iteration === 0),
  traceOdd[0],
  MUTATIONS.NONE
);
assert(correctAnalysis.isCorrect === true, 'Exact prediction correctly verified as isCorrect: true');
assert(correctAnalysis.divergentIndices.length === 0, 'No divergent indices on correct prediction');

// 7. Test Prediction Analysis (Divergence / Misconception)
const divergentAnalysis = analyzePrediction(
  {
    predictedArray: [1, 2, 3, 4, 5], // Student didn't predict swap
    predictedSwapIndices: [],
    predictedI: 0,
    predictedJ: 4
  },
  traceOdd.find(s => s.phase === 'ITERATION_COMPLETE' && s.iteration === 0),
  traceOdd[0],
  MUTATIONS.NONE
);
assert(divergentAnalysis.isCorrect === false, 'Mismatch correctly flagged as isCorrect: false');
assert(divergentAnalysis.divergentIndices.includes(0), 'Divergence correctly flagged at index 0');
assert(divergentAnalysis.studentExpectation.length > 0, 'Explanation includes student expectation');
assert(divergentAnalysis.whyItDiffers.length > 0, 'Explanation includes why it differs');
assert(divergentAnalysis.nextInspectionTip.length > 0, 'Explanation includes actionable inspection tip');

// 8. Test Transfer Challenge Questions
const q1 = TRANSFER_CHALLENGE.questions[0];
const q1Correct = q1.options.find(o => o.isCorrect);
assert(
  JSON.stringify(q1Correct.value) === JSON.stringify([4, 2, 9, 7]),
  'Transfer challenge Q1 correct answer is [4, 2, 9, 7]'
);

const q2 = TRANSFER_CHALLENGE.questions[1];
const q2Correct = q2.options.find(o => o.isCorrect);
assert(q2Correct.value === 2, 'Transfer challenge Q2 correct swap count is 2');

const q3 = TRANSFER_CHALLENGE.questions[2];
const q3Correct = q3.options.find(o => o.isCorrect);
assert(
  JSON.stringify(q3Correct.value) === JSON.stringify([4, 9, 2, 7]),
  'Transfer challenge Q3 final array is [4, 9, 2, 7]'
);

console.log(`\n=== All Tests Finished: ${passedTests}/${totalTests} Passed ===`);
