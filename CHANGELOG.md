# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-11-20

### Removed
- **BREAKING: `parseFigmaSVG` and `parseInkscapeSVG`** - These functions have been removed to simplify the API.

### Changed
- **BREAKING: API Consolidation** - The `parseSVG` function now handles all SVG types, including Figma and Inkscape. For Draw.io SVGs, `parseDrawIoSVG` remains available. This change simplifies the API and reduces redundancy.

### Fixed
- **Dark Mode Text Colors** - Fixed poor text contrast in dark mode
  - Updated input text color: `#000000` → `#111827` (gray-900)
  - Updated output text color: `#000000` → `#065f46` (emerald-800)
  - Updated SVG text fill color: `#000000` → `#111827`
  - Changes applied across themes.css, useFieldOverlay.ts, and InteractiveSVG.tsx
- **Style Reactivity Bug** - Fixed `inputStyle` and `outputStyle` props not updating fields at runtime
  - Added `inputStyle` and `outputStyle` to dependency array in `useFieldOverlay.ts:384`
  - Fields now properly re-render when style props change

## [0.1.3] - 2025-11-16

### Added
- **IDs Array Matching** - Match specific elements by exact IDs for maximum control
  - New `ids?: string[]` option in `FieldPattern` interface
  - Enables explicit element selection: `{ ids: ['sensor-1', 'sensor-2', 'sensor-3'], type: 'input' }`
  - Perfect for complex diagrams with 100+ specific sensors or irregular naming conventions
  - Field names use the full ID (no extraction like prefix/regex)
  - Works with any attribute: `{ attribute: 'data-id', ids: ['temp-north', 'temp-south'], type: 'input' }`
  - Mutual exclusivity validation: only one matching strategy (ids, prefix, or regex) per pattern
  - Comprehensive validation: array must not be empty, all elements must be strings
  - IDs array checked first in matching order (before prefix/regex) for performance

### Tests
- Added 15 new tests for IDs array functionality (total: 237 tests passing)
  - 8 unit tests for matching logic
  - 7 validation tests for mutual exclusivity and array validation
  - 4 generic parser tests
  - 2 draw.io parser tests
  - 1 integration test

### Documentation
- **README.md** - Added "Match by Exact ID List" section with use cases and examples
- **docs/api.md** - Comprehensive FieldPattern documentation with IDs array examples
- **docs/hand-coded.md** - Added sensor dashboard example showing IDs array usage
- **CLAUDE.md** - Updated architecture documentation with IDs array information

### Examples
- **examples/02-advanced/ids-array-matching.tsx** - New working example demonstrating IDs array
  - Sensor dashboard with 3 input sensors and 1 output (average calculation)
  - Shows non-interactive elements being excluded from IDs array
  - Integrated with site/playground via examples manifest
  - Added new "Advanced" category to examples

## [0.1.2] - 2025-11-16

### Fixed
- **Critical: DOM ID Collision Bug** - Fixed duplicate IDs breaking output field updates
  - Input fields now use `id="input-field-{name}"` pattern
  - Output fields now use `id="output-field-{name}"` pattern
  - Previously both used `id="field-{name}"`, causing `getElementById` to always return the first element
  - This broke all SVGs where inputs and outputs share the same base name (e.g., `input-field-gas` and `output-field-gas`)
  - Updated all 6 ID assignment locations in `useFieldOverlay.ts`
  - Fixed 10+ test cases across 5 integration test files to use correct IDs

### Added
- **`defaultInputs` prop** - Pre-populate input fields with initial values
  - New optional prop on `InteractiveSVG`: `defaultInputs?: Record<string, string>`
  - Allows setting initial values when component mounts
  - Existing values take precedence over defaults
  - Useful for examples, demos, and preset configurations

### Changed
- **Examples** - Replaced heat exchanger with calculator example
  - Added `Calculator (draw.io)` example demonstrating simple addition
  - Removed outdated heat exchanger example
  - New example better demonstrates draw.io integration with clear, simple use case
  - Added comprehensive integration tests (10 test cases)

### Documentation
- **docs/api.md** - Added `defaultInputs` prop documentation with examples
- **docs/draw-io.md** - Updated to reference new calculator example
- **tests/integration/README.md** - Updated to document all 3 fixtures and their tests
- **site/Playground** - Now passes `defaultInputs` to InteractiveSVG component

## [0.1.1] - 2025-11-13

### Fixed
- **README.md** - Fixed broken anchor links in navigation (Quick Start, Examples, API Docs)
  - Updated links to include emoji in anchors to match GitHub's auto-generation

### Documentation
- **docs/api.md** - Complete rewrite to accurately reflect actual implementation
  - Removed outdated `svgUrl` and `config` props that don't exist
  - Added comprehensive parser functions documentation (`parseSVG`, `parseDrawIoSVG`, etc.)
  - Documented two-step pattern: parse SVG → render with mappings
  - Fixed `DebugInfo` interface (inputFields/outputFields are FieldData arrays)
  - Added `ParseOptions` and `ParseResult` type documentation
  - Documented attribute-based matching system (id, class, data-*, custom)
  - Added all CSS variables that actually exist
  - Updated all examples to use correct two-step API
  - Added parser-specific documentation for each tool
  - Documented three-strategy element lookup system

