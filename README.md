# SVG Interactive Diagram

<div align="center">

**Transform ANY SVG diagram into an interactive form with embedded input/output fields.**

[![npm version](https://img.shields.io/npm/v/svg-interactive?color=blue)](https://www.npmjs.com/package/svg-interactive)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/m98/svg-interactive/ci.yml?branch=main)](https://github.com/m98/svg-interactive)

Works seamlessly with **draw.io**, **Figma**, **Inkscape**, or **custom SVGs**. No vendor lock-in.

[Quick Start](#-quick-start) • [Examples](#-examples) • [API Docs](#-api-reference) • [Contributing](./CONTRIBUTING.md)

</div>

---

## ✨ Why This Library?

Ever wanted to make your SVG diagrams interactive but faced these problems?

- ❌ Locked into one tool's proprietary format
- ❌ Can't embed HTML inputs directly in SVG
- ❌ Complex setup just to add a few interactive fields
- ❌ Have to rebuild your diagram from scratch

**This library solves all of that:**

- ✅ Works with **ANY SVG tool** - no vendor lock-in
- ✅ Uses SVG `foreignObject` to embed real HTML inputs
- ✅ Dead simple setup - just add IDs or data attributes
- ✅ Keep using your favorite design tool

## 🚀 Quick Start

### Installation

```bash
npm install svg-interactive
# or
yarn add svg-interactive
```

### Basic Usage (30 seconds)

1. **Add IDs to your SVG** (in Inkscape, Figma, or any editor):
   ```svg
   <rect id="input-temperature" .../>
   <rect id="output-result" .../>
   ```

2. **Use in React**:
   ```tsx
   import { SvgInteractive, parseSVG } from 'svg-interactive';

   // Step 1: Parse your SVG to extract field mappings
   const svgContent = await fetch('/diagram.svg').then(r => r.text());
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

## 🎯 Flexible Field Matching

The library matches SVG elements using **attribute-based patterns** - you can match on any SVG attribute (`id`, `class`, `data-*`, etc.):

### Match by ID (Default - Inkscape, Figma, Custom SVGs)

```svg
<rect id="input-temp" x="10" y="10" width="100" height="30"/>
```

```tsx
const { mappings } = parseSVG(svgContent, {
  patterns: [
    { prefix: 'input-', type: 'input' },  // Matches id="input-*"
    { prefix: 'output-', type: 'output' }
  ]
});
```

### Match by Data Attribute (draw.io)

For draw.io SVGs, use the dedicated parser which automatically looks for custom metadata:

**In draw.io:**
1. Right-click shape → Edit Data
2. Add property: `data-id` = `input-field-temp`
3. Export as SVG

```tsx
import { parseDrawIoSVG } from 'svg-interactive';

const { mappings } = parseDrawIoSVG(svgContent, {
  patterns: [
    { prefix: 'input-field-', type: 'input' },
    { prefix: 'output-field-', type: 'output' }
  ]
});
```

### Match by Custom Attribute

```tsx
const { mappings } = parseSVG(svgContent, {
  patterns: [
    { attribute: 'class', prefix: 'field-input-', type: 'input' },
    { attribute: 'data-field', regex: /^output-(.+)$/, type: 'output' }
  ]
});
```

### Match by Exact ID List

When you have a fixed set of elements with specific IDs:

```svg
<rect id="temperature" x="10" y="10" width="100" height="30"/>
<rect id="pressure" x="10" y="50" width="100" height="30"/>
<rect id="volume" x="10" y="90" width="100" height="30"/>
```

```tsx
const { mappings } = parseSVG(svgContent, {
  patterns: [
    { ids: ['temperature', 'pressure', 'volume'], type: 'input' }
  ]
});
```

**Use cases for `ids` array:**
- Fixed set of known elements
- Legacy SVGs with inconsistent naming
- When you don't control the ID naming convention
- Maximum explicitness and control (e.g., 100+ specific sensors in a complex diagram)



## 💡 Features

- 🎨 **Universal SVG Support** - draw.io, Figma, Inkscape, Adobe Illustrator, hand-coded
- 🔄 **Flexible Matching** - Match any SVG attribute (id, class, data-*, etc.)
- 🎯 **Pattern-Based** - Prefix or regex matching with per-pattern configuration
- ⚛️ **React 18+** - Built with modern React and createRoot API
- 🎨 **Fully Customizable** - Themes, CSS variables, custom components
- 📊 **Debug Mode** - Built-in debugging panel
- 💪 **TypeScript** - Complete type definitions with strict mode
- 🚀 **Next.js Ready** - Works out of the box

## 🌐 Interactive Landing Page & Playground

This repository now ships with a polished React + Vite site (see [`/site`](./site)) that showcases every example and includes a fully interactive playground:

- `npm run site:dev` — run the landing page locally with hot reload
- `npm run site:build` — produce the static assets under `site/dist`
- `npm run site:preview` — preview the production build

The site imports the real components and presets from [`/examples`](./examples) so content always stays in sync with the package. A dedicated workflow ([`.github/workflows/site.yml`](./.github/workflows/site.yml)) builds the site on every push to `main` and deploys it to GitHub Pages—just enable “GitHub Actions” under **Settings → Pages** and you’ll have a live playground/landing page with zero manual steps.

## 📖 Examples

### Calculator with Custom Styling

```tsx
import { SvgInteractive, parseSVG } from 'svg-interactive';

const svgContent = await fetch('/calculator.svg').then(r => r.text());
const { mappings } = parseSVG(svgContent, {
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ]
});

<SvgInteractive
  mappings={mappings}
  svgContent={svgContent}
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
import { SvgInteractive, parseDrawIoSVG } from 'svg-interactive';

const svgContent = await fetch('/diagram.svg').then(r => r.text());
const { mappings } = parseDrawIoSVG(svgContent, {
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ]
});

<SvgInteractive
  mappings={mappings}
  svgContent={svgContent}
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
<SvgInteractive
  mappings={mappings}
  svgContent={svgContent}
  theme="none"
  inputClassName="w-full h-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:ring-2"
  outputClassName="w-full h-full px-3 py-2 bg-green-50 border-2 border-green-500 rounded-lg"
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

### Parser Function

First, parse your SVG to extract field mappings. `parseSVG` will auto-detect Draw.io SVGs.

```typescript
// Generic parser for all SVG types
parseSVG(svgContent: string, options: ParseOptions): ParseResult

// Optimized parser for Draw.io SVGs
parseDrawIoSVG(svgContent: string, options: ParseOptions): ParseResult
```

**ParseOptions:**
```typescript
interface ParseOptions {
  patterns: FieldPattern[];        // Field matching patterns
  mode?: 'data-id' | 'direct-id';  // Optional: force specific mode
}

// FieldPattern is a discriminated union - must have exactly ONE matching strategy
type FieldPattern =
  | { prefix: string; type: 'input' | 'output'; attribute?: string }      // Match by prefix
  | { regex: RegExp; type: 'input' | 'output'; attribute?: string }       // Match by regex
  | { ids: string[]; type: 'input' | 'output'; attribute?: string };      // Match by ID list
```

**ParseResult:**
```typescript
interface ParseResult {
  mappings: FieldMapping[];        // Use this for SvgInteractive
  errors: string[];                // Any parsing errors encountered
  metadata: {
    tool: 'drawio' | 'generic';    // drawio or generic (Figma, Inkscape, etc.)
    detectedMode: 'data-id' | 'direct-id';
    attributesUsed: string[];      // Attributes queried during parsing
  };
}
```

### `<SvgInteractive>` Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mappings` | `FieldMapping[]` | **Yes** | Field mappings from parser |
| `svgContent` | `string` | **Yes** | Raw SVG string |
| `onInputChange` | `(name, value, all) => void` | No | Fired when any input changes |
| `onOutputCompute` | `(inputs) => outputs` | No | Compute all outputs from inputs |
| `outputValues` | `Record<string, string>` | No | Controlled output values |
| `onOutputUpdate` | `Record<string, fn>` | No | Per-field output callbacks |
| `renderInput` | `(props) => ReactNode` | No | Custom input renderer |
| `renderOutput` | `(props) => ReactNode` | No | Custom output renderer |
| `theme` | `'default' \| 'minimal' \| 'bordered' \| 'none'` | No | Built-in theme |
| `inputClassName` | `string` | No | CSS class for inputs |
| `outputClassName` | `string` | No | CSS class for outputs |
| `inputStyle` | `CSSProperties` | No | Inline styles for inputs |
| `outputStyle` | `CSSProperties` | No | Inline styles for outputs |
| `debug` | `boolean` | No | Show debug panel |
| `onDebugInfo` | `(info) => void` | No | Debug callback |

**[Full API Documentation →](./docs/api.md)**

## 🎨 Styling

### Built-in Themes

```tsx
<SvgInteractive theme="default" />  // Blue inputs, green outputs
<SvgInteractive theme="minimal" />  // Simple borders
<SvgInteractive theme="bordered" /> // Bold borders with shadows
<SvgInteractive theme="none" />     // No default styling
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
import 'svg-interactive/styles';
```

## 🐛 Debug Mode

```tsx
<SvgInteractive
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
git clone https://github.com/m98/svg-interactive
cd svg-interactive
npm install
npm run dev       # Watch mode
npm test          # Run tests
npm run quality   # Full quality check
```

## 📝 License

MIT © [Mohammad](https://github.com/m98)

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/svg-interactive)
- [GitHub Repository](https://github.com/m98/svg-interactive)
- [Issue Tracker](https://github.com/m98/svg-interactive/issues)
- [Changelog](./CHANGELOG.md)

## ⭐ Show Your Support

If this library helped you, please consider giving it a ⭐ on [GitHub](https://github.com/m98/svg-interactive)!

---

**Built with ❤️ for the open-source community**
