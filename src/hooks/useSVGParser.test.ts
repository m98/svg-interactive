import { renderHook, waitFor } from '@testing-library/react';
import { useSVGParser } from './useSVGParser';
import { FieldConfig } from '../types';

// Mock fetch
global.fetch = jest.fn();

describe('useSVGParser', () => {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with svgContent', () => {
    it('should parse SVG content with direct-id mode', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:username" />
          <circle id="output:result" />
        </svg>
      `;

      const { result } = renderHook(() => useSVGParser({ svgContent, config }));

      // Wait for parsing to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings).toHaveLength(2);
      expect(result.current.mappings[0].name).toBe('username');
      expect(result.current.mappings[1].name).toBe('result');
      expect(result.current.svgText).toBe(svgContent);
      expect(result.current.errors).toEqual([]);
      expect(result.current.detectedMode).toBe('direct-id');
    });

    it('should parse draw.io SVG with data-id mode', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;object data-id=&quot;input:email&quot; id=&quot;el1&quot;/&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
        </svg>
      `;

      const { result } = renderHook(() => useSVGParser({ svgContent, config }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings).toHaveLength(1);
      expect(result.current.mappings[0].name).toBe('email');
      expect(result.current.detectedMode).toBe('data-id');
    });

    it('should handle parsing errors', async () => {
      const svgContent = '<div>Not valid SVG</div>';

      const { result } = renderHook(() => useSVGParser({ svgContent, config }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings).toHaveLength(0);
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  describe('with svgUrl', () => {
    it('should fetch and parse SVG from URL', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:field1" />
        </svg>
      `;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => svgContent,
      });

      const { result } = renderHook(() =>
        useSVGParser({ svgUrl: 'https://example.com/diagram.svg', config })
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/diagram.svg');
      expect(result.current.mappings).toHaveLength(1);
      expect(result.current.mappings[0].name).toBe('field1');
      expect(result.current.svgText).toBe(svgContent);
      expect(result.current.errors).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const { result } = renderHook(() =>
        useSVGParser({ svgUrl: 'https://example.com/missing.svg', config })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.errors).toContain('Failed to fetch SVG: Not Found');
      expect(result.current.mappings).toHaveLength(0);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useSVGParser({ svgUrl: 'https://example.com/diagram.svg', config })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.errors).toContain('Network error');
      expect(result.current.mappings).toHaveLength(0);
    });
  });

  describe('validation', () => {
    it('should error if neither svgUrl nor svgContent provided', async () => {
      const { result } = renderHook(() => useSVGParser({ config }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.errors).toContain('Either svgUrl or svgContent must be provided');
    });
  });

  describe('re-fetching on dependency changes', () => {
    it('should re-parse when svgContent changes', async () => {
      const svgContent1 = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:field1" />
        </svg>
      `;

      const svgContent2 = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:field2" />
        </svg>
      `;

      const { result, rerender } = renderHook(
        ({ content }) => useSVGParser({ svgContent: content, config }),
        { initialProps: { content: svgContent1 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings[0].name).toBe('field1');

      // Update content
      rerender({ content: svgContent2 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings[0].name).toBe('field2');
    });

    it('should re-fetch when svgUrl changes', async () => {
      const svg1 = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="input:a" /></svg>';
      const svg2 = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="input:b" /></svg>';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, text: async () => svg1 })
        .mockResolvedValueOnce({ ok: true, text: async () => svg2 });

      const { result, rerender } = renderHook(({ url }) => useSVGParser({ svgUrl: url, config }), {
        initialProps: { url: 'https://example.com/svg1.svg' },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings[0].name).toBe('a');

      // Change URL
      rerender({ url: 'https://example.com/svg2.svg' });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings[0].name).toBe('b');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should re-parse when config changes', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:field" />
          <rect id="IN_field2" />
        </svg>
      `;

      const config1: FieldConfig = {
        patterns: [{ prefix: 'input:', type: 'input' }],
      };

      const config2: FieldConfig = {
        patterns: [{ regex: /^IN_(.+)$/, type: 'input' }],
      };

      const { result, rerender } = renderHook(
        ({ cfg }) => useSVGParser({ svgContent, config: cfg }),
        { initialProps: { cfg: config1 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings).toHaveLength(1);
      expect(result.current.mappings[0].name).toBe('field');

      // Change config
      rerender({ cfg: config2 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.mappings).toHaveLength(1);
      expect(result.current.mappings[0].name).toBe('field2');
    });
  });

  describe('error handling', () => {
    it('should clear previous errors on re-parse', async () => {
      const invalidSvg = '<div>Invalid</div>';
      const validSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect id="input:test" /></svg>';

      const { result, rerender } = renderHook(
        ({ content }) => useSVGParser({ svgContent: content, config }),
        { initialProps: { content: invalidSvg } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.errors.length).toBeGreaterThan(0);

      // Update to valid SVG
      rerender({ content: validSvg });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.errors).toEqual([]);
    });

    it('should handle unknown errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useSVGParser({ svgUrl: 'https://example.com/test.svg', config })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.errors).toContain('Unknown error occurred');
    });
  });
});
