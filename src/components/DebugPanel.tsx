import React from 'react';
import { DebugInfo } from '../types';

interface DebugPanelProps {
  debugInfo: DebugInfo;
}

/**
 * Debug panel component for displaying parsing and field information
 */
export const DebugPanel: React.FC<DebugPanelProps> = ({ debugInfo }) => {
  return (
    <div
      style={{
        marginTop: '20px',
        padding: '16px',
        background: '#F3F4F6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1F2937',
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
        Debug Information
      </h3>

      <div style={{ color: '#4B5563' }}>
        <p>Total Fields: {debugInfo.totalFields}</p>
        <p>Input Fields: {debugInfo.inputFields.length}</p>
        <p>Output Fields: {debugInfo.outputFields.length}</p>

        {debugInfo.matchingMode && (
          <p>
            <strong>Matching Mode:</strong>{' '}
            <span
              style={{
                background: debugInfo.matchingMode === 'data-id' ? '#DBEAFE' : '#D1FAE5',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              {debugInfo.matchingMode === 'data-id'
                ? 'data-id (draw.io)'
                : 'direct-id (custom SVG)'}
            </span>
          </p>
        )}

        {debugInfo.svgDimensions && (
          <p>
            SVG Dimensions: {debugInfo.svgDimensions.width} × {debugInfo.svgDimensions.height}
          </p>
        )}

        {debugInfo.errors && debugInfo.errors.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <strong style={{ color: '#DC2626' }}>Errors:</strong>
            <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
              {debugInfo.errors.map((error, idx) => (
                <li key={idx} style={{ color: '#DC2626' }}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <details style={{ marginTop: '16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '500' }}>View Field Details</summary>
          <pre
            style={{
              marginTop: '8px',
              padding: '12px',
              background: 'white',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '11px',
            }}
          >
            {JSON.stringify(
              {
                inputFields: debugInfo.inputFields,
                outputFields: debugInfo.outputFields,
                rawMappings: debugInfo.rawMappings,
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </div>
  );
};
