# Hand-Coded SVG

How to create SVGs by hand for `svg-interactive-diagram`.

## Overview

**Approach**: Direct ID (full control)

Writing SVG by hand gives you complete control over structure, IDs, and optimization.

## Basic Template

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="600"
     height="400"
     viewBox="0 0 600 400">

  <!-- Input Field -->
  <g id="input-temperature">
    <rect x="50" y="50" width="200" height="40"
          fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
    <text x="60" y="75" font-size="14" fill="#1976d2">
      Temperature
    </text>
  </g>

  <!-- Output Field -->
  <g id="output-result">
    <rect x="350" y="50" width="200" height="40"
          fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
    <text x="360" y="75" font-size="14" fill="#388e3c">
      Result
    </text>
  </g>
</svg>
```

## Complete Example

Interactive calculator diagram:

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="700"
     height="300"
     viewBox="0 0 700 300">

  <!-- Background -->
  <rect width="700" height="300" fill="#f5f5f5"/>

  <!-- Title -->
  <text x="350" y="30" text-anchor="middle"
        font-size="20" font-weight="bold" fill="#333">
    Simple Calculator
  </text>

  <!-- Input A -->
  <g id="input-number-a">
    <rect x="50" y="80" width="150" height="40"
          fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
    <text x="60" y="105" font-size="14" fill="#1976d2">
      Number A
    </text>
  </g>

  <!-- Input B -->
  <g id="input-number-b">
    <rect x="50" y="150" width="150" height="40"
          fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="4"/>
    <text x="60" y="175" font-size="14" fill="#1976d2">
      Number B
    </text>
  </g>

  <!-- Operation Symbol -->
  <circle cx="350" cy="150" r="40"
          fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
  <text x="350" y="160" text-anchor="middle"
        font-size="24" font-weight="bold" fill="#f57c00">
    +
  </text>

  <!-- Arrows -->
  <path d="M 200 100 L 310 130"
        stroke="#666" stroke-width="2"
        marker-end="url(#arrowhead)"/>
  <path d="M 200 170 L 310 150"
        stroke="#666" stroke-width="2"
        marker-end="url(#arrowhead)"/>
  <path d="M 390 150 L 500 150"
        stroke="#666" stroke-width="2"
        marker-end="url(#arrowhead)"/>

  <!-- Output Sum -->
  <g id="output-sum">
    <rect x="500" y="130" width="150" height="40"
          fill="#e8f5e9" stroke="#388e3c" stroke-width="2" rx="4"/>
    <text x="510" y="155" font-size="14" fill="#388e3c">
      Sum
    </text>
  </g>

  <!-- Definitions -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10"
            refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#666"/>
    </marker>
  </defs>
</svg>
```

## Best Practices

### 1. Use Groups (`<g>`)

Group related elements together and set ID on the group:

```svg
<!-- ✅ GOOD: Group with ID -->
<g id="input-temperature">
  <rect fill="#e3f2fd" ... />
  <text>Temperature</text>
</g>

<!-- ❌ BAD: ID on individual element -->
<rect id="input-temperature" ... />
<text>Temperature</text>
```

### 2. Consistent Sizing

Keep input/output areas similar sizes:

```svg
<!-- All fields 200×40 -->
<rect x="50" y="50" width="200" height="40" ... />
<rect x="50" y="120" width="200" height="40" ... />
<rect x="350" y="50" width="200" height="40" ... />
```

### 3. Use viewBox for Responsiveness

```svg
<!-- Scales to any container size -->
<svg viewBox="0 0 600 400" width="100%" height="100%">
  ...
</svg>
```

### 4. Semantic IDs

Use descriptive, meaningful IDs:

```svg
<!-- ✅ GOOD -->
<g id="input-reactor-temperature">...</g>
<g id="output-energy-calculation">...</g>

<!-- ❌ BAD -->
<g id="input1">...</g>
<g id="output-result">...</g>
```

### 5. Visual Hierarchy

