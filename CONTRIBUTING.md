# Contributing to SVG Interactive Diagram

First off, thank you for considering contributing! 🎉

This document provides guidelines for contributing to this project.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include**:
- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs actual behavior
- Code samples (minimal reproduction)
- Screenshots if applicable
- Environment details (browser, OS, library version)
- Debug mode output (if relevant)

**Example**:
```markdown
**Bug**: Fields not detected in Figma exports

**To Reproduce**:
1. Export SVG from Figma with "Include 'id' attribute" checked
2. Use config: `{ patterns: [{ prefix: 'input-', type: 'input' }] }`
3. No fields detected in debug mode

**Expected**: Fields should be detected
**Actual**: Debug shows 0 fields

**Environment**:
- Library version: 1.0.0
- Browser: Chrome 120
- React: 18.2.0
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear, descriptive title
- Provide detailed use case
- Explain why this would be useful
- Include code examples if possible

### Pull Requests

**Before submitting**:
1. Check existing PRs to avoid duplication
2. Discuss major changes in an issue first
3. Follow the coding standards below

**PR Process**:

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make your changes** following our standards
4. **Run quality checks**:
   ```bash
   npm run quality
   ```
5. **Commit** with clear messages:
   ```bash
   git commit -m "Add: New feature description"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/svg-interactive
cd svg-interactive

# Install dependencies
npm install

# Run tests
npm test

# Run in development mode
npm run dev

# Build the project
npm run build
```

### Available Scripts

```bash
npm run dev        # Watch mode for development
npm test           # Run tests
npm run lint       # Lint code
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
npm run typecheck  # TypeScript type checking
npm run quality    # Run ALL quality checks
npm run build      # Build for production
```

## Coding Standards

We maintain **maximum strictness** for code quality.

### TypeScript

- **ALL strict flags enabled** in `tsconfig.json`
- No `any` types (use proper typing)
- No non-null assertions (`!`) - prove type safety
- No implicit returns
- No unused variables/parameters

**Example**:
```typescript
// ❌ BAD
function compute(data: any) {
  return data.value!;
}

// ✅ GOOD
function compute(data: { value?: number }): number | undefined {
  return data.value;
}
```

### ESLint

- **Zero warnings policy** (`--max-warnings 0`)
- Use **nullish coalescing** (`??`) over logical OR (`||`)
- Use **optional chaining** (`?.`) for safe access
- **Exhaustive dependencies** in React hooks

**Example**:
```typescript
// ❌ BAD
const value = config.timeout || 1000;
if (ref.current && ref.current.value) { ... }

// ✅ GOOD
const value = config.timeout ?? 1000;
if (ref.current?.value) { ... }
```

### Prettier

- Run `npm run format` before committing
- Config: `.prettierrc.json`
- Single quotes, semicolons, 2-space indent, 100 char width

### React

- Functional components only
- Use hooks (no class components)
- React 18+ patterns (createRoot, etc.)
- Proper cleanup in useEffect

**Example**:
```typescript
useEffect(() => {
  const listener = () => { ... };
  window.addEventListener('resize', listener);

  // ✅ Cleanup
  return () => {
    window.removeEventListener('resize', listener);
  };
}, [dependencies]);
```

## Testing

### Writing Tests

- Place tests next to source files: `feature.test.ts`
- Use descriptive test names
- Cover edge cases
- Aim for >80% coverage

**Example**:
```typescript
describe('matchFieldPattern', () => {
  it('should match prefix and extract name', () => {
    const result = matchFieldPattern('input:username', [
      { prefix: 'input:', type: 'input' }
    ]);
    expect(result).toEqual({ type: 'input', name: 'username' });
  });

  it('should return null for non-matching prefix', () => {
    const result = matchFieldPattern('output:test', [
      { prefix: 'input:', type: 'input' }
    ]);
    expect(result).toBeNull();
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Explain **why**, not **what** (code shows what)
- Document complex algorithms

**Example**:
```typescript
/**
 * Computes bounding boxes for SVG elements.
 *
 * Uses getBBox() for accurate positioning even with transforms.
 * Falls back to getBoundingClientRect() if getBBox() fails.
 */
function computeBoundingBox(element: SVGElement): BBox { ... }
```

### User Documentation

When adding features:
- Update relevant docs in `docs/`
- Add examples to `examples/`
- Update `README.md` if API changes
- Update `CHANGELOG.md`

## Commit Messages

Use clear, conventional commit messages:

```
<type>: <description>

[optional body]
```

**Types**:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Improve existing feature
- `Refactor:` Code restructure (no behavior change)
- `Docs:` Documentation only
- `Test:` Add/update tests
- `Chore:` Build process, dependencies

**Examples**:
```
Add: Support for regex patterns in field matching

Fix: Output fields not updating when inputs change

Docs: Add Figma export guide

Test: Add tests for data-id matching mode
```

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run quality` - must pass
4. Commit: `Release: v1.2.0`
5. Tag: `git tag v1.2.0`
6. Push: `git push && git push --tags`
7. Publish: `npm publish`

## Project Structure

```
svg-interactive/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # React hooks
│   ├── utils/          # Utility functions
│   └── types.ts        # TypeScript types
├── examples/           # Usage examples
│   ├── 01-basic/       # Beginner examples
│   ├── 02-advanced/    # Advanced usage
│   ├── 03-integrations/# Library integrations
│   ├── 04-by-tool/     # Tool-specific examples
│   └── 05-real-world/  # Production examples
├── docs/               # Documentation
│   ├── api.md          # API reference
│   ├── draw-io.md      # Tool guides
│   └── ...
├── dist/               # Built files (gitignored)
└── package.json
```

## Questions?

- **Check the docs**: [docs/](./docs)
- **Search issues**: [GitHub Issues](https://github.com/m98/svg-interactive/issues)
- **Ask a question**: Open a new issue with "Question:" prefix

## Recognition

Contributors will be recognized in:
- `CHANGELOG.md` for their contributions
- GitHub contributors page
- Special thanks in release notes

Thank you for contributing! 🙏
