import { SvgInteractive, parseSVG } from 'svg-interactive';
import 'svg-interactive/styles';
import type { ExamplePreset } from '../presets';

const calculatorSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="650" height="250" viewBox="0 0 650 250">
    <!-- Calculator Title -->
    <text x="325" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">
      Calculator
    </text>

    <!--
      Input Field A
      - id="input-a" matches pattern "input-" to become an input field
      - The library will overlay an HTML input at this element's position
      - Field name extracted: "a"
    -->
    <g id="input-a">
      <rect x="50" y="80" width="120" height="40"
            fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
      <text x="60" y="105" font-size="14" fill="#666">Number A</text>
    </g>

    <!--
      Input Field B
      - id="input-b" matches pattern "input-" to become an input field
      - Field name extracted: "b"
    -->
    <g id="input-b">
      <rect x="50" y="150" width="120" height="40"
            fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
      <text x="60" y="175" font-size="14" fill="#666">Number B</text>
    </g>

    <!-- Operation symbol -->
    <circle cx="300" cy="140" r="35" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
    <text x="300" y="150" text-anchor="middle" font-size="20" font-weight="bold" fill="#f57c00">
      ÷×+
    </text>

    <!-- Arrows from inputs to operation -->
    <path d="M 170 100 L 265 125" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
    <path d="M 170 170 L 265 155" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>

    <!-- Arrows showing data flow from operation to outputs -->
    <path d="M 335 125 L 430 100" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>
    <path d="M 335 155 L 430 170" stroke="#999" stroke-width="2" marker-end="url(#arrow)"/>

    <!--
      Output Field: Sum
      - id="output-sum" matches pattern "output-" to become an output field
      - Field name extracted: "sum"
      - Value computed by onOutputCompute: a + b
      - Auto-updates when any input changes
    -->
    <g id="output-sum">
      <rect x="430" y="80" width="170" height="40"
            fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
      <text x="440" y="105" font-size="14" fill="#666">Sum (A + B)</text>
    </g>

    <!--
      Output Field: Product
      - id="output-product" matches pattern "output-" to become an output field
      - Field name extracted: "product"
      - Value computed by onOutputCompute: a × b
      - Auto-updates when any input changes
    -->
    <g id="output-product">
      <rect x="430" y="150" width="170" height="40"
            fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
      <text x="440" y="175" font-size="14" fill="#666">Product (A × B)</text>
    </g>

    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10"
              refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#999"/>
      </marker>
    </defs>
  </svg>
`;

export const calculatorPreset: ExamplePreset = {
  id: 'calculator',
  title: 'Dual Output Calculator',
  description: 'Two inputs mapped to sum and product outputs to highlight multi-field workflows.',
  category: 'Basics',
  tags: ['math', 'outputs', 'multi-field'],
  accentColor: '#c084fc',
  svgContent: calculatorSvg,
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ],
  theme: 'default',
  defaultInputs: { a: '12', b: '8' },
  onOutputCompute: (inputs) => {
    // Use || instead of ?? to treat empty string as falsy
    const a = parseFloat(inputs.a || '0');
    const b = parseFloat(inputs.b || '0');

    return {
      sum: (a + b).toString(),
      product: (a * b).toString()
    };
  }
};

/**
 * Calculator - Basic two-number calculator
 *
 * This example demonstrates:
 * - Multiple input fields (a, b) with id-based pattern matching
 * - Multiple output fields (sum, product) computed from inputs
 * - Real-time computation using onOutputCompute callback
 * - SVG element identification using id attributes with "input-" and "output-" prefixes
 * - Automatic field name extraction (e.g., "input-a" → field name "a")
 *
 * Pattern Matching:
 * - Input pattern: { prefix: 'input-', type: 'input' }
 * - Output pattern: { prefix: 'output-', type: 'output' }
 *
 * Computation Logic:
 * - Sum: Adds both input values (a + b)
 * - Product: Multiplies both input values (a × b)
 * - Handles empty inputs by defaulting to 0
 */
export function Calculator() {
  const { mappings } = parseSVG(calculatorPreset.svgContent, {
    patterns: calculatorPreset.patterns
  });

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Simple Calculator</h1>
      <p>Enter two numbers to see their sum and product.</p>

      <SvgInteractive
        mappings={mappings}
        svgContent={calculatorPreset.svgContent}
        defaultInputs={calculatorPreset.defaultInputs}
        onOutputCompute={calculatorPreset.onOutputCompute}
        theme={calculatorPreset.theme}
      />
    </div>
  );
}
