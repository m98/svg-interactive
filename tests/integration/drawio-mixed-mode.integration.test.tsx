import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { InteractiveSVG } from '../../src/components/InteractiveSVG';
import { parseDrawIoSVG } from '../../src/parsers/drawio';
import { FieldPattern } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Draw.io Mixed Mode Integration Tests', () => {
  let svgContent: string;

  beforeAll(() => {
    // Load the actual SVG file
    const svgPath = path.join(__dirname, 'fixtures', 'gas-input-output.drawio.svg');
    svgContent = fs.readFileSync(svgPath, 'utf-8');
  });

  beforeEach(() => {
    // Mock getBBox for consistent testing
    SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
      x: 10,
      y: 40,
      width: 120,
      height: 20,
    });
  });

  describe('Mixed Attribute Parsing', () => {
    it('should parse using explicit attribute specification', () => {
      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
        { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.mappings.length).toBeGreaterThan(0);
      expect(result.metadata.attributesUsed).toContain('data-id');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Multiple Attribute Types', () => {
    it('should work with data-id input and output computation', async () => {
      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
        { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => {
        const gasValue = inputs.gas ? parseFloat(inputs.gas) : 0;
        return {
          gas: (gasValue * 2).toString(),
        };
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
      const output = document.getElementById('output-field-gas');

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
  });

  describe('Pattern Matching', () => {
    it('should match prefix patterns correctly', () => {
      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
        { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      const inputFields = result.mappings.filter((m) => m.type === 'input');
      const outputFields = result.mappings.filter((m) => m.type === 'output');

      expect(inputFields.length).toBeGreaterThan(0);
      expect(outputFields.length).toBeGreaterThan(0);

      // All input fields should have dataId starting with prefix
      inputFields.forEach((field) => {
        expect(field.dataId).toMatch(/^input-field-/);
      });

      // All output fields should have dataId starting with prefix
      outputFields.forEach((field) => {
        expect(field.dataId).toMatch(/^output-field-/);
      });
    });

    it('should handle regex patterns', () => {
      const patterns: FieldPattern[] = [
        { attribute: 'data-id', regex: /^input-field-(.+)$/, type: 'input' },
        { attribute: 'data-id', regex: /^output-field-(.+)$/, type: 'output' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.mappings.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);

      // Should extract field names correctly
      const gasInput = result.mappings.find((m) => m.name === 'gas' && m.type === 'input');
      expect(gasInput).toBeDefined();
    });
  });

  describe('Auto-detection', () => {
    it('should auto-detect data-id mode when attribute not specified', () => {
      // When attribute is omitted, should default to 'id' for non-draw.io
      // But parseDrawIoSVG forces data-id mode
      const patterns: FieldPattern[] = [
        { prefix: 'input-field-', type: 'input' }, // No attribute specified
        { prefix: 'output-field-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.metadata.detectedMode).toBe('data-id');
      expect(result.mappings.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty patterns array', () => {
      const result = parseDrawIoSVG(svgContent, { patterns: [] });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-matching patterns', () => {
      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'nonexistent-', type: 'input' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors).toContain('No fields matched the configured patterns');
    });

    it('should handle patterns with non-existent attributes', () => {
      const patterns: FieldPattern[] = [
        { attribute: 'custom-attr', prefix: 'field-', type: 'input' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.mappings).toHaveLength(0);
    });
  });

  describe('Metadata', () => {
    it('should include correct tool metadata', () => {
      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.metadata.tool).toBe('drawio');
      expect(result.metadata.detectedMode).toBe('data-id');
    });

    it('should track which attributes were queried', () => {
      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
        { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns });

      expect(result.metadata.attributesUsed).toContain('data-id');
      expect(result.metadata.attributesUsed.length).toBeGreaterThan(0);
    });
  });
});
