# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-11-13

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

[Unreleased]: https://github.com/m98/svg-interactive/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/m98/svg-interactive/releases/tag/v0.1.0
