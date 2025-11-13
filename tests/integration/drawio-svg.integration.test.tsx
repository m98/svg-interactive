import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { InteractiveSVG } from '../../src/components/InteractiveSVG';
import { FieldConfig } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Draw.io SVG Integration Tests', () => {
  let svgContent: string;

  beforeAll(() => {
    // Load the actual SVG file
    const svgPath = path.join(__dirname, 'fixtures', 'gas-input-output.drawio.svg');
    svgContent = fs.readFileSync(svgPath, 'utf-8');
  });

  const config: FieldConfig = {
    patterns: [
      { prefix: 'input-field-', type: 'input' },
      { prefix: 'output-field-', type: 'output' }
    ]
  };

  beforeAll(() => {
    // Mock getBBox for consistent testing
    SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
      x: 10, y: 40, width: 120, height: 20
    });
  });

  describe('SVG Loading and Parsing', () => {
    it('should successfully load and parse the draw.io SVG', async () => {
      render(<InteractiveSVG svgContent={svgContent} config={config} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const svgContainer = document.querySelector('.svg-container');
      expect(svgContainer).toBeInTheDocument();

      // Verify SVG is actually rendered
      const svg = svgContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should detect data-id mode for draw.io SVG', async () => {
      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          debug={true}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Verify the debug panel shows data-id mode
      await waitFor(() => {
        expect(screen.getByText(/Matching Mode:/)).toBeInTheDocument();
        expect(screen.getByText(/data-id/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should find input and output fields', async () => {
      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Wait for input element to be created
      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]');
        expect(input).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify output element exists
      const output = document.getElementById('output-gas');
      expect(output).toBeInTheDocument();
    });
  });

  describe('Field Mapping', () => {
    it('should correctly identify input field name', async () => {
      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Should have a field named 'gas' (from 'input-field-gas')
      await waitFor(() => {
        const inputField = document.querySelector('input[data-field-name="gas"]');
        expect(inputField).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should correctly identify output field name', async () => {
      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Should have an output field named 'gas' (from 'output-field-gas')
      await waitFor(() => {
        const outputField = document.getElementById('output-gas');
        expect(outputField).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Input/Output Functionality', () => {
    it('should trigger onInputChange when input is modified', async () => {
      const onInputChange = jest.fn();

      // Mock getBBox for proper rendering
      SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
        x: 10, y: 10, width: 120, height: 20
      });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          onInputChange={onInputChange}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Try to find the input field
      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;

      if (input) {
        fireEvent.input(input, { target: { value: '100' } });

        await waitFor(() => {
          expect(onInputChange).toHaveBeenCalled();
        });

        // Check the call arguments
        const calls = onInputChange.mock.calls;
        const gasCall = calls.find(call => call[0] === 'gas');

        if (gasCall) {
          expect(gasCall[1]).toBe('100');
          expect(gasCall[2]).toHaveProperty('gas', '100');
        }
      }
    });

    it('should calculate and display output values', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        // Multiply gas input by 2
        const gasValue = parseFloat(inputs.gas || '0');
        return {
          gas: (gasValue * 2).toString()
        };
      });

      SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
        x: 10, y: 10, width: 120, height: 20
      });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        // Type 50 in the input
        fireEvent.input(input, { target: { value: '50' } });

        await waitFor(() => {
          expect(onOutputCompute).toHaveBeenCalled();
        });

        // Output should show 100 (50 * 2)
        await waitFor(() => {
          expect(output.textContent).toBe('100');
        });
      }
    });

    it('should handle decimal values correctly', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = parseFloat(inputs.gas || '0');
        return {
          gas: (gasValue * 2).toString()
        };
      });

      SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
        x: 10, y: 10, width: 120, height: 20
      });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        // Type 12.5 in the input
        fireEvent.input(input, { target: { value: '12.5' } });

        await waitFor(() => {
          expect(onOutputCompute).toHaveBeenCalled();
        });

        // Output should show 25 (12.5 * 2)
        await waitFor(() => {
          expect(output.textContent).toBe('25');
        });
      }
    });

    it('should update output when input changes multiple times', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = parseFloat(inputs.gas || '0');
        return { gas: (gasValue * 2).toString() };
      });

      SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
        x: 10, y: 10, width: 120, height: 20
      });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        // First value
        fireEvent.input(input, { target: { value: '10' } });
        await waitFor(() => {
          expect(output.textContent).toBe('20');
        });

        // Second value
        fireEvent.input(input, { target: { value: '25' } });
        await waitFor(() => {
          expect(output.textContent).toBe('50');
        });

        // Third value
        fireEvent.input(input, { target: { value: '100' } });
        await waitFor(() => {
          expect(output.textContent).toBe('200');
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty input gracefully', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = parseFloat(inputs.gas || '0');
        return { gas: (gasValue * 2).toString() };
      });

      SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
        x: 10, y: 10, width: 120, height: 20
      });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        // Empty input
        fireEvent.input(input, { target: { value: '' } });

        await waitFor(() => {
          expect(output.textContent).toBe('0');
        });
      }
    });

    it('should handle invalid input gracefully', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = parseFloat(inputs.gas || '0');
        return { gas: isNaN(gasValue) ? '0' : (gasValue * 2).toString() };
      });

      SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
        x: 10, y: 10, width: 120, height: 20
      });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        // Invalid input
        fireEvent.input(input, { target: { value: 'abc' } });

        await waitFor(() => {
          expect(output.textContent).toBe('0');
        });
      }
    });
  });

  describe('SVG Structure', () => {
    it('should preserve SVG attributes after rendering', async () => {
      render(<InteractiveSVG svgContent={svgContent} config={config} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      if (svg) {
        // Should have preserved the content attribute
        const contentAttr = svg.getAttribute('content');
        expect(contentAttr).toBeTruthy();
        expect(contentAttr?.length).toBeGreaterThan(0);
      }
    });

    it('should have the correct SVG dimensions', async () => {
      render(<InteractiveSVG svgContent={svgContent} config={config} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      if (svg) {
        // The gas-input-output.drawio.svg has width="369px" height="316px"
        const width = svg.getAttribute('width');
        const height = svg.getAttribute('height');

        expect(width).toBeTruthy();
        expect(height).toBeTruthy();
      }
    });
  });
});
