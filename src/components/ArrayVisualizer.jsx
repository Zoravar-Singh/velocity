import React from 'react';

/**
 * ArrayVisualizer renders an array of elements as visual cells with:
 * - Indices beneath each cell
 * - Variable pointers (i, j)
 * - State colors (matching, divergent, active, changed)
 */
export function ArrayVisualizer({
  array = [],
  pointers = {}, // e.g. { i: 0, j: 4 }
  highlightIndices = [],
  changedIndices = [],
  matchingIndices = null, // array of indices if diffing
  divergentIndices = null, // array of indices if diffing
  isInteractive = false,
  onCellClick = null,
  label = ''
}) {
  return (
    <div className="array-visualizer-container">
      {label && <div className="array-visualizer-label">{label}</div>}

      <div className="array-cells-track">
        {array.map((value, index) => {
          // Determine status flags
          const isPointerI = pointers.i === index;
          const isPointerJ = pointers.j === index;
          const isHighlighted = highlightIndices.includes(index);
          const isChanged = changedIndices.includes(index);
          
          let diffStatus = null;
          if (matchingIndices && matchingIndices.includes(index)) {
            diffStatus = 'matching';
          } else if (divergentIndices && divergentIndices.includes(index)) {
            diffStatus = 'divergent';
          }

          let cellClass = 'array-cell';
          if (diffStatus === 'matching') cellClass += ' cell-match';
          else if (diffStatus === 'divergent') cellClass += ' cell-divergent';
          else if (isChanged) cellClass += ' cell-changed';
          else if (isHighlighted) cellClass += ' cell-active';

          return (
            <div
              key={index}
              className={`cell-column ${isInteractive ? 'interactive' : ''}`}
              onClick={() => isInteractive && onCellClick && onCellClick(index)}
            >
              {/* Top pointer indicators */}
              <div className="pointer-header">
                {isPointerI && isPointerJ ? (
                  <span className="pointer-tag pointer-ij" title="Pointers i and j meet">
                    i, j ↓
                  </span>
                ) : (
                  <>
                    {isPointerI && (
                      <span className="pointer-tag pointer-i" title={`Left pointer i = ${index}`}>
                        i ↓
                      </span>
                    )}
                    {isPointerJ && (
                      <span className="pointer-tag pointer-j" title={`Right pointer j = ${index}`}>
                        j ↓
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Cell Value Box */}
              <div className={cellClass}>
                <span className="cell-value">{value !== undefined ? value : '?'}</span>
              </div>

              {/* Index Label */}
              <div className="cell-index">
                <span className="index-bracket">[</span>
                <span className="index-num">{index}</span>
                <span className="index-bracket">]</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
