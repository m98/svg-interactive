import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { InteractiveSVG } from '../../src/components/InteractiveSVG';
import { FieldConfig } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Simple SVG Integration Tests', () => {
  let svgContent: string;

  beforeAll(() => {
    const svgPath = path.join(__dirname, 'fixtures', 'simple-calculator.svg');
    svgContent = fs.readFileSync(svgPath, 'utf-8');
  });

  const config: FieldConfig = {
    patterns: [
      { prefix: 'input-field-', type: 'input' },
      { prefix: 'output-field-', type: 'output' }
    ]
  };

  beforeAll(() => {
    // Mock getBBox for consistent testing - must return DOMRect-like object
    const mockGetBBox = jest.fn().mockReturnValue({
      x: 130,
      y: 70,
      width: 100,
      height: 30,
      top: 70,
      right: 230,
      bottom: 100,
      left: 130
    });

    SVGGraphicsElement.prototype.getBBox = mockGetBBox;

    // Ensure SVGRectElement is considered an SVGGraphicsElement
    if (typeof SVGRectElement !== 'undefined') {
      Object.setPrototypeOf(SVGRectElement.prototype, SVGGraphicsElement.prototype);
    }
  });

  describe('Calculator Functionality', () => {
    it('should render calculator with two inputs and one output', async () => {
      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
        />
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Wait for input elements to be created
      await waitFor(() => {
        const inputA = document.querySelector('input[data-field-name="a"]');
        const inputB = document.querySelector('input[data-field-name="b"]');
        expect(inputA).toBeInTheDocument();
        expect(inputB).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify output element exists
      const output = document.getElementById('output-sum');
      expect(output).toBeInTheDocument();
    });

    it('should calculate sum of two inputs', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const a = parseFloat(inputs.a || '0');
        const b = parseFloat(inputs.b || '0');
        return {
          sum: (a + b).toString()
        };
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

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-sum');

      if (inputA && inputB && output) {
        // Set first input
        fireEvent.input(inputA, { target: { value: '10' } });

        await waitFor(() => {
          expect(output.textContent).toBe('10');
        });

        // Set second input
        fireEvent.input(inputB, { target: { value: '20' } });

        await waitFor(() => {
          expect(output.textContent).toBe('30');
        });
      }
    });

    it('should handle negative numbers correctly', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const a = parseFloat(inputs.a || '0');
        const b = parseFloat(inputs.b || '0');
        return {
          sum: (a + b).toString()
        };
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

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-sum');

      if (inputA && inputB && output) {
        fireEvent.input(inputA, { target: { value: '100' } });
        fireEvent.input(inputB, { target: { value: '-30' } });

        await waitFor(() => {
          expect(output.textContent).toBe('70');
        });
      }
    });

    it('should handle decimal arithmetic correctly', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const a = parseFloat(inputs.a || '0');
        const b = parseFloat(inputs.b || '0');
        return {
          sum: (a + b).toFixed(2)
        };
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

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-sum');

      if (inputA && inputB && output) {
        fireEvent.input(inputA, { target: { value: '1.5' } });
        fireEvent.input(inputB, { target: { value: '2.3' } });

        await waitFor(() => {
          expect(output.textContent).toBe('3.80');
        });
      }
    });

    it('should update when only one input is filled', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const a = parseFloat(inputs.a || '0');
        const b = parseFloat(inputs.b || '0');
        return {
          sum: (a + b).toString()
        };
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

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const output = document.getElementById('output-sum');

      if (inputA && output) {
        fireEvent.input(inputA, { target: { value: '42' } });

        await waitFor(() => {
          expect(output.textContent).toBe('42');
        });
      }
    });

    it('should preserve input values when switching between fields', async () => {
      const onOutputCompute = jest.fn((inputs) => {
        const a = parseFloat(inputs.a || '0');
        const b = parseFloat(inputs.b || '0');
        return {
          sum: (a + b).toString()
        };
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

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-sum');

      if (inputA && inputB && output) {
        // Fill first input
        fireEvent.input(inputA, { target: { value: '15' } });

        await waitFor(() => {
          expect(inputA.value).toBe('15');
        });

        // Fill second input
        fireEvent.input(inputB, { target: { value: '25' } });

        await waitFor(() => {
          expect(inputB.value).toBe('25');
        });

        // Both values should be preserved
        expect(inputA.value).toBe('15');
        expect(inputB.value).toBe('25');
        expect(output.textContent).toBe('40');
      }
    });
  });

  describe('Direct-ID Mode Detection', () => {
    it('should correctly detect direct-id mode for simple SVG', async () => {
      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          debug={true}
        />
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Verify the debug panel shows direct-id mode
      await waitFor(() => {
        expect(screen.getByText(/Matching Mode:/)).toBeInTheDocument();
        expect(screen.getByText(/direct-id/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('External Output Control', () => {
    it('should use external output values when provided', async () => {
      const externalOutputs = {
        sum: 'External: 999'
      };

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          outputValues={externalOutputs}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const output = document.getElementById('output-sum');

      if (output) {
        await waitFor(() => {
          expect(output.textContent).toBe('External: 999');
        });
      }
    });

    it('should update when external output values change', async () => {
      const { rerender } = render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          outputValues={{ sum: 'First' }}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const output = document.getElementById('output-sum');
        expect(output).toBeInTheDocument();
        expect(output?.textContent).toBe('First');
      });

      // Update external values
      rerender(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          outputValues={{ sum: 'Second' }}
        />
      );

      await waitFor(() => {
        const output = document.getElementById('output-sum');
        expect(output).toBeInTheDocument();
        expect(output?.textContent).toBe('Second');
      }, { timeout: 3000 });
    });
  });

  describe('Input Change Callbacks', () => {
    it('should call onInputChange with all input values', async () => {
      const onInputChange = jest.fn();

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

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;

      if (inputA && inputB) {
        // Type in first input
        fireEvent.input(inputA, { target: { value: '5' } });

        await waitFor(() => {
          expect(onInputChange).toHaveBeenCalledWith(
            'a',
            '5',
            expect.objectContaining({ a: '5' })
          );
        });

        // Type in second input
        fireEvent.input(inputB, { target: { value: '10' } });

        await waitFor(() => {
          expect(onInputChange).toHaveBeenCalledWith(
            'b',
            '10',
            expect.objectContaining({ a: '5', b: '10' })
          );
        });
      }
    });
  });
});
