import { FieldMapping } from '../types';
import { decodeHTMLEntities } from '../utils/decodeHTML';
import { matchFieldPattern } from '../utils/fieldMatcher';
import { ParseOptions, ParseResult } from './types';

/**
 * Parses a Draw.io SVG file
 *
 * Draw.io SVGs contain an encoded mxfile XML in the 'content' attribute.
 * This parser extracts field mappings from the mxfile XML structure.
 *
 * @example
 * ```typescript
 * const result = parseDrawIoSVG(svgContent, {
 *   patterns: [
 *     { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
 *     { attribute: 'data-id', prefix: 'output-field-', type: 'output' }
 *   ]
 * });
 * ```
 *
 * @param svgContent - Raw SVG file content
 * @param options - Parsing options
 * @returns Parse result with mappings, errors, and metadata
 */
export function parseDrawIoSVG(svgContent: string, options: ParseOptions): ParseResult {
  const mappings: FieldMapping[] = [];
  const errors: string[] = [];
  const attributesUsed: Set<string> = new Set();

  try {
    // Validate input
    if (!svgContent || typeof svgContent !== 'string') {
      return {
        mappings: [],
        errors: ['Invalid SVG content: Expected non-empty string'],
        metadata: {
          tool: 'drawio',
          detectedMode: 'data-id',
          attributesUsed: [],
        },
      };
    }

    if (!svgContent.includes('<svg')) {
      return {
        mappings: [],
        errors: [
          'Invalid SVG: Expected SVG content but received invalid string. ' +
            "Make sure you're passing the SVG file content, not a file path.",
        ],
        metadata: {
          tool: 'drawio',
          detectedMode: 'data-id',
          attributesUsed: [],
        },
      };
    }

    // Parse SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    if (!svgElement) {
      return {
        mappings: [],
        errors: ['No SVG element found in provided content'],
        metadata: {
          tool: 'drawio',
          detectedMode: 'data-id',
          attributesUsed: [],
        },
      };
    }

    // Check for draw.io content attribute
    const contentAttr = svgElement.getAttribute('content');
    if (!contentAttr) {
      return {
        mappings: [],
        errors: [
          'Draw.io SVG missing content attribute. ' +
            'This may not be a Draw.io SVG file. Try using parseFigmaSVG() or parseSVG() instead.',
        ],
        metadata: {
          tool: 'drawio',
          detectedMode: 'data-id',
          attributesUsed: [],
        },
      };
    }

    // Decode HTML entities
    const decodedContent = decodeHTMLEntities(contentAttr);

    // Parse the mxfile XML content
    const contentDoc = parser.parseFromString(decodedContent, 'text/xml');

    // Check for XML parsing errors
    const parserError = contentDoc.querySelector('parsererror');
    if (parserError) {
      return {
        mappings: [],
        errors: [`Failed to parse mxfile XML: ${parserError.textContent ?? 'Unknown error'}`],
        metadata: {
          tool: 'drawio',
          detectedMode: 'data-id',
          attributesUsed: [],
        },
      };
    }

    // Group patterns by attribute (or default to 'data-id')
    const patternsByAttribute = new Map<string, ParseOptions['patterns']>();
    options.patterns.forEach((pattern) => {
      // For draw.io, default to 'data-id' since that's the draw.io convention
      const attribute = pattern.attribute ?? 'data-id';

      const existing = patternsByAttribute.get(attribute) ?? [];
      patternsByAttribute.set(attribute, [...existing, pattern]);
    });

    // Process each attribute group
    patternsByAttribute.forEach((patterns, attribute) => {
      attributesUsed.add(attribute);

      if (attribute === 'data-id') {
        // Parse data-id attributes from mxfile XML
        const objects = contentDoc.querySelectorAll('object[data-id]');

        if (objects.length === 0 && patternsByAttribute.size === 1) {
          errors.push('No object elements with data-id found in SVG content');
        }

        objects.forEach((obj) => {
          const dataId = obj.getAttribute('data-id');
          const elementId = obj.getAttribute('id');

          if (dataId && elementId) {
            // Match against field patterns
            const match = matchFieldPattern(dataId, patterns);

            if (match) {
              mappings.push({
                dataId,
                name: match.name,
                elementId,
                type: match.type,
              });
            }
          }
        });
      } else {
        // Parse other attributes from mxfile XML
        const selector = `object[${attribute}]`;
        const objects = contentDoc.querySelectorAll(selector);

        objects.forEach((obj) => {
          const attrValue = obj.getAttribute(attribute);
          const elementId = obj.getAttribute('id');

          if (attrValue && elementId) {
            // Match against field patterns
            const match = matchFieldPattern(attrValue, patterns);

            if (match) {
              mappings.push({
                dataId: attrValue,
                name: match.name,
                elementId,
                type: match.type,
              });
            }
          }
        });
      }
    });

    if (mappings.length === 0) {
      errors.push('No fields matched the configured patterns');
    }
  } catch (error) {
    errors.push(
      `Error parsing Draw.io SVG: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return {
    mappings,
    errors,
    metadata: {
      tool: 'drawio',
      detectedMode: 'data-id',
      attributesUsed: Array.from(attributesUsed),
    },
  };
}
