# Adobe Illustrator

How to prepare Adobe Illustrator files for `svg-interactive`.

## Overview

**Approach**: Direct ID (object names become IDs)

Illustrator exports layer/object names as SVG `id` attributes.

## Step-by-Step Guide

### 1. Create Your Diagram

- Open **Adobe Illustrator**
- Create your diagram using shapes, paths, and text
- Design interactive field areas

### 2. Set Object Names

Use the **Layers panel** to name objects:

1. **Window** → **Layers** (or press `F7`)
2. In the **Layers panel**, locate your shape/object
3. **Double-click** the layer/object name
4. **Rename** to your field identifier:
   - `input-temperature`
   - `output-result`
5. Press **Enter**

### 3. Export as SVG

1. **File** → **Export** → **Export As**
2. **Format**: SVG (svg)
3. **Click "Export"**

### 4. SVG Options Dialog

**Important settings**:

- **Styling**:
  - CSS Properties: **"Presentation Attributes"**
  - Font: **SVG** (not "Convert to Outlines" for smaller files)
- **Object IDs**: **Layer Names**
- **Decimal Places**: 2
- **Options**:
  - ✅ **Minify**
  - ✅ **Responsive**
- **Click "OK"**

### 5. Verify Export

1. Open exported SVG in **text editor**
2. Confirm `id` attributes match your layer names:
   ```svg
   <rect id="input-temperature" ... />
   ```

### 6. Use in Your Application

```tsx
import { InteractiveSVG } from 'svg-interactive';

<InteractiveSVG
  svgUrl="/illustrator-export.svg"
  config={{
    patterns: [
      { prefix: 'input-', type: 'input' },
      { prefix: 'output-', type: 'output' }
    ]
  }}
/>
```

## Best Practices

### Layer Organization

Organize your Layers panel clearly:

```
📁 Diagram
  📁 Inputs
    🔲 input-temperature
    🔲 input-pressure
  📁 Outputs
    🔲 output-result
    🔲 output-status
  📁 Decorations
    🔲 arrows
    🔲 labels
```

### Object vs Layer Names

- **Object names** (sublayer items) are preferred
- **Layer names** work but can conflict if multiple objects in one layer

### Clean Naming

Use consistent, descriptive names:

- ✅ `input-reactor-temp`
- ✅ `output-energy-calc`
- ❌ `Layer 1`
- ❌ `Rectangle`

## Common Issues

### IDs Not Exported

**Problem**: SVG has generic IDs like `rect1`, `path2`

**Solutions**:
1. **Re-export** with Object IDs: **"Layer Names"** selected
2. Ensure you **named objects in Layers panel**, not just layers
3. Check each object has a unique name

### Grouped Objects

**Problem**: Grouped elements don't have IDs

**Solutions**:
1. **Name the group** in Layers panel (group acts as container)
2. Or **ungroup** (`Shift+Ctrl+G`) and name individual objects
3. Set ID on outermost group only

### Complex Paths Not Working

**Problem**: Complex artwork doesn't export cleanly

**Solutions**:
1. **Simplify**: Object → Path → Simplify
2. **Expand**: Object → Expand Appearance
3. Keep field shapes simple (rectangles preferred)

## Example Workflow

1. **Create artboard** (600×400px)
2. **Draw rectangles** for input/output fields
3. **Add text labels** (optional)
4. **Open Layers panel** (`F7`)
5. **Rename each rectangle**:
   - `input-name`
   - `input-email`
   - `output-greeting`
6. **File** → **Export As** → **SVG**
7. **Set SVG options** (Presentation Attributes, Layer Names)
8. **Verify** IDs in exported file
9. **Load** in React

## Tips

- **Artboard Size**: Match your intended display size (e.g., 800×600px)
- **Use Symbols**: Create symbol for standard input field shape
- **Smart Guides**: Enable for consistent sizing and alignment
- **Appearance Panel**: Keep effects simple (avoid complex filters)
- **Test Export**: Always verify SVG after export

## Advanced: Actions

Create an Illustrator Action to automate export:

1. **Window** → **Actions**
2. **New Action**: "Export Interactive SVG"
3. **Record**: File → Export → SVG with correct settings
4. **Stop Recording**
5. **Use**: Select artboard, run action

## Troubleshooting Export Settings

If IDs still don't appear:

```
CSS Properties: Presentation Attributes  ← CRITICAL
Object IDs: Layer Names                  ← CRITICAL
Decimal: 2
Minify: Yes (optional)
Responsive: Yes (recommended)
```

## Next Steps

- **[Troubleshooting Guide](./troubleshooting.md)** - Fix common issues
- **[API Reference](./api.md)** - Complete configuration options
- **[Examples](../examples)** - See working examples
