import { InteractiveSVG, parseSVG } from 'svg-interactive';
import 'svg-interactive/styles';
import type { ExamplePreset } from '../presets';

const helloWorldSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="500" height="150" viewBox="0 0 500 150">
    <!--
      Input Field: Name
      - id="input-name" matches pattern "input-" to become an input field
      - Field name extracted: "name"
      - User types their name here
    -->
    <g id="input-name">
      <rect x="50" y="50" width="150" height="40"
            fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
      <text x="60" y="75" font-size="14" fill="#666">Name</text>
    </g>

    <!-- Arrow showing data flow from input to output -->
    <path d="M 210 70 L 270 70" stroke="#666" stroke-width="2"
          marker-end="url(#arrow)"/>

    <!--
      Output Field: Greeting
      - id="output-greeting" matches pattern "output-" to become an output field
      - Field name extracted: "greeting"
      - Value computed by onOutputCompute
      - Shows "Hello, [name]!" or "Hello, World!" if empty
    -->
    <g id="output-greeting">
      <rect x="280" y="50" width="200" height="40"
            fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
      <text x="290" y="75" font-size="14" fill="#666">Greeting</text>
    </g>

    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10"
              refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#666"/>
      </marker>
    </defs>
  </svg>
`;

export const helloWorldPreset: ExamplePreset = {
  id: 'hello-world',
  title: 'Hello World',
  description: 'Single input, single output. Perfect to get familiar with field prefixes.',
  category: 'Basics',
  tags: ['inputs', 'outputs', 'prefixes'],
  accentColor: '#7dd3fc',
  svgContent: helloWorldSVG,
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ],
  theme: 'default',
  defaultInputs: { name: 'Ada Lovelace' },
  onOutputCompute: (inputs) => ({
    greeting: inputs.name ? `Hello, ${inputs.name}!` : 'Hello, World!'
  })
};

/**
 * Hello World - Simplest possible example
 *
 * This example demonstrates:
 * - Single input field (name) for text input
 * - Single output field (greeting) that responds to input
 * - Basic string concatenation in onOutputCompute
 * - Conditional logic: shows default message when input is empty
 * - Pattern matching with id attributes
 *
 * Pattern Matching:
 * - Input pattern: { prefix: 'input-', type: 'input' }
 * - Output pattern: { prefix: 'output-', type: 'output' }
 *
 * Behavior:
 * - With input: Shows "Hello, [name]!"
 * - Without input: Shows "Hello, World!"
 *
 * Perfect first example to understand the library's core concepts:
 * 1. Define SVG elements with id attributes
 * 2. Configure patterns to match those ids
 * 3. Parse SVG to extract field mappings
 * 4. Render with InteractiveSVG component
 * 5. Define computation logic in onOutputCompute
 */
export function HelloWorld() {
  const { mappings } = parseSVG(helloWorldPreset.svgContent, {
    patterns: helloWorldPreset.patterns
  });

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Hello World Example</h1>
      <p>Type your name in the input field.</p>

      <InteractiveSVG
        mappings={mappings}
        svgContent={helloWorldPreset.svgContent}
        defaultInputs={helloWorldPreset.defaultInputs}
        onOutputCompute={helloWorldPreset.onOutputCompute}
        theme={helloWorldPreset.theme}
      />
    </div>
  );
}
