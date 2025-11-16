import { InteractiveSVG, parseSVG } from 'svg-interactive';
import 'svg-interactive/styles';
import type { ExamplePreset } from '../presets';

const idsArraySVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <!--
      Sensor Inputs: Matched by exact IDs
      - Uses ids: ['temp-sensor-1', 'temp-sensor-2', 'pressure-gauge']
      - Field names are the full IDs (no extraction)
      - Perfect for specific elements or irregular naming
    -->
    <g id="temp-sensor-1">
      <rect x="50" y="50" width="150" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
      <text x="60" y="75" font-size="14" fill="#1976d2">Temp Sensor 1</text>
    </g>

    <g id="temp-sensor-2">
      <rect x="50" y="120" width="150" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
      <text x="60" y="145" font-size="14" fill="#1976d2">Temp Sensor 2</text>
    </g>

    <g id="pressure-gauge">
      <rect x="50" y="190" width="150" height="40" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
      <text x="60" y="215" font-size="14" fill="#1976d2">Pressure Gauge</text>
    </g>

    <!-- Arrows showing data flow -->
    <path d="M 200 70 L 340 130" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
    <path d="M 200 140 L 340 140" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
    <path d="M 200 210 L 340 150" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>

    <!--
      Output Field: Average Reading
      - Also matched by IDs array: ids: ['average-reading']
      - Computes average of all three sensors
    -->
    <g id="average-reading">
      <rect x="350" y="120" width="150" height="40" fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
      <text x="360" y="145" font-size="14" fill="#388e3c">Average Reading</text>
    </g>

    <!--
      Non-interactive decoration
      - id="background-decoration" is NOT in the IDs array
      - Will remain static (not interactive)
    -->
    <g id="background-decoration">
      <circle cx="500" cy="300" r="30" fill="#f5f5f5" stroke="#757575"/>
      <text x="500" y="305" text-anchor="middle" font-size="10" fill="#757575">Decor</text>
    </g>

    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10"
              refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#666"/>
      </marker>
    </defs>
  </svg>
`;

export const idsArrayPreset: ExamplePreset = {
  id: 'ids-array',
  title: 'IDs Array Matching',
  description: 'Match specific elements by exact IDs - perfect for 100+ sensors or irregular naming.',
  category: 'Advanced',
  tags: ['ids', 'sensors', 'explicit-matching'],
  accentColor: '#60a5fa',
  svgContent: idsArraySVG,
  patterns: [
    { ids: ['temp-sensor-1', 'temp-sensor-2', 'pressure-gauge'], type: 'input' },
    { ids: ['average-reading'], type: 'output' }
  ],
  theme: 'default',
  defaultInputs: {
    'temp-sensor-1': '72',
    'temp-sensor-2': '68',
    'pressure-gauge': '101.3'
  },
  onOutputCompute: (inputs) => {
    const temp1 = parseFloat(inputs['temp-sensor-1'] || '0');
    const temp2 = parseFloat(inputs['temp-sensor-2'] || '0');
    const pressure = parseFloat(inputs['pressure-gauge'] || '0');

    const average = (temp1 + temp2 + pressure) / 3;

    return {
      'average-reading': average.toFixed(2)
    };
  }
};

/**
 * IDs Array Matching - Explicit element selection
 *
 * This example demonstrates:
 * - Matching specific elements by exact IDs (not prefix/regex)
 * - Using ids array: { ids: ['sensor-1', 'sensor-2'], type: 'input' }
 * - Field names are the full IDs (no extraction)
 * - Non-listed elements remain non-interactive
 * - Perfect for complex diagrams with 100+ specific sensors
 *
 * Pattern Matching:
 * - Input pattern: { ids: ['temp-sensor-1', 'temp-sensor-2', 'pressure-gauge'], type: 'input' }
 * - Output pattern: { ids: ['average-reading'], type: 'output' }
 *
 * When to use IDs array:
 * - Fixed set of known elements
 * - Legacy SVGs with inconsistent naming
 * - You don't control the ID naming convention
 * - Maximum explicitness (e.g., 100+ specific sensors)
 *
 * Key features:
 * 1. Explicit control over which elements are interactive
 * 2. Works with any naming convention
 * 3. No accidental matches
 * 4. Easy to add/remove specific elements
 */
export function IdsArrayExample() {
  const { mappings } = parseSVG(idsArrayPreset.svgContent, {
    patterns: idsArrayPreset.patterns
  });

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>IDs Array Matching Example</h1>
      <p>
        This example matches only specific elements by their exact IDs.
        The "background-decoration" element is NOT interactive because it's not in the IDs array.
      </p>
      <p style={{ marginTop: '10px', color: '#666' }}>
        <strong>Use case:</strong> Perfect for complex diagrams where you need to specify exactly which
        100+ sensors or elements should be interactive, regardless of their naming pattern.
      </p>

      <InteractiveSVG
        mappings={mappings}
        svgContent={idsArrayPreset.svgContent}
        defaultInputs={idsArrayPreset.defaultInputs}
        onOutputCompute={idsArrayPreset.onOutputCompute}
        theme={idsArrayPreset.theme}
      />
    </div>
  );
}

