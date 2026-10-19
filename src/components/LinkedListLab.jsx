import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, CircleDot, Code2, Cpu, GitCompare, Lightbulb } from 'lucide-react';
import { generateLinkedListTrace } from '../engine/reverseLinkedListSimulator.js';
import { ExecutionControls } from './ExecutionControls.jsx';

const STARTING_VALUES = [10, 20, 30, 40];

function ListDiagram({ step }) {
  const { nodes, head, pointers, changedId } = step;
  return (
    <div className="linked-list-diagram" aria-label="Linked list memory diagram">
      <div className="linked-head-label">head <ArrowRight size={15} /></div>
      <div className="linked-node-row">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div className={`linked-node ${node.id === changedId ? 'linked-node-changed' : ''} ${node.id === head ? 'linked-node-head' : ''}`}>
              <span className="linked-node-value">{node.value}</span>
              <span className="linked-node-next">next: {node.next ? nodes.find(item => item.id === node.next)?.value : 'null'}</span>
              <div className="linked-pointer-tags">
                {pointers.previous === node.id && <span>previous</span>}
                {pointers.current === node.id && <span>current</span>}
                {pointers.next === node.id && <span>next</span>}
              </div>
            </div>
            {index < nodes.length - 1 && <ArrowRight className="linked-arrow" size={20} />}
          </React.Fragment>
        ))}
        <span className="linked-null">null</span>
      </div>
    </div>
  );
}

export function LinkedListLab() {
  const [values, setValues] = useState(STARTING_VALUES);
  const [draft, setDraft] = useState(STARTING_VALUES.join(', '));
  const [error, setError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const trace = useMemo(() => generateLinkedListTrace(values), [values]);
  const step = trace[stepIndex];

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (stepIndex >= trace.length - 1) { setIsPlaying(false); return undefined; }
    const timer = setTimeout(() => setStepIndex(index => Math.min(index + 1, trace.length - 1)), 1100);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, trace.length]);

  const reset = () => { setStepIndex(0); setIsPlaying(false); setPrediction(''); setPredictionResult(null); };
  const applyValues = (event) => {
    event.preventDefault();
    const parsed = draft.split(',').map(value => value.trim()).filter(Boolean).map(Number);
    if (parsed.length < 2 || parsed.length > 6 || parsed.some(value => !Number.isInteger(value))) {
      setError('Use 2–6 comma-separated integers.');
      return;
    }
    setValues(parsed); setError(''); reset();
  };
  const checkPrediction = () => {
    const expected = step.pointers.current === null ? 'null' : step.nodes.find(node => node.id === step.pointers.current)?.value;
    setPredictionResult(String(prediction).trim() === String(expected) ? 'correct' : `The current node is ${expected}.`);
  };
  const goToStep = (index) => { setIsPlaying(false); setStepIndex(Math.max(0, Math.min(trace.length - 1, index))); };

  return (
    <main className="main-workspace linked-workspace">
      <div className="workspace-column sidebar-column"><section className="panel code-panel linked-code-sidebar"><div className="panel-header"><div className="panel-title-group"><Code2 size={16} className="text-accent" /><h2 className="panel-title">Algorithm & Source Code</h2></div><span className="mutation-pill badge-safe">LINKED LIST</span></div><div className="code-container"><pre className="code-block linked-code"><code>{['function reverse(head) {', '  let previous = null;', '  let current = head;', '  while (current !== null) {', '    const next = current.next;', '    current.next = previous;', '    previous = current;', '    current = next;', '  }', '  return previous;', '}'].map((line, index) => <div key={index} className={`code-line ${step.activeLine === index + 1 ? 'line-active' : ''}`}><span className="line-number">{index + 1}</span><span className="line-indicator">{step.activeLine === index + 1 ? '▶' : ' '}</span><span className="line-content">{line}</span></div>)}</code></pre></div><div className="array-config-bar"><div className="array-config-header"><div className="flex items-center gap-2"><CircleDot size={14} className="text-secondary" /><span className="text-xs uppercase font-semibold text-secondary">Linked List Input</span></div></div><form onSubmit={applyValues} className="custom-input-form"><div className="input-group"><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="10, 20, 30, 40" /><button className="apply-btn" type="submit">Apply</button></div>{error && <div className="input-error-msg">{error}</div>}</form><div className="current-array-display"><span className="text-xs text-secondary">Current Nodes:</span><span className="font-mono text-sm text-foreground">{values.join(' → ')} → null</span></div></div></section></div>
      <div className="workspace-column main-content-column"><div className="comparison-arena-wrapper"><div className="comparison-banner"><div className="banner-left"><GitCompare size={18} className="text-accent" /><span className="banner-title">LAB WORKSPACE:</span><span className="linked-banner-title">Reverse a Linked List</span></div></div><div className="comparison-grid two-column-grid"><section className="panel mental-model-panel staging linked-predict-panel"><div className="panel-header"><div className="panel-title-group"><Brain size={18} className="text-accent" /><h2 className="panel-title">Your Mental Model</h2></div><span className="text-xs text-secondary font-mono">Pointer Prediction</span></div><div className="panel-body"><p className="prediction-prompt">Predict which node <code>current</code> points to. Type <code>null</code> at the end.</p><div className="linked-prediction-input"><input value={prediction} onChange={event => setPrediction(event.target.value)} placeholder="e.g. 20 or null" /><button className="action-btn commit-btn" onClick={checkPrediction}><Lightbulb size={16} /> Check Prediction</button></div>{predictionResult && <p className={predictionResult === 'correct' ? 'linked-correct' : 'linked-incorrect'}>{predictionResult === 'correct' ? 'Correct — your pointer model matches execution.' : predictionResult}</p>}<div className="linked-concept-card"><strong>Why save <code>next</code>?</strong><span>Changing <code>current.next</code> would otherwise disconnect the remaining nodes.</span></div></div></section><section className="panel actual-execution-panel linked-execution-panel"><div className="panel-header"><div className="panel-title-group"><Cpu size={18} className="text-accent" /><h2 className="panel-title">Actual Execution</h2></div><span className="font-mono text-xs text-secondary">{step.operationName}</span></div><div className="panel-body"><ListDiagram step={step} /><div className="engine-variables-grid linked-variable-grid"><div className="variable-card"><span className="var-label">previous</span><span className="var-val font-mono">{step.pointers.previous ? step.nodes.find(node => node.id === step.pointers.previous)?.value : 'null'}</span></div><div className="variable-card"><span className="var-label">current</span><span className="var-val font-mono">{step.pointers.current ? step.nodes.find(node => node.id === step.pointers.current)?.value : 'null'}</span></div><div className="variable-card"><span className="var-label">next (saved)</span><span className="var-val font-mono text-accent">{step.pointers.next ? step.nodes.find(node => node.id === step.pointers.next)?.value : '—'}</span></div></div><p className="linked-description">{step.description}</p></div></section></div></div><ExecutionControls currentStepIndex={stepIndex} totalSteps={trace.length} isPlaying={isPlaying} playbackSpeed={1100} currentStep={step} onStepForward={() => goToStep(stepIndex + 1)} onStepBackward={() => goToStep(stepIndex - 1)} onTogglePlay={() => setIsPlaying(playing => !playing)} onReset={reset} onGoToStep={goToStep} onChangeSpeed={() => {}} /></div>
    </main>
  );
}
