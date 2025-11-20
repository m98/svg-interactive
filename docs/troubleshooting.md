# Troubleshooting Guide

Common issues and solutions for `svg-interactive`.

## Quick Diagnostics

### Enable Debug Mode

Always start with debug mode to understand what's happening:

```tsx
<SvgInteractive
  debug={true}
  onDebugInfo={(info) => {
    console.log('Matching Mode:', info.matchingMode);
    console.log('Total Fields:', info.totalFields);
    console.log('Input Fields:', info.inputFields);
    console.log('Output Fields:', info.outputFields);
  }}
  {...otherProps}
/>
```

The debug panel shows:
- Which matching mode is active (`direct-id` or `data-id`)
- How many fields were found
- List of all detected fields
- Any configuration errors

---

## No Fields Found

**Symptom**: Debug shows "Total Fields: 0"

### Cause 1: IDs don't match patterns

**Check**:
```tsx
// Your config
patterns: [
  { prefix: 'input-', type: 'input' }
]

// Your SVG should have
<rect id="input-temperature" ... />
//       ^^^^^^ must start with 'input-'
```

**Solution**:
- Verify pattern prefixes match SVG IDs exactly
- Check case sensitivity (use lowercase)
- Open SVG in text editor and search for `id="`

### Cause 2: Wrong matching mode

**Check**: Debug panel shows matching mode

**Solution for draw.io**:
```tsx
<SvgInteractive
  config={{
    matchingMode: 'data-id',  // Force data-id mode
    patterns: [...]
  }}
/>
```

**Solution for other tools**:
```tsx
<SvgInteractive
  config={{
    matchingMode: 'direct-id',  // Force direct-id mode
    patterns: [...]
  }}
/>
```

### Cause 3: SVG not loaded

**Check**: Does SVG render at all?

**Solutions**:
- Verify `svgUrl` path is correct
- Check browser console for 404 errors
- Try using `svgContent` prop with inline SVG string

---

## Fields Positioned Incorrectly

**Symptom**: Input overlays appear in wrong locations

### Cause 1: SVG transformations

**Problem**: Nested groups with transforms confuse bounding box calculations

**Solutions**:
1. **Flatten transforms** before export (tool-specific):
   - Inkscape: Path → Object to Path
   - Illustrator: Object → Expand Appearance
   - Figma: Object → Flatten

2. **Avoid nested groups**:
   ```svg
   <!-- ❌ BAD: Nested with transforms -->
   <g transform="translate(100, 50)">
     <g transform="rotate(45)">
       <rect id="input-temp" ... />
     </g>
   </g>

   <!-- ✅ GOOD: Flat structure -->
   <rect id="input-temp" x="100" y="50" ... />
   ```

### Cause 2: ViewBox mismatch

**Problem**: SVG viewBox doesn't match actual coordinates

**Solution**: Ensure viewBox matches content:
```svg
<!-- If content is 0-600 x 0-400 -->
<svg viewBox="0 0 600 400" ... >
```

### Cause 3: Percentage-based sizing

**Problem**: Elements use percentage widths/heights

**Solution**: Use absolute pixel values:
```svg
<!-- ❌ BAD -->
<rect width="50%" height="20%" ... />

<!-- ✅ GOOD -->
<rect width="200" height="40" ... />
```

---

## draw.io Specific Issues

### Fields not detected

**Symptoms**: Debug shows 0 fields, but data-id properties exist

**Solutions**:

1. **Verify data-id in SVG**:
   - Open exported SVG in text editor
   - Search for `data-id`
   - Ensure format: `data-id="input-field-name"`

2. **Check export format**:
   - Must be **SVG** (not PNG, PDF, XML)
   - Uncheck "Compressed" if checked

3. **Force data-id mode**:
   ```tsx
   config={{
     matchingMode: 'data-id',
     patterns: [...]
   }}
   ```

4. **Verify content attribute**:
   - draw.io SVGs use `content` attribute to store metadata
   - Ensure it wasn't stripped during export

---

## Figma Specific Issues

### IDs not in exported SVG

**Symptoms**: SVG has no `id` attributes

**Solutions**:

1. **Re-export with ID attribute enabled**:
   - Export Settings → ✅ **"Include 'id' attribute"**
   - This is the most common issue

2. **Export frames, not whole page**:
   - Select individual frame/component
   - Don't export entire canvas

3. **Check layer names**:
   - Remove special characters
   - Use only: letters, numbers, hyphens
   - Example: `input-temp-value` ✅, `Input (Temp)` ❌

---

## Inkscape Specific Issues

### IDs revert to auto-generated

**Symptoms**: IDs like `rect1234` instead of custom names

**Solutions**:

1. **Set ID via Object Properties**:
   - Object → Object Properties (`Shift+Ctrl+O`)
   - Enter ID in "ID" field
   - Don't just edit in XML Editor

