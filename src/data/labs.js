export const DEFAULT_ARRAY = [1, 2, 3, 4, 5];

export const ARRAY_PRESETS = [
  { label: 'Odd Length (5 items)', array: [1, 2, 3, 4, 5], description: 'Baseline odd length array. Center element (3) stays in place.' },
  { label: 'Even Length (4 items)', array: [1, 2, 3, 4], description: 'Crucial for testing boundary conditions & pointer crossing.' },
  { label: 'Even Length (6 items)', array: [10, 20, 30, 40, 50, 60], description: 'Longer even array with 3 distinct swaps.' },
  { label: 'Odd Short (3 items)', array: [9, 5, 1], description: 'Quick 1-swap odd array.' }
];

export const TRANSFER_CHALLENGE = {
  id: 'transfer-array-reversal',
  title: 'Learning Transfer Test: Array Reversal',
  description: 'Apply your mental model to a new array. Predict the exact outcomes below to prove mastery.',
  targetArray: [7, 2, 9, 4],
  questions: [
    {
      id: 'q1',
      type: 'FIRST_SWAP',
      title: 'Question 1: First Iteration Output',
      prompt: 'For input [7, 2, 9, 4], what will the array become after the first iteration (i = 0) finishes?',
      options: [
        { label: '[4, 2, 9, 7]', value: [4, 2, 9, 7], isCorrect: true, explanation: 'Correct! At i=0, j=4-1-0=3. arr[0] (7) and arr[3] (4) swap places.' },
        { label: '[7, 2, 9, 4]', value: [7, 2, 9, 4], isCorrect: false, explanation: 'Incorrect. The first iteration swaps the first and last elements.' },
        { label: '[4, 9, 2, 7]', value: [4, 9, 2, 7], isCorrect: false, explanation: 'Incorrect. This represents the final fully-reversed array, not just iteration 0.' },
        { label: '[2, 7, 9, 4]', value: [2, 7, 9, 4], isCorrect: false, explanation: 'Incorrect. Two-pointer reversal swaps outer symmetric elements (indices 0 and 3), not adjacent elements.' }
      ]
    },
    {
      id: 'q2',
      type: 'SWAP_COUNT',
      title: 'Question 2: Total Swap Count',
      prompt: 'How many total swap operations will run for [7, 2, 9, 4] using the correct algorithm?',
      options: [
        { label: '2 swaps', value: 2, isCorrect: true, explanation: 'Correct! Array length is 4. Math.floor(4 / 2) = 2. Iterations run for i = 0 and i = 1.' },
        { label: '4 swaps', value: 4, isCorrect: false, explanation: 'Incorrect. Running 4 swaps would traverse the entire array and reverse it back to the original!' },
        { label: '1 swap', value: 1, isCorrect: false, explanation: 'Incorrect. 1 swap only reverses the outer two elements (7 and 4), leaving 2 and 9 unswapped.' },
        { label: '3 swaps', value: 3, isCorrect: false, explanation: 'Incorrect. 3 swaps would cause pointers to cross the midpoint.' }
      ]
    },
    {
      id: 'q3',
      type: 'FINAL_ARRAY',
      title: 'Question 3: Final Output',
      prompt: 'What is the final array returned by reverseArray([7, 2, 9, 4])?',
      options: [
        { label: '[4, 9, 2, 7]', value: [4, 9, 2, 7], isCorrect: true, explanation: 'Correct! Both pairs (7<->4 and 2<->9) are swapped.' },
        { label: '[7, 2, 9, 4]', value: [7, 2, 9, 4], isCorrect: false, explanation: 'Incorrect. The array is fully reversed by the canonical algorithm.' },
        { label: '[4, 2, 9, 7]', value: [4, 2, 9, 7], isCorrect: false, explanation: 'Incorrect. That is only the intermediate state after 1 iteration.' },
        { label: '[9, 4, 2, 7]', value: [9, 4, 2, 7], isCorrect: false, explanation: 'Incorrect. The elements are sorted or scrambled rather than reversed.' }
      ]
    }
  ]
};

export const CORE_CONCEPTS = [
  { id: 'c1', title: 'Two-Pointer Mirroring', description: 'Left pointer i and right pointer j mirror symmetrically around the center.' },
  { id: 'c2', title: 'Loop Boundary Halving', description: 'Stopping at Math.floor(length / 2) prevents swapping elements back.' },
  { id: 'c3', title: 'Temporary Storage', description: 'Preserving a value in a temporary variable prevents in-place memory overwrite.' },
  { id: 'c4', title: 'Odd vs Even Parity', description: 'Odd arrays have a center pivot; even arrays have no pivot and require strict bounds.' }
];
