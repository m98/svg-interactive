# draw.io / diagrams.net

How to prepare draw.io diagrams for `svg-interactive`.

## Overview

**Approach**: Data-ID (draw.io auto-generates element IDs)

draw.io generates random IDs for shapes, so we use custom data attributes instead.

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
import { InteractiveSVG } from 'svg-interactive';

<InteractiveSVG
  svgUrl="/my-diagram.svg"
  config={{
    patterns: [
      { prefix: 'input-field-', type: 'input' },
      { prefix: 'output-field-', type: 'output' }
    ]
  }}
  onOutputCompute={(inputs) => ({
    // Your calculation logic
    result: calculateResult(inputs)
  })}
/>
```

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
4. Try explicitly setting `matchingMode: 'data-id'` in config

### Wrong Matching Mode

**Problem**: Library uses 'direct-id' instead of 'data-id'

**Solution**: Explicitly set the mode:

```tsx
<InteractiveSVG
  config={{
    matchingMode: 'data-id',  // Force data-id mode
    patterns: [...]
  }}
/>
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

## Next Steps

- **[Troubleshooting Guide](./troubleshooting.md)** - Fix common issues
- **[API Reference](./api.md)** - Complete configuration options
- **[Examples](../examples)** - See working examples
