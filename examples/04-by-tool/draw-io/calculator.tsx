import { SvgInteractive, parseDrawIoSVG } from 'svg-interactive';
import 'svg-interactive/styles';
import type { ExamplePreset } from '../../presets';
import calculatorSvg from './calculator.drawio.svg?raw';

export const calculatorPreset: ExamplePreset = {
  id: 'calculator-drawio',
  title: 'Calculator (draw.io)',
  description:
    'Basic addition calculator with two inputs and one output. Demonstrates simple arithmetic operations with Draw.io diagrams.',
  category: 'Integrations',
  tags: ['draw.io', 'calculator', 'arithmetic', 'flowchart'],
  accentColor: '#60a5fa',
  svgContent: calculatorSvg,
  patterns: [
    { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
    { attribute: 'data-id', prefix: 'output-field-', type: 'output' },
  ],
  theme: 'default',
  defaultInputs: { one: '5', two: '3' },
  onOutputCompute: (inputs) => {
    const numOne = parseFloat(inputs.one ?? '0');
    const numTwo = parseFloat(inputs.two ?? '0');
    const result = numOne + numTwo;

    return {
      result: Number.isNaN(result) ? '0' : result.toString(),
    };
  },
};

export function Calculator() {
  const result = parseDrawIoSVG(calculatorSvg, {
    patterns: calculatorPreset.patterns,
  });

  return (
    <SvgInteractive
      svgContent={calculatorSvg}
      mappings={result.mappings}
      theme={calculatorPreset.theme}
      defaultInputs={calculatorPreset.defaultInputs}
      onOutputCompute={calculatorPreset.onOutputCompute}
    />
  );
}
