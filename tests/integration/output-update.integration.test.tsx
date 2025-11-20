import React, { StrictMode } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SvgInteractive } from '../../src/components/SvgInteractive';
import { parseSVG } from '../../src/parsers/generic';

describe('Output Update Integration Tests', () => {
  const temperatureSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="550" height="200" viewBox="0 0 550 200">
      <g id="input-celsius">
        <rect x="50" y="80" width="180" height="45"
              fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
        <text x="60" y="107" font-size="14" fill="#666">Celsius (°C)</text>
      </g>

      <g id="output-fahrenheit">
        <rect x="310" y="80" width="180" height="45"
              fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
        <text x="320" y="107" font-size="14" fill="#666">Fahrenheit (°F)</text>
      </g>
    </svg>
  `;

  beforeEach(() => {
    // Mock getBBox for consistent testing
    const mockGetBBox = jest.fn().mockReturnValue({
      x: 50,
      y: 80,
      width: 180,
      height: 45,
      top: 80,
      right: 230,
      bottom: 125,
      left: 50,
    });

    SVGGraphicsElement.prototype.getBBox = mockGetBBox;

    if (typeof SVGRectElement !== 'undefined') {
      Object.setPrototypeOf(SVGRectElement.prototype, SVGGraphicsElement.prototype);
    }
  });

  it('should show initial computed output value immediately', async () => {
    const { mappings } = parseSVG(temperatureSvg, {
      patterns: [
        { prefix: 'input-', type: 'input' },
        { prefix: 'output-', type: 'output' },
      ],
    });

    const onOutputCompute = jest.fn((inputs) => {
      const celsius = parseFloat(inputs.celsius || '0');
      const fahrenheit = (celsius * 9) / 5 + 32;
      return {
        fahrenheit: Number.isNaN(fahrenheit) ? '0.0' : fahrenheit.toFixed(1),
      };
    });

    render(
      <SvgInteractive
        mappings={mappings}
        svgContent={temperatureSvg}
        onOutputCompute={onOutputCompute}
      />
    );

    // Wait for the component to render
    await waitFor(() => {
      const input = document.querySelector('input[data-field-name="celsius"]');
      expect(input).toBeInTheDocument();
    });

    // Give React StrictMode time to complete double-mount cycle
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check that output was computed immediately (0°C = 32.0°F)
    const outputDiv = document.getElementById('output-field-fahrenheit');
    expect(outputDiv).toBeInTheDocument();
    expect(outputDiv?.textContent).toBe('32.0');
  });

  it('should update output when input changes', async () => {
    const { mappings } = parseSVG(temperatureSvg, {
      patterns: [
        { prefix: 'input-', type: 'input' },
        { prefix: 'output-', type: 'output' },
      ],
    });

    const onOutputCompute = jest.fn((inputs) => {
      const celsius = parseFloat(inputs.celsius || '0');
      const fahrenheit = (celsius * 9) / 5 + 32;
      return {
        fahrenheit: Number.isNaN(fahrenheit) ? '0.0' : fahrenheit.toFixed(1),
      };
    });

    render(
      <SvgInteractive
        mappings={mappings}
        svgContent={temperatureSvg}
        onOutputCompute={onOutputCompute}
      />
    );

    await waitFor(() => {
      const input = document.querySelector('input[data-field-name="celsius"]');
      expect(input).toBeInTheDocument();
    });

    const input = document.querySelector('input[data-field-name="celsius"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Initial value should be 32.0 (0°C)
    const outputDiv = document.getElementById('output-field-fahrenheit');
    expect(outputDiv?.textContent).toBe('32.0');

    // Change input to 100°C
    fireEvent.input(input, { target: { value: '100' } });

    // Wait for output to update to 212.0°F
    await waitFor(() => {
      const outputDiv = document.getElementById('output-field-fahrenheit');
      expect(outputDiv?.textContent).toBe('212.0');
    });

    // Verify onOutputCompute was called
    expect(onOutputCompute).toHaveBeenCalled();
  });

  it('should handle multiple rapid input changes', async () => {
    const { mappings } = parseSVG(temperatureSvg, {
      patterns: [
        { prefix: 'input-', type: 'input' },
        { prefix: 'output-', type: 'output' },
      ],
    });

    const onOutputCompute = (inputs: Record<string, string>) => {
      const celsius = parseFloat(inputs.celsius || '0');
      const fahrenheit = (celsius * 9) / 5 + 32;
      return {
        fahrenheit: Number.isNaN(fahrenheit) ? '0.0' : fahrenheit.toFixed(1),
      };
    };

    render(
      <SvgInteractive
        mappings={mappings}
        svgContent={temperatureSvg}
        onOutputCompute={onOutputCompute}
      />
    );

    await waitFor(() => {
      const input = document.querySelector('input[data-field-name="celsius"]');
      expect(input).toBeInTheDocument();
    });

    const input = document.querySelector('input[data-field-name="celsius"]') as HTMLInputElement;
    const outputDiv = document.getElementById('output-field-fahrenheit');

    // Rapidly change values
    fireEvent.input(input, { target: { value: '10' } });
    await waitFor(() => {
      expect(outputDiv?.textContent).toBe('50.0');
    });

    fireEvent.input(input, { target: { value: '20' } });
    await waitFor(() => {
      expect(outputDiv?.textContent).toBe('68.0');
    });

    fireEvent.input(input, { target: { value: '30' } });
    await waitFor(() => {
      expect(outputDiv?.textContent).toBe('86.0');
    });

    // Should still only have one output div
    const outputDivs = document.querySelectorAll('#output-field-fahrenheit');
    expect(outputDivs.length).toBe(1);
  });
});
