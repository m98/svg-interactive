import { ParseOptions, ParseResult } from './types';
import { parseSVG } from './generic';

/**
 * Parses a Figma SVG file
 *
 * Figma SVGs use direct element IDs. This parser is optimized for Figma's output format
 * but uses the generic parser under the hood.
 *
 * Common Figma patterns:
 * - Element IDs are usually the layer names from Figma
 * - Use prefix or regex patterns to match interactive fields
 * - Supports any attribute matching (id, class, data-*, etc.)
 *
 * @example
 * ```typescript
 * // Match by element ID (Figma layer names)
 * const result = parseFigmaSVG(svgContent, {
 *   patterns: [
 *     { prefix: 'input:', type: 'input' },
 *     { prefix: 'output:', type: 'output' }
 *   ]
 * });
 *
 * // Match by class attribute
 * const result2 = parseFigmaSVG(svgContent, {
 *   patterns: [
 *     { attribute: 'class', regex: /input-field-/, type: 'input' }
 *   ]
 * });
 * ```
 *
 * @param svgContent - Raw SVG file content
 * @param options - Parsing options
 * @returns Parse result with mappings, errors, and metadata
 */
export function parseFigmaSVG(svgContent: string, options: ParseOptions): ParseResult {
  // Use generic parser with direct-id mode
  const result = parseSVG(svgContent, {
    ...options,
    mode: options.mode ?? 'direct-id', // Force direct-id for Figma
  });

  // Override tool metadata
  return {
    ...result,
    metadata: {
      ...result.metadata,
      tool: 'figma',
    },
  };
}
