// Main component
export { InteractiveSVG } from './components/InteractiveSVG';

// Field components
export { InputField } from './components/InputField';
export { OutputField } from './components/OutputField';
export { DebugPanel } from './components/DebugPanel';

// Hooks
export { useSVGParser } from './hooks/useSVGParser';
export { useFieldOverlay } from './hooks/useFieldOverlay';

// Utilities
export {
  parseSVGContent,
  parseSVGWithDataId,
  parseSVGWithDirectId,
  getFieldBoundingBoxes,
} from './utils/svgParser';
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
