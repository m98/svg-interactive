# API Reference

Complete API documentation for `svg-interactive`.

## InteractiveSVG Component

The main React component for creating interactive SVG diagrams.

### Basic Usage

```tsx
import { InteractiveSVG } from 'svg-interactive';

<InteractiveSVG
  svgUrl="/diagram.svg"
  config={{
    patterns: [
      { prefix: 'input-', type: 'input' },
      { prefix: 'output-', type: 'output' }
    ]
  }}
/>
```

---

## Props Reference

### SVG Source

#### `svgUrl`
- **Type**: `string`
- **Required**: One of `svgUrl` or `svgContent` required
- **Description**: URL to load SVG file from

```tsx
<InteractiveSVG svgUrl="/path/to/diagram.svg" ... />
```

#### `svgContent`
- **Type**: `string`
- **Required**: One of `svgUrl` or `svgContent` required
- **Description**: Raw SVG content as string

```tsx
const svgString = `<svg>...</svg>`;
<InteractiveSVG svgContent={svgString} ... />
```

---

### Configuration

#### `config`
- **Type**: `FieldConfig`
- **Required**: Yes
- **Description**: Field matching configuration

```tsx
<InteractiveSVG
  config={{
    matchingMode: 'auto',  // or 'direct-id' | 'data-id'
    patterns: [
      { prefix: 'input-', type: 'input' },
      { prefix: 'output-', type: 'output' }
    ]
  }}
/>
```

**FieldConfig Interface**:
```typescript
interface FieldConfig {
  patterns: FieldPattern[];
  matchingMode?: 'auto' | 'direct-id' | 'data-id';  // Default: 'auto'
}
```

**FieldPattern Interface**:
```typescript
interface FieldPattern {
  prefix?: string;        // e.g., "input-"
  regex?: RegExp;         // e.g., /^param-(.+)/
  type: 'input' | 'output';
  useDataId?: boolean;    // Per-pattern override for matching mode
}
```

**Examples**:

```tsx
// Prefix matching
{ prefix: 'input-', type: 'input' }
// Matches: input-temperature, input-pressure
// Extracts: temperature, pressure

// Regex matching
{ regex: /^IN_(.+)$/, type: 'input' }
// Matches: IN_TEMP, IN_PRESSURE
// Extracts: TEMP, PRESSURE

// Multiple patterns
patterns: [
  { prefix: 'input-', type: 'input' },
  { prefix: 'param-', type: 'input' },
  { prefix: 'output-', type: 'output' },
  { prefix: 'result-', type: 'output' }
]
```

---

### Callbacks

#### `onInputChange`
- **Type**: `(name: string, value: string, allInputs: Record<string, string>) => void`
- **Description**: Called when any input value changes

```tsx
<InteractiveSVG
  onInputChange={(name, value, allInputs) => {
    console.log(`${name} changed to: ${value}`);
    console.log('All inputs:', allInputs);
  }}
/>
```

#### `onOutputCompute`
- **Type**: `(inputs: Record<string, string>) => Record<string, string>`
- **Description**: Computes all output values from current inputs

```tsx
<InteractiveSVG
  onOutputCompute={(inputs) => ({
    sum: (parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')).toString(),
    product: (parseFloat(inputs.a || '0') * parseFloat(inputs.b || '0')).toString()
  })}
/>
```

#### `onOutputUpdate`
- **Type**: `Record<string, (inputs: Record<string, string>) => string>`
- **Description**: Per-field output computation functions

```tsx
<InteractiveSVG
  onOutputUpdate={{
    total: (inputs) => (parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')).toString(),
    average: (inputs) => {
      const sum = parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0');
      return (sum / 2).toString();
    }
  }}
/>
```

---

### Controlled Values

#### `inputValues`
- **Type**: `Record<string, string>`
- **Description**: Controlled input values (for external state management)

```tsx
const [inputs, setInputs] = useState({ temperature: '25' });

<InteractiveSVG
  inputValues={inputs}
  onInputChange={(name, value, allInputs) => {
    setInputs(allInputs);
  }}
/>
```

#### `outputValues`
- **Type**: `Record<string, string>`
- **Description**: Controlled output values

```tsx
const [outputs, setOutputs] = useState({});

<InteractiveSVG
  outputValues={outputs}
  onOutputCompute={(inputs) => {
    const newOutputs = { result: compute(inputs) };
    setOutputs(newOutputs);
    return newOutputs;
  }}
/>
```

---

### Custom Rendering

#### `renderInput`
- **Type**: `(props: InputFieldProps) => ReactNode`
- **Description**: Custom input component renderer

```tsx
<InteractiveSVG
  renderInput={(props) => (
    <input
      type="number"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className={props.className}
      style={props.style}
      min="0"
      max="100"
    />
  )}
/>
```

**InputFieldProps**:
```typescript
interface InputFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}
```

#### `renderOutput`
- **Type**: `(props: OutputFieldProps) => ReactNode`
- **Description**: Custom output component renderer

```tsx
<InteractiveSVG
  renderOutput={(props) => (
    <div className={props.className} style={props.style}>
      <strong>{props.name}:</strong> {props.value}
    </div>
  )}
/>
```

**OutputFieldProps**:
```typescript
interface OutputFieldProps {
  name: string;
  value: string;
  className?: string;
  style?: CSSProperties;
}
```

---

### Styling

#### `theme`
- **Type**: `'default' | 'minimal' | 'bordered' | 'none'`
- **Default**: `'default'`
- **Description**: Built-in theme to apply

