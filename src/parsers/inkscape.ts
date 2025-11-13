import { ParseOptions, ParseResult } from './types';
import { parseSVG } from './generic';

/**
 * Parses an Inkscape SVG file
 *
 * Inkscape SVGs use direct element IDs. This parser is optimized for Inkscape's output format
 * but uses the generic parser under the hood.
 *
 * Common Inkscape patterns:
 * - Element IDs are auto-generated (e.g., 'rect123', 'path456') or custom if named in Inkscape
 * - Layer names are stored in 'inkscape:label' attribute
 * - Use prefix or regex patterns to match interactive fields
 * - Can match by id, inkscape:label, or any other attribute
 *
 * @example
 * ```typescript
 * // Match by element ID
 * const result = parseSVG(svgContent, {
 *   patterns: [
 *     { prefix: 'input-', type: 'input' },
 *     { prefix: 'output-', type: 'output' }
 *   ]
 * });
 *
 * // Match by Inkscape layer label
 * const result2 = parseInkscapeSVG(svgContent, {
 *   patterns: [
 *     { attribute: 'inkscape:label', prefix: 'field:', type: 'input' }
 *   ]
 * });
 * ```
 *
 * @param svgContent - Raw SVG file content
 * @param options - Parsing options
 * @returns Parse result with mappings, errors, and metadata
 */
export function parseInkscapeSVG(svgContent: string, options: ParseOptions): ParseResult {
  // Use generic parser with direct-id mode
  const result = parseSVG(svgContent, {
    ...options,
    mode: options.mode ?? 'direct-id', // Force direct-id for Inkscape
  });

  // Override tool metadata
  return {
    ...result,
    metadata: {
      ...result.metadata,
      tool: 'inkscape',
    },
  };
}
