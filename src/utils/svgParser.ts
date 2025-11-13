import { FieldMapping } from '../types';

/**
 * @deprecated Legacy parser functions have been moved to src/parsers/
 * Use parseDrawIoSVG, parseFigmaSVG, parseInkscapeSVG, or parseSVG instead
 */

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
