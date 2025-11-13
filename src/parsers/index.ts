/**
 * SVG Parser Functions
 *
 * This module provides tool-specific parser functions that extract field mappings
 * from SVG files. Each parser is optimized for a specific SVG tool's output format.
 *
 * @example
 * ```typescript
 * import { parseDrawIoSVG } from 'svg-interactive-diagram/parsers';
 *
 * const result = parseDrawIoSVG(svgContent, {
 *   patterns: [
 *     { attribute: 'data-id', prefix: 'input:', type: 'input' },
 *     { attribute: 'data-id', prefix: 'output:', type: 'output' }
 *   ]
 * });
 *
 * if (result.errors.length > 0) {
 *   console.error('Parsing errors:', result.errors);
 * }
 *
 * console.log('Found fields:', result.mappings);
 * ```
 */

// Export types
export type { ParseOptions, ParseResult, SVGParser } from './types';

// Export parser functions (will be implemented)
export { parseDrawIoSVG } from './drawio';
export { parseFigmaSVG } from './figma';
export { parseInkscapeSVG } from './inkscape';
export { parseSVG } from './generic';
