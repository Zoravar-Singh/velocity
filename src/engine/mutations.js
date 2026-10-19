export const MUTATIONS = {
  NONE: 'NONE',
  OFF_BY_ONE: 'OFF_BY_ONE',
  WRONG_DIRECTION: 'WRONG_DIRECTION',
  DATA_LOSS_SWAP: 'DATA_LOSS_SWAP',
  OUT_OF_BOUNDS: 'OUT_OF_BOUNDS'
};

export const MUTATION_DEFINITIONS = {
  [MUTATIONS.NONE]: {
    id: MUTATIONS.NONE,
    name: 'Correct Canonical Algorithm',
    badge: 'Baseline (Correct)',
    type: 'success',
    description: 'The standard two-pointer array reversal stopping at the midpoint Math.floor(arr.length / 2).',
    lineHighlights: {
      loopCondition: 2,
      jCalculation: 3,
      swap: [4, 5, 6]
    },
    codeLines: [
      'function reverseArray(arr) {',
      '  for (let i = 0; i < Math.floor(arr.length / 2); i++) {',
      '    const j = arr.length - 1 - i;',
      '    const temp = arr[i];',
      '    arr[i] = arr[j];',
      '    arr[j] = temp;',
      '  }',
      '  return arr;',
      '}'
    ],
    bugExplanation: null,
    repairOptions: null
  },

  [MUTATIONS.OFF_BY_ONE]: {
    id: MUTATIONS.OFF_BY_ONE,
    name: 'Off-by-One Boundary',
    badge: 'Bug: i <= midpoint',
    type: 'danger',
    description: 'Loop condition uses <= instead of <. Causes a redundant self-swap on odd-length arrays and index inversion on even-length arrays.',
    lineHighlights: {
      loopCondition: 2,
      jCalculation: 3,
      swap: [4, 5, 6]
    },
    codeLines: [
      'function reverseArray(arr) {',
      '  // BUG: <= causes loop to run one extra iteration',
      '  for (let i = 0; i <= Math.floor(arr.length / 2); i++) {',
      '    const j = arr.length - 1 - i;',
      '    const temp = arr[i];',
      '    arr[i] = arr[j];',
      '    arr[j] = temp;',
      '  }',
      '  return arr;',
      '}'
    ],
    bugExplanation: {
      title: 'Off-by-One Loop Condition (<= vs <)',
      oddLengthBehavior: 'For odd-length arrays (e.g. len 5), Math.floor(5/2) is 2. The loop runs for i=2, where j = 5 - 1 - 2 = 2. It performs an unnecessary self-swap arr[2] with arr[2].',
      evenLengthBehavior: 'For even-length arrays (e.g. len 4), Math.floor(4/2) is 2. The loop runs for i=2, where j = 4 - 1 - 2 = 1. This swaps indices 1 and 2 again, reversing the middle elements back to original!',
      fixHint: 'Change the loop condition to strictly less than: i < Math.floor(arr.length / 2).'
    },
    repairOptions: [
      {
        id: 'fix-condition',
        label: 'Change loop condition to i < Math.floor(arr.length / 2)',
        isCorrect: true,
        explanation: 'Correct! Halving the length with strict less-than stops exactly at the midpoint before pointers cross.'
      },
      {
        id: 'fix-minus-one',
        label: 'Change loop condition to i <= Math.floor(arr.length / 2) - 1',
        isCorrect: false,
        explanation: 'While this avoids crossing on even arrays, for odd arrays with length 3, floor(3/2)-1 = 0, which only swaps once and works, but strict < is the standard idiom.'
      },
      {
        id: 'fix-length',
        label: 'Change loop condition to i <= arr.length',
        isCorrect: false,
        explanation: 'This would make the bug worse by traversing the entire array, causing out-of-bounds access.'
      }
    ]
  },

  [MUTATIONS.WRONG_DIRECTION]: {
    id: MUTATIONS.WRONG_DIRECTION,
    name: 'Full Traversal Over-Swap',
    badge: 'Bug: i < arr.length',
    type: 'danger',
    description: 'The loop condition traverses the entire array (i < arr.length) instead of stopping at half. It reverses the array, then reverses it right back!',
    lineHighlights: {
      loopCondition: 2,
      jCalculation: 3,
      swap: [4, 5, 6]
    },
    codeLines: [
      'function reverseArray(arr) {',
      '  // BUG: Loops across entire array length instead of half',
      '  for (let i = 0; i < arr.length; i++) {',
      '    const j = arr.length - 1 - i;',
      '    const temp = arr[i];',
      '    arr[i] = arr[j];',
      '    arr[j] = temp;',
      '  }',
      '  return arr;',
      '}'
    ],
    bugExplanation: {
      title: 'Full Traversal Reversal (Double Swap)',
      oddLengthBehavior: 'In the first half, elements are swapped correctly. Once i passes the midpoint, j points to already-swapped elements in the front, undoing every swap!',
      evenLengthBehavior: 'Every pair gets swapped twice. The final array ends up in its original order, rendering the function completely ineffective.',
      fixHint: 'Divide the bound by 2: stop when i reaches Math.floor(arr.length / 2).'
    },
    repairOptions: [
      {
        id: 'fix-bound-half',
        label: 'Stop at midpoint: i < Math.floor(arr.length / 2)',
        isCorrect: true,
        explanation: 'Correct! Two pointers meet in the middle. Swapping each pair once reverses the array.'
      },
      {
        id: 'fix-decrement',
        label: 'Keep loop length but decrement i--',
        isCorrect: false,
        explanation: 'Decrementing i from 0 causes an infinite loop since i becomes negative!'
      },
      {
        id: 'fix-break-flag',
        label: 'Add break when i === j',
        isCorrect: false,
        explanation: 'In even-length arrays, i is never equal to j (they cross from 1 to 2), so the break never triggers!'
      }
    ]
  },

  [MUTATIONS.DATA_LOSS_SWAP]: {
    id: MUTATIONS.DATA_LOSS_SWAP,
    name: 'Data Loss Swap (Missing Temp)',
    badge: 'Bug: No temp storage',
    type: 'danger',
    description: 'Overwrites arr[i] with arr[j] before saving arr[i] into a temporary variable, permanently erasing arr[i].',
    lineHighlights: {
      loopCondition: 2,
      jCalculation: 3,
      swap: [4, 5]
    },
    codeLines: [
      'function reverseArray(arr) {',
      '  for (let i = 0; i < Math.floor(arr.length / 2); i++) {',
      '    const j = arr.length - 1 - i;',
      '    // BUG: Missing temp variable! arr[i] is destroyed',
      '    arr[i] = arr[j];',
      '    arr[j] = arr[i]; // arr[i] was already changed to arr[j]!',
      '  }',
      '  return arr;',
      '}'
    ],
    bugExplanation: {
      title: 'Variable Overwrite & Data Loss',
      oddLengthBehavior: 'When arr[i] is assigned arr[j], the original value of arr[i] is overwritten in memory. Assigning arr[j] = arr[i] simply copies arr[j] back to itself, resulting in duplicate values.',
      evenLengthBehavior: 'The first half of the array is replaced with mirrored values from the second half, and the original values from the front are permanently lost.',
      fixHint: 'Store arr[i] in a temporary variable const temp = arr[i] before assigning arr[i] = arr[j].'
    },
    repairOptions: [
      {
        id: 'fix-temp-variable',
        label: 'Use temp variable: const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;',
        isCorrect: true,
        explanation: 'Correct! Temporary storage preserves the value in index i before overwriting it.'
      },
      {
        id: 'fix-destructuring',
        label: 'Use ES6 destructuring: [arr[i], arr[j]] = [arr[j], arr[i]];',
        isCorrect: true,
        explanation: 'Correct! Array destructuring performs a simultaneous atomic swap under the hood.'
      },
      {
        id: 'fix-swap-order',
        label: 'Just switch the order: arr[j] = arr[i]; arr[i] = arr[j];',
        isCorrect: false,
        explanation: 'Reversing the order has the exact same bug in reverse: arr[j] is overwritten and lost first!'
      }
    ]
  }
};
