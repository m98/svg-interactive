# Examples

Progressive examples to help you get started with `svg-interactive`.

## 📚 Example Categories

### [01-basic/](./01-basic)
Start here! Simple examples to understand the basics.
- Hello World - Minimal setup
- Basic Calculator - Simple input/output
- Temperature Converter - Single computation

### [02-advanced/](./02-advanced)
Advanced features and customization.
- Custom Styling - Tailwind CSS integration
- Custom Components - React component renderers
- Controlled State - External state management
- Validation - Input validation patterns

### [03-integrations/](./03-integrations)
Integration with popular libraries.
- React Hook Form - Form management
- Zustand - State management
- Redux - State management
- TanStack Query - Data fetching

### [04-by-tool/](./04-by-tool)
Tool-specific SVG creation examples.
- draw.io - Flowcharts and diagrams
- Figma - Design tool exports
- Inkscape - Open-source SVG editor
- Hand-coded - Pure SVG examples

### [05-real-world/](./05-real-world)
Complete real-world applications.
- Physics Simulator - Gas laws calculator
- Financial Calculator - Loan payments
- Data Dashboard - Multi-field analytics
- Process Flow - Workflow automation

## Quick Start

1. **Install the library**:
   ```bash
   npm install svg-interactive
   ```

2. **Try the basic example**:
   ```tsx
   import { SvgInteractive } from 'svg-interactive';

   <SvgInteractive
     svgUrl="/diagram.svg"
     config={{
       patterns: [
         { prefix: 'input-', type: 'input' },
         { prefix: 'output-', type: 'output' }
       ]
     }}
   />
   ```

3. **Explore progressive examples** from `01-basic/` to `05-real-world/`

## Running Examples

Each example directory contains:
- `README.md` - Description and instructions
- `*.tsx` - React components
- `*.svg` - SVG diagrams
- `*.html` - Standalone demos (where applicable)

## Need Help?

- **[Documentation](../docs)** - Complete docs
- **[Troubleshooting](../docs/troubleshooting.md)** - Common issues
- **[API Reference](../docs/api.md)** - Full API docs
