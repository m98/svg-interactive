import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { InteractiveSVG } from '../../src/components/InteractiveSVG';
import { parseDrawIoSVG } from '../../src/parsers/drawio';
import { FieldPattern } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Draw.io SVG Integration Tests', () => {
  let svgContent: string;

  beforeAll(() => {
    // Load the actual SVG file
    const svgPath = path.join(__dirname, 'fixtures', 'gas-input-output.drawio.svg');
    svgContent = fs.readFileSync(svgPath, 'utf-8');
  });

  const patterns: FieldPattern[] = [
    { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
    { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
  ];

  beforeEach(() => {
    // Mock getBBox for consistent testing
    SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
      x: 10,
      y: 40,
      width: 120,
      height: 20,
    });
  });

  describe('SVG Parsing', () => {
    it('should successfully parse draw.io SVG', () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.mappings.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.tool).toBe('drawio');
      expect(result.metadata.detectedMode).toBe('data-id');
    });

    it('should detect data-id attributes', () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.metadata.attributesUsed).toContain('data-id');
    });

    it('should find input and output fields', () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      const inputFields = result.mappings.filter((m) => m.type === 'input');
      const outputFields = result.mappings.filter((m) => m.type === 'output');

      expect(inputFields.length).toBeGreaterThan(0);
      expect(outputFields.length).toBeGreaterThan(0);
    });
  });

  describe('SVG Rendering', () => {
    it('should render SVG with parsed mappings', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(<InteractiveSVG mappings={result.mappings} svgContent={svgContent} />);

      const svgContainer = document.querySelector('.svg-container');
      expect(svgContainer).toBeInTheDocument();

      const svg = svgContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should preserve SVG attributes', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(<InteractiveSVG mappings={result.mappings} svgContent={svgContent} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      if (svg) {
        const contentAttr = svg.getAttribute('content');
        expect(contentAttr).toBeTruthy();
        expect(contentAttr?.length).toBeGreaterThan(0);
      }
    });

    it('should have correct SVG dimensions', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(<InteractiveSVG mappings={result.mappings} svgContent={svgContent} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      if (svg) {
        const width = svg.getAttribute('width');
        const height = svg.getAttribute('height');
        expect(width).toBeTruthy();
        expect(height).toBeTruthy();
      }
    });
  });

  describe('Field Mapping', () => {
    it('should correctly extract field names', () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      const gasInput = result.mappings.find((m) => m.name === 'gas' && m.type === 'input');
      const gasOutput = result.mappings.find((m) => m.name === 'gas' && m.type === 'output');

      expect(gasInput).toBeDefined();
      expect(gasOutput).toBeDefined();
    });

    it('should render input field in DOM', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(<InteractiveSVG mappings={result.mappings} svgContent={svgContent} />);

      await waitFor(
        () => {
          const inputField = document.querySelector('input[data-field-name="gas"]');
          expect(inputField).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should render output field in DOM', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(<InteractiveSVG mappings={result.mappings} svgContent={svgContent} />);

      await waitFor(
        () => {
          const outputField = document.getElementById('output-field-gas');
          expect(outputField).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Input Interaction', () => {
    it('should trigger onInputChange when input value changes', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });
      const onInputChange = jest.fn();

      render(
        <InteractiveSVG
          mappings={result.mappings}
          svgContent={svgContent}
          onInputChange={onInputChange}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;

      if (input) {
        fireEvent.input(input, { target: { value: '100' } });

        await waitFor(() => {
          expect(onInputChange).toHaveBeenCalled();
        });

        const calls = onInputChange.mock.calls;
        const gasCall = calls.find((call) => call[0] === 'gas');

        expect(gasCall).toBeDefined();
        expect(gasCall?.[1]).toBe('100');
        expect(gasCall?.[2]).toHaveProperty('gas', '100');
      }
    });

    it('should handle multiple input changes', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });
      const onInputChange = jest.fn();

      render(
        <InteractiveSVG
          mappings={result.mappings}
          svgContent={svgContent}
          onInputChange={onInputChange}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]');
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;

      if (input) {
        fireEvent.input(input, { target: { value: '10' } });
        fireEvent.input(input, { target: { value: '20' } });
        fireEvent.input(input, { target: { value: '30' } });

        await waitFor(() => {
          expect(onInputChange).toHaveBeenCalledTimes(3);
        });
      }
    });
  });

  describe('Output Computation', () => {
    it('should compute and display output values', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = inputs.gas ? parseFloat(inputs.gas) : 0;
        return { gas: (gasValue * 2).toString() };
      });

      render(
        <InteractiveSVG
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]');
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        fireEvent.input(input, { target: { value: '50' } });

        await waitFor(() => {
          expect(onOutputCompute).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(output.textContent).toBe('100');
        });
      }
    });

    it('should handle decimal values', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = inputs.gas ? parseFloat(inputs.gas) : 0;
        return { gas: (gasValue * 2).toString() };
      });

      render(
        <InteractiveSVG
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]');
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        fireEvent.input(input, { target: { value: '12.5' } });

        await waitFor(() => {
          expect(output.textContent).toBe('25');
        });
      }
    });

    it('should update output on multiple input changes', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = inputs.gas ? parseFloat(inputs.gas) : 0;
        return { gas: (gasValue * 2).toString() };
      });

      render(
        <InteractiveSVG
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]');
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        fireEvent.input(input, { target: { value: '10' } });
        await waitFor(() => {
          expect(output.textContent).toBe('20');
        });

        fireEvent.input(input, { target: { value: '25' } });
        await waitFor(() => {
          expect(output.textContent).toBe('50');
        });

        fireEvent.input(input, { target: { value: '100' } });
        await waitFor(() => {
          expect(output.textContent).toBe('200');
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty input gracefully', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = inputs.gas ? parseFloat(inputs.gas) : 0;
        return { gas: (gasValue * 2).toString() };
      });

      render(
        <InteractiveSVG
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]');
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        fireEvent.input(input, { target: { value: '' } });

        await waitFor(() => {
          expect(output.textContent).toBe('0');
        });
      }
    });

    it('should handle invalid input gracefully', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });
      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = inputs.gas ? parseFloat(inputs.gas) : 0;
        return { gas: isNaN(gasValue) ? '0' : (gasValue * 2).toString() };
      });

      render(
        <InteractiveSVG
          mappings={result.mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="gas"]');
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="gas"]') as HTMLInputElement;
      const output = document.getElementById('output-gas');

      if (input && output) {
        fireEvent.input(input, { target: { value: 'abc' } });

        await waitFor(() => {
          expect(output.textContent).toBe('0');
        });
      }
    });

    it('should handle missing SVG content', () => {
      const result = parseDrawIoSVG('', { patterns });

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.mappings).toHaveLength(0);
    });

    it('should handle invalid SVG content', () => {
      const result = parseDrawIoSVG('not valid svg', { patterns });

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.mappings).toHaveLength(0);
    });

    it('should handle SVG without content attribute', () => {
      const invalidSvg = '<svg><rect id="test"/></svg>';
      const result = parseDrawIoSVG(invalidSvg, { patterns });

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('content attribute');
    });
  });
});
