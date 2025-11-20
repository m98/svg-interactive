# Figma

How to prepare Figma designs for `svg-interactive`.

## Overview

**Approach**: Direct ID (layer names become element IDs)

Figma exports layer names as SVG `id` attributes, giving you full control.

## Step-by-Step Guide

### 1. Design Your Diagram

- Create your diagram in Figma
- Use **frames**, **rectangles**, or **shapes** for interactive areas
- Organize your layers clearly

### 2. Rename Layers

For each element that should be interactive:

1. **Select the layer/frame**
2. **Rename it** with your field identifier:
   - `input-temperature`
   - `output-result`
   - `param-pressure`

The layer name will become the element's `id` in the SVG.

### 3. Export Settings

**CRITICAL**: Enable ID attributes in export

1. **Select frame/component** to export
2. **Export Settings** → **Add "SVG" export**
3. **⚠️ IMPORTANT**: Check **"Include 'id' attribute"**
4. **Export**

### 4. Verify Export

Always verify the export worked correctly:

1. Open exported SVG in a **text editor**
2. Search for `id="`
3. Confirm your layer names appear as IDs:
   ```svg
   <rect id="input-temperature" ... />
   ```

### 5. Use in Your Application

```tsx
import { SvgInteractive, parseSVG } from 'svg-interactive';

// Step 1: Parse your SVG to extract field mappings
const svgContent = await fetch('/figma-export.svg').then(r => r.text());
const { mappings } = parseSVG(svgContent, {
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ]
});

// Step 2: Render the interactive SVG
<SvgInteractive
  mappings={mappings}
  svgContent={svgContent}
  onOutputCompute={(inputs) => ({
    // Your computation logic here
  })}
/>
```

## Best Practices

### Layer Organization

Use descriptive layer names from the start:

```
✅ input-temperature
✅ input-pressure
✅ output-energy-result
❌ Rectangle 1
❌ Rectangle 2
```

### Frames vs Shapes

Both work, but **frames are more reliable**:

- ✅ Frames always export with IDs
- ⚠️ Grouped shapes may lose IDs
- ⚠️ Flattened shapes may merge IDs

### Clean Naming

Remove Figma's default numbering:

- ❌ `Rectangle 1` → ✅ `input-temp`
- ❌ `Frame 23` → ✅ `output-result`

## Common Issues

### IDs Not Found in SVG

**Problem**: Exported SVG has no `id` attributes

**Solutions**:
1. **Re-export** with "Include 'id' attribute" **checked**
2. Export **individual frames**, not the entire page
3. Avoid exporting flattened/rasterized elements

### Layer Names Don't Match IDs

**Problem**: IDs in SVG don't match layer names

**Solutions**:
1. Remove special characters from layer names (use hyphens only)
2. Avoid spaces in layer names
3. Don't use Figma's auto-generated names

### Fields Not Positioned Correctly

**Problem**: Input overlays appear in wrong positions

**Solutions**:
1. **Flatten transformations** before export (Object → Flatten)
2. Ensure elements aren't inside rotated/scaled groups
3. Use simple rectangles for field areas

## Example Workflow

1. **Design** your diagram in Figma
2. **Create frames** for each input/output area (120×30px minimum)
3. **Rename** frames:
   - `input-username`
   - `input-email`
   - `output-welcome-message`
4. **Select parent frame** containing all elements
5. **Export** → SVG → ✅ **"Include 'id' attribute"**
6. **Verify** exported SVG has correct IDs
7. **Load** in React with matching patterns

## Tips

- **Component Library**: Create a Figma component for standard input/output shapes
- **Consistent Sizing**: Keep all input fields the same size (e.g., 150×35px)
- **Visual Coding**: Use color to distinguish inputs (blue) from outputs (green)
- **Test Early**: Export and test SVG early in design process
- **Version Control**: Keep Figma file and exported SVG in sync

## Advanced: Figma Plugins

Consider creating a Figma plugin to:
- Auto-rename layers with prefixes
- Validate layer naming conventions
- Auto-export with correct settings

## Next Steps

- **[Troubleshooting Guide](./troubleshooting.md)** - Fix common issues
- **[API Reference](./api.md)** - Complete configuration options
- **[Examples](../examples)** - See working Figma examples
