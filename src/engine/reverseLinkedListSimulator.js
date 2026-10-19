/**
 * Generates an immutable, line-by-line trace for iterative linked-list reversal.
 * A node is represented as { id, value, next }, where `next` is a node id or null.
 */
export function generateLinkedListTrace(values) {
  const source = Array.isArray(values) && values.length >= 2 ? values : [10, 20, 30, 40];
  const nodes = source.map((value, index) => ({
    id: `node-${index}`,
    value,
    next: index < source.length - 1 ? `node-${index + 1}` : null
  }));
  const trace = [];
  let head = nodes[0].id;
  let previous = null;
  let current = head;

  const snapshot = (data) => trace.push({
    stepNumber: trace.length,
    nodes: nodes.map(node => ({ ...node })),
    head,
    pointers: { previous, current, next: null, ...(data.pointers || {}) },
    ...data
  });

  snapshot({ activeLine: 1, operationName: 'Function entry', description: `The head points to node ${source[0]}. Each node stores a value and a next reference.`, changedId: null });
  snapshot({ activeLine: 2, operationName: 'Initialize previous', description: 'previous starts at null because the new tail will not point to another node.', changedId: null });

  while (current !== null) {
    const currentNode = nodes.find(node => node.id === current);
    const next = currentNode.next;
    snapshot({ activeLine: 4, operationName: 'Save next node', description: `Save ${next ? `the link to ${nodes.find(node => node.id === next).value}` : 'null'} before changing the current node.`, pointers: { previous, current, next }, changedId: null });
    currentNode.next = previous;
    snapshot({ activeLine: 5, operationName: 'Reverse current link', description: `Node ${currentNode.value}.next now points ${previous ? `back to ${nodes.find(node => node.id === previous).value}` : 'to null'}.`, pointers: { previous, current, next }, changedId: current });
    previous = current;
    snapshot({ activeLine: 6, operationName: 'Advance previous', description: `previous moves to node ${currentNode.value}; it is the beginning of the reversed portion.`, pointers: { previous, current, next }, changedId: null });
    current = next;
    snapshot({ activeLine: 7, operationName: 'Advance current', description: current ? `current moves forward to node ${nodes.find(node => node.id === current).value}.` : 'current is null, so every node has been processed.', pointers: { previous, current, next: null }, changedId: null });
  }

  head = previous;
  snapshot({ activeLine: 9, operationName: 'Return new head', description: `Return node ${nodes.find(node => node.id === head).value} as the new head. The list links now run in reverse.`, changedId: head, finished: true });
  return trace;
}
