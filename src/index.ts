// Import styles for bundling
import './styles/themes.css';

// Main component
export { InteractiveSVG } from './components/InteractiveSVG';

// Field components
export { InputField } from './components/InputField';
export { OutputField } from './components/OutputField';
export { DebugPanel } from './components/DebugPanel';

// Parser functions - NEW IN v2.0
export { parseDrawIoSVG } from './parsers/drawio';
export { parseFigmaSVG } from './parsers/figma';
export { parseInkscapeSVG } from './parsers/inkscape';
export { parseSVG } from './parsers/generic';

// Hooks
export { useFieldOverlay } from './hooks/useFieldOverlay';

// Utilities
export { getFieldBoundingBoxes } from './utils/svgParser';
export { matchFieldPattern, validateFieldConfig } from './utils/fieldMatcher';
export { decodeHTMLEntities } from './utils/decodeHTML';

// Types
export type {
  FieldPattern,
  FieldConfig,
  FieldMapping,
  BoundingBox,
  FieldData,
  InputFieldProps,
  OutputFieldProps,
  DebugInfo,
  ThemeType,
  InteractiveSVGProps,
  SVGParserResult,
} from './types';

// Parser types
export type { ParseOptions, ParseResult, SVGParser } from './parsers/types';
