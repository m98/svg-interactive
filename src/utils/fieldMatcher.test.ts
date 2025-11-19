import { matchFieldPattern, isValidFieldPattern, validateFieldPatterns } from './fieldMatcher';
import { FieldPattern } from '../types';

describe('matchFieldPattern', () => {
  describe('prefix matching', () => {
    const patterns: FieldPattern[] = [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ];

    it('should match input prefix and extract name', () => {
      const result = matchFieldPattern('input:username', patterns);
      expect(result).toEqual({ type: 'input', name: 'username' });
    });

    it('should match output prefix and extract name', () => {
      const result = matchFieldPattern('output:total', patterns);
      expect(result).toEqual({ type: 'output', name: 'total' });
    });

    it('should return null for non-matching prefix', () => {
      const result = matchFieldPattern('field:test', patterns);
      expect(result).toBeNull();
    });

    it('should extract empty name if only prefix provided', () => {
      const result = matchFieldPattern('input:', patterns);
      expect(result).toEqual({ type: 'input', name: '' });
    });

    it('should handle complex field names', () => {
      const result = matchFieldPattern('input:user.email.address', patterns);
      expect(result).toEqual({ type: 'input', name: 'user.email.address' });
    });
  });

  describe('regex matching', () => {
    const patterns: FieldPattern[] = [
      { regex: /^IN_(.+)$/, type: 'input' },
      { regex: /^OUT_(.+)$/, type: 'output' },
    ];

    it('should match regex pattern and extract captured group', () => {
      const result = matchFieldPattern('IN_username', patterns);
      expect(result).toEqual({ type: 'input', name: 'username' });
    });

    it('should match output regex pattern', () => {
      const result = matchFieldPattern('OUT_result', patterns);
      expect(result).toEqual({ type: 'output', name: 'result' });
    });

    it('should return null for non-matching regex', () => {
      const result = matchFieldPattern('FIELD_test', patterns);
      expect(result).toBeNull();
    });

    it('should use full string as name if no capture group', () => {
      const patternsNoCaptureGroup: FieldPattern[] = [{ regex: /^INPUT/, type: 'input' }];
      const result = matchFieldPattern('INPUT', patternsNoCaptureGroup);
      expect(result).toEqual({ type: 'input', name: 'INPUT' });
    });
  });

  describe('mixed patterns', () => {
    const patterns: FieldPattern[] = [
      { prefix: 'in:', type: 'input' },
      { regex: /^INPUT_(.+)$/, type: 'input' },
      { prefix: 'out:', type: 'output' },
      { regex: /^OUTPUT_(.+)$/, type: 'output' },
    ];

    it('should match first applicable pattern (prefix)', () => {
      const result = matchFieldPattern('in:email', patterns);
      expect(result).toEqual({ type: 'input', name: 'email' });
    });

    it('should match regex when prefix does not match', () => {
      const result = matchFieldPattern('INPUT_username', patterns);
      expect(result).toEqual({ type: 'input', name: 'username' });
    });

    it('should prioritize prefix over regex if both could match', () => {
      const overlappingPatterns: FieldPattern[] = [
        { prefix: 'INPUT', type: 'input' },
        { regex: /^INPUT_(.+)$/, type: 'input' },
      ];
      const result = matchFieldPattern('INPUT_test', overlappingPatterns);
      // Prefix is checked first, so it matches and extracts "_test"
      expect(result).toEqual({ type: 'input', name: '_test' });
    });
  });

  describe('ids array matching', () => {
    const patterns: FieldPattern[] = [
      { ids: ['element1', 'element2', 'element3'], type: 'input' },
      { ids: ['result', 'output'], type: 'output' },
    ];

    it('should match exact IDs from array', () => {
      const result = matchFieldPattern('element1', patterns);
      expect(result).toEqual({ type: 'input', name: 'element1' });
    });

    it('should use full ID as name without extraction', () => {
      const result = matchFieldPattern('result', patterns);
      expect(result).toEqual({ type: 'output', name: 'result' });
    });

    it('should match multiple IDs in same pattern', () => {
      const result1 = matchFieldPattern('element2', patterns);
      const result2 = matchFieldPattern('element3', patterns);
      expect(result1).toEqual({ type: 'input', name: 'element2' });
      expect(result2).toEqual({ type: 'input', name: 'element3' });
    });

    it('should return null for ID not in any array', () => {
      const result = matchFieldPattern('unknown', patterns);
      expect(result).toBeNull();
    });

    it('should handle empty ids array', () => {
      const emptyPattern: FieldPattern[] = [{ ids: [], type: 'input' }];
      const result = matchFieldPattern('test', emptyPattern);
      expect(result).toBeNull();
    });

    it('should prioritize ids over prefix/regex when mixed', () => {
      const mixedPatterns: FieldPattern[] = [
        { ids: ['temperature'], type: 'input' },
        { prefix: 'temp', type: 'input' },
      ];
      const result = matchFieldPattern('temperature', mixedPatterns);
      // ids pattern comes first, so it matches
      expect(result).toEqual({ type: 'input', name: 'temperature' });
    });

    it('should handle IDs with special characters', () => {
      const patternsWithSpecial: FieldPattern[] = [
        { ids: ['field-1', 'field_2', 'field.3'], type: 'input' },
      ];
      const result1 = matchFieldPattern('field-1', patternsWithSpecial);
      const result2 = matchFieldPattern('field_2', patternsWithSpecial);
      const result3 = matchFieldPattern('field.3', patternsWithSpecial);
      expect(result1).toEqual({ type: 'input', name: 'field-1' });
      expect(result2).toEqual({ type: 'input', name: 'field_2' });
      expect(result3).toEqual({ type: 'input', name: 'field.3' });
    });

    it('should not match partial IDs', () => {
      const result1 = matchFieldPattern('element', patterns);
      const result2 = matchFieldPattern('element12', patterns);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty patterns array', () => {
      const result = matchFieldPattern('test', []);
      expect(result).toBeNull();
    });

    it('should handle empty dataId string', () => {
      const patterns: FieldPattern[] = [{ prefix: 'in:', type: 'input' }];
      const result = matchFieldPattern('', patterns);
      expect(result).toBeNull();
    });

    it('should handle special characters in field names', () => {
      const patterns: FieldPattern[] = [{ prefix: 'field:', type: 'input' }];
      const result = matchFieldPattern('field:user-name_123', patterns);
      expect(result).toEqual({ type: 'input', name: 'user-name_123' });
    });
  });
});

