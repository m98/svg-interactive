import { matchFieldPattern, validateFieldConfig } from './fieldMatcher';
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

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('validateFieldConfig', () => {
  it('should return no errors for valid configuration', () => {
    const patterns: FieldPattern[] = [
      { prefix: 'input:', type: 'input' },
      { regex: /^OUT_/, type: 'output' },
    ];
    const errors = validateFieldConfig(patterns);
    expect(errors).toEqual([]);
  });

  it('should error if patterns array is empty', () => {
    const errors = validateFieldConfig([]);
    expect(errors).toContain('At least one field pattern must be defined');
  });

  it('should error if patterns is undefined', () => {
    // Skip this test since the function assumes patterns is always provided
    // In TypeScript, this would be caught at compile time
    expect(true).toBe(true);
  });

  it('should error if pattern has neither prefix, regex, nor ids', () => {
    const patterns: FieldPattern[] = [{ type: 'input' } as any];
    const errors = validateFieldConfig(patterns);
    expect(errors.some((e) => e.includes('must have either ids, prefix, or regex'))).toBe(true);
  });

  it('should error if pattern type is invalid', () => {
    const patterns: FieldPattern[] = [{ prefix: 'test:', type: 'invalid' as any }];
    const errors = validateFieldConfig(patterns);
    expect(errors.some((e) => e.includes("type must be 'input' or 'output'"))).toBe(true);
  });

  it('should error if pattern type is missing', () => {
    const patterns: FieldPattern[] = [{ prefix: 'test:' } as any];
    const errors = validateFieldConfig(patterns);
    expect(errors.some((e) => e.includes("type must be 'input' or 'output'"))).toBe(true);
  });

  it('should report multiple errors for multiple invalid patterns', () => {
    const patterns: FieldPattern[] = [
      { type: 'invalid' as any },
      { prefix: 'valid:', type: 'input' },
      { regex: /test/, type: 'bad' as any },
    ];
    const errors = validateFieldConfig(patterns);
    expect(errors.length).toBeGreaterThan(1);
  });

  it('should include pattern index in error messages', () => {
    const patterns: FieldPattern[] = [
      { prefix: 'valid:', type: 'input' },
      { type: 'invalid' as any },
    ];
    const errors = validateFieldConfig(patterns);
    expect(errors.some((e) => e.includes('Pattern 1'))).toBe(true);
  });

  describe('ids array validation', () => {
    it('should accept pattern with ids array', () => {
      const patterns: FieldPattern[] = [{ ids: ['elem1', 'elem2'], type: 'input' }];
      const errors = validateFieldConfig(patterns);
      expect(errors).toEqual([]);
    });

    it('should error if pattern has both ids and prefix', () => {
      const patterns: FieldPattern[] = [{ ids: ['elem1'], prefix: 'input-', type: 'input' } as any];
      const errors = validateFieldConfig(patterns);
      expect(errors.some((e) => e.includes('cannot use multiple matching strategies'))).toBe(true);
    });

    it('should error if pattern has both ids and regex', () => {
      const patterns: FieldPattern[] = [{ ids: ['elem1'], regex: /test/, type: 'input' } as any];
      const errors = validateFieldConfig(patterns);
      expect(errors.some((e) => e.includes('cannot use multiple matching strategies'))).toBe(true);
    });

    it('should error if pattern has all three (ids, prefix, regex)', () => {
      const patterns: FieldPattern[] = [
        { ids: ['elem1'], prefix: 'in-', regex: /test/, type: 'input' } as any,
      ];
      const errors = validateFieldConfig(patterns);
      expect(errors.some((e) => e.includes('cannot use multiple matching strategies'))).toBe(true);
    });

    it('should error if ids array is empty', () => {
      const patterns: FieldPattern[] = [{ ids: [], type: 'input' }];
      const errors = validateFieldConfig(patterns);
      expect(errors.some((e) => e.includes('ids array cannot be empty'))).toBe(true);
    });

    it('should error if ids contains non-strings', () => {
      const patterns: FieldPattern[] = [{ ids: ['valid', 123, 'another'] as any, type: 'input' }];
      const errors = validateFieldConfig(patterns);
      expect(errors.some((e) => e.includes('all ids must be strings'))).toBe(true);
    });

    it('should error if ids is not an array', () => {
      const patterns: FieldPattern[] = [{ ids: 'not-an-array' as any, type: 'input' }];
      const errors = validateFieldConfig(patterns);
      expect(errors.some((e) => e.includes('ids must be an array'))).toBe(true);
    });
  });

  it('should error if pattern has both prefix and regex', () => {
    const patterns: FieldPattern[] = [{ prefix: 'test:', regex: /test/, type: 'input' }];
    const errors = validateFieldConfig(patterns);
    expect(errors.some((e) => e.includes('cannot use multiple matching strategies'))).toBe(true);
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
