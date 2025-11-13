import { decodeHTMLEntities } from './decodeHTML';

describe('decodeHTMLEntities', () => {
  it('should decode &lt; to <', () => {
    expect(decodeHTMLEntities('&lt;div&gt;')).toBe('<div>');
  });

  it('should decode &gt; to >', () => {
    expect(decodeHTMLEntities('a &gt; b')).toBe('a > b');
  });

  it('should decode &quot; to "', () => {
    expect(decodeHTMLEntities('&quot;hello&quot;')).toBe('"hello"');
  });

  it('should decode &#10; to newline', () => {
    expect(decodeHTMLEntities('line1&#10;line2')).toBe('line1\nline2');
  });

  it('should decode &amp; to &', () => {
    expect(decodeHTMLEntities('A &amp; B')).toBe('A & B');
  });

  it('should decode multiple entities in correct order', () => {
    expect(decodeHTMLEntities('&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;/div&gt;')).toBe(
      '<div class="test">A & B</div>'
    );
  });

  it('should handle text without entities', () => {
    expect(decodeHTMLEntities('plain text')).toBe('plain text');
  });

  it('should handle empty string', () => {
    expect(decodeHTMLEntities('')).toBe('');
  });

  it('should decode complex HTML entities', () => {
    const result = decodeHTMLEntities('&lt;span&gt;&quot;A &amp; B&quot;&lt;/span&gt;');
    expect(result).toBe('<span>"A & B"</span>');
  });

  it('should handle mixed entities', () => {
    const result = decodeHTMLEntities('&lt;div&gt;Test&lt;/div&gt;');
    expect(result).toBe('<div>Test</div>');
  });

  it('should decode numeric entities', () => {
    expect(decodeHTMLEntities('&#60;&#62;')).toBe('<>');
  });

  it('should handle multiple consecutive entities', () => {
    expect(decodeHTMLEntities('&lt;&lt;&gt;&gt;')).toBe('<<>>');
  });
});
