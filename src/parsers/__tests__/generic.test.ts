import { parseSVG } from '../generic';
import { FieldPattern } from '../../types';

describe('parseSVG', () => {
  describe('Basic Parsing', () => {
    it('should parse SVG with id attributes', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-name" />
          <rect id="output-field-result" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { prefix: 'input-field-', type: 'input' },
        { prefix: 'output-field-', type: 'output' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.tool).toBe('generic');
      expect(result.metadata.detectedMode).toBe('direct-id');
      expect(result.metadata.attributesUsed).toContain('id');

      const inputField = result.mappings.find((m) => m.type === 'input');
      const outputField = result.mappings.find((m) => m.type === 'output');

      expect(inputField).toMatchObject({
        dataId: 'input-field-name',
        name: 'name',
        type: 'input',
      });

      expect(outputField).toMatchObject({
        dataId: 'output-field-result',
        name: 'result',
        type: 'output',
      });
    });

    it('should default to id attribute when not specified', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="field:email" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'field:', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.metadata.attributesUsed).toContain('id');
      expect(result.mappings[0]?.dataId).toBe('field:email');
    });

    it('should use elementId from id attribute for bounding box lookup', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-test" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.elementId).toBe('input-field-test');
    });
  });

  describe('Draw.io Auto-detection', () => {
    const createDrawIoSVG = (mxfileContent: string): string => {
      const encoded = mxfileContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      return `<svg xmlns="http://www.w3.org/2000/svg" content="${encoded}"></svg>`;
    };

    it('should auto-detect draw.io SVG and delegate to parseDrawIoSVG', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="input-field-test" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svg = createDrawIoSVG(mxfile);

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.metadata.tool).toBe('drawio');
      expect(result.metadata.detectedMode).toBe('data-id');
    });

    it('should not detect draw.io if content attribute is empty', () => {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" content=""><rect id="field-test" /></svg>';

      const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.metadata.tool).toBe('generic');
      expect(result.metadata.detectedMode).toBe('direct-id');
    });

    it('should handle SVG with content attribute that is not draw.io', () => {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" content="some random content"><rect id="field-test" /></svg>';

      const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      // Should try to parse as draw.io and fail, but metadata should still show drawio
      expect(result.metadata.tool).toBe('drawio');
    });
  });

  describe('Custom Attributes', () => {
    it('should support custom attribute matching', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect data-field-name="input-value" />
          <rect data-field-name="output-value" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'data-field-name', prefix: 'input-', type: 'input' },
        { attribute: 'data-field-name', prefix: 'output-', type: 'output' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.metadata.attributesUsed).toContain('data-field-name');
    });

    it('should support class attribute matching', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect class="input:username" />
          <rect class="output:display" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'class', prefix: 'input:', type: 'input' },
        { attribute: 'class', prefix: 'output:', type: 'output' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.metadata.attributesUsed).toContain('class');
    });

    it('should handle multiple different attributes', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-a" />
          <rect data-name="output-field-b" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'id', prefix: 'input-field-', type: 'input' },
        { attribute: 'data-name', prefix: 'output-field-', type: 'output' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.metadata.attributesUsed).toContain('id');
      expect(result.metadata.attributesUsed).toContain('data-name');
    });

    it('should use id for elementId when matching custom attributes', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="element-123" data-field="input-field-test" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'data-field', prefix: 'input-field-', type: 'input' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.elementId).toBe('element-123');
      expect(result.mappings[0]?.dataId).toBe('input-field-test');
    });

    it('should use attribute value as elementId when element has no id', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect data-field="input-field-test" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'data-field', prefix: 'input-field-', type: 'input' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.elementId).toBe('input-field-test');
    });
  });

  describe('Pattern Matching', () => {
    it('should match prefix patterns', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="field:username" />
          <rect id="field:password" />
          <rect id="other:something" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'field:', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings[0]?.name).toBe('username');
      expect(result.mappings[1]?.name).toBe('password');
    });

    it('should match regex patterns', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="INPUT_name" />
          <rect id="OUTPUT_result" />
          <rect id="INVALID" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { regex: /^INPUT_(.+)$/, type: 'input' },
        { regex: /^OUTPUT_(.+)$/, type: 'output' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings.find((m) => m.name === 'name')).toBeDefined();
      expect(result.mappings.find((m) => m.name === 'result')).toBeDefined();
    });

    it('should handle mixed prefix and regex patterns', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-a" />
          <rect id="OUTPUT_b" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { prefix: 'input-field-', type: 'input' },
        { regex: /^OUTPUT_(.+)$/, type: 'output' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
    });

    it('should handle case-sensitive matching', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="field-Test" />
          <rect id="field-test" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings.some((m) => m.name === 'Test')).toBe(true);
      expect(result.mappings.some((m) => m.name === 'test')).toBe(true);
    });

    it('should match ids array pattern', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="temperature" />
          <rect id="pressure" />
          <rect id="volume" />
          <rect id="other-field" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { ids: ['temperature', 'pressure', 'volume'], type: 'input' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(3);
      expect(result.mappings[0]?.name).toBe('temperature');
      expect(result.mappings[1]?.name).toBe('pressure');
      expect(result.mappings[2]?.name).toBe('volume');
    });

    it('should match exact IDs only (no partial matches)', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="temperature-input" />
          <rect id="temperature" />
          <rect id="temp" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ ids: ['temperature'], type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.elementId).toBe('temperature');
      expect(result.mappings[0]?.name).toBe('temperature');
    });

    it('should work with custom attribute and ids array', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect class="field-a" id="elem-a" />
          <rect class="field-b" id="elem-b" />
          <rect class="field-c" id="elem-c" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'class', ids: ['field-a', 'field-b'], type: 'input' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings[0]?.dataId).toBe('field-a');
      expect(result.mappings[0]?.name).toBe('field-a');
      expect(result.mappings[0]?.elementId).toBe('elem-a');
    });

    it('should mix ids patterns with prefix/regex patterns', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="temp-sensor" />
          <rect id="pressure-sensor" />
          <rect id="output-result" />
          <rect id="OUTPUT_status" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { ids: ['temp-sensor', 'pressure-sensor'], type: 'input' },
        { prefix: 'output-', type: 'output' },
        { regex: /^OUTPUT_(.+)$/, type: 'output' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(4);
      expect(result.mappings.filter((m) => m.type === 'input')).toHaveLength(2);
      expect(result.mappings.filter((m) => m.type === 'output')).toHaveLength(2);
    });
  });

  describe('SVG Element Types', () => {
    it('should handle various SVG element types', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-a" />
          <circle id="input-field-b" />
          <path id="input-field-c" />
          <text id="input-field-d" />
          <g id="input-field-e" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(5);
    });

    it('should handle nested SVG elements', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g>
            <rect id="input-field-nested" />
          </g>
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.name).toBe('nested');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty SVG content', () => {
      const result = parseSVG('', { patterns: [] });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid SVG content');
    });

    it('should handle invalid SVG content', () => {
      const result = parseSVG('not valid svg', { patterns: [] });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid SVG');
    });

    it('should handle SVG without matching elements', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="test"/></svg>';
      const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors).toContain('No fields matched the configured patterns');
    });

    it('should handle empty patterns array', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="field-a"/></svg>';

      const result = parseSVG(svg, { patterns: [] });

      expect(result.mappings).toHaveLength(0);
      expect(result.errors).toContain('No fields matched the configured patterns');
    });

    it('should handle malformed SVG', () => {
      const svg = '<svg><unclosed><tag>';
      const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle elements without required attribute', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect data-name="field-has-attribute" />
          <rect />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'data-name', prefix: 'field-', type: 'input' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.name).toBe('has-attribute');
    });

    it('should handle special characters in field names', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-my_special-field.name" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.name).toBe('my_special-field.name');
    });

    it('should handle empty string as field name', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.name).toBe('');
    });

    it('should handle multiple fields with same name', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-duplicate" />
          <circle id="input-field-duplicate" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      // Should find both, even though they have the same name
      expect(result.mappings).toHaveLength(2);
      expect(result.mappings.every((m) => m.name === 'duplicate')).toBe(true);
    });

    it('should handle Unicode characters in field names', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-用户名" />
          <rect id="input-field-имя" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings.some((m) => m.name === '用户名')).toBe(true);
      expect(result.mappings.some((m) => m.name === 'имя')).toBe(true);
    });

    it('should preserve order of elements', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-third" />
          <rect id="input-field-first" />
          <rect id="input-field-second" />
        </svg>
      `;

      const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.mappings).toHaveLength(3);
      expect(result.mappings[0]?.name).toBe('third');
      expect(result.mappings[1]?.name).toBe('first');
      expect(result.mappings[2]?.name).toBe('second');
    });
  });

  describe('Metadata', () => {
    it('should include correct tool metadata', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="field-test" /></svg>';
      const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

      const result = parseSVG(svg, { patterns });

      expect(result.metadata.tool).toBe('generic');
      expect(result.metadata.detectedMode).toBe('direct-id');
    });

    it('should track all attributes used', () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input-field-a" />
          <rect data-name="output-field-b" />
          <rect class="other-field-c" />
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'id', prefix: 'input-field-', type: 'input' },
        { attribute: 'data-name', prefix: 'output-field-', type: 'output' },
        { attribute: 'class', prefix: 'other-field-', type: 'input' },
      ];

      const result = parseSVG(svg, { patterns });

      expect(result.metadata.attributesUsed).toHaveLength(3);
      expect(result.metadata.attributesUsed).toContain('id');
      expect(result.metadata.attributesUsed).toContain('data-name');
      expect(result.metadata.attributesUsed).toContain('class');
    });
  });
});
