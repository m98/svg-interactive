import type { ComponentType } from 'react';
import { Calculator, calculatorPreset } from './01-basic/calculator';
import { HelloWorld, helloWorldPreset } from './01-basic/hello-world';
import { TemperatureConverter, temperaturePreset } from './01-basic/temperature-converter';
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
    ...calculatorPreset,
    Component: Calculator
  }
];

export const exampleGroups: ExampleGroup[] = [
  {
    id: 'basics',
    title: 'Foundations',
    description: 'Core patterns for inputs, outputs, and simple computations.',
    items: basics
  }
];

export const examples = [...basics];
export const exampleMap = new Map<string, ExampleEntry>(examples.map((example) => [example.id, example]));

export function getExampleById(id: string): ExampleEntry | undefined {
  return exampleMap.get(id);
}
