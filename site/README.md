# svg-interactive Landing Page

Modern, minimalist documentation site for the svg-interactive library. Built with Vite, React, TypeScript, and React Router.

## Design

- **Style**: Radix UI inspired - clean, minimal, professional
- **Colors**: Black/white/gray with subtle accents
- **Typography**: System fonts for fast loading
- **Architecture**: Multi-route SPA with 4 main pages

## Pages

- **Home** (`/`): Hero, features, quick start, examples preview
- **Examples** (`/examples`): Interactive example grid with live demos and code
- **Playground** (`/playground`): Full-featured interactive SVG playground
- **Docs** (`/docs`): Documentation hub with links to GitHub docs

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Components

- **UI Primitives** (`components/ui/`): Button, Card, Tabs, Badge, CopyButton, Select
- **Layout** (`components/layout/`): Header, Footer, Container
- **Home** (`components/home/`): Hero, FeatureGrid, QuickStart, ExamplesPreview
- **Examples** (`components/examples/`): ExampleGrid, ExampleCard, ExampleDetail, CodeViewer
- **Playground** (`components/playground/`): Playground (full-featured)
- **Docs** (`components/docs/`): DocsSidebar, DocsContent

### Pages

- `pages/Home.tsx`: Landing page
- `pages/Examples.tsx`: Examples showcase
- `pages/Playground.tsx`: Interactive playground
- `pages/Docs.tsx`: Documentation

### Design System

- **Styles**: `styles/globals.css` (Tailwind + custom tokens), `styles/reset.css`, `styles/prism-theme.css`
- **Utilities**: `lib/utils.ts` (className helper)
- **Tailwind Config**: `tailwind.config.js`, `postcss.config.js`

## Key Features

1. **Zero SVG Duplication**: All examples imported from `@examples/manifest`
2. **Live Demos**: Every example renders its actual component
3. **Code Viewing**: View SVG source and configuration
4. **Interactive Playground**: Upload, configure, and test any SVG
5. **Responsive Design**: Mobile-friendly with Tailwind-style utility classes

## Deployment

Deployed to GitHub Pages via `.github/workflows/site.yml`:

1. Build triggered on push to `main`
2. Install dependencies (root + site)
3. Build site with Vite
4. Deploy to GitHub Pages

**Live URL**: `https://m98.github.io/svg-interactive-diagram/` (or `svg-interactive` depending on repo name)

## Configuration

### Vite

- **Base Path**: `./` (relative, for GitHub Pages)
- **Aliases**:
  - `svg-interactive` → `../src` (imports library source)
  - `svg-interactive/styles` → `../src/styles/themes.css`
  - `@examples` → `../examples`

### TypeScript

- **Strict Mode**: Enabled
- **Path Mappings**: Mirror Vite aliases
- **No Unused Vars**: Enforced (prefix with `_` if intentional)

## Adding Examples

1. Create preset in `examples/` (e.g., `01-basic/my-example.tsx`)
2. Export both preset and component
3. Add to `examples/manifest.ts`
4. Site auto-updates (no changes needed here)

## Dependencies

- **React**: 18.3.1
- **React Router**: 6.x
- **Tailwind CSS**: 3.x
- **Lucide Icons**: Latest
- **Vite**: 4.x
- **TypeScript**: 5.x

## Notes

- All documentation content links to GitHub (no in-site markdown rendering)
- Playground supports URL parameters: `/playground?example=calculator`
- Examples can be opened in playground from detail view
- Design follows Radix UI principles: minimal, accessible, type-safe
