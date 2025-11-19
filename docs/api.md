# API Reference

Complete API documentation for `svg-interactive`.

## Table of Contents

- [Quick Start](#quick-start)
- [Parser Functions](#parser-functions)
- [InteractiveSVG Component](#interactivesvg-component)
- [TypeScript Types](#typescript-types)
- [CSS Variables](#css-variables)
- [Examples](#examples)

---

## Quick Start

**svg-interactive** uses a **two-step pattern**:

1. **Parse** your SVG to extract field mappings
2. **Render** with the InteractiveSVG component

```tsx
import { parseSVG, InteractiveSVG } from 'svg-interactive';
import 'svg-interactive/styles';

// Step 1: Parse SVG
const svgContent = await fetch('/diagram.svg').then(r => r.text());
const { mappings } = parseSVG(svgContent, {
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ]
});

// Step 2: Render
<InteractiveSVG
  mappings={mappings}
  svgContent={svgContent}
  onOutputCompute={(inputs) => ({
    result: `You entered: ${inputs.temperature}`
  })}
/>
```

---

## Parser Functions

All parser functions follow the same signature and return the same result structure.

### `parseSVG(svgContent, options)`

**Generic parser** - Works with any SVG. Supports matching by any attribute (id, class, data-*, custom).

```tsx
import { parseSVG } from 'svg-interactive';

const result = parseSVG(svgContent, {
  patterns: [
    { prefix: 'input-', type: 'input' },  // Defaults to id attribute
    { attribute: 'class', prefix: 'field-', type: 'output' }
  ]
});
```

**Auto-detects draw.io SVGs** and delegates to `parseDrawIoSVG` automatically.

### `parseDrawIoSVG(svgContent, options)`

**Draw.io specific parser** - Extracts fields from draw.io SVG exports.

```tsx
import { parseDrawIoSVG } from 'svg-interactive';

const result = parseDrawIoSVG(svgContent, {
  patterns: [
    { attribute: 'data-id', prefix: 'input:', type: 'input' },
    { attribute: 'data-id', prefix: 'output:', type: 'output' }
  ]
});
```



---

## ParseOptions

Configuration for parser functions.

```typescript
interface ParseOptions {
  patterns: FieldPattern[];
  mode?: 'data-id' | 'direct-id';  // Optional: Override auto-detection
}
```

### `patterns`
- **Type**: `FieldPattern[]`
- **Required**: Yes
- **Description**: Array of field patterns to match

```tsx
patterns: [
  // Match by prefix (default attribute: 'id')
  { prefix: 'input-', type: 'input' },

  // Match by regex
  { regex: /^OUTPUT_(.+)$/, type: 'output' },

  // Match by custom attribute
  { attribute: 'class', prefix: 'field-', type: 'input' },

  // Match by data attribute
  { attribute: 'data-field', prefix: 'input-', type: 'input' }
]
```

### `mode`
- **Type**: `'data-id' | 'direct-id'`
- **Optional**: Yes (auto-detected if not provided)
- **Description**: Force specific parsing mode

---

## FieldPattern

Defines how to match fields in SVG. This is a **discriminated union** that enforces exactly one matching strategy per pattern at compile-time.

```typescript
type FieldPattern =
  | { prefix: string; type: 'input' | 'output'; attribute?: string }
  | { regex: RegExp; type: 'input' | 'output'; attribute?: string }
  | { ids: string[]; type: 'input' | 'output'; attribute?: string };
```

**Matching Strategies** (exactly ONE required per pattern):
- `prefix` - Match by string prefix (e.g., "input-")
- `regex` - Match by regular expression pattern
- `ids` - Match exact list of element IDs

**Type Safety**: The discriminated union ensures you cannot accidentally combine multiple strategies. TypeScript will catch this at compile-time.

### Examples

```tsx
// Match id="input-temperature"
{ prefix: 'input-', type: 'input' }

// Match class="field-input-name"
{ attribute: 'class', prefix: 'field-input-', type: 'input' }

// Match data-field="output-result"
{ attribute: 'data-field', prefix: 'output-', type: 'output' }

// Regex: match PARAM_TEMP, PARAM_PRESSURE
{ regex: /^PARAM_(.+)$/, type: 'input' }

// IDs array: match exact list of elements
{ ids: ['temperature', 'pressure', 'volume'], type: 'input' }

// IDs array with custom attribute
{ attribute: 'data-id', ids: ['sensor-1', 'sensor-2'], type: 'input' }

// Mix different strategies (in separate patterns)
patterns: [
  { ids: ['temp-sensor', 'pressure-sensor'], type: 'input' },
  { prefix: 'output-', type: 'output' },
  { regex: /^CALC_(.+)$/, type: 'output' }
]
```

### When to use `ids` array

Use the `ids` array when:
- You have a fixed, known set of element IDs
- Element IDs don't follow a consistent prefix pattern
- You want explicit control over which elements are interactive
- Working with legacy SVGs with inconsistent naming conventions
- You have 100+ specific elements to make interactive

**Example use case:**
```tsx
// Complex draw.io diagram with specific sensors
const patterns: FieldPattern[] = [
  {
    attribute: 'data-id',
    ids: [
      'temp-sensor-1', 'temp-sensor-2', 'temp-sensor-3',
      'pressure-gauge-a', 'pressure-gauge-b',
      'flow-meter-inlet', 'flow-meter-outlet'
    ],
    type: 'input'
  }
];
```

---

## ParseResult

Result returned by all parser functions.

```typescript
interface ParseResult {
  mappings: FieldMapping[];
  errors: string[];
  metadata: {
    tool: 'drawio' | 'generic';  // drawio for Draw.io SVGs, generic for all others
    detectedMode: 'data-id' | 'direct-id';
    attributesUsed: string[];
  };
}
```

### Usage

```tsx
const { mappings, errors, metadata } = parseSVG(svgContent, options);

if (errors.length > 0) {
  console.error('Parsing errors:', errors);
}

console.log(`Found ${mappings.length} fields using ${metadata.tool} parser`);
console.log(`Mode: ${metadata.detectedMode}`);
console.log(`Attributes: ${metadata.attributesUsed.join(', ')}`);
```

---

## Validation Functions

Runtime validation utilities for dynamic pattern configurations.

### `isValidFieldPattern(value)`

Type guard that validates if a value is a valid `FieldPattern` at runtime.

**Use Cases:**
- Validating patterns from JSON config files
- Checking patterns from API responses
- Plugin systems with dynamic pattern loading

```typescript
import { isValidFieldPattern } from 'svg-interactive';

const pattern = JSON.parse(configString);
if (isValidFieldPattern(pattern)) {
  // TypeScript now knows pattern is FieldPattern
  patterns.push(pattern);
} else {
  console.error('Invalid pattern configuration');
}
```

**Returns:** `boolean` - `true` if valid, `false` otherwise

### `validateFieldPatterns(patterns)`

Validates an array of field patterns and returns detailed error messages.

```typescript
import { validateFieldPatterns } from 'svg-interactive';

const patterns = loadPatternsFromAPI();
const errors = validateFieldPatterns(patterns);

if (errors.length > 0) {
  console.error('Pattern validation errors:', errors);
  // errors = ['Pattern 0: must have either prefix, regex, or ids', ...]
} else {
  // Safe to use patterns
}
```

**Parameters:**
- `patterns` - `unknown` - Value to validate as pattern array

**Returns:** `string[]` - Array of error messages (empty if valid)

**Validation Rules:**
- Patterns must be an array
- Each pattern must have exactly one strategy: `prefix`, `regex`, or `ids`
- `type` must be `'input'` or `'output'`
- `ids` array cannot be empty and must contain only strings
- `attribute` (if provided) must be a string

---

## InteractiveSVG Component

Main React component for rendering interactive SVG diagrams.

### Required Props

#### `mappings`
- **Type**: `FieldMapping[]`
- **Required**: Yes
- **Description**: Pre-parsed field mappings from a parser function

```tsx
const { mappings } = parseSVG(svgContent, { patterns });

<InteractiveSVG mappings={mappings} svgContent={svgContent} />
```

#### `svgContent`
- **Type**: `string`
- **Required**: Yes
- **Description**: Raw SVG content as string

```tsx
const svgContent = await fetch('/diagram.svg').then(r => r.text());

<InteractiveSVG mappings={mappings} svgContent={svgContent} />
```

#### `defaultInputs`
- **Type**: `Record<string, string>`
- **Optional**: Yes
- **Description**: Pre-populate input fields with initial values

```tsx
<InteractiveSVG
  mappings={mappings}
  svgContent={svgContent}
  defaultInputs={{ temperature: '25', pressure: '101.3' }}
/>
```

**Note**: Default values are applied when the component mounts. Existing values take precedence over defaults if inputs are already populated.

---

### Callbacks

#### `onInputChange`
- **Type**: `(name: string, value: string, allInputs: Record<string, string>) => void`
- **Optional**: Yes
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
- **Optional**: Yes
- **Description**: Computes all output values from current inputs

```tsx
<InteractiveSVG
  onOutputCompute={(inputs) => ({
    sum: String(parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')),
    product: String(parseFloat(inputs.a || '0') * parseFloat(inputs.b || '0'))
  })}
/>
```

#### `onOutputUpdate`
- **Type**: `Record<string, (inputs: Record<string, string>) => string>`
- **Optional**: Yes
- **Description**: Per-field output computation functions

```tsx
<InteractiveSVG
  onOutputUpdate={{
    total: (inputs) => String(parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')),
    average: (inputs) => {
      const sum = parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0');
      return String(sum / 2);
    }
  }}
/>
```

---

### Controlled Output Values

#### `outputValues`
- **Type**: `Record<string, string>`
- **Optional**: Yes
- **Description**: External output values (controlled mode)

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
- **Optional**: Yes
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
      placeholder={props.placeholder}
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
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}
```

#### `renderOutput`
- **Type**: `(props: OutputFieldProps) => ReactNode`
- **Optional**: Yes
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
- **Optional**: Yes
- **Description**: Built-in theme preset

```tsx
<InteractiveSVG theme="bordered" />
```

**Available themes**:
- `default`: Blue inputs, green outputs, 2px borders, uses CSS variables
- `minimal`: Simple 1px gray borders, minimal styling
- `bordered`: Bold 3px borders with shadows
- `none`: No default styling (completely customizable)

#### `inputClassName`
- **Type**: `string`
- **Optional**: Yes
- **Description**: CSS class name(s) for input fields

```tsx
<InteractiveSVG inputClassName="px-3 py-2 border-2 border-blue-500 rounded" />
```

#### `outputClassName`
- **Type**: `string`
- **Optional**: Yes
- **Description**: CSS class name(s) for output fields

```tsx
<InteractiveSVG outputClassName="px-3 py-2 bg-green-50 border-2 border-green-500" />
```

#### `inputStyle`
- **Type**: `CSSProperties`
- **Optional**: Yes
- **Description**: Inline styles for input fields

```tsx
<InteractiveSVG
  inputStyle={{
    border: '2px solid #3B82F6',
    borderRadius: '8px',
    padding: '8px'
  }}
/>
```

#### `outputStyle`
- **Type**: `CSSProperties`
- **Optional**: Yes
- **Description**: Inline styles for output fields

```tsx
<InteractiveSVG
  outputStyle={{
    border: '2px solid #10B981',
    background: '#F0FDF4',
    borderRadius: '8px'
  }}
/>
```

#### `className`
- **Type**: `string`
- **Optional**: Yes
- **Description**: CSS class for root container

```tsx
<InteractiveSVG className="my-diagram-container" />
```

#### `style`
- **Type**: `CSSProperties`
- **Optional**: Yes
- **Description**: Inline styles for root container

```tsx
<InteractiveSVG style={{ maxWidth: '800px', margin: '0 auto' }} />
```

---

### Debugging

#### `debug`
- **Type**: `boolean`
- **Default**: `false`
- **Optional**: Yes
- **Description**: Show debug panel with field information

```tsx
<InteractiveSVG debug={true} />
```

**Debug panel displays**:
- Total fields found
- Input fields (name, type, bbox)
- Output fields (name, type, bbox)
- Raw mappings
- SVG dimensions
- Errors (if any)

#### `onDebugInfo`
- **Type**: `(info: DebugInfo) => void`
- **Optional**: Yes
- **Description**: Callback with debug information

```tsx
<InteractiveSVG
  onDebugInfo={(info) => {
    console.log('Total fields:', info.totalFields);
    console.log('Input fields:', info.inputFields);
    console.log('Output fields:', info.outputFields);
    console.log('Errors:', info.errors);
  }}
/>
```

**DebugInfo Interface**:
```typescript
interface DebugInfo {
  totalFields: number;
  inputFields: FieldData[];
  outputFields: FieldData[];
  rawMappings: FieldMapping[];
  matchingMode?: 'data-id' | 'direct-id';
  svgDimensions?: { width: number; height: number };
  errors?: string[];
}
```

---

## TypeScript Types

All types are exported for use in your application:

```typescript
import type {
  // Parser types
  ParseOptions,
  ParseResult,
  FieldPattern,

  // Component types
  InteractiveSVGProps,
  InputFieldProps,
  OutputFieldProps,

  // Data types
  FieldMapping,
  FieldData,
  BoundingBox,

  // Utility types
  DebugInfo,
  ThemeType
} from 'svg-interactive';
```

### Core Types

```typescript
interface FieldMapping {
  dataId: string;           // Original matched value
  name: string;             // Extracted field name
  elementId: string;        // SVG element ID for lookup
  type: 'input' | 'output';
  matchedAttribute?: string; // Which attribute was used
}

interface FieldData extends FieldMapping {
  bbox: BoundingBox | null;  // Bounding box coordinates
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ThemeType = 'default' | 'minimal' | 'bordered' | 'none';
```

---

## CSS Variables

Customize default styling with CSS variables.

### Available Variables

```css
:root {
  /* Input field styling */
  --svg-input-border: #3B82F6;
  --svg-input-bg: #FFFFFF;
  --svg-input-text: #111827;
  --svg-input-focus: #2563EB;

  /* Output field styling */
  --svg-output-border: #10B981;
  --svg-output-bg: #F0FDF4;
  --svg-output-text: #065f46;
}
```

### Example: Dark Mode

```css
.dark-mode {
  --svg-input-border: #60A5FA;
  --svg-input-bg: #1F2937;
  --svg-input-text: #F9FAFB;

  --svg-output-border: #34D399;
  --svg-output-bg: #065F46;
  --svg-output-text: #F9FAFB;
}
```

### Example: Custom Brand Colors

```css
:root {
  --svg-input-border: #9333EA;   /* Purple */
  --svg-input-bg: #FAF5FF;

  --svg-output-border: #F59E0B;  /* Amber */
  --svg-output-bg: #FFFBEB;
}
```

---

## Importing Styles

Import default styles in your app:

```tsx
// In your main App.tsx or index.tsx
import 'svg-interactive/styles';
```

Or in CSS:

```css
/* In your CSS file */
@import 'svg-interactive/styles';
```

---

## Examples

### Basic Calculator

```tsx
import { parseSVG, InteractiveSVG } from 'svg-interactive';
import 'svg-interactive/styles';

function Calculator() {
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
      <rect id="input-a" x="50" y="50" width="100" height="30" fill="#e3f2fd"/>
      <rect id="input-b" x="50" y="100" width="100" height="30" fill="#e3f2fd"/>
      <rect id="output-sum" x="250" y="75" width="100" height="30" fill="#e8f5e9"/>
    </svg>
  `;

  const { mappings } = parseSVG(svgContent, {
    patterns: [
      { prefix: 'input-', type: 'input' },
      { prefix: 'output-', type: 'output' }
    ]
  });

  return (
    <InteractiveSVG
      mappings={mappings}
      svgContent={svgContent}
      defaultInputs={{ a: '5', b: '3' }}
      onOutputCompute={(inputs) => ({
        sum: String(parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0'))
      })}
      theme="bordered"
    />
  );
}
```

### Draw.io Diagram

```tsx
import { parseDrawIoSVG, InteractiveSVG } from 'svg-interactive';

async function WorkflowDiagram() {
  const svgContent = await fetch('/workflow.drawio.svg').then(r => r.text());

  const { mappings, errors } = parseDrawIoSVG(svgContent, {
    patterns: [
      { attribute: 'data-id', prefix: 'input:', type: 'input' },
      { attribute: 'data-id', prefix: 'output:', type: 'output' }
    ]
  });

  if (errors.length > 0) {
    console.error('Parse errors:', errors);
  }

  return (
    <InteractiveSVG
      mappings={mappings}
      svgContent={svgContent}
      onOutputCompute={(inputs) => ({
        result: processWorkflow(inputs)
      })}
      debug={true}
    />
  );
}
```

### Custom Renderers with Validation

```tsx
<InteractiveSVG
  renderInput={(props) => (
    <input
      type="number"
      min="0"
      max="100"
      value={props.value}
      onChange={(e) => {
        const val = e.target.value;
        if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 100)) {
          props.onChange(val);
        }
      }}
      className={props.className}
      style={props.style}
      placeholder="0-100"
    />
  )}
  renderOutput={(props) => (
    <div className={props.className} style={props.style}>
      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
        {props.name}
      </div>
      <div style={{ fontSize: '16px', color: '#059669' }}>
        {props.value}
      </div>
    </div>
  )}
/>
```

### Controlled Output State

```tsx
import { useState, useEffect } from 'react';

function ControlledDiagram() {
  const [outputs, setOutputs] = useState({});

  return (
    <InteractiveSVG
      mappings={mappings}
      svgContent={svgContent}
      outputValues={outputs}
      onOutputCompute={(inputs) => {
        const computed = {
          total: String(parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')),
          average: String((parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')) / 2)
        };

        // Update state for external tracking
        setOutputs(computed);

        return computed;
      }}
    />
  );
}
```

### Multiple Patterns and Attributes

```tsx
const { mappings } = parseSVG(svgContent, {
  patterns: [
    // Match id="input-temperature"
    { prefix: 'input-', type: 'input' },

    // Match class="param-field-pressure"
    { attribute: 'class', prefix: 'param-field-', type: 'input' },

    // Match data-field="output-result"
    { attribute: 'data-field', prefix: 'output-', type: 'output' },

    // Regex: match CALC_SUM, CALC_AVERAGE
    { regex: /^CALC_(.+)$/, type: 'output' }
  ]
});
```

---

## Browser Support

**Minimum Requirements**:
- Chrome/Edge 88+
- Firefox 90+
- Safari 14+

**Required Features**:
- SVG `foreignObject` support
- ES2020+ JavaScript
- React 18+

---

## Next Steps

- **[Troubleshooting Guide](./troubleshooting.md)** - Fix common issues
- **[Tool-Specific Guides](./README.md)** - Prepare SVGs for draw.io, Figma, Inkscape
- **[Examples Directory](../examples)** - See working examples
- **[GitHub Repository](https://github.com/m98/svg-interactive)** - Source code
