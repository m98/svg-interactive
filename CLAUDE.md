# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**svg-interactive** - React library that transforms ANY SVG diagram into an interactive form with embedded input/output fields.

**Key Innovation**: Uses SVG `foreignObject` elements to overlay HTML inputs/outputs at exact positions on SVG diagrams.

**Supports**: svg exports from draw.io, Figma, Inkscape, custom SVGs

## Quick Commands

```bash
# Development
npm run build          # Build library (dist/)
npm run dev            # Watch mode
npm test               # All tests
npm run test:watch     # Watch mode
npm test -- svgParser  # Specific test file

# Quality (all must pass before publish)
npm run typecheck      # TypeScript strict mode check
npm run lint           # ESLint (zero warnings policy)
npm run format         # Prettier auto-fix
npm run quality        # Run all: typecheck + lint + format + test
```

## Architecture

### Core Concept
Load SVG → Parse (extract field mappings) → Render SVG → Get BoundingBoxes → Create foreignObjects → Embed HTML → Wire Events

### Flexible Attribute-Based Matching

The library uses a flexible attribute-based matching system that can match on **any SVG attribute**:

**Match by ID** (default - Inkscape, Figma, custom SVGs):
- Match SVG element `id` attributes: `<rect id="input:username" />`
- Pattern: `{ prefix: 'input:', type: 'input' }`

**Match by Data Attribute** (draw.io):
- draw.io auto-generates IDs, so use custom metadata instead
- Users add metadata in draw.io: `<object data-id="input:username">`
- Use dedicated parser: `parseDrawIoSVG(svgContent, { patterns: [...] })`

**Match by Custom Attribute** (advanced):
- Match any attribute: `class`, `data-field`, `data-*`, etc.
- Pattern: `{ attribute: 'class', prefix: 'field-', type: 'input' }`
- Per-pattern attribute specification enables mixing strategies

**Match by Exact ID List** (explicit control):
- Match specific element IDs from an array
- Pattern: `{ ids: ['temperature', 'pressure', 'volume'], type: 'input' }`
- Use for fixed sets of known elements or complex diagrams with 100+ specific sensors
- Field name uses the full ID (no extraction like prefix/regex)
- Can combine with `attribute` option: `{ attribute: 'data-id', ids: ['sensor-1', 'sensor-2'], type: 'input' }`

**Matching Strategies** (choose ONE per pattern):
- `prefix` - Match by string prefix
- `regex` - Match by regular expression
- `ids` - Match exact list of IDs
- **Important**: Only ONE strategy (`prefix`, `regex`, or `ids`) can be used per pattern (mutually exclusive)

**Auto-Detection**: `parseSVG()` automatically detects draw.io SVGs (checks for `content` attribute) and delegates to `parseDrawIoSVG`.

### Three-Layer Architecture

**Utils Layer** (`src/utils/`) - Pure functions, no React:
- `svgParser.ts` - Parses SVG, extracts field mappings, gets bounding boxes
- `fieldMatcher.ts` - Pattern matching (prefix/regex/ids), runtime validation for dynamic configs
- `decodeHTML.ts` - HTML entity decoding for draw.io content

**Hooks Layer** (`src/hooks/`) - React integration:
- `useFieldOverlay.ts` - Creates foreignObjects, embeds HTML, manages lifecycle

**Components Layer** (`src/components/`):
- `InteractiveSVG.tsx` - Main orchestrator, wires everything together
- `InputField.tsx` / `OutputField.tsx` - Default field renderers (customizable)
- `DebugPanel.tsx` - Shows field detection for debugging

### Key Files

**Entry**: `src/index.ts` exports all public APIs

**Main Component**: `InteractiveSVG` at `src/components/InteractiveSVG.tsx:11`
- Accepts pre-parsed `mappings` (from `parseSVG` or `parseDrawIoSVG`) and `svgContent` props
- Orchestrates: useFieldOverlay → render SVG + foreignObject overlays + fields
- Manages state: inputValues, outputValues (internal or controlled)
- Three output patterns: computed (onOutputCompute), controlled (outputValues prop), individual (onOutputUpdate)

**Critical Hook**: `useFieldOverlay` at `src/hooks/useFieldOverlay.ts:31`
- Creates foreignObject overlays positioned at SVG element bounding boxes
- Mounts React components with createRoot (React 18+)
- Handles cleanup: unmounts roots, removes foreignObjects, clears event listeners

**Types**: `src/types/index.ts` - Complete type system for library

## Code Quality Standards

### Maximum Strictness - ALL FLAGS ENABLED

**TypeScript** (`tsconfig.json`):
```
All strict flags: strict, noImplicitAny, strictNullChecks, strictFunctionTypes, etc.
All safety flags: noUnusedLocals, noUnusedParameters, noImplicitReturns,
                  noUncheckedIndexedAccess, exactOptionalPropertyTypes, etc.
```

**Implications**:
- No `any` without explicit annotation
- Null/undefined must be handled explicitly (use `?.` and `??`)
- Array access returns `T | undefined`
- No unused variables (prefix with `_` if intentional)
- All code paths must return values

