import { FieldMapping } from '../types';

/**
 * Utility for getting bounding boxes of SVG elements from field mappings.
 *
 * This function takes field mappings produced by parsers (parseDrawIoSVG, parseSVG, etc.)
 * and locates the corresponding elements in the rendered SVG DOM to extract their
 * bounding box coordinates. This is essential for positioning foreignObject overlays.
 *
 * Supports multiple query strategies:
 * - Direct id attributes (Figma, Inkscape, custom SVGs)
 * - data-cell-id attributes (draw.io compatibility)
 * - Custom attribute matching (class, data-*, etc.)
 *
 * @param svgElement - The rendered SVG DOM element
 * @param mappings - Field mappings to locate (from parser output)
 * @returns Array of field data with bounding boxes (bbox may be null if element not found)
 */
export function getFieldBoundingBoxes(
  svgElement: SVGSVGElement,
  mappings: FieldMapping[]
): Array<FieldMapping & { bbox: { x: number; y: number; width: number; height: number } | null }> {
  return mappings.map((mapping) => {
    try {
      let targetElement: Element | null = null;

      // Strategy 1: If element has an id attribute, try querying by id
      // (This works when the matched element has an id, regardless of which attribute was used to match)
      targetElement = svgElement.querySelector(`#${CSS.escape(mapping.elementId)}`);

      // Strategy 2: Try data-cell-id (draw.io SVGs don't add id attributes to rendered elements)
      targetElement ??= svgElement.querySelector(`g[data-cell-id="${mapping.elementId}"]`);

      // Strategy 3: If we matched by a custom attribute and element has no id,
      // query by that attribute with the original matched value
      if (!targetElement && mapping.matchedAttribute) {
        // Escape special characters in attribute value for CSS selector
        const escapedValue = mapping.dataId.replace(/"/g, '\\"');
        const attrSelector = `[${mapping.matchedAttribute}="${escapedValue}"]`;
        targetElement = svgElement.querySelector(attrSelector);
      }

      // Check if element has getBBox method (more reliable than instanceof in test environments)
      if (
        targetElement &&
        'getBBox' in targetElement &&
        typeof targetElement.getBBox === 'function'
      ) {
        const bbox = (targetElement as SVGGraphicsElement).getBBox();
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
