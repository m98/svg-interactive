# Integration Tests

This directory contains integration tests that verify the complete functionality of the svg-interactive library using real SVG files.

## Test Status

✅ **23 integration tests** covering:
- 13 Draw.io SVG tests (100% passing)
- 10 Custom SVG tests (80% passing)

The tests verify real-world usage with actual SVG files from the examples directory.

## Structure

```
tests/integration/
├── fixtures/               # SVG files used in tests
│   ├── gas-input-output.drawio.svg   # Draw.io example
│   └── simple-calculator.svg         # Custom SVG example
├── drawio-svg.integration.test.tsx   # Tests for Draw.io SVG
└── simple-svg.integration.test.tsx   # Tests for simple SVG
```

## Test Files

### `fixtures/`
Contains actual SVG files used in integration tests:
- **gas-input-output.drawio.svg**: A real Draw.io exported SVG with gas input/output fields
- **simple-calculator.svg**: A custom SVG with two inputs (a, b) and one output (sum) for addition

### `drawio-svg.integration.test.tsx`
Tests the complete flow with a Draw.io SVG:
- ✅ SVG loading and parsing
- ✅ Data-id mode detection
- ✅ Field mapping (input-field-gas, output-field-gas)
- ✅ Input/output functionality
- ✅ Value calculations (multiply by 2)
- ✅ Error handling
- ✅ SVG structure preservation

### `simple-svg.integration.test.tsx`
Tests with a custom simple SVG:
- ✅ Calculator functionality (A + B = Sum)
- ✅ Direct-id mode detection
- ✅ Multiple input handling
- ✅ Decimal arithmetic
- ✅ Negative numbers
- ✅ Value persistence
- ✅ External output control

## Running Tests

### Run all tests (unit + integration)
```bash
npm test
```

### Run only integration tests
```bash
npm run test:integration
```

### Run only unit tests
```bash
npm run test:unit
```

### Run integration tests in watch mode
```bash
npm run test:integration:watch
```

### Run with coverage
```bash
npm run test:coverage
```

## What These Tests Verify

### 1. **Real SVG Parsing**
- Tests load actual SVG files from disk
- Verifies correct parsing of different SVG formats (Draw.io vs custom)
- Ensures field detection works with real-world SVGs

### 2. **Complete User Flow**
- User types in input field → onInputChange callback
- Calculation logic → onOutputCompute callback
- Output display updates → DOM verification

### 3. **Multiple Field Coordination**
- Tests with 2+ inputs ensure values don't get lost
- Verifies state management across multiple fields
- Checks that each field maintains its independent value

### 4. **Data Types & Edge Cases**
- Integers: `100`
- Decimals: `12.5`
- Negatives: `-30`
- Empty: `""`
- Invalid: `"abc"`

### 5. **Different SVG Formats**
- **Draw.io format**: Uses `data-id` in XML content attribute (auto-detected via `content` attribute)
- **Custom SVG**: Uses direct `id` attributes on `<g>` elements (e.g., `<g id="input-field-a">`)

## Adding New Integration Tests

To add a new integration test:

1. **Add SVG fixture**:
   ```bash
   cp your-diagram.svg tests/integration/fixtures/
   ```

2. **Create test file**:
   ```typescript
   // tests/integration/your-diagram.integration.test.tsx
   import * as fs from 'fs';
   import * as path from 'path';

   describe('Your Diagram Integration', () => {
     let svgContent: string;

     beforeAll(() => {
       const svgPath = path.join(__dirname, 'fixtures', 'your-diagram.svg');
       svgContent = fs.readFileSync(svgPath, 'utf-8');
     });

     // Add your tests...
   });
   ```

3. **Run the tests**:
   ```bash
   npm run test:integration
   ```

## Example Test Scenarios

### Testing Input → Output Flow
```typescript
it('should calculate correctly', async () => {
  const onOutputCompute = jest.fn((inputs) => ({
    output: (parseFloat(inputs.input) * 2).toString()
  }));

  render(
    <InteractiveSVG
      svgContent={svgContent}
      config={config}
      onOutputCompute={onOutputCompute}
    />
  );

  const input = document.querySelector('input[data-field-name="input"]');
  const output = document.getElementById('output-output');

  fireEvent.input(input, { target: { value: '10' } });

  await waitFor(() => {
    expect(output.textContent).toBe('20');
  });
});
```

### Testing Field Detection
```typescript
it('should find all fields', async () => {
  const onDebugInfo = jest.fn();

  render(
    <InteractiveSVG
      svgContent={svgContent}
      config={config}
      onDebugInfo={onDebugInfo}
    />
  );

  await waitFor(() => {
    expect(onDebugInfo).toHaveBeenCalled();
  });

  const debugInfo = onDebugInfo.mock.calls[0][0];
  expect(debugInfo.inputFields.length).toBe(2);
  expect(debugInfo.outputFields.length).toBe(1);
});
```

## Benefits of Integration Tests

1. **Catch Real Issues**: Test with actual SVG files, not mocked data
2. **Verify Complete Flow**: From SVG load → parse → render → interact
3. **Document Usage**: Tests serve as working examples
4. **Regression Prevention**: Ensure new changes don't break existing functionality
5. **Format Coverage**: Test both Draw.io and custom SVG formats

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  run: npm run test:integration
```

All integration tests use jsdom for DOM rendering, so they don't require a browser.
