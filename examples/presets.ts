import type { FieldPattern, ThemeType } from 'svg-interactive';

export type ExampleCategory = 'Basics' | 'Advanced' | 'Real World' | 'Integrations';

export type ExamplePreset = {
  id: string;
  title: string;
  description: string;
  category: ExampleCategory;
  tags: string[];
  accentColor: string;
  svgContent: string;
  patterns: FieldPattern[];
  theme?: ThemeType;
  debug?: boolean;
  defaultInputs?: Record<string, string>;
  onOutputCompute?: (inputs: Record<string, string>) => Record<string, string>;
};
