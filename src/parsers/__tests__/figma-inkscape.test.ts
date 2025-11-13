import { parseFigmaSVG } from '../figma';
import { parseInkscapeSVG } from '../inkscape';
import { FieldPattern } from '../../types';

describe('parseFigmaSVG', () => {
  it('should parse Figma SVG with correct metadata', () => {
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

    const result = parseFigmaSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(2);
    expect(result.metadata.tool).toBe('figma');
    expect(result.metadata.detectedMode).toBe('direct-id');
  });

  it('should use id attribute by default', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="field-test" />
      </svg>
    `;

    const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

    const result = parseFigmaSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(1);
    expect(result.metadata.attributesUsed).toContain('id');
  });

  it('should support custom attributes', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect data-figma-name="input-value" />
      </svg>
    `;

    const patterns: FieldPattern[] = [
      { attribute: 'data-figma-name', prefix: 'input-', type: 'input' },
    ];

    const result = parseFigmaSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(1);
    expect(result.metadata.attributesUsed).toContain('data-figma-name');
  });

  it('should handle prefix patterns', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="input:username" />
        <rect id="output:display" />
      </svg>
    `;

    const patterns: FieldPattern[] = [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ];

    const result = parseFigmaSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(2);
    expect(result.mappings[0]?.name).toBe('username');
    expect(result.mappings[1]?.name).toBe('display');
  });

  it('should handle regex patterns', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="INPUT_name" />
        <rect id="OUTPUT_result" />
      </svg>
    `;

    const patterns: FieldPattern[] = [
      { regex: /^INPUT_(.+)$/, type: 'input' },
      { regex: /^OUTPUT_(.+)$/, type: 'output' },
    ];

    const result = parseFigmaSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(2);
  });

  it('should force direct-id mode even if draw.io content present', () => {
    // This ensures parseFigmaSVG doesn't auto-detect draw.io
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" content="some-content">
        <rect id="field-test" />
      </svg>
    `;

    const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

    const result = parseFigmaSVG(svg, { patterns });

    expect(result.metadata.detectedMode).toBe('direct-id');
  });

  it('should handle errors gracefully', () => {
    const result = parseFigmaSVG('', { patterns: [] });

    expect(result.mappings).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.metadata.tool).toBe('figma');
  });
});

describe('parseInkscapeSVG', () => {
  it('should parse Inkscape SVG with correct metadata', () => {
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

    const result = parseInkscapeSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(2);
    expect(result.metadata.tool).toBe('inkscape');
    expect(result.metadata.detectedMode).toBe('direct-id');
  });

  it('should use id attribute by default', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="field-test" />
      </svg>
    `;

    const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

    const result = parseInkscapeSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(1);
    expect(result.metadata.attributesUsed).toContain('id');
  });

  it('should support custom attributes', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect data-inkscape-name="input-value" />
      </svg>
    `;

    const patterns: FieldPattern[] = [
      { attribute: 'data-inkscape-name', prefix: 'input-', type: 'input' },
    ];

    const result = parseInkscapeSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(1);
    expect(result.metadata.attributesUsed).toContain('data-inkscape-name');
  });

  it('should handle prefix patterns', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="input:email" />
        <rect id="output:message" />
      </svg>
    `;

    const patterns: FieldPattern[] = [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ];

    const result = parseInkscapeSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(2);
    expect(result.mappings[0]?.name).toBe('email');
    expect(result.mappings[1]?.name).toBe('message');
  });

  it('should handle regex patterns', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="INPUT_field1" />
        <rect id="OUTPUT_field2" />
      </svg>
    `;

    const patterns: FieldPattern[] = [
      { regex: /^INPUT_(.+)$/, type: 'input' },
      { regex: /^OUTPUT_(.+)$/, type: 'output' },
    ];

    const result = parseInkscapeSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(2);
  });

  it('should handle Inkscape-specific elements', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
        <g inkscape:groupmode="layer" id="layer1">
          <rect id="input-field-test" />
        </g>
      </svg>
    `;

    const patterns: FieldPattern[] = [{ prefix: 'input-field-', type: 'input' }];

    const result = parseInkscapeSVG(svg, { patterns });

    expect(result.mappings).toHaveLength(1);
    expect(result.mappings[0]?.name).toBe('test');
  });

  it('should force direct-id mode even if draw.io content present', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" content="some-content">
        <rect id="field-test" />
      </svg>
    `;

    const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

    const result = parseInkscapeSVG(svg, { patterns });

    expect(result.metadata.detectedMode).toBe('direct-id');
  });

  it('should handle errors gracefully', () => {
    const result = parseInkscapeSVG('', { patterns: [] });

    expect(result.mappings).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.metadata.tool).toBe('inkscape');
  });
});

describe('Figma vs Inkscape Metadata', () => {
  it('should correctly differentiate metadata between parsers', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="field-test" />
      </svg>
    `;

    const patterns: FieldPattern[] = [{ prefix: 'field-', type: 'input' }];

    const figmaResult = parseFigmaSVG(svg, { patterns });
    const inkscapeResult = parseInkscapeSVG(svg, { patterns });

    expect(figmaResult.metadata.tool).toBe('figma');
    expect(inkscapeResult.metadata.tool).toBe('inkscape');

    // Both should have same mappings
    expect(figmaResult.mappings).toEqual(inkscapeResult.mappings);
  });
});