2. **Save as Plain SVG**:
   - File → Save As
   - Format: **Plain SVG** (not Inkscape SVG)

3. **Verify before closing**:
   - Edit → XML Editor
   - Check IDs are correct before closing file

---

## Input Fields Too Small

**Symptoms**: Text doesn't fit in input fields

### Solutions:

1. **Make SVG shapes larger**:
   - Minimum recommended: 120×30px
   - Touch targets (mobile): 150×44px

2. **Reduce font size**:
   ```tsx
   <SvgInteractive
     inputStyle={{ fontSize: '10px', padding: '2px' }}
   />
   ```

3. **Redesign layout**:
   - Give more space to interactive areas
   - Reduce decorative elements

---

## Output Values Not Updating

**Symptoms**: Outputs show "..." or don't update when inputs change

### Cause 1: Missing onOutputCompute

**Solution**: Provide computation function:
```tsx
<SvgInteractive
  onOutputCompute={(inputs) => ({
    result: computeResult(inputs),
    status: getStatus(inputs)
  })}
/>
```

### Cause 2: Output names don't match

**Check**:
```tsx
// SVG has
<rect id="output-total" ... />

// onOutputCompute must return
onOutputCompute={(inputs) => ({
  total: "123"  // Key must be "total", not "output-total"
})}
```

### Cause 3: Controlled outputs

**If using controlled outputs**:
```tsx
const [outputs, setOutputs] = useState({});

<SvgInteractive
  outputValues={outputs}  // Provide values
  onOutputCompute={(inputs) => {
    const newOutputs = { result: calculate(inputs) };
    setOutputs(newOutputs);  // Update state
    return newOutputs;
  }}
/>
```

---

## Performance Issues

### Symptom: Laggy input typing

**Causes**: Re-rendering on every keystroke

**Solutions**:

1. **Debounce inputs**:
   ```tsx
   import { useDebouncedCallback } from 'use-debounce';

   const debouncedCompute = useDebouncedCallback(
     (inputs) => computeOutputs(inputs),
     300
   );

   <SvgInteractive
     onOutputCompute={debouncedCompute}
   />
   ```

2. **Memoize render functions**:
   ```tsx
   const renderInput = useMemo(() => (props) => (
     <input {...props} />
   ), []);
   ```

3. **Simplify SVG**:
   - Remove unnecessary paths/gradients
   - Optimize with [SVGOMG](https://jakearchibald.github.io/svgomg/)

---

## Styling Not Applied

### Symptom: Custom className or style not visible

**Solutions**:

1. **Import theme styles**:
   ```tsx
   import 'svg-interactive/styles';
   ```

2. **Check CSS specificity**:
   ```css
   /* May need !important or higher specificity */
   .my-input {
     border: 2px solid blue !important;
   }
   ```

3. **Use theme="none" for full control**:
   ```tsx
   <SvgInteractive
     theme="none"
     inputClassName="my-custom-input"
   />
   ```

---

## Browser Compatibility

### Symptom: Not working in specific browser

**Check foreignObject support**:
```javascript
const supported = 'foreignObject' in document.createElementNS(
  'http://www.w3.org/2000/svg',
  'foreignObject'
);
```

**Supported**:
- ✅ Chrome/Edge 88+
- ✅ Firefox 90+
- ✅ Safari 14+

**Not supported**:
- ❌ IE11 (foreignObject partial support)
- ❌ Very old mobile browsers

---

## Still Having Issues?

### Before Opening an Issue

1. **Enable debug mode** and check output
2. **Verify SVG loads** in browser directly
3. **Check IDs exist** in SVG source code
4. **Try minimal example** to isolate problem
5. **Review relevant docs**:
   - [draw.io guide](./draw-io.md)
   - [Figma guide](./figma.md)
   - [Inkscape guide](./inkscape.md)
   - [API reference](./api.md)

### Open an Issue

Include:
- Debug mode output
- Minimal code example
- SVG file (or relevant excerpt)
- Browser/OS information
- Screenshots

**[GitHub Issues](https://github.com/m98/svg-interactive/issues)**

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "At least one field pattern must be defined" | Empty `patterns` array | Add at least one pattern |
| "Pattern must have either prefix or regex" | Invalid pattern config | Add `prefix` or `regex` to pattern |
| "Type must be 'input' or 'output'" | Invalid type | Use only 'input' or 'output' |
| No SVG element found | SVG didn't load | Check `svgUrl` or `svgContent` |

---

## Testing Checklist

Before deploying, verify:

- [ ] Debug mode shows correct matching mode
- [ ] All expected fields are detected
- [ ] Input fields are positioned correctly
- [ ] Output fields are positioned correctly
- [ ] Text is readable in inputs/outputs
- [ ] Typing in inputs works smoothly
- [ ] Outputs update when inputs change
- [ ] SVG scales properly at different sizes
- [ ] Works on target browsers
- [ ] Works on mobile (if applicable)
