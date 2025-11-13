# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation reorganization
  - Split SVG preparation guide into tool-specific docs
  - Created API reference documentation
  - Added troubleshooting guide
- Examples reorganization
  - Progressive learning structure (01-basic to 05-real-world)
  - Tool-specific examples
  - Integration examples
- Contributor guidelines (CONTRIBUTING.md)
- Code of Conduct (CODE_OF_CONDUCT.md)
- Maximum TypeScript strictness
- ESLint v9 with zero-warnings policy
- Prettier code formatting
- Comprehensive quality checks

### Changed
- README.md completely rewritten with open-source best practices
- Documentation structure for better navigation
- Examples directory structure for better learning progression

### Fixed
- **Theming System** - Complete overhaul of CSS variable support
  - Replaced hardcoded colors with CSS variables throughout codebase
  - `InteractiveSVG` component now uses `var(--svg-*-*)` syntax with fallbacks
  - `useFieldOverlay` hook now uses CSS variables for inline styles
  - Removed most `!important` flags to allow proper user customization
  - `themes.css` is now properly imported and bundled as `dist/styles.css`
  - Users can now successfully override theme colors via CSS variables
- TypeScript strict mode error in `useFieldOverlay.ts` (array index null check)
- All ESLint errors and warnings
- React hooks dependency issues
- Nullish coalescing violations

## [1.0.0] - 2024-11-12

### Added
- Initial release
- Core InteractiveSVG component
- Support for direct-id and data-id matching modes
- Auto-detection of matching mode
- Prefix and regex pattern matching
- Custom input/output renderers
- Built-in themes (default, minimal, bordered, none)
- Debug mode with comprehensive info
- TypeScript support
- React 18+ compatibility

### Features
- Transform any SVG into interactive form
- Works with draw.io, Figma, Inkscape, Illustrator, hand-coded SVGs
- Flexible pattern matching (prefix or regex)
- Full customization (themes, CSS, custom components)
- Controlled and uncontrolled modes
- Input change callbacks
- Output computation functions
- Per-field output callbacks

### Documentation
- README with quick start guide
- Basic usage examples
- SVG preparation guide
- TypeScript type definitions

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

[Unreleased]: https://github.com/m98/svg-interactive-diagram/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/m98/svg-interactive-diagram/releases/tag/v1.0.0
