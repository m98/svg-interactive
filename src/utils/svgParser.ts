import { FieldConfig, FieldMapping, SVGParserResult } from '../types';
import { decodeHTMLEntities } from './decodeHTML';
import { matchFieldPattern } from './fieldMatcher';

/**
 * Parses an SVG file using data-id attributes (draw.io approach)
 * Extracts field mappings from the content attribute (mxfile format)
 * @param svgText - Raw SVG file content
 * @param config - Field configuration
 * @returns Field mappings and any errors encountered
 */
export function parseSVGWithDataId(svgText: string, config: FieldConfig): SVGParserResult {
  const mappings: FieldMapping[] = [];
  const errors: string[] = [];

  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    if (!svgElement) {
      errors.push('No SVG element found in provided content');
      return { mappings, errors };
    }

    // Get the content attribute (contains mxfile XML data)
    const contentAttr = svgElement.getAttribute('content');

    if (!contentAttr) {
      errors.push('SVG does not contain a content attribute with diagram data');
      return { mappings, errors };
    }

    // Decode HTML entities
    const decodedContent = decodeHTMLEntities(contentAttr);

    // Parse the mxfile XML content
    const contentDoc = parser.parseFromString(decodedContent, 'text/xml');

    // Check for XML parsing errors
    const parserError = contentDoc.querySelector('parsererror');
    if (parserError) {
      errors.push('Failed to parse mxfile XML: ' + parserError.textContent);
      return { mappings, errors };
    }

    // Find all object elements with data-id attribute
    const objects = contentDoc.querySelectorAll('object[data-id]');

    if (objects.length === 0) {
      errors.push('No object elements with data-id found in SVG content');
    }

    objects.forEach((obj) => {
      const dataId = obj.getAttribute('data-id');
      const elementId = obj.getAttribute('id');

      if (dataId && elementId) {
        // Match against field patterns
        const match = matchFieldPattern(dataId, config.patterns);

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

    if (mappings.length === 0) {
      errors.push('No fields matched the configured patterns');
    }
  } catch (error) {
    errors.push(`Error parsing SVG: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { mappings, errors, detectedMode: 'data-id' };
}

/**
 * Parses an SVG file using direct ID attributes (custom SVG approach)
 * Directly matches SVG element IDs against configured patterns
 * @param svgText - Raw SVG file content
 * @param config - Field configuration
 * @returns Field mappings and any errors encountered
 */
export function parseSVGWithDirectId(svgText: string, config: FieldConfig): SVGParserResult {
  const mappings: FieldMapping[] = [];
  const errors: string[] = [];

  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    if (!svgElement) {
      errors.push('No SVG element found in provided content');
      return { mappings, errors, detectedMode: 'direct-id' };
    }

    // Get all elements with an id attribute
    const elementsWithId = svgElement.querySelectorAll('[id]');

    if (elementsWithId.length === 0) {
      errors.push('No elements with id attributes found in SVG');
      return { mappings, errors, detectedMode: 'direct-id' };
    }

    elementsWithId.forEach((element) => {
      const elementId = element.getAttribute('id');

      if (elementId) {
        // Match against field patterns
        const match = matchFieldPattern(elementId, config.patterns);

        if (match) {
          mappings.push({
            dataId: elementId, // In direct-id mode, dataId and elementId are the same
            name: match.name,
            elementId,
            type: match.type,
          });
        }
      }
    });

    if (mappings.length === 0) {
      errors.push('No element IDs matched the configured patterns');
    }
  } catch (error) {
    errors.push(`Error parsing SVG: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { mappings, errors, detectedMode: 'direct-id' };
}

/**
 * Parses SVG with mixed modes, respecting per-pattern useDataId flags
 * @param svgText - Raw SVG file content
 * @param config - Field configuration
 * @returns Field mappings and any errors encountered
 */
function parseSVGUnified(svgText: string, config: FieldConfig): SVGParserResult {
  const mappings: FieldMapping[] = [];
  const errors: string[] = [];
  let detectedMode: 'data-id' | 'direct-id' = 'direct-id';

  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    if (!svgElement) {
      errors.push('No SVG element found in provided content');
      return { mappings, errors, detectedMode };
    }

    // Check for each pattern's useDataId flag
    config.patterns.forEach((pattern) => {
      const useDataId = pattern.useDataId ?? null;

      if (useDataId === true) {
        // Force data-id mode for this pattern
        const contentAttr = svgElement.getAttribute('content');
        if (!contentAttr) {
          errors.push(`Pattern requires data-id mode but SVG has no content attribute`);
          return;
        }

        const decodedContent = decodeHTMLEntities(contentAttr);
        const contentDoc = parser.parseFromString(decodedContent, 'application/xml');
        const objects = contentDoc.querySelectorAll('object[data-id]');

        objects.forEach((obj) => {
          const dataId = obj.getAttribute('data-id');
          if (dataId) {
            const match = matchFieldPattern(dataId, [pattern]);
            if (match) {
              const cellId = obj.getAttribute('id');
              if (cellId) {
                mappings.push({
                  dataId,
                  name: match.name,
                  elementId: cellId,
                  type: match.type,
                });
                detectedMode = 'data-id';
              }
            }
          }
        });
      } else if (useDataId === false) {
        // Force direct-id mode for this pattern
        const elementsWithId = svgElement.querySelectorAll('[id]');
        elementsWithId.forEach((element) => {
          const elementId = element.getAttribute('id');
          if (elementId) {
            const match = matchFieldPattern(elementId, [pattern]);
            if (match) {
              mappings.push({
                dataId: elementId,
                name: match.name,
                elementId,
                type: match.type,
              });
            }
          }
        });
      } else {
        // Auto-detect mode for this pattern
        // Try data-id first
        const contentAttr = svgElement.getAttribute('content');
        if (contentAttr) {
          const decodedContent = decodeHTMLEntities(contentAttr);
          const contentDoc = parser.parseFromString(decodedContent, 'application/xml');
          const objects = contentDoc.querySelectorAll('object[data-id]');

          objects.forEach((obj) => {
            const dataId = obj.getAttribute('data-id');
            if (dataId) {
              const match = matchFieldPattern(dataId, [pattern]);
              if (match) {
                const cellId = obj.getAttribute('id');
                if (cellId) {
                  mappings.push({
                    dataId,
                    name: match.name,
                    elementId: cellId,
                    type: match.type,
                  });
                  detectedMode = 'data-id';
                }
              }
            }
          });
        }

        // Also try direct-id
        const elementsWithId = svgElement.querySelectorAll('[id]');
        elementsWithId.forEach((element) => {
          const elementId = element.getAttribute('id');
          if (elementId) {
            const match = matchFieldPattern(elementId, [pattern]);
            if (match) {
              // Avoid duplicates
              const exists = mappings.some((m) => m.elementId === elementId);
              if (!exists) {
                mappings.push({
                  dataId: elementId,
                  name: match.name,
                  elementId,
                  type: match.type,
                });
              }
            }
          }
        });
      }
    });

    if (mappings.length === 0) {
      errors.push('No fields matched the configured patterns');
    }
  } catch (error) {
    errors.push(`Error parsing SVG: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { mappings, errors, detectedMode };
}

/**
 * Auto-detects the best parsing mode and parses the SVG
 * @param svgText - Raw SVG file content
 * @param config - Field configuration
 * @returns Field mappings and any errors encountered
 */
export function parseSVGContent(svgText: string, config: FieldConfig): SVGParserResult {
  // Check if any pattern has explicit useDataId flag
  const hasExplicitFlags = config.patterns.some((p) => p.useDataId !== undefined);

  if (hasExplicitFlags) {
    // Use unified parser that respects per-pattern flags
    return parseSVGUnified(svgText, config);
  }

  // Legacy behavior: use global mode
  const mode = config.matchingMode ?? 'auto';

  // If explicit mode specified, use it
  if (mode === 'data-id') {
    return parseSVGWithDataId(svgText, config);
  }

  if (mode === 'direct-id') {
    return parseSVGWithDirectId(svgText, config);
  }

  // Auto-detect: check if SVG has content attribute
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  if (svgElement?.getAttribute('content')) {
    // Has content attribute, likely draw.io - use data-id mode
    return parseSVGWithDataId(svgText, config);
  }

  // No content attribute, use direct-id mode
  return parseSVGWithDirectId(svgText, config);
}

/**
 * Finds rendered SVG elements and gets their bounding boxes
 * Supports both data-cell-id (draw.io) and direct id attributes
 * @param svgElement - The rendered SVG DOM element
 * @param mappings - Field mappings to locate
 * @returns Array of field data with bounding boxes
 */
export function getFieldBoundingBoxes(
  svgElement: SVGSVGElement,
  mappings: FieldMapping[]
): Array<FieldMapping & { bbox: { x: number; y: number; width: number; height: number } | null }> {
  return mappings.map((mapping) => {
    try {
      // Try data-cell-id first (draw.io format)
      let targetElement = svgElement.querySelector(`g[data-cell-id="${mapping.elementId}"]`);

      // If not found, try direct id attribute
      targetElement ??= svgElement.querySelector(`#${CSS.escape(mapping.elementId)}`);

      if (targetElement && targetElement instanceof SVGGraphicsElement) {
        const bbox = targetElement.getBBox();
        return {
          ...mapping,
          bbox: {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
          },
        };
      }
    } catch (error) {
      console.warn(`Failed to get bounding box for ${mapping.elementId}:`, error);
    }

    return { ...mapping, bbox: null };
  });
}
