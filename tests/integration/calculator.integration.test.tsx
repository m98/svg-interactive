import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { SvgInteractive, parseDrawIoSVG } from '../../src';
import type { FieldPattern } from '../../src/types';
import fs from 'fs';
import path from 'path';

// Load the SVG file
const svgPath = path.join(__dirname, 'fixtures', 'calculator.drawio.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Field patterns for the calculator
const patterns: FieldPattern[] = [
  { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
  { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
];

describe('Calculator Integration Tests', () => {
  describe('SVG Parsing', () => {
    it('should successfully parse calculator SVG', () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.mappings.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.tool).toBe('drawio');
    });

    it('should find all calculator fields', () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      const inputFields = result.mappings.filter((m) => m.type === 'input');
      const outputFields = result.mappings.filter((m) => m.type === 'output');

      // Should have 2 input fields: one, two
      expect(inputFields.length).toBeGreaterThanOrEqual(2);

      // Should have 1 output field: result
      expect(outputFields.length).toBeGreaterThanOrEqual(1);
    });

    it('should correctly extract field names', () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      const inputNames = new Set(
        result.mappings.filter((m) => m.type === 'input').map((m) => m.name)
      );
      const outputNames = new Set(
        result.mappings.filter((m) => m.type === 'output').map((m) => m.name)
      );

      expect(inputNames.has('one')).toBe(true);
      expect(inputNames.has('two')).toBe(true);
      expect(outputNames.has('result')).toBe(true);
    });
  });

  describe('Field Rendering', () => {
    it('should render input fields in DOM', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(
        <SvgInteractive
          svgContent={svgContent}
          mappings={result.mappings}
          defaultInputs={{ one: '5', two: '3' }}
          onOutputCompute={(inputs) => ({
            result: ((parseFloat(inputs.one ?? '0') + parseFloat(inputs.two ?? '0')) || 0).toString(),
          })}
        />
      );

      await waitFor(() => {
        const oneInput = screen.queryByDisplayValue('5');
        const twoInput = screen.queryByDisplayValue('3');

        expect(oneInput).toBeInTheDocument();
        expect(twoInput).toBeInTheDocument();
      });
    });

    it('should render output fields in DOM', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(
        <SvgInteractive
          svgContent={svgContent}
          mappings={result.mappings}
          defaultInputs={{ one: '5', two: '3' }}
          onOutputCompute={(inputs) => ({
            result: ((parseFloat(inputs.one ?? '0') + parseFloat(inputs.two ?? '0')) || 0).toString(),
          })}
        />
      );

      await waitFor(() => {
        const resultOutput = screen.queryByText('8');
        expect(resultOutput).toBeInTheDocument();
      });
    });
  });

  describe('Calculator Operations', () => {
    it('should calculate sum correctly', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(
        <SvgInteractive
          svgContent={svgContent}
          mappings={result.mappings}
          defaultInputs={{ one: '10', two: '15' }}
          onOutputCompute={(inputs) => ({
            result: ((parseFloat(inputs.one ?? '0') + parseFloat(inputs.two ?? '0')) || 0).toString(),
          })}
        />
      );

      await waitFor(() => {
        const resultOutput = screen.queryByText('25');
        expect(resultOutput).toBeInTheDocument();
      });
    });

    it('should handle decimal numbers', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      const { container } = render(
        <SvgInteractive
          svgContent={svgContent}
          mappings={result.mappings}
          defaultInputs={{ one: '0', two: '0' }}
          onOutputCompute={(inputs) => ({
            result: ((parseFloat(inputs.one ?? '0') + parseFloat(inputs.two ?? '0')) || 0).toString(),
          })}
        />
      );

      const oneInput = await waitFor(() => {
        const input = container.querySelector('input[data-field-name="one"]');
        if (!input) throw new Error('Input "one" not found');
        return input as HTMLInputElement;
      });

      const twoInput = await waitFor(() => {
        const input = container.querySelector('input[data-field-name="two"]');
        if (!input) throw new Error('Input "two" not found');
        return input as HTMLInputElement;
      });

      fireEvent.input(oneInput, { target: { value: '2.5' } });
      fireEvent.input(twoInput, { target: { value: '3.7' } });

      await waitFor(() => {
        const resultOutput = screen.queryByText('6.2');
        expect(resultOutput).toBeInTheDocument();
      });
    });

    it('should handle negative numbers', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      const { container } = render(
        <SvgInteractive
          svgContent={svgContent}
          mappings={result.mappings}
          defaultInputs={{ one: '-5', two: '3' }}
          onOutputCompute={(inputs) => ({
            result: ((parseFloat(inputs.one ?? '0') + parseFloat(inputs.two ?? '0')) || 0).toString(),
          })}
        />
      );

      await waitFor(() => {
        const resultOutput = screen.queryByText('-2');
        expect(resultOutput).toBeInTheDocument();
      });
    });

    it('should handle empty inputs gracefully', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      render(
        <SvgInteractive
          svgContent={svgContent}
          mappings={result.mappings}
          defaultInputs={{ one: '', two: '' }}
          onOutputCompute={(inputs) => ({
            result: ((parseFloat(inputs.one ?? '0') + parseFloat(inputs.two ?? '0')) || 0).toString(),
          })}
        />
      );

      await waitFor(() => {
        const resultOutput = screen.queryByText('0');
        expect(resultOutput).toBeInTheDocument();
      });
    });

    it('should update result when inputs change', async () => {
      const result = parseDrawIoSVG(svgContent, { patterns });

      const { container } = render(
        <SvgInteractive
          svgContent={svgContent}
          mappings={result.mappings}
          defaultInputs={{ one: '1', two: '1' }}
          onOutputCompute={(inputs) => ({
            result: ((parseFloat(inputs.one ?? '0') + parseFloat(inputs.two ?? '0')) || 0).toString(),
          })}
        />
      );

      // Initial result should be 2
      await waitFor(() => {
        expect(screen.queryByText('2')).toBeInTheDocument();
      });

      // Change first input to 10
      const oneInput = await waitFor(() => {
        const input = container.querySelector('input[data-field-name="one"]');
        if (!input) throw new Error('Input "one" not found');
        return input as HTMLInputElement;
      });

      fireEvent.input(oneInput, { target: { value: '10' } });

      // Result should now be 11
      await waitFor(() => {
        expect(screen.queryByText('11')).toBeInTheDocument();
      });
    });
  });
});