describe('isValidFieldPattern', () => {
  it('should return true for valid prefix pattern', () => {
    expect(isValidFieldPattern({ prefix: 'input-', type: 'input' })).toBe(true);
  });

  it('should return true for valid regex pattern', () => {
    expect(isValidFieldPattern({ regex: /^OUT_/, type: 'output' })).toBe(true);
  });

  it('should return true for valid ids pattern', () => {
    expect(isValidFieldPattern({ ids: ['elem1', 'elem2'], type: 'input' })).toBe(true);
  });

  it('should return true for pattern with attribute', () => {
    expect(isValidFieldPattern({ prefix: 'input-', type: 'input', attribute: 'data-id' })).toBe(
      true
    );
  });

  it('should return false for null', () => {
    expect(isValidFieldPattern(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidFieldPattern(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isValidFieldPattern('string')).toBe(false);
    expect(isValidFieldPattern(123)).toBe(false);
  });

  it('should return false for invalid type', () => {
    expect(isValidFieldPattern({ prefix: 'input-', type: 'invalid' })).toBe(false);
  });

  it('should return false for missing type', () => {
    expect(isValidFieldPattern({ prefix: 'input-' })).toBe(false);
  });

  it('should return false for empty prefix', () => {
    expect(isValidFieldPattern({ prefix: '', type: 'input' })).toBe(false);
  });

  it('should return false for empty ids array', () => {
    expect(isValidFieldPattern({ ids: [], type: 'input' })).toBe(false);
  });

  it('should return false for ids with non-string elements', () => {
    expect(isValidFieldPattern({ ids: ['valid', 123], type: 'input' })).toBe(false);
  });

  it('should return false for multiple strategies (prefix + regex)', () => {
    expect(isValidFieldPattern({ prefix: 'input-', regex: /test/, type: 'input' })).toBe(false);
  });

  it('should return false for multiple strategies (prefix + ids)', () => {
    expect(isValidFieldPattern({ prefix: 'input-', ids: ['elem1'], type: 'input' })).toBe(false);
  });

  it('should return false for multiple strategies (regex + ids)', () => {
    expect(isValidFieldPattern({ regex: /test/, ids: ['elem1'], type: 'input' })).toBe(false);
  });

  it('should return false for no strategy', () => {
    expect(isValidFieldPattern({ type: 'input' })).toBe(false);
  });

  it('should return false for invalid attribute type', () => {
    expect(isValidFieldPattern({ prefix: 'input-', type: 'input', attribute: 123 })).toBe(false);
  });
});

describe('validateFieldPatterns', () => {
  it('should return empty array for valid patterns', () => {
    const patterns = [
      { prefix: 'input-', type: 'input' },
      { regex: /^OUT_/, type: 'output' },
    ];
    expect(validateFieldPatterns(patterns)).toEqual([]);
  });

  it('should error if patterns is not an array', () => {
    const errors = validateFieldPatterns('not an array');
    expect(errors).toContain('Patterns must be an array');
  });

  it('should error if patterns array is empty', () => {
    const errors = validateFieldPatterns([]);
    expect(errors).toContain('At least one field pattern must be defined');
  });

  it('should error if pattern is not an object', () => {
    const errors = validateFieldPatterns(['string']);
    expect(errors.some((e) => e.includes('must be an object'))).toBe(true);
  });

  it('should error if pattern has invalid type', () => {
    const errors = validateFieldPatterns([{ prefix: 'test-', type: 'invalid' }]);
    expect(errors.some((e) => e.includes("type must be 'input' or 'output'"))).toBe(true);
  });

  it('should error if pattern has no strategy', () => {
    const errors = validateFieldPatterns([{ type: 'input' }]);
    expect(errors.some((e) => e.includes('must have either prefix, regex, or ids'))).toBe(true);
  });

  it('should error if pattern has multiple strategies', () => {
    const errors = validateFieldPatterns([{ prefix: 'in-', regex: /test/, type: 'input' }]);
    expect(errors.some((e) => e.includes('can only use one matching strategy'))).toBe(true);
  });

  it('should error if ids array is empty', () => {
    const errors = validateFieldPatterns([{ ids: [], type: 'input' }]);
    expect(errors.some((e) => e.includes('must have either prefix, regex, or ids'))).toBe(true);
  });

  it('should error if ids contains non-strings', () => {
    const errors = validateFieldPatterns([{ ids: ['valid', 123], type: 'input' }]);
    expect(errors.some((e) => e.includes('all ids must be strings'))).toBe(true);
  });

  it('should include pattern index in error messages', () => {
    const errors = validateFieldPatterns([
      { prefix: 'valid-', type: 'input' },
      { type: 'invalid' },
    ]);
    expect(errors.some((e) => e.includes('Pattern 1'))).toBe(true);
  });

  it('should report multiple errors for multiple invalid patterns', () => {
    const errors = validateFieldPatterns([
      { type: 'invalid' },
      { prefix: 'valid-', type: 'input' },
      { regex: /test/, type: 'bad' },
    ]);
    expect(errors.length).toBeGreaterThan(1);
  });
});
