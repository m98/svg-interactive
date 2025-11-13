import { FieldMapping } from '../types';
import { matchFieldPattern } from '../utils/fieldMatcher';
import { ParseOptions, ParseResult } from './types';
import { parseDrawIoSVG } from './drawio';

/**
 * Generic SVG parser with attribute support and auto-detection
 *
 * This parser can match fields based on ANY attribute (id, class, data-*, custom attributes).
 * If the SVG is a Draw.io file (has 'content' attribute), it automatically delegates to parseDrawIoSVG.
 *
 * @example
 * ```typescript
 * // Match by id attribute (default)
 * const result1 = parseSVG(svgContent, {
 *   patterns: [
 *     { prefix: 'input:', type: 'input' }, // attribute defaults to 'id'
 *     { prefix: 'output:', type: 'output' }
 *   ]
 * });
 *
 * // Match by custom attribute
 * const result2 = parseSVG(svgContent, {
 *   patterns: [
 *     { attribute: 'data-field-name', prefix: 'input-', type: 'input' },
 *     { attribute: 'class', regex: /^output-/, type: 'output' }
 *   ]
 * });
 *
 * // Mix multiple attributes
 * const result3 = parseSVG(svgContent, {
 *   patterns: [
 *     { attribute: 'id', prefix: 'input:', type: 'input' },
 *     { attribute: 'class', prefix: 'field-', type: 'output' }
 *   ]
 * });
 * ```
 *
 * @param svgContent - Raw SVG file content
 * @param options - Parsing options
 * @returns Parse result with mappings, errors, and metadata
 */
export function parseSVG(svgContent: string, options: ParseOptions): ParseResult {
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
          tool: 'generic',
          detectedMode: 'direct-id',
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
          tool: 'generic',
          detectedMode: 'direct-id',
          attributesUsed: [],
        },
      };
    }

    // Auto-detect Draw.io SVGs and delegate
    if (svgContent.includes('content="') && !options.mode) {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      const hasContentAttr = svgElement?.getAttribute('content');

      if (hasContentAttr) {
        // This is a Draw.io SVG, delegate to specialized parser
        return parseDrawIoSVG(svgContent, options);
      }
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
          tool: 'generic',
          detectedMode: 'direct-id',
          attributesUsed: [],
        },
      };
    }

    // Group patterns by attribute (default to 'id')
    const patternsByAttribute = new Map<string, ParseOptions['patterns']>();
    options.patterns.forEach((pattern) => {
      // Determine which attribute to match
      const attribute = pattern.attribute ?? 'id';

      const existing = patternsByAttribute.get(attribute) ?? [];
      patternsByAttribute.set(attribute, [...existing, pattern]);
    });

    // Process each attribute group
    patternsByAttribute.forEach((patterns, attribute) => {
      attributesUsed.add(attribute);

      // Query elements with this attribute
      const selector = `[${attribute}]`;
      const elements = svgElement.querySelectorAll(selector);

      if (elements.length === 0 && patternsByAttribute.size === 1) {
        errors.push(`No elements with ${attribute} attribute found in SVG`);
        return;
      }

      elements.forEach((element) => {
        const attrValue = element.getAttribute(attribute);

        if (attrValue) {
          // Match against field patterns
          const match = matchFieldPattern(attrValue, patterns);

          if (match) {
            // For elements without an id, use the attribute value as elementId
            const elementId = element.getAttribute('id') ?? attrValue;

            mappings.push({
              dataId: attrValue,
              name: match.name,
              elementId,
              type: match.type,
            });
          }
        }
      });
    });

    if (mappings.length === 0) {
      errors.push('No fields matched the configured patterns');
    }
  } catch (error) {
    errors.push(`Error parsing SVG: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    mappings,
    errors,
    metadata: {
      tool: 'generic',
      detectedMode: 'direct-id',
      attributesUsed: Array.from(attributesUsed),
    },
  };
}
