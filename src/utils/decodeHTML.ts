/**
 * Decodes HTML entities in a string
 * @param text - The HTML-encoded text
 * @returns Decoded string
 */
export function decodeHTMLEntities(text: string): string {
  if (typeof document === 'undefined') {
    // Server-side: basic entity decoding
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#10;/g, '\n')
      .replace(/&amp;/g, '&');
  }

  // Client-side: use textarea for full decoding
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}
