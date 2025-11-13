# SVG Interactive Diagram

<div align="center">

**Transform ANY SVG diagram into an interactive form with embedded input/output fields.**

[![npm version](https://img.shields.io/npm/v/svg-interactive-diagram?color=blue)](https://www.npmjs.com/package/svg-interactive-diagram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/m98/svg-interactive-diagram/ci.yml?branch=main)](https://github.com/m98/svg-interactive-diagram)

Works seamlessly with **draw.io**, **Figma**, **Inkscape**, or **custom SVGs**. No vendor lock-in.

[Quick Start](#quick-start) • [Examples](./examples) • [API Docs](#api-reference) • [Contributing](./CONTRIBUTING.md)

</div>

---

## ✨ Why This Library?

Ever wanted to make your SVG diagrams interactive but faced these problems?

❌ Locked into one tool's proprietary format
❌ Can't embed HTML inputs directly in SVG
❌ Complex setup just to add a few interactive fields
❌ Have to rebuild your diagram from scratch

**This library solves all of that:**

✅ Works with **ANY SVG tool** - no vendor lock-in
✅ Uses SVG `foreignObject` to embed real HTML inputs
✅ Dead simple setup - just add IDs or data attributes
✅ Keep using your favorite design tool

## 🚀 Quick Start

### Installation

```bash
npm install svg-interactive-diagram
# or
yarn add svg-interactive-diagram
```

### Basic Usage (30 seconds)

1. **Add IDs to your SVG** (in Inkscape, Figma, or any editor):
   ```svg
   <rect id="input-temperature" .../>
   <rect id="output-result" .../>
   ```

2. **Use in React**:
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
     onOutputCompute={(inputs) => ({
       result: `You entered: ${inputs.temperature}`
     })}
   />
   ```

**That's it!** Your SVG now has interactive input/output fields.

## 📚 How It Works

The library uses SVG's `<foreignObject>` element to overlay HTML inputs at exact positions:

1. Load your SVG
2. Find elements with matching IDs
3. Get their bounding boxes
4. Create `<foreignObject>` overlays
5. Render HTML inputs/outputs inside

## 🎯 Two Matching Modes

### Mode 1: Direct ID (Custom SVGs)

**When:** You control element IDs (Inkscape, Figma, hand-coded)

```svg
<rect id="input-temp" x="10" y="10" width="100" height="30"/>
```

```tsx
<InteractiveSVG
  svgUrl="/custom.svg"
  config={{
    patterns: [
      { prefix: 'input-', type: 'input' },
      { prefix: 'output-', type: 'output' }
    ]
  }}
/>
```

### Mode 2: Data-ID (draw.io)

**When:** Auto-generated IDs (draw.io)

**In draw.io:**
1. Right-click shape → Edit Data
2. Add property: `data-id` = `input-field-temp`
3. Export as SVG

```tsx
<InteractiveSVG
  svgUrl="/flowchart.svg"
  config={{
    patterns: [
      { prefix: 'input-field-', type: 'input' },
      { prefix: 'output-field-', type: 'output' }
    ]
  }}
/>
```

💡 **Auto-detection**: The library automatically chooses the right mode!

## 💡 Features

- 🎨 **Universal SVG Support** - draw.io, Figma, Inkscape, Adobe Illustrator, hand-coded
- 🔄 **Auto-Detection** - Automatically picks direct-id or data-id mode
- 🎯 **Flexible Patterns** - Prefix or regex matching
- ⚛️ **React 18+** - Built with modern React
- 🎨 **Fully Customizable** - Themes, CSS variables, custom components
- 📊 **Debug Mode** - Built-in debugging panel
- 💪 **TypeScript** - Complete type definitions
- 🚀 **Next.js Ready** - Works out of the box

## 📖 Examples

### Calculator with Custom Styling

```tsx
<InteractiveSVG
  svgUrl="/calculator.svg"
  config={{
    patterns: [
      { prefix: 'input-', type: 'input' },
      { prefix: 'output-', type: 'output' }
    ]
  }}
  onOutputCompute={(inputs) => ({
    sum: (parseFloat(inputs.a || '0') + parseFloat(inputs.b || '0')).toString()
  })}
  theme="bordered"
  inputClassName="px-2 py-1 border-2 border-blue-500 rounded"
  outputClassName="px-2 py-1 bg-green-50 border-2 border-green-500 rounded"
/>
```

### Custom React Components

```tsx
<InteractiveSVG
  svgUrl="/diagram.svg"
  config={{ patterns: [...] }}
  renderInput={(props) => (
    <input
      type="number"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className="custom-input"
      min="0"
      max="100"
    />
  )}
  renderOutput={(props) => (
    <div className="custom-output">
      <strong>{props.name}:</strong> {props.value}
    </div>
  )}
/>
```

### Tailwind Styling

```tsx
<InteractiveSVG
  theme="none"
  inputClassName="w-full h-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:ring-2"
  outputClassName="w-full h-full px-3 py-2 bg-green-50 border-2 border-green-500 rounded-lg"
  {...otherProps}
/>
```

**[See more examples →](./examples)**

## 📐 SVG Preparation

Quick guides for each tool:

- **[draw.io / diagrams.net](./docs/draw-io.md)** - Use data-id attributes
- **[Figma](./docs/figma.md)** - Rename layers with prefixes
- **[Inkscape](./docs/inkscape.md)** - Set element IDs via Object Properties
- **[Adobe Illustrator](./docs/illustrator.md)** - Use Layers panel names
- **[Hand-coded SVG](./docs/hand-coded.md)** - Just add `id` attributes

**[Full SVG Preparation Guide →](./docs)**

## 🔧 API Reference

### `<InteractiveSVG>` Props

| Prop | Type | Description |
|------|------|-------------|
| `svgUrl` | `string` | URL to SVG file |
| `svgContent` | `string` | Raw SVG string (alternative to URL) |
| `config` | `FieldConfig` | **Required.** Field matching configuration |
| `onInputChange` | `(name, value, all) => void` | Fired when any input changes |
| `onOutputCompute` | `(inputs) => outputs` | Compute all outputs from inputs |
| `outputValues` | `Record<string, string>` | Controlled output values |
| `onOutputUpdate` | `Record<string, fn>` | Per-field output callbacks |
| `renderInput` | `(props) => ReactNode` | Custom input renderer |
| `renderOutput` | `(props) => ReactNode` | Custom output renderer |
| `theme` | `'default' \| 'minimal' \| 'bordered' \| 'none'` | Built-in theme |
| `inputClassName` | `string` | CSS class for inputs |
| `outputClassName` | `string` | CSS class for outputs |
| `inputStyle` | `CSSProperties` | Inline styles for inputs |
| `outputStyle` | `CSSProperties` | Inline styles for outputs |
| `debug` | `boolean` | Show debug panel |
| `onDebugInfo` | `(info) => void` | Debug callback |

### `FieldConfig`

```typescript
interface FieldConfig {
  patterns: FieldPattern[];
  matchingMode?: 'data-id' | 'direct-id' | 'auto'; // Default: 'auto'
}

interface FieldPattern {
  prefix?: string;        // e.g., "input-"
  regex?: RegExp;         // e.g., /^param-(.*)/
  type: 'input' | 'output';
  useDataId?: boolean;    // Per-pattern override
}
```

**[Full API Documentation →](./docs/api.md)**

## 🎨 Styling

### Built-in Themes

```tsx
<InteractiveSVG theme="default" />  // Blue inputs, green outputs
<InteractiveSVG theme="minimal" />  // Simple borders
<InteractiveSVG theme="bordered" /> // Bold borders with shadows
<InteractiveSVG theme="none" />     // No default styling
```

### CSS Variables

```css
:root {
  --svg-input-border: #3B82F6;
  --svg-input-bg: #FFFFFF;
  --svg-output-border: #10B981;
  --svg-output-bg: #F0FDF4;
  --svg-field-font-size: 12px;
}
```

### Import Styles

```tsx
import 'svg-interactive-diagram/styles';
```

## 🐛 Debug Mode

```tsx
<InteractiveSVG
  debug={true}
  onDebugInfo={(info) => {
    console.log('Mode:', info.matchingMode);    // 'data-id' or 'direct-id'
    console.log('Fields:', info.totalFields);   // Total fields found
    console.log('Inputs:', info.inputFields);   // Input fields
    console.log('Outputs:', info.outputFields); // Output fields
  }}
/>
```

## 🌐 Browser Support

✅ Chrome/Edge | ✅ Firefox | ✅ Safari

Requires SVG `foreignObject` support (all modern browsers).

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/m98/svg-interactive-diagram
cd svg-interactive-diagram
npm install
npm run dev       # Watch mode
npm test          # Run tests
npm run quality   # Full quality check
```

## 📝 License

MIT © [Mohammad](https://github.com/m98)

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/svg-interactive-diagram)
- [GitHub Repository](https://github.com/m98/svg-interactive-diagram)
- [Issue Tracker](https://github.com/m98/svg-interactive-diagram/issues)
- [Changelog](./CHANGELOG.md)

## ⭐ Show Your Support

If this library helped you, please consider giving it a ⭐ on [GitHub](https://github.com/m98/svg-interactive-diagram)!

---

**Built with ❤️ for the open-source community**
