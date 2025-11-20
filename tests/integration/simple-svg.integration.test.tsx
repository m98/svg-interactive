import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SvgInteractive } from '../../src/components/SvgInteractive';
import { parseSVG } from '../../src/parsers/generic';
import { FieldPattern } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Simple SVG Integration Tests', () => {
  let svgContent: string;

  beforeAll(() => {
    const svgPath = path.join(__dirname, 'fixtures', 'simple-calculator.svg');
    svgContent = fs.readFileSync(svgPath, 'utf-8');
  });

  const patterns: FieldPattern[] = [
    { prefix: 'input-field-', type: 'input' },
    { prefix: 'output-field-', type: 'output' },
  ];

  beforeEach(() => {
    // Mock getBBox for consistent testing - must return DOMRect-like object
    const mockGetBBox = jest.fn().mockReturnValue({
      x: 130,
      y: 70,
      width: 100,
      height: 30,
      top: 70,
      right: 230,
      bottom: 100,
      left: 130,
    });

    SVGGraphicsElement.prototype.getBBox = mockGetBBox;

    // Ensure SVGRectElement is considered an SVGGraphicsElement
    if (typeof SVGRectElement !== 'undefined') {
      Object.setPrototypeOf(SVGRectElement.prototype, SVGGraphicsElement.prototype);
    }
  });

  describe('SVG Parsing', () => {
    it('should successfully parse simple SVG', () => {
      const result = parseSVG(svgContent, { patterns });

      expect(result.mappings.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.tool).toBe('generic');
      expect(result.metadata.detectedMode).toBe('direct-id');
    });

    it('should find input and output fields', () => {
      const result = parseSVG(svgContent, { patterns });

      const inputFields = result.mappings.filter((m) => m.type === 'input');
      const outputFields = result.mappings.filter((m) => m.type === 'output');

      expect(inputFields.length).toBeGreaterThan(0);
      expect(outputFields.length).toBeGreaterThan(0);
    });

    it('should use id attribute by default', () => {
      const result = parseSVG(svgContent, { patterns });

      expect(result.metadata.attributesUsed).toContain('id');
    });
  });

  describe('Calculator Functionality', () => {
    it('should render calculator with two inputs and one output', async () => {
      const result = parseSVG(svgContent, { patterns });

      render(<SvgInteractive mappings={result.mappings} svgContent={svgContent} />);

      // Wait for input elements to be created
      await waitFor(
        () => {
          const inputA = document.querySelector('input[data-field-name="a"]');
          const inputB = document.querySelector('input[data-field-name="b"]');
          expect(inputA).toBeInTheDocument();
          expect(inputB).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify output element exists
      const output = document.getElementById('output-field-sum');
      expect(output).toBeInTheDocument();
    });

    it('should calculate sum of two inputs', async () => {
      const result = parseSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => {
        const a = inputs.a ? parseFloat(inputs.a) : 0;
        const b = inputs.b ? parseFloat(inputs.b) : 0;
        return {
          sum: (a + b).toString(),
        };
      });

      render(
        <SvgInteractive
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const inputA = document.querySelector('input[data-field-name="a"]');
        expect(inputA).toBeInTheDocument();
      });

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-field-sum');

      if (inputA && inputB && output) {
        // Set first input
        fireEvent.input(inputA, { target: { value: '10' } });

        await waitFor(() => {
          expect(onOutputCompute).toHaveBeenCalled();
        });

        // Set second input
        fireEvent.input(inputB, { target: { value: '5' } });

        await waitFor(() => {
          expect(output.textContent).toBe('15');
        });
      }
    });

    it('should handle multiple calculations', async () => {
      const result = parseSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => {
        const a = inputs.a ? parseFloat(inputs.a) : 0;
        const b = inputs.b ? parseFloat(inputs.b) : 0;
        return { sum: (a + b).toString() };
      });

      render(
        <SvgInteractive
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const inputA = document.querySelector('input[data-field-name="a"]');
        expect(inputA).toBeInTheDocument();
      });

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-field-sum');

      if (inputA && inputB && output) {
        // First calculation: 10 + 5 = 15
        fireEvent.input(inputA, { target: { value: '10' } });
        fireEvent.input(inputB, { target: { value: '5' } });
        await waitFor(() => {
          expect(output.textContent).toBe('15');
        });

        // Second calculation: 20 + 15 = 35
        fireEvent.input(inputA, { target: { value: '20' } });
        fireEvent.input(inputB, { target: { value: '15' } });
        await waitFor(() => {
          expect(output.textContent).toBe('35');
        });

        // Third calculation: 100 + 200 = 300
        fireEvent.input(inputA, { target: { value: '100' } });
        fireEvent.input(inputB, { target: { value: '200' } });
        await waitFor(() => {
          expect(output.textContent).toBe('300');
        });
      }
    });

    it('should handle negative numbers', async () => {
      const result = parseSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => {
        const a = inputs.a ? parseFloat(inputs.a) : 0;
        const b = inputs.b ? parseFloat(inputs.b) : 0;
        return { sum: (a + b).toString() };
      });

      render(
        <SvgInteractive
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const inputA = document.querySelector('input[data-field-name="a"]');
        expect(inputA).toBeInTheDocument();
      });

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-field-sum');

      if (inputA && inputB && output) {
        fireEvent.input(inputA, { target: { value: '-10' } });
        fireEvent.input(inputB, { target: { value: '5' } });

        await waitFor(() => {
          expect(output.textContent).toBe('-5');
        });
      }
    });

    it('should handle decimal numbers', async () => {
      const result = parseSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => {
        const a = inputs.a ? parseFloat(inputs.a) : 0;
        const b = inputs.b ? parseFloat(inputs.b) : 0;
        return { sum: (a + b).toString() };
      });

      render(
        <SvgInteractive
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const inputA = document.querySelector('input[data-field-name="a"]');
        expect(inputA).toBeInTheDocument();
      });

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-field-sum');

      if (inputA && inputB && output) {
        fireEvent.input(inputA, { target: { value: '3.14' } });
        fireEvent.input(inputB, { target: { value: '2.86' } });

        await waitFor(() => {
          expect(output.textContent).toBe('6');
        });
      }
    });
  });

  describe('Field Names', () => {
    it('should extract correct field names', () => {
      const result = parseSVG(svgContent, { patterns });

      const fieldNames = result.mappings.map((m) => m.name);

      // Should have 'a', 'b' (inputs) and 'sum' (output)
      expect(fieldNames).toContain('a');
      expect(fieldNames).toContain('b');
      expect(fieldNames).toContain('sum');
    });

    it('should correctly identify field types', () => {
      const result = parseSVG(svgContent, { patterns });

      const inputA = result.mappings.find((m) => m.name === 'a');
      const inputB = result.mappings.find((m) => m.name === 'b');
      const outputSum = result.mappings.find((m) => m.name === 'sum');

      expect(inputA?.type).toBe('input');
      expect(inputB?.type).toBe('input');
      expect(outputSum?.type).toBe('output');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty input values', async () => {
      const result = parseSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => {
        const a = inputs.a ? parseFloat(inputs.a) : 0;
        const b = inputs.b ? parseFloat(inputs.b) : 0;
        return { sum: (a + b).toString() };
      });

      render(
        <SvgInteractive
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const inputA = document.querySelector('input[data-field-name="a"]');
        expect(inputA).toBeInTheDocument();
      });

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-field-sum');

      if (inputA && inputB && output) {
        // Leave inputs empty (should default to 0)
        fireEvent.input(inputA, { target: { value: '' } });
        fireEvent.input(inputB, { target: { value: '' } });

        await waitFor(() => {
          expect(output.textContent).toBe('0');
        });
      }
    });

    it('should handle invalid input gracefully', async () => {
      const result = parseSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => {
        const a = inputs.a ? parseFloat(inputs.a) : 0;
        const b = inputs.b ? parseFloat(inputs.b) : 0;
        const sum = a + b;
        return { sum: isNaN(sum) ? '0' : sum.toString() };
      });

      render(
        <SvgInteractive
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const inputA = document.querySelector('input[data-field-name="a"]');
        expect(inputA).toBeInTheDocument();
      });

      const inputA = document.querySelector('input[data-field-name="a"]') as HTMLInputElement;
      const inputB = document.querySelector('input[data-field-name="b"]') as HTMLInputElement;
      const output = document.getElementById('output-field-sum');

      if (inputA && inputB && output) {
        fireEvent.input(inputA, { target: { value: 'abc' } });
        fireEvent.input(inputB, { target: { value: 'xyz' } });

        await waitFor(() => {
          expect(output.textContent).toBe('0');
        });
      }
    });
  });
});
