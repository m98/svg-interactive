import {
  parseSVGWithDataId,
  parseSVGWithDirectId,
  parseSVGContent,
  getFieldBoundingBoxes,
} from './svgParser';
import { FieldConfig } from '../types';

describe('parseSVGWithDataId', () => {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ],
  };

  it('should parse draw.io SVG with data-id attributes', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;object data-id=&quot;input:username&quot; id=&quot;el1&quot;/&gt;&lt;object data-id=&quot;output:result&quot; id=&quot;el2&quot;/&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
      </svg>
    `;

    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(2);
    expect(result.mappings[0]).toEqual({
      dataId: 'input:username',
      name: 'username',
      elementId: 'el1',
      type: 'input',
    });
    expect(result.mappings[1]).toEqual({
      dataId: 'output:result',
      name: 'result',
      elementId: 'el2',
      type: 'output',
    });
    expect(result.errors).toEqual([]);
    expect(result.detectedMode).toBe('data-id');
  });

  it('should error if no SVG element found', () => {
    const svgText = '<div>Not an SVG</div>';
    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors).toContain('No SVG element found in provided content');
  });

  it('should error if content attribute is missing', () => {
    const svgText = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors).toContain('SVG does not contain a content attribute with diagram data');
  });

  it('should error if content XML is malformed', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;unclosed">
      </svg>
    `;
    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors.some((e) => e.includes('Failed to parse mxfile XML'))).toBe(true);
  });

  it('should error if no objects with data-id found', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
      </svg>
    `;
    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors).toContain('No object elements with data-id found in SVG content');
  });

  it('should error if no fields match patterns', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;object data-id=&quot;field:test&quot; id=&quot;el1&quot;/&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
      </svg>
    `;
    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors).toContain('No fields matched the configured patterns');
  });

  it('should skip objects without data-id or id', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;object data-id=&quot;input:name&quot;/&gt;&lt;object id=&quot;el2&quot;/&gt;&lt;object data-id=&quot;output:total&quot; id=&quot;el3&quot;/&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
      </svg>
    `;
    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(1);
    expect(result.mappings[0].elementId).toBe('el3');
  });

  it('should handle parsing exceptions gracefully', () => {
    const svgText = 'invalid xml <<>>';
    const result = parseSVGWithDataId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('parseSVGWithDirectId', () => {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ],
  };

  it('should parse SVG with direct ID attributes', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="input:username" />
        <circle id="output:result" />
      </svg>
    `;

    const result = parseSVGWithDirectId(svgText, config);

    expect(result.mappings).toHaveLength(2);
    expect(result.mappings[0]).toEqual({
      dataId: 'input:username',
      name: 'username',
      elementId: 'input:username',
      type: 'input',
    });
    expect(result.mappings[1]).toEqual({
      dataId: 'output:result',
      name: 'result',
      elementId: 'output:result',
      type: 'output',
    });
    expect(result.errors).toEqual([]);
    expect(result.detectedMode).toBe('direct-id');
  });

  it('should error if no SVG element found', () => {
    const svgText = '<div>Not an SVG</div>';
    const result = parseSVGWithDirectId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors).toContain('No SVG element found in provided content');
    expect(result.detectedMode).toBe('direct-id');
  });

  it('should error if no elements with id found', () => {
    const svgText = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = parseSVGWithDirectId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors).toContain('No elements with id attributes found in SVG');
  });

  it('should error if no element IDs match patterns', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="field:test" />
      </svg>
    `;
    const result = parseSVGWithDirectId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors).toContain('No element IDs matched the configured patterns');
  });

  it('should handle nested elements with IDs', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <g id="input:group">
          <rect id="output:inner" />
        </g>
      </svg>
    `;
    const result = parseSVGWithDirectId(svgText, config);

    expect(result.mappings).toHaveLength(2);
  });

  it('should handle parsing exceptions gracefully', () => {
    const svgText = 'invalid xml <<>>';
    const result = parseSVGWithDirectId(svgText, config);

    expect(result.mappings).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('parseSVGContent', () => {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ],
  };

  it('should use data-id mode when explicitly specified', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;object data-id=&quot;input:test&quot; id=&quot;el1&quot;/&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
      </svg>
    `;
    const configWithMode = { ...config, matchingMode: 'data-id' as const };
    const result = parseSVGContent(svgText, configWithMode);

    expect(result.detectedMode).toBe('data-id');
  });

  it('should use direct-id mode when explicitly specified', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="input:test" />
      </svg>
    `;
    const configWithMode = { ...config, matchingMode: 'direct-id' as const };
    const result = parseSVGContent(svgText, configWithMode);

    expect(result.detectedMode).toBe('direct-id');
  });

  it('should auto-detect data-id mode when content attribute present', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;object data-id=&quot;input:test&quot; id=&quot;el1&quot;/&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
      </svg>
    `;
    const result = parseSVGContent(svgText, config);

    expect(result.detectedMode).toBe('data-id');
  });

  it('should auto-detect direct-id mode when no content attribute', () => {
    const svgText = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <rect id="input:test" />
      </svg>
    `;
    const result = parseSVGContent(svgText, config);

    expect(result.detectedMode).toBe('direct-id');
  });

  it('should handle auto mode with invalid SVG', () => {
    const svgText = '<div>Not SVG</div>';
    const result = parseSVGContent(svgText, config);

    expect(result.detectedMode).toBe('direct-id');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('getFieldBoundingBoxes', () => {
  let svgElement: SVGSVGElement;

  beforeEach(() => {
    // Create a mock SVG element with getBBox support
    svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svgElement);
  });

  afterEach(() => {
    document.body.removeChild(svgElement);
  });

  it('should get bounding boxes for elements with data-cell-id', () => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-cell-id', 'el1');

    // Mock getBBox
    g.getBBox = jest.fn().mockReturnValue({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });

    svgElement.appendChild(g);

    const mappings = [
      { dataId: 'input:test', name: 'test', elementId: 'el1', type: 'input' as const },
    ];

    const result = getFieldBoundingBoxes(svgElement, mappings);

    expect(result).toHaveLength(1);
    expect(result[0].bbox).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
  });

  it('should handle elements not found', () => {
    const mappings = [
      { dataId: 'input:test', name: 'test', elementId: 'test-id', type: 'input' as const },
    ];

    const result = getFieldBoundingBoxes(svgElement, mappings);

    expect(result).toHaveLength(1);
    expect(result[0].bbox).toBeNull();
  });

  it('should return null bbox if element not found', () => {
    const mappings = [
      { dataId: 'input:test', name: 'test', elementId: 'nonexistent', type: 'input' as const },
    ];

    const result = getFieldBoundingBoxes(svgElement, mappings);

    expect(result).toHaveLength(1);
    expect(result[0].bbox).toBeNull();
  });

  it('should handle multiple mappings', () => {
    const mappings = [
      { dataId: 'input:a', name: 'a', elementId: 'id1', type: 'input' as const },
      { dataId: 'output:b', name: 'b', elementId: 'id2', type: 'output' as const },
    ];

    const result = getFieldBoundingBoxes(svgElement, mappings);

    expect(result).toHaveLength(2);
  });

  it('should handle getBBox errors gracefully', () => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('id', 'error-id');
    rect.getBBox = jest.fn().mockImplementation(() => {
      throw new Error('getBBox failed');
    });

    svgElement.appendChild(rect);

    const mappings = [
      { dataId: 'input:test', name: 'test', elementId: 'error-id', type: 'input' as const },
    ];

    const result = getFieldBoundingBoxes(svgElement, mappings);

    expect(result).toHaveLength(1);
    expect(result[0].bbox).toBeNull();
  });

  it('should escape special characters in CSS selectors', () => {
    const mappings = [
      { dataId: 'input:test', name: 'test', elementId: 'id:with:colons', type: 'input' as const },
    ];

    const result = getFieldBoundingBoxes(svgElement, mappings);

    expect(result).toHaveLength(1);
    // Ens should handle special characters without errors
    expect(result[0]).toBeDefined();
  });
});