- **docs/draw-io.md** - Enhanced with technical details and updated API
  - Added note that draw.io and diagrams.net are the same tool
  - Updated all code examples to use new two-step API (`parseDrawIoSVG` + `InteractiveSVG`)
  - Added comprehensive "How It Works" technical section explaining:
    - draw.io export structure (embedded mxfile XML)
    - Data-ID to element lookup process
    - Step-by-step parsing process
    - Three-strategy element lookup fallback
    - Why data-id attributes are needed (random ID problem)
    - Metadata returned by parser
  - Updated troubleshooting section to use new error handling patterns

## [0.1.0] - 2025-11-13

**Initial npm release** of `svg-interactive` - Transform any SVG into an interactive form with embedded input/output fields.

### Added
- Core `InteractiveSVG` component for rendering interactive SVG diagrams
- Parser functions: `parseSVG`, `parseDrawIoSVG`, `parseFigmaSVG`, `parseInkscapeSVG`
- Support for attribute-based field matching (id, class, data-*, custom attributes)
- Flexible pattern matching (prefix or regex)
- Three-strategy element lookup system:
  1. Direct id attribute query
  2. data-cell-id fallback (draw.io compatibility)
  3. Custom attribute matching (class, data-field, etc.)
- Custom input/output renderers via `renderInput` and `renderOutput` props
- Built-in themes: `default`, `minimal`, `bordered`
- CSS variable theming system with full customization support
- Debug mode with comprehensive field detection info
- Output computation patterns:
  - Global `onOutputCompute` callback
  - Per-field `onOutputUpdate` callbacks
  - Controlled mode with external `outputValues` prop
- Comprehensive documentation
  - Tool-specific SVG preparation guides (draw.io, Figma, Inkscape, Illustrator)
  - API reference documentation
  - Troubleshooting guide
  - Progressive examples (basic → advanced → real-world)
- Contributor guidelines (CONTRIBUTING.md)
- Code of Conduct (CODE_OF_CONDUCT.md)
- Publishing guide (PUBLISHING.md)
- Maximum TypeScript strictness (all strict flags enabled)
- ESLint v9 with zero-warnings policy
- Prettier code formatting
- Comprehensive test suite (202 tests, 13 test suites)
  - Unit tests for all utilities and hooks
  - Integration tests with real SVG files
  - Custom attribute matching tests
  - draw.io mixed-mode tests

### Fixed
- **Custom Attribute Matching** - Fixed completely broken custom attribute matching
  - Added `matchedAttribute` field to `FieldMapping` type
  - Updated all parsers to set `matchedAttribute`
  - Enhanced `getFieldBoundingBoxes` with 3-strategy fallback system
  - Fixed JSDOM compatibility (getBBox method check vs instanceof)
  - Added comprehensive integration tests for class and data-* attributes
- **Input State Management** - Fixed input state not clearing when switching diagrams
  - Removed early return in `useEffect` when `inputFieldNames.length === 0`
  - Input state now correctly clears to `{}` when switching to diagrams without inputs
  - Prevents stale input values from leaking into `onOutputCompute` callbacks
- **Rendering Optimization** - Optimized `InteractiveSVG` component
  - Replaced `JSON.stringify` comparison with `useMemo` for inputFieldNames
  - More efficient dependency tracking in useEffect
- **Theming System** - Complete overhaul of CSS variable support
  - Replaced hardcoded colors with CSS variables throughout codebase
  - Component now uses `var(--svg-*-*)` syntax with fallbacks
  - Removed most `!important` flags to allow proper user customization
  - Users can now successfully override theme colors via CSS variables
- **draw.io SVG Parsing** - Fixed unreliable elementId extraction
  - Changed from `obj.parentElement?.getAttribute('id')` to `obj.getAttribute('id')`
  - Now correctly matches the `data-cell-id` in rendered SVG
- TypeScript strict mode compliance (all strict flags pass)
- ESLint compliance (zero warnings)
- React hooks dependency issues
- Nullish coalescing violations

### Documentation
- README with quick start guide and examples
- Tool-specific SVG preparation guides
- API reference with all props documented
- Troubleshooting guide for common issues
- TypeScript type definitions with full JSDoc comments

### Technical Details
- React 18+ compatibility (uses `createRoot` API)
- TypeScript 5.0+ with maximum strictness
- Rollup bundler outputting CJS, ESM, and type definitions
- SVG `foreignObject` technique for HTML embedding
- Automatic cleanup of React roots to prevent memory leaks

---

## Release Notes Format

### Added
For new features.

### Changed
For changes in existing functionality.

### Deprecated
For soon-to-be removed features.

### Removed
For now removed features.

### Fixed
For any bug fixes.

### Security
In case of vulnerabilities.

---

[Unreleased]: https://github.com/m98/svg-interactive/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/m98/svg-interactive/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/m98/svg-interactive/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/m98/svg-interactive/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/m98/svg-interactive/releases/tag/v0.1.0
