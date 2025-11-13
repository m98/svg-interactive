import { InteractiveSVG } from 'svg-interactive-diagram';
import 'svg-interactive-diagram/styles';
import { useState } from 'react';

/**
 * Temperature Converter
 *
 * Convert between Celsius and Fahrenheit.
 * Demonstrates bidirectional conversion and number formatting.
 */
export function TemperatureConverter() {
  const [lastChanged, setLastChanged] = useState<'celsius' | 'fahrenheit'>('celsius');

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Temperature Converter</h1>
      <p>Enter a temperature in either Celsius or Fahrenheit.</p>

      <InteractiveSVG
        svgContent={`
          <svg xmlns="http://www.w3.org/2000/svg" width="550" height="200" viewBox="0 0 550 200">
            <!-- Title -->
            <text x="275" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">
              Temperature Converter
            </text>

            <!-- Input Celsius -->
            <g id="input-celsius">
              <rect x="50" y="80" width="180" height="45"
                    fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
              <text x="60" y="107" font-size="14" fill="#666">Celsius (°C)</text>
            </g>

            <!-- Bidirectional arrows -->
            <g>
              <path d="M 240 95 L 300 95" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
              <path d="M 300 110 L 240 110" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
              <text x="270" y="93" text-anchor="middle" font-size="12" fill="#666">⇄</text>
            </g>

            <!-- Output Fahrenheit -->
            <g id="output-fahrenheit">
              <rect x="310" y="80" width="180" height="45"
                    fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
              <text x="320" y="107" font-size="14" fill="#666">Fahrenheit (°F)</text>
            </g>

            <!-- Formula hint -->
            <text x="275" y="160" text-anchor="middle" font-size="12" fill="#999">
              Formula: °F = (°C × 9/5) + 32
            </text>

            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10"
                      refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#999"/>
              </marker>
            </defs>
          </svg>
        `}
        config={{
          patterns: [
            { prefix: 'input-', type: 'input' },
            { prefix: 'output-', type: 'output' }
          ]
        }}
        onInputChange={(name) => {
          if (name === 'celsius') {
            setLastChanged('celsius');
          }
        }}
        onOutputCompute={(inputs) => {
          const celsius = parseFloat(inputs.celsius || '0');
          const fahrenheit = (celsius * 9/5) + 32;

          return {
            fahrenheit: isNaN(fahrenheit)
              ? '0.0'
              : fahrenheit.toFixed(1)
          };
        }}
        theme="default"
      />

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Common Temperatures:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Water freezes: 0°C = 32°F</li>
          <li>Room temperature: 20°C = 68°F</li>
          <li>Body temperature: 37°C = 98.6°F</li>
          <li>Water boils: 100°C = 212°F</li>
        </ul>
      </div>
    </div>
  );
}
