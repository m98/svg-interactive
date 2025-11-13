# SVG Interactive Diagram - Documentation

Complete documentation for preparing SVGs and using the library.

## Quick Links

- **[API Reference](./api.md)** - Complete API documentation
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## SVG Tool Guides

Choose your design tool to learn how to prepare SVGs:

### 📊 [draw.io / diagrams.net](./draw-io.md)
Perfect for flowcharts and diagrams. Uses data-id attributes.

### 🎨 [Figma](./figma.md)
Modern design tool. Layer names become IDs.

### ✏️ [Inkscape](./inkscape.md)
Free, powerful SVG editor. Direct ID control via Object Properties.

### 🖼️ [Adobe Illustrator](./illustrator.md)
Professional design software. Uses Layer panel names.

### 💻 [Hand-Coded SVG](./hand-coded.md)
Writing SVG by hand? Full control over IDs and structure.

## General Principles

### Two Matching Approaches

1. **Direct ID** (Recommended)
   - You control element IDs directly
   - Works: Inkscape, Figma, Illustrator, hand-coded SVG
   - Use when: Your tool lets you set custom IDs

2. **Data-ID** (draw.io)
   - Uses custom data attributes
   - Works: draw.io (auto-generated IDs)
   - Use when: Tool generates random IDs

### Naming Convention

Always use consistent, descriptive names:

```
input-{descriptive-name}
output-{descriptive-name}
```

**Examples**:
- ✅ `input-temperature`
- ✅ `output-energy-calculation`
- ✅ `param-pressure-value`
- ❌ `input1` (not descriptive)
- ❌ `Input_Temperature` (inconsistent casing)

**Rules**:
- Lowercase only
- Hyphens for separators (no underscores, spaces)
- Descriptive, not generic

## Visual Design Tips

1. **Clear Distinction**
   - Use different colors for inputs (e.g., blue) vs outputs (e.g., green)
   - Position inputs on left, outputs on right

2. **Adequate Size**
   - Minimum 120×30px for input fields
   - Minimum 44px height for touch targets (mobile)

3. **Testing**
   - Always test exported SVG in browser first
   - Enable debug mode: `debug={true}`
   - Verify fields are positioned correctly

## Common Patterns

```typescript
// Standard business application
config: {
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ]
}

// Scientific/engineering
config: {
  patterns: [
    { prefix: 'param-', type: 'input' },
    { prefix: 'result-', type: 'output' }
  ]
}
```

## Need Help?

- **[Troubleshooting Guide](./troubleshooting.md)** - Common issues
- **[GitHub Issues](https://github.com/m98/svg-interactive/issues)** - Report bugs
- **[Examples](../examples)** - See working examples
