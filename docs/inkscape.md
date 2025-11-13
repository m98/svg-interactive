# Inkscape

How to prepare Inkscape SVGs for `svg-interactive-diagram`.

## Overview

**Approach**: Direct ID (full control over element IDs)

Inkscape gives you complete control over element IDs through Object Properties or the XML Editor.

## Step-by-Step Guide

### 1. Create Your Diagram

- Open **Inkscape**
- Create shapes using **Rectangle**, **Circle**, **Path** tools
- Design your diagram layout

### 2. Set Element IDs (Object Properties)

**Recommended method**:

1. **Select a shape**
2. **Object** → **Object Properties** (or press `Shift+Ctrl+O`)
3. In the **"ID"** field, enter your field identifier:
   - `input-temperature`
   - `output-result`
4. **Close** the dialog
5. **Repeat** for all interactive elements

### 3. Alternative: XML Editor

**Advanced method** for precise control:

1. **Edit** → **XML Editor**
2. **Select element** in the tree view
3. Find the `id` attribute
4. **Change** to desired name: `input-temperature`

### 4. Save as Plain SVG

**IMPORTANT**: Export as Plain SVG, not Inkscape SVG

1. **File** → **Save As**
2. **Format**: Choose **"Plain SVG"** (not "Inkscape SVG")
3. This removes Inkscape-specific metadata
4. **Save**

### 5. Use in Your Application

```tsx
import { InteractiveSVG } from 'svg-interactive-diagram';

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

## Best Practices

### Group Related Elements

If a field needs multiple shapes (e.g., rectangle + text):

1. **Select all shapes** for the field
2. **Object** → **Group** (`Ctrl+G`)
3. **Set ID on the group**, not individual elements

```svg
<g id="input-temperature">
  <rect fill="#e3f2fd" ... />
  <text>Temperature</text>
</g>
```

### Clean SVG Output

Plain SVG produces smaller, cleaner files:

- ✅ Plain SVG: ~2KB, clean code
- ❌ Inkscape SVG: ~8KB, metadata clutter

### Verify IDs

Always verify IDs were set correctly:

1. **Edit** → **XML Editor**
2. Browse the tree
3. Confirm all interactive elements have correct IDs

## Common Issues

### IDs Revert to Auto-Generated

**Problem**: IDs like `rect1234` instead of custom names

**Solutions**:
1. **Set ID via Object Properties**, not just by renaming in XML
2. **Save immediately** after setting IDs
3. Check you saved as **Plain SVG**

### Fields Not Detected

**Problem**: Library doesn't find fields

**Solutions**:
1. Verify IDs match your pattern prefixes
2. Check saved as **Plain SVG** (not Inkscape SVG)
3. Enable debug mode: `debug={true}`

### Grouped Elements Don't Work

**Problem**: Grouped shapes not positioned correctly

**Solutions**:
1. Set ID on the **group**, not individual shapes
2. Flatten transforms: **Path** → **Object to Path**
3. Ensure group isn't nested inside other groups

## Example Workflow

1. **Draw rectangle** (120×30px)
2. **Add text label** inside
3. **Select both** → `Ctrl+G` to group
4. **Object Properties** (`Shift+Ctrl+O`)
5. **Set ID**: `input-temperature`
6. **Repeat** for all fields
7. **File** → **Save As** → **Plain SVG**
8. **Test** in browser
9. **Load** in React

## Tips

- **Template File**: Create an Inkscape template with standard field shapes
- **Layers**: Use layers to organize inputs, outputs, and decorations
- **Snap to Grid**: Enable grid snapping for consistent sizing
- **Reuse**: Copy/paste fields and just change IDs
- **Test Frequently**: Save and test SVG often during design

## Advanced: Scripting

Inkscape supports Python scripting for automation:

```python
# Batch rename elements with prefix
for element in svg.findall('.//{http://www.w3.org/2000/svg}rect'):
    if element.get('id').startswith('rect'):
        element.set('id', 'input-' + element.get('id'))
```

## Next Steps

- **[Troubleshooting Guide](./troubleshooting.md)** - Fix common issues
- **[API Reference](./api.md)** - Complete configuration options
- **[Hand-Coded SVG Guide](./hand-coded.md)** - Understanding SVG structure