```tsx
<InteractiveSVG theme="bordered" ... />
```

**Themes**:
- `default`: Blue inputs, green outputs, 2px borders
- `minimal`: Simple 1px borders, no colors
- `bordered`: Bold borders with shadows
- `none`: No default styling (bring your own)

#### `inputClassName`
- **Type**: `string`
- **Description**: CSS class name(s) for input fields

```tsx
<InteractiveSVG
  inputClassName="px-3 py-2 border-2 border-blue-500 rounded"
/>
```

#### `outputClassName`
- **Type**: `string`
- **Description**: CSS class name(s) for output fields

```tsx
<InteractiveSVG
  outputClassName="px-3 py-2 bg-green-50 border-2 border-green-500 rounded"
/>
```

#### `inputStyle`
- **Type**: `CSSProperties`
- **Description**: Inline styles for input fields

```tsx
<InteractiveSVG
  inputStyle={{
    border: '2px solid #3B82F6',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '14px'
  }}
/>
```

#### `outputStyle`
- **Type**: `CSSProperties`
- **Description**: Inline styles for output fields

```tsx
<InteractiveSVG
  outputStyle={{
    border: '2px solid #10B981',
    borderRadius: '8px',
    padding: '8px',
    background: '#F0FDF4'
  }}
/>
```

---

### Debugging

#### `debug`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Show debug panel with field information

```tsx
<InteractiveSVG debug={true} ... />
```

**Debug panel shows**:
- Matching mode (direct-id or data-id)
- Total fields found
- Input fields list
- Output fields list
- Configuration errors
- SVG dimensions

#### `onDebugInfo`
- **Type**: `(info: DebugInfo) => void`
- **Description**: Callback with debug information

```tsx
<InteractiveSVG
  onDebugInfo={(info) => {
    console.log('Mode:', info.matchingMode);
    console.log('Fields:', info.totalFields);
    console.log('Inputs:', info.inputFields);
    console.log('Outputs:', info.outputFields);
    console.log('Errors:', info.configErrors);
  }}
/>
```

**DebugInfo Interface**:
```typescript
interface DebugInfo {
  matchingMode: 'direct-id' | 'data-id';
  totalFields: number;
  inputFields: number;
  outputFields: number;
  fields: Array<{ name: string; type: 'input' | 'output'; dataId: string }>;
  configErrors?: string[];
  parseErrors?: string[];
  svgDimensions?: { width: number; height: number };
}
```

---

## CSS Variables

Customize default styling with CSS variables:

```css
:root {
  /* Input field styling */
  --svg-input-border: #3B82F6;
  --svg-input-bg: #FFFFFF;
  --svg-input-focus-ring: rgba(59, 130, 246, 0.5);

  /* Output field styling */
  --svg-output-border: #10B981;
  --svg-output-bg: #F0FDF4;

  /* General */
  --svg-field-font-size: 12px;
  --svg-field-border-radius: 4px;
  --svg-field-padding: 2px 6px;
}
```

---

## Importing Styles

Import default styles in your app:

```tsx
// App.tsx or index.tsx
import 'svg-interactive/styles';
```

Or import specific theme:

```css
/* In your CSS file */
@import 'svg-interactive/styles';
```

---

## TypeScript Types

All types are exported for use in your application:

```typescript
import type {
  FieldConfig,
  FieldPattern,
  InteractiveSVGProps,
  InputFieldProps,
  OutputFieldProps,
  DebugInfo,
  FieldData,
  FieldMapping
} from 'svg-interactive';
```

---

## Examples

### Complete Example

```tsx
import { InteractiveSVG } from 'svg-interactive';
import 'svg-interactive/styles';
import { useState } from 'react';

function Calculator() {
  const [inputs, setInputs] = useState({ a: '0', b: '0' });

  return (
    <InteractiveSVG
      svgUrl="/calculator.svg"
      config={{
        matchingMode: 'auto',
        patterns: [
          { prefix: 'input-', type: 'input' },
          { prefix: 'output-', type: 'output' }
        ]
      }}
      inputValues={inputs}
      onInputChange={(name, value, allInputs) => {
        setInputs(allInputs);
      }}
      onOutputCompute={(inputs) => ({
        sum: (parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')).toString(),
        product: (parseFloat(inputs.a || '0') * parseFloat(inputs.b || '0')).toString()
      })}
      theme="bordered"
      inputClassName="calculator-input"
      outputClassName="calculator-output"
      debug={true}
      onDebugInfo={(info) => {
        console.log('Calculator loaded:', info.totalFields, 'fields');
      }}
    />
  );
}
```

### Custom Renderers

```tsx
<InteractiveSVG
  renderInput={(props) => (
    <input
      type="range"
      min="0"
      max="100"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className={props.className}
    />
  )}
  renderOutput={(props) => (
    <div className="custom-output">
      <span className="label">{props.name}:</span>
      <span className="value">{props.value}</span>
      <span className="unit">°C</span>
    </div>
  )}
/>
```

---

## Browser Support

**Minimum Requirements**:
- Chrome/Edge 88+
- Firefox 90+
- Safari 14+

**Required Features**:
- SVG `foreignObject` support
- ES2015+ JavaScript

---

## Next Steps

- **[Troubleshooting Guide](./troubleshooting.md)** - Fix common issues
- **[Tool-Specific Guides](./README.md)** - Prepare SVGs
- **[Examples](../examples)** - See working examples