Use color to distinguish inputs from outputs:

```svg
<!-- Inputs: Blue theme -->
fill="#e3f2fd" stroke="#1976d2"

<!-- Outputs: Green theme -->
fill="#e8f5e9" stroke="#388e3c"

<!-- Neutral: Gray theme -->
fill="#f5f5f5" stroke="#757575"
```

## React Usage

```tsx
import { InteractiveSVG } from 'svg-interactive-diagram';

function Calculator() {
  return (
    <InteractiveSVG
      svgUrl="/calculator.svg"
      config={{
        patterns: [
          { prefix: 'input-', type: 'input' },
          { prefix: 'output-', type: 'output' }
        ]
      }}
      onOutputCompute={(inputs) => ({
        sum: (
          parseFloat(inputs['number-a'] || '0') +
          parseFloat(inputs['number-b'] || '0')
        ).toString()
      })}
    />
  );
}
```

## Advanced Techniques

### Reusable Components with `<use>`

```svg
<defs>
  <!-- Define reusable input shape -->
  <g id="input-field-template">
    <rect width="150" height="40"
          fill="#e3f2fd" stroke="#1976d2"
          stroke-width="2" rx="4"/>
  </g>
</defs>

<!-- Use it multiple times -->
<use href="#input-field-template" x="50" y="50" id="input-temp"/>
<use href="#input-field-template" x="50" y="120" id="input-pressure"/>
```

### Inline Styling with CSS

```svg
<svg>
  <style>
    .input-field {
      fill: #e3f2fd;
      stroke: #1976d2;
      stroke-width: 2;
    }
    .output-field {
      fill: #e8f5e9;
      stroke: #388e3c;
      stroke-width: 2;
    }
  </style>

  <rect id="input-temp" class="input-field" ... />
  <rect id="output-result" class="output-field" ... />
</svg>
```

### Dynamic Positioning

```svg
<!-- Use variables for consistent spacing -->
<!-- x positions: 50, 300, 550 (250px apart) -->
<!-- y positions: 80, 150, 220 (70px apart) -->

<g id="input-a" transform="translate(50, 80)">
  <rect width="200" height="40" ... />
</g>

<g id="input-b" transform="translate(50, 150)">
  <rect width="200" height="40" ... />
</g>
```

## Common Patterns

### Flowchart Style

```svg
<!-- Rectangular process boxes -->
<g id="input-start-value">
  <rect x="50" y="50" width="200" height="60" rx="8" ... />
</g>

<!-- Diamond decision (not interactive) -->
<path d="M 300 80 L 350 50 L 400 80 L 350 110 Z" ... />

<!-- Output box -->
<g id="output-final-result">
  <rect x="450" y="50" width="200" height="60" rx="8" ... />
</g>
```

### Dashboard Style

```svg
<!-- Card-style panels -->
<g id="input-metric-value">
  <rect width="180" height="100" rx="8"
        fill="white" stroke="#e0e0e0" stroke-width="1"/>
  <text x="90" y="30" text-anchor="middle" font-size="12" fill="#666">
    Metric Value
  </text>
</g>
```

## Tips

- **Grid System**: Use a consistent grid (e.g., 50px spacing)
- **Min Sizes**: Keep fields ≥ 120×30px for usability
- **Text Labels**: Add visual labels so users know what each field is
- **Comments**: Comment your SVG code for maintainability
- **Optimize**: Remove unnecessary attributes and whitespace for production

## Tools for Hand-Coding

- **[SVG Path Editor](https://yqnn.github.io/svg-path-editor/)** - Visual path creation
- **[SVGOMG](https://jakearchibald.github.io/svgomg/)** - SVG optimization
- **[SVG Viewer](https://www.svgviewer.dev/)** - Live preview

## Next Steps

- **[API Reference](./api.md)** - Complete configuration options
- **[Troubleshooting](./troubleshooting.md)** - Common issues
- **[Examples](../examples)** - See more hand-coded examples
