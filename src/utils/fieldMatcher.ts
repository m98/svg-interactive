import { FieldPattern } from '../types';

/**
 * Matches a data-id string against field patterns
 * @param dataId - The data-id attribute value
 * @param patterns - Array of field patterns to match against
 * @returns The field type if matched, null otherwise
 */
export function matchFieldPattern(
  dataId: string,
  patterns: FieldPattern[]
): { type: 'input' | 'output'; name: string } | null {
  for (const pattern of patterns) {
    // Check ids array first (exact match)
    if (pattern.ids?.includes(dataId)) {
      return {
        type: pattern.type,
        name: dataId, // Use full ID as name (no extraction)
      };
    }

    if (pattern.prefix && dataId.startsWith(pattern.prefix)) {
      return {
        type: pattern.type,
        name: dataId.substring(pattern.prefix.length),
      };
    }

    if (pattern.regex?.test(dataId)) {
      // Extract name by removing the matched pattern if possible
      const match = dataId.match(pattern.regex);
      const name = match ? (match[1] ?? dataId) : dataId;
      return {
        type: pattern.type,
        name,
      };
    }
  }

  return null;
}

/**
 * Validates field configuration
 * @param patterns - Field patterns to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateFieldConfig(patterns: FieldPattern[]): string[] {
  const errors: string[] = [];

  if (!patterns || patterns.length === 0) {
    errors.push('At least one field pattern must be defined');
  }

  patterns.forEach((pattern, index) => {
    // Count how many matching strategies are defined
    const strategies = [
      pattern.ids !== undefined,
      pattern.prefix !== undefined,
      pattern.regex !== undefined,
    ].filter(Boolean).length;

    if (strategies === 0) {
      errors.push(`Pattern ${index}: must have either ids, prefix, or regex`);
    } else if (strategies > 1) {
      errors.push(`Pattern ${index}: cannot use multiple matching strategies (ids, prefix, regex)`);
    }

    // Validate ids array if provided
    if (pattern.ids !== undefined) {
      if (!Array.isArray(pattern.ids)) {
        errors.push(`Pattern ${index}: ids must be an array`);
      } else if (pattern.ids.length === 0) {
        errors.push(`Pattern ${index}: ids array cannot be empty`);
      } else if (!pattern.ids.every((id) => typeof id === 'string')) {
        errors.push(`Pattern ${index}: all ids must be strings`);
      }
    }

    if (!pattern.type || !['input', 'output'].includes(pattern.type)) {
      errors.push(`Pattern ${index}: type must be 'input' or 'output'`);
    }
  });

  return errors;
}