**ESLint** (`eslint.config.mjs`) - ESLint v9 Flat Config:
```
Zero warnings policy (--max-warnings 0)
Type-aware linting (parserOptions.project)
```

**Key Rules**:
- `prefer-nullish-coalescing` - Use `??` not `||` (safer: treats 0 and '' correctly)
- `prefer-optional-chain` - Use `?.` not manual checks
- `no-non-null-assertion` - No `!` operator, prove type safety
- `no-floating-promises` - Must await or `void` promises
- `react-hooks/exhaustive-deps` - All dependencies must be listed
- `no-unused-vars` - No unused variables (except `_` prefix)

**Prettier** (`.prettierrc.json`):
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Enforced Patterns

```typescript
// ❌ BAD: || treats 0 and '' as falsy
const value = config.timeout || 1000;
// ✅ GOOD: ?? only treats null/undefined as nullish
const value = config.timeout ?? 1000;

// ❌ BAD: Non-null assertion
const el = document.getElementById('foo')!;
// ✅ GOOD: Proper null check
const el = document.getElementById('foo');
if (!el) throw new Error('Not found');

// ❌ BAD: Floating promise
useEffect(() => { fetchData(); }, []);
// ✅ GOOD: Explicit handling
useEffect(() => { void fetchData(); }, []);

// ❌ BAD: Missing dependency
useEffect(() => { console.log(count); }, []);
// ✅ GOOD: All dependencies listed
useEffect(() => { console.log(count); }, [count]);
```

### Pre-Publish Quality Gate

`npm run prepublishOnly` runs:
1. TypeScript type check (all strict flags)
2. ESLint (zero warnings)
3. Prettier (all files formatted)
4. All tests (unit + integration)
5. Production build

If ANY step fails, publishing is blocked.

## Testing

**Unit Tests**: Co-located `*.test.ts` files - utils, hooks, components

**Integration Tests**: `tests/integration/`
- `fixtures/gas-input-output.drawio.svg` - Real draw.io SVG
- `fixtures/simple-calculator.svg` - Real custom SVG
- Tests verify complete flow: load → parse → render → interact → calculate

**Coverage**: 75%+ maintained

## Common Tasks

### Debugging Field Detection
```typescript
<InteractiveSVG svgContent={svg} config={config} debug={true} />
// Shows DebugPanel with all detected fields and mode
```

### Adding New Pattern
Edit `config.patterns`:
```typescript
patterns: [
  { prefix: 'myprefix:', type: 'input' },
  { regex: /^CUSTOM_(.+)$/, type: 'output' },
  { ids: ['sensor-1', 'sensor-2', 'sensor-3'], type: 'input' }
]
```

### Custom Rendering
```typescript
<InteractiveSVG
  renderInput={(props) => <MyInput {...props} />}
  renderOutput={(props) => <MyOutput {...props} />}
/>
```

## Important Implementation Notes

### React 18 Compatibility
- Uses `createRoot()` for mounting custom renderers (not `renderToString`)
- Must unmount roots in cleanup to prevent memory leaks
- See `useFieldOverlay.ts:50-62` for root management

### SVG foreignObject
- Only way to embed HTML in SVG
- Creates overlay at exact bounding box position
- Namespace must be `http://www.w3.org/1999/xhtml` for div
- See `useFieldOverlay.ts:80-102` for creation

### State Management Patterns
- Functional setState for updates based on previous state
- Refs for values that don't trigger re-renders (fieldsRef, reactRootsRef)
- Guards to prevent setState in effects (prevMappingsRef prevents infinite loops)
- See `InteractiveSVG.tsx:67-82` for guarded setState pattern

### Build System
- Rollup outputs: CJS (`dist/index.js`), ESM (`dist/index.esm.js`), types (`dist/index.d.ts`)
- React is peer dependency (not bundled)
- PostCSS extracts and minifies CSS to `dist/styles.css`

## Extension Points

**Custom Renderers**: `renderInput`, `renderOutput` props - full control over field UI

**Custom Themes**: `theme` prop - applies CSS class to all fields

**Custom Patterns**: `config.patterns` - prefix, regex, or ids matching with per-pattern attribute configuration

## Documentation

- `README.md` - API reference, usage examples
- `docs/draw-io.md`, `docs/figma.md`, `docs/inkscape.md` - Tool-specific SVG preparation guides
- `examples/` - Usage examples
- Integration tests - Real-world usage patterns

## Project Philosophy

**Design Principles**:
1. Universal SVG support (no vendor lock-in)
2. Auto-detection (smart defaults, minimal config)
3. Type safety (100% TypeScript, maximum strictness)
4. Developer experience (debug mode, clear errors)

**Code Organization**:
- Pure functions in utils/ (testable, no side effects)
- Hooks for React lifecycle (side effects, state)
- Components for UI (presentation)
- Types first (define contracts before implementation)

**Quality Standards**:
- Zero tolerance for type errors, linting warnings, formatting issues
- Every strict flag enabled (TypeScript, ESLint)
- Comprehensive tests (unit + integration with real SVGs)
- Pre-publish quality gate prevents broken releases
- Prefer functional patterns, proper cleanup of side effects

---

**Last Updated**: 2025-11-13 | **Version**: 0.1.0
