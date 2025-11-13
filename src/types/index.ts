import { CSSProperties, ReactNode } from 'react';

export interface FieldPattern {
  /** String prefix to match (e.g., "input-field-") */
  prefix?: string;
  /** Regular expression to match */
  regex?: RegExp;
  /** Field type */
  type: 'input' | 'output';
  /**
   * Matching mode:
   * - true: Use data-id attribute (for draw.io and auto-generated IDs)
   * - false/undefined: Use id attribute directly (for custom SVGs)
   */
  useDataId?: boolean;
}

export interface FieldConfig {
  patterns: FieldPattern[];
  /**
   * Global matching mode (can be overridden per pattern):
   * - 'data-id': Look for data-id attributes in mxfile content (draw.io)
   * - 'direct-id': Match SVG element IDs directly (custom SVGs)
   * - 'auto': Auto-detect based on SVG structure (default)
   */
  matchingMode?: 'data-id' | 'direct-id' | 'auto';
}

export interface FieldMapping {
  dataId: string;
  name: string;
  elementId: string;
  type: 'input' | 'output';
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FieldData extends FieldMapping {
  bbox: BoundingBox | null;
}

export interface InputFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}

export interface OutputFieldProps {
  name: string;
  value: string;
  className?: string;
  style?: CSSProperties;
}

export interface DebugInfo {
  totalFields: number;
  inputFields: FieldData[];
  outputFields: FieldData[];
  rawMappings: FieldMapping[];
  matchingMode?: 'data-id' | 'direct-id';
  svgDimensions?: {
    width: number;
    height: number;
  };
  errors?: string[];
}

export type ThemeType = 'default' | 'minimal' | 'bordered' | 'none';

export interface InteractiveSVGProps {
  /** URL to the SVG file */
  svgUrl?: string;
  /** Raw SVG content string (alternative to svgUrl) */
  svgContent?: string;
  /** Field matching configuration */
  config: FieldConfig;
  /** Callback when any input value changes */
  onInputChange?: (name: string, value: string, allValues: Record<string, string>) => void;
  /**
   * Optional: Function to compute output values from inputs
   * If not provided, outputs are independent placeholders
   */
  onOutputCompute?: (inputValues: Record<string, string>) => Record<string, string>;
  /**
   * Optional: Individual output value setters
   * Key is output field name, value is the content to display
   */
  outputValues?: Record<string, string>;
  /**
   * Optional: Individual callbacks for output updates
   * Key is output field name, value is callback function
   */
  onOutputUpdate?: Record<string, (inputValues: Record<string, string>) => string>;
  /** Custom render function for input fields */
  renderInput?: (props: InputFieldProps) => ReactNode;
  /** Custom render function for output fields */
  renderOutput?: (props: OutputFieldProps) => ReactNode;
  /** CSS class name for input fields */
  inputClassName?: string;
  /** CSS class name for output fields */
  outputClassName?: string;
  /** Inline styles for input fields */
  inputStyle?: CSSProperties;
  /** Inline styles for output fields */
  outputStyle?: CSSProperties;
  /** Theme preset */
  theme?: ThemeType;
  /** Enable debug mode */
  debug?: boolean;
  /** Callback for debug information */
  onDebugInfo?: (info: DebugInfo) => void;
  /** Container class name */
  className?: string;
  /** Container style */
  style?: CSSProperties;
}

export interface SVGParserResult {
  mappings: FieldMapping[];
  errors: string[];
  detectedMode?: 'data-id' | 'direct-id';
}
