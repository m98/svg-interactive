# draw.io / diagrams.net

How to prepare draw.io diagrams for `svg-interactive`.

> **Note**: draw.io is also known as **diagrams.net** - they are the same tool. The web app is available at [https://app.diagrams.net](https://app.diagrams.net).

## Overview

**Approach**: Data-ID (draw.io auto-generates element IDs)

draw.io generates random IDs for shapes that change on every export, so we use custom `data-id` attributes instead.

## Step-by-Step Guide

### 1. Create Your Diagram

- Open [https://app.diagrams.net](https://app.diagrams.net)
- Create your flowchart or diagram
- Add shapes (rectangles, circles, etc.) where you want interactive fields

### 2. Add Data-ID Attributes

For each shape that should be an input or output field:

1. **Select the shape**
2. **Right-click** → **Edit Data**
3. **Click "Add Property"**
4. Set the property:
   - **Property**: `data-id`
   - **Value**: `input-field-temperature` (or your field name)
5. **Click "Apply"**

Repeat for all interactive shapes and make sure they are not duplicated.

### 3. Export as SVG

1. **File** → **Export as** → **SVG**
2. **Recommended settings**:
   - ✅ Check "Transparent Background"
   - ✅ Include a copy of my diagram (optional)
3. **Export**

### 4. Use in Your Application

```tsx
import { parseDrawIoSVG, InteractiveSVG } from 'svg-interactive';
import 'svg-interactive/styles';

// Load SVG content
const svgContent = await fetch('/my-diagram.svg').then(r => r.text());

// Parse to extract field mappings
const { mappings } = parseDrawIoSVG(svgContent, {
  patterns: [
    { attribute: 'data-id', prefix: 'input-field-', type: 'input' },
    { attribute: 'data-id', prefix: 'output-field-', type: 'output' }
  ]
});

// Render interactive diagram
<InteractiveSVG
  mappings={mappings}
  svgContent={svgContent}
  onOutputCompute={(inputs) => ({
    // Your calculation logic
    result: calculateResult(inputs)
  })}
/>
```

> **Tip**: You can also use `parseSVG()` which auto-detects draw.io SVGs and delegates to `parseDrawIoSVG()` automatically.

## Naming Tips

### Be Consistent

Use the same prefix for all inputs and outputs:

```
input-field-temperature
input-field-pressure
input-field-volume
output-field-energy
output-field-status
```

### Be Descriptive

Good names make your code self-documenting:

- ✅ `input-field-reactor-temperature`
- ✅ `output-field-energy-calculation`
- ❌ `input-field-1`
- ❌ `output-field-result`

## Common Issues

### Fields Not Detected

**Problem**: Debug mode shows "No fields found"

**Solutions**:
1. Verify data-id property exists in draw.io (Edit Data)
2. Check you exported as SVG (not PNG, PDF)
3. Ensure pattern prefixes match your data-id values
4. Check the `errors` array returned by `parseDrawIoSVG()`

```tsx
const { mappings, errors } = parseDrawIoSVG(svgContent, options);
if (errors.length > 0) {
  console.error('Parse errors:', errors);
}
```

## Example Workflow

1. Create flowchart in draw.io
2. Add 3 input shapes for user data
3. Add 2 output shapes for results
4. For each shape:
   - Right-click → Edit Data
   - Add property: `data-id` = `input-field-username` (etc.)
5. Export as SVG
6. Load in React with appropriate patterns

## Tips

- **Test Export**: Open exported SVG in browser to verify it renders
- **Consistent Prefixes**: Stick to one naming scheme throughout
- **Keep Simple**: Don't nest interactive shapes inside groups
- **Label Elements**: Add text labels in draw.io so users know what fields are for

---

## How It Works (Technical Details)

Understanding how draw.io SVG exports work helps troubleshoot issues and optimize your diagrams.

### draw.io Export Structure

When you export a diagram from draw.io as SVG, it creates a unique structure:

1. **Visual SVG**: The rendered diagram (what you see)
2. **Embedded mxfile XML**: Complete diagram data stored in a `content` attribute

```xml
<svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;...&lt;/mxfile&gt;">
  <!-- Visual SVG elements -->
  <g data-cell-id="abc123">
    <rect .../>
  </g>
</svg>
```

The `content` attribute contains your entire diagram as HTML-encoded XML. This is what allows draw.io to re-open and edit the SVG.

### Data-ID to Element Lookup

Here's what happens when you add a `data-id` property in draw.io:

**1. In draw.io's Edit Data:**
```
Property: data-id
Value: input-field-temperature
```

**2. In the mxfile XML (embedded in SVG):**
```xml
<object id="abc123" data-id="input-field-temperature">
  <mxCell .../>
</object>
```

**3. In the rendered SVG:**
```xml
<g data-cell-id="abc123">
  <rect .../>
</g>
```

### Parsing Process

The `parseDrawIoSVG()` function:

1. **Extracts the mxfile XML** from the `content` attribute
2. **Decodes HTML entities** (`&lt;` → `<`)
3. **Parses the XML** to find `<object>` elements
4. **Matches patterns** against `data-id` attributes
5. **Maps to element IDs** using the `id` attribute
6. **Returns mappings** with `elementId` set to the object's `id`

### Element Lookup Strategy

When rendering, the library uses a **three-strategy fallback**:

```tsx
// Strategy 1: Try direct id attribute
element = svg.querySelector(`#${elementId}`);

// Strategy 2: Try data-cell-id (draw.io specific)
element = svg.querySelector(`g[data-cell-id="${elementId}"]`);

// Strategy 3: Try custom matched attribute
element = svg.querySelector(`[${matchedAttribute}="${dataId}"]`);
```

For draw.io SVGs, **Strategy 2** is what typically succeeds because draw.io renders elements with `data-cell-id` matching the `id` from the mxfile XML.

### Why Not Direct ID Matching?

draw.io **generates random IDs** like `abc123`, `def456` that:
- Change on every export
- Are not user-controllable
- Would break your field mappings constantly

By using `data-id` custom properties:
- ✅ IDs are **stable** across exports
- ✅ IDs are **user-controlled**
- ✅ Mappings **don't break** when you re-export

### Metadata Returned

`parseDrawIoSVG()` returns metadata about the parsing process:

```tsx
const { mappings, errors, metadata } = parseDrawIoSVG(svgContent, options);

console.log(metadata);
// {
//   tool: 'drawio',
//   detectedMode: 'data-id',
//   attributesUsed: ['data-id']
// }
```

Use this to verify the parser detected your SVG correctly and used the expected attributes.

---

## Next Steps

- **[Troubleshooting Guide](./troubleshooting.md)** - Fix common issues
- **[API Reference](./api.md)** - Complete configuration options
- **[Examples](../examples)** - See working examples
