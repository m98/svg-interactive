import { FieldPattern } from '../types';

/**
 * Validates that a value is a valid FieldPattern at runtime
 * Useful for validating patterns loaded from JSON, APIs, or plugin systems
 *
 * @param value - Unknown value to validate
 * @returns True if value is a valid FieldPattern
 *
 * @example
 * ```typescript
 * const pattern = JSON.parse(configString);
 * if (isValidFieldPattern(pattern)) {
 *   // TypeScript knows pattern is FieldPattern
 *   patterns.push(pattern);
 * }
 * ```
 */
export function isValidFieldPattern(value: unknown): value is FieldPattern {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Must have valid type
  if (obj['type'] !== 'input' && obj['type'] !== 'output') {
    return false;
  }

  // Count matching strategies
  const hasPrefix = typeof obj['prefix'] === 'string' && obj['prefix'].length > 0;
  const hasRegex = obj['regex'] instanceof RegExp;
  const hasIds =
    Array.isArray(obj['ids']) &&
    obj['ids'].length > 0 &&
    obj['ids'].every((id) => typeof id === 'string');

  const strategiesCount = [hasPrefix, hasRegex, hasIds].filter(Boolean).length;

  // Must have exactly one strategy
  if (strategiesCount !== 1) {
    return false;
  }

  // Validate attribute if provided
  if (obj['attribute'] !== undefined && typeof obj['attribute'] !== 'string') {
    return false;
  }

  return true;
}

/**
 * Validates an array of field patterns
 * @param patterns - Patterns to validate
 * @returns Array of validation error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateFieldPatterns(patternsFromAPI);
 * if (errors.length > 0) {
 *   console.error('Invalid patterns:', errors);
 * }
 * ```
 */
export function validateFieldPatterns(patterns: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(patterns)) {
    errors.push('Patterns must be an array');
    return errors;
  }

  if (patterns.length === 0) {
    errors.push('At least one field pattern must be defined');
    return errors;
  }

  patterns.forEach((pattern, index) => {
    if (!isValidFieldPattern(pattern)) {
      const obj = pattern as Record<string, unknown>;

      // Provide specific error messages
      if (!pattern || typeof pattern !== 'object') {
        errors.push(`Pattern ${index}: must be an object`);
      } else if (obj['type'] !== 'input' && obj['type'] !== 'output') {
        errors.push(`Pattern ${index}: type must be 'input' or 'output'`);
      } else {
        const hasPrefix = typeof obj['prefix'] === 'string' && obj['prefix'].length > 0;
        const hasRegex = obj['regex'] instanceof RegExp;
        const hasIds = Array.isArray(obj['ids']) && obj['ids'].length > 0;
        const strategiesCount = [hasPrefix, hasRegex, hasIds].filter(Boolean).length;

        if (strategiesCount === 0) {
          errors.push(`Pattern ${index}: must have either prefix, regex, or ids`);
        } else if (strategiesCount > 1) {
          errors.push(
            `Pattern ${index}: can only use one matching strategy (prefix, regex, or ids)`
          );
        } else if (Array.isArray(obj['ids'])) {
          if (obj['ids'].length === 0) {
            errors.push(`Pattern ${index}: ids array cannot be empty`);
          } else if (!obj['ids'].every((id) => typeof id === 'string')) {
            errors.push(`Pattern ${index}: all ids must be strings`);
          }
        }
      }
    }
  });

  return errors;
}

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
