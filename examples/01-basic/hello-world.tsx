import { InteractiveSVG } from 'svg-interactive-diagram';
import 'svg-interactive-diagram/styles';

/**
 * Hello World - Simplest possible example
 *
 * Single input field, single output field.
 * Output shows "Hello, [name]!"
 */
export function HelloWorld() {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Hello World Example</h1>
      <p>Type your name in the input field.</p>

      <InteractiveSVG
        svgContent={`
          <svg xmlns="http://www.w3.org/2000/svg" width="500" height="150" viewBox="0 0 500 150">
            <!-- Input field for name -->
            <g id="input-name">
              <rect x="50" y="50" width="150" height="40"
                    fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
              <text x="60" y="75" font-size="14" fill="#666">Name</text>
            </g>

            <!-- Arrow -->
            <path d="M 210 70 L 270 70" stroke="#666" stroke-width="2"
                  marker-end="url(#arrow)"/>

            <!-- Output field for greeting -->
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
        `}
        config={{
          patterns: [
            { prefix: 'input-', type: 'input' },
            { prefix: 'output-', type: 'output' }
          ]
        }}
        onOutputCompute={(inputs) => ({
          greeting: inputs.name ? `Hello, ${inputs.name}!` : 'Hello, World!'
        })}
      />
    </div>
  );
}
