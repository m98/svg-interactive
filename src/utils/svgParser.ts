import { FieldMapping } from '../types';

/**
 * @deprecated Legacy parser functions have been moved to src/parsers/
 * Use parseDrawIoSVG, parseFigmaSVG, parseInkscapeSVG, or parseSVG instead
 */

/**
 * Finds rendered SVG elements and gets their bounding boxes
 * Supports both id attributes and data-cell-id attributes (for draw.io)
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
      // Try direct id attribute first (Figma, Inkscape, custom SVGs)
      let targetElement = svgElement.querySelector(`#${CSS.escape(mapping.elementId)}`);

      // Fallback to data-cell-id (draw.io SVGs don't add id attributes to rendered elements)
      if (!targetElement) {
        targetElement = svgElement.querySelector(`g[data-cell-id="${mapping.elementId}"]`);
      }

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
