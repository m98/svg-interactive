import { FieldMapping, FieldPattern } from '../types';

/**
 * Options for parsing SVG files
 */
export interface ParseOptions {
  /**
   * Field patterns to match against
   */
  patterns: FieldPattern[];

  /**
   * Override auto-detection and force a specific parsing mode
   * - 'data-id': Parse data-id attributes from mxfile XML (draw.io)
   * - 'direct-id': Parse id attributes directly from SVG elements
   * If not specified, parser will auto-detect the best mode
   */
  mode?: 'data-id' | 'direct-id';
}

/**
 * Result of parsing an SVG file
 */
export interface ParseResult {
  /**
   * Extracted field mappings
   */
  mappings: FieldMapping[];

  /**
   * Any errors encountered during parsing
   */
  errors: string[];

  /**
   * Metadata about the parsing process
   */
  metadata: {
    /**
     * Which tool was detected/used for parsing
     * - 'drawio': Detected draw.io SVG (has mxfile content attribute)
     * - 'generic': All other SVGs (Figma, Inkscape, hand-coded, etc.)
     */
    tool: 'drawio' | 'generic';

    /**
     * Which mode was actually used for parsing
     */
    detectedMode: 'data-id' | 'direct-id';

    /**
     * Which attributes were queried during parsing
     */
    attributesUsed: string[];
  };
}

/**
 * Parser function signature
 * All parser functions must implement this interface
 */
export type SVGParser = (svgContent: string, options: ParseOptions) => ParseResult;
