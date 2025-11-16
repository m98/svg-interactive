import type { ComponentType } from 'react';
import { Calculator as BasicCalculator, calculatorPreset as basicCalculatorPreset } from './01-basic/calculator';
import { HelloWorld, helloWorldPreset } from './01-basic/hello-world';
import { TemperatureConverter, temperaturePreset } from './01-basic/temperature-converter';
import { IdsArrayExample, idsArrayPreset } from './02-advanced/ids-array-matching';
import { Calculator as DrawioCalculator, calculatorPreset as drawioCalculatorPreset } from './04-by-tool/draw-io/calculator';
import type { ExamplePreset } from './presets';

export type ExampleEntry = ExamplePreset & {
  Component: ComponentType;
};

export type ExampleGroup = {
  id: string;
  title: string;
  description: string;
  items: ExampleEntry[];
};

const basics: ExampleEntry[] = [
  {
    ...helloWorldPreset,
    Component: HelloWorld
  },
  {
    ...temperaturePreset,
    Component: TemperatureConverter
  },
  {
    ...basicCalculatorPreset,
    Component: BasicCalculator
  }
];

const advanced: ExampleEntry[] = [
  {
    ...idsArrayPreset,
    Component: IdsArrayExample
  }
];

const drawio: ExampleEntry[] = [
  {
    ...drawioCalculatorPreset,
    Component: DrawioCalculator
  }
];

export const exampleGroups: ExampleGroup[] = [
  {
    id: 'basics',
    title: 'Foundations',
    description: 'Core patterns for inputs, outputs, and simple computations.',
    items: basics
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Advanced pattern matching techniques and complex scenarios.',
    items: advanced
  },
  {
    id: 'drawio',
    title: 'Draw.io',
    description: 'Professional diagrams exported from Draw.io with interactive fields.',
    items: drawio
  }
];

export const examples = [...basics, ...advanced, ...drawio];
export const exampleMap = new Map<string, ExampleEntry>(examples.map((example) => [example.id, example]));

export function getExampleById(id: string): ExampleEntry | undefined {
  return exampleMap.get(id);
}
