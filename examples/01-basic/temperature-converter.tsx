import { SvgInteractive, parseSVG } from 'svg-interactive';
import 'svg-interactive/styles';
import type { ExamplePreset } from '../presets';

const temperatureSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="550" height="200" viewBox="0 0 550 200">
    <!-- Temperature Converter Title -->
    <text x="275" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">
      Temperature Converter
    </text>

    <!--
      Input Field: Celsius
      - id="input-celsius" matches pattern "input-" to become an input field
      - Field name extracted: "celsius"
      - User enters temperature in Celsius
    -->
    <g id="input-celsius">
      <rect x="50" y="80" width="180" height="45"
            fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
      <text x="60" y="107" font-size="14" fill="#666">Celsius (°C)</text>
    </g>

    <!-- Bidirectional conversion indicator (visual only) -->
    <g>
      <path d="M 240 95 L 300 95" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
      <path d="M 300 110 L 240 110" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="270" y="93" text-anchor="middle" font-size="12" fill="#666">⇄</text>
    </g>

    <!--
      Output Field: Fahrenheit
      - id="output-fahrenheit" matches pattern "output-" to become an output field
      - Field name extracted: "fahrenheit"
      - Value computed by onOutputCompute using formula: (°C × 9/5) + 32
      - Formatted to 1 decimal place
    -->
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
`;

export const temperaturePreset: ExamplePreset = {
  id: 'temperature-converter',
  title: 'Temperature Converter',
  description: 'Bidirectional example that converts Celsius to Fahrenheit and showcases numeric formatting.',
  category: 'Basics',
  tags: ['numbers', 'formatting', 'bidirectional'],
  accentColor: '#fcd34d',
  svgContent: temperatureSvg,
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ],
  theme: 'default',
  defaultInputs: { celsius: '21' },
  onOutputCompute: (inputs) => {
    // Use || instead of ?? to treat empty string as falsy
    const celsius = parseFloat(inputs.celsius || '0');
    const fahrenheit = (celsius * 9) / 5 + 32;

    return {
      // Format to 1 decimal place, fallback to '0.0' if NaN
      fahrenheit: Number.isNaN(fahrenheit) ? '0.0' : fahrenheit.toFixed(1)
    };
  }
};

/**
 * Temperature Converter - Celsius to Fahrenheit
 *
 * This example demonstrates:
 * - Single input field (celsius) with numeric values
 * - Single computed output field (fahrenheit)
 * - Mathematical computation: °F = (°C × 9/5) + 32
 * - Number formatting with toFixed(1) for 1 decimal place
 * - Graceful handling of invalid/empty inputs with NaN check
 *
 * Pattern Matching:
 * - Input pattern: { prefix: 'input-', type: 'input' }
 * - Output pattern: { prefix: 'output-', type: 'output' }
 *
 * Key Features:
 * - Real-time conversion as user types
 * - Clean numeric formatting
 * - Educational reference table with common temperatures
 */
export function TemperatureConverter() {
  const { mappings } = parseSVG(temperaturePreset.svgContent, {
    patterns: temperaturePreset.patterns
  });

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Temperature Converter</h1>
      <p>Enter a temperature in either Celsius or Fahrenheit.</p>

      <SvgInteractive
        mappings={mappings}
        svgContent={temperaturePreset.svgContent}
        defaultInputs={temperaturePreset.defaultInputs}
        onOutputCompute={temperaturePreset.onOutputCompute}
        theme={temperaturePreset.theme}
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
