// Polyfill TextEncoder/TextDecoder for Node environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Load Jest DOM matchers
require('@testing-library/jest-dom');

// Mock CSS.escape if not available
if (!global.CSS) {
  global.CSS = {
    escape: (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
  };
}

// Ensure SVG elements have getBBox method available
if (typeof SVGGraphicsElement !== 'undefined') {
  if (!SVGGraphicsElement.prototype.getBBox) {
    SVGGraphicsElement.prototype.getBBox = function() {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 30,
        top: 0,
        right: 100,
        bottom: 30,
        left: 0
      };
    };
  }

  // Make common SVG elements inherit from SVGGraphicsElement
  const svgElements = [
    typeof SVGRectElement !== 'undefined' && SVGRectElement,
    typeof SVGCircleElement !== 'undefined' && SVGCircleElement,
    typeof SVGEllipseElement !== 'undefined' && SVGEllipseElement,
    typeof SVGLineElement !== 'undefined' && SVGLineElement,
    typeof SVGPolylineElement !== 'undefined' && SVGPolylineElement,
    typeof SVGPolygonElement !== 'undefined' && SVGPolygonElement,
    typeof SVGPathElement !== 'undefined' && SVGPathElement,
    typeof SVGGElement !== 'undefined' && SVGGElement,
  ].filter(Boolean);

  svgElements.forEach(ElementClass => {
    if (ElementClass && !Object.prototype.isPrototypeOf.call(SVGGraphicsElement.prototype, ElementClass.prototype)) {
      Object.setPrototypeOf(ElementClass.prototype, SVGGraphicsElement.prototype);
    }
  });
}
