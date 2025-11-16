import { parseDrawIoSVG } from '../drawio';
import { FieldPattern } from '../../types';

describe('parseDrawIoSVG', () => {
  const createDrawIoSVG = (mxfileContent: string): string => {
    const encoded = mxfileContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `<svg xmlns="http://www.w3.org/2000/svg" content="${encoded}"></svg>`;
  };

  describe('Basic Parsing', () => {
    it('should successfully parse draw.io SVG with data-id attributes', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="input-field-name" label="Name" />
                <object id="2" data-id="output-field-result" label="Result" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
        { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.tool).toBe('drawio');
      expect(result.metadata.detectedMode).toBe('data-id');
      expect(result.metadata.attributesUsed).toContain('data-id');

      const inputField = result.mappings.find((m) => m.type === 'input');
      const outputField = result.mappings.find((m) => m.type === 'output');

      expect(inputField).toMatchObject({
        dataId: 'input-field-name',
        name: 'name',
        elementId: '1',
        type: 'input',
      });

      expect(outputField).toMatchObject({
        dataId: 'output-field-result',
        name: 'result',
        elementId: '2',
        type: 'output',
      });
    });

    it('should default to data-id attribute when not specified', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="input-field-email" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { prefix: 'input-field-', type: 'input' }, // No attribute specified
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.metadata.attributesUsed).toContain('data-id');
      expect(result.mappings[0]?.dataId).toBe('input-field-email');
    });
  });

  describe('Pattern Matching', () => {
    it('should match prefix patterns', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="field:username" />
                <object id="2" data-id="field:password" />
                <object id="3" data-id="other:something" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'field:', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings[0]?.name).toBe('username');
      expect(result.mappings[1]?.name).toBe('password');
    });

    it('should match regex patterns', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="INPUT_name" />
                <object id="2" data-id="OUTPUT_result" />
                <object id="3" data-id="INVALID" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { regex: /^INPUT_(.+)$/, type: 'input' },
        { regex: /^OUTPUT_(.+)$/, type: 'output' },
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings.find((m) => m.name === 'name')).toBeDefined();
      expect(result.mappings.find((m) => m.name === 'result')).toBeDefined();
    });

    it('should handle mixed prefix and regex patterns', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="input-field-a" />
                <object id="2" data-id="OUTPUT_b" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { prefix: 'input-field-', type: 'input' },
        { regex: /^OUTPUT_(.+)$/, type: 'output' },
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
    });

    it('should match ids array in draw.io XML', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="temp-sensor" />
                <object id="2" data-id="pressure-sensor" />
                <object id="3" data-id="flow-sensor" />
                <object id="4" data-id="other-element" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { attribute: 'data-id', ids: ['temp-sensor', 'pressure-sensor'], type: 'input' },
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings[0]?.name).toBe('temp-sensor');
      expect(result.mappings[1]?.name).toBe('pressure-sensor');
      expect(result.mappings[0]?.elementId).toBe('1');
      expect(result.mappings[1]?.elementId).toBe('2');
    });

    it('should mix ids with other patterns in draw.io', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="sensor-1" />
                <object id="2" data-id="sensor-2" />
                <object id="3" data-id="output-result" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { ids: ['sensor-1', 'sensor-2'], type: 'input' },
        { prefix: 'output-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(3);
      expect(result.mappings.filter((m) => m.type === 'input')).toHaveLength(2);
      expect(result.mappings.filter((m) => m.type === 'output')).toHaveLength(1);
    });
  });

  describe('Custom Attributes', () => {
    it('should support custom attribute names', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" custom-field="input-value" />
                <object id="2" custom-field="output-value" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { attribute: 'custom-field', prefix: 'input-', type: 'input' },
        { attribute: 'custom-field', prefix: 'output-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.metadata.attributesUsed).toContain('custom-field');
    });

    it('should handle multiple different attributes', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="field-a" />
                <object id="2" custom-attr="field-b" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'field-', type: 'input' },
        { attribute: 'custom-attr', prefix: 'field-', type: 'output' },
      ];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.metadata.attributesUsed).toContain('data-id');
      expect(result.metadata.attributesUsed).toContain('custom-attr');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty SVG content', () => {
      const result = parseDrawIoSVG('', { patterns: [] });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid SVG content');
    });

    it('should handle invalid SVG content', () => {
      const result = parseDrawIoSVG('not valid svg', { patterns: [] });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid SVG');
    });

    it('should handle SVG without content attribute', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="test"/></svg>';
      const patterns: FieldPattern[] = [{ prefix: 'test', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('content attribute');
    });

    it('should handle malformed mxfile XML', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" content="<invalid><xml"></svg>';
      const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle no matching patterns', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="unmatched-field" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'matched-', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors).toContain('No fields matched the configured patterns');
    });

    it('should handle empty patterns array', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="field-a" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const result = parseDrawIoSVG(svg, { patterns: [] });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors).toContain('No fields matched the configured patterns');
    });
  });

  describe('Edge Cases', () => {
    it('should handle objects without id attribute', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object data-id="input-field-test" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      // Should skip objects without id
      expect(result.mappings).toHaveLength(0);
    });

    it('should handle objects without data-id attribute', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" label="No data-id" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(0);
    });

    it('should handle special characters in field names', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="input-field-my_special-field.name" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.name).toBe('my_special-field.name');
    });

    it('should handle multiple fields with same type', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="input-field-firstName" />
                <object id="2" data-id="input-field-lastName" />
                <object id="3" data-id="input-field-email" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(3);
      expect(result.mappings.every((m) => m.type === 'input')).toBe(true);
    });

    it('should preserve element ID for bounding box lookup', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="AUTO_GEN_123" data-id="input-field-test" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseDrawIoSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.elementId).toBe('AUTO_GEN_123');
      expect(result.mappings[0]?.dataId).toBe('input-field-test');
    });
  });
});
