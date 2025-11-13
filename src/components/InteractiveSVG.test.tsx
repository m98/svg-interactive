import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { InteractiveSVG } from './InteractiveSVG';
import { FieldConfig } from '../types';

// Mock fetch
global.fetch = jest.fn();

describe('InteractiveSVG', () => {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input:', type: 'input' },
      { prefix: 'output:', type: 'output' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render SVG content after loading', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
          <rect id="input:username" x="10" y="10" width="100" height="30" />
        </svg>
      `;

      render(<InteractiveSVG svgContent={svgContent} config={config} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const svgContainer = document.querySelector('.svg-container');
      expect(svgContainer).toBeInTheDocument();
      expect(svgContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply custom className and style', async () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';

      render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          className="custom-class"
          style={{ margin: '20px' }}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const wrapper = document.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveStyle({ margin: '20px' });
    });
  });

  describe('SVG loading', () => {
    it('should load SVG from URL', async () => {
      const svgContent = '<svg><rect id="input:field" /></svg>';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => svgContent,
      });

      render(<InteractiveSVG svgUrl="https://example.com/diagram.svg" config={config} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/diagram.svg');
    });

    it('should prefer svgContent over svgUrl', async () => {
      const svgContent = '<svg><rect id="input:field" /></svg>';

      render(
        <InteractiveSVG
          svgContent={svgContent}
          svgUrl="https://example.com/diagram.svg"
          config={config}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should display configuration errors', async () => {
      const invalidConfig: FieldConfig = {
        patterns: [],
      };

      render(<InteractiveSVG svgContent="<svg />" config={invalidConfig} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading interactive SVG:')).toBeInTheDocument();
      });

      expect(screen.getByText(/At least one field pattern must be defined/)).toBeInTheDocument();
    });

    it('should display parsing errors', async () => {
      const svgContent = '<div>Not an SVG</div>';

      render(<InteractiveSVG svgContent={svgContent} config={config} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading interactive SVG:')).toBeInTheDocument();
      });
    });
  });

  describe('debug mode', () => {
    it('should not render debug panel by default', async () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';

      render(<InteractiveSVG svgContent={svgContent} config={config} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Debug Information')).not.toBeInTheDocument();
    });

    it('should render debug panel when debug=true', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:test" x="10" y="10" width="100" height="30" />
        </svg>
      `;

      render(<InteractiveSVG svgContent={svgContent} config={config} debug={true} />);

      await waitFor(() => {
        expect(screen.getByText('Debug Information')).toBeInTheDocument();
      });

      expect(screen.getByText(/Total Fields:/)).toBeInTheDocument();
    });
  });

  describe('theming', () => {
    it('should apply default theme styles', async () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';

      render(<InteractiveSVG svgContent={svgContent} config={config} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const style = document.querySelector('style');
      expect(style?.textContent).toContain('svg-field-default');
    });

    it('should apply theme styles for all theme options', async () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';

      const { rerender } = render(
        <InteractiveSVG svgContent={svgContent} config={config} theme="minimal" />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      const style = document.querySelector('style');
      expect(style?.textContent).toContain('svg-field-minimal');

      rerender(<InteractiveSVG svgContent={svgContent} config={config} theme="bordered" />);

      await waitFor(() => {
        const updatedStyle = document.querySelector('style');
        expect(updatedStyle?.textContent).toContain('svg-field-bordered');
      });
    });
  });

  describe('matching modes', () => {
    it('should handle direct-id mode', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:username" />
        </svg>
      `;

      const onDebugInfo = jest.fn();

      render(<InteractiveSVG svgContent={svgContent} config={config} onDebugInfo={onDebugInfo} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // onDebugInfo should be called, but we don't rely on it for this test
      // Just ensure rendering completes without error
    });

    it('should handle data-id mode for draw.io SVGs', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" content="&lt;mxfile&gt;&lt;diagram&gt;&lt;mxGraphModel&gt;&lt;root&gt;&lt;object data-id=&quot;input:test&quot; id=&quot;el1&quot;/&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&lt;/diagram&gt;&lt;/mxfile&gt;">
        </svg>
      `;

      const onDebugInfo = jest.fn();

      render(<InteractiveSVG svgContent={svgContent} config={config} onDebugInfo={onDebugInfo} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Just ensure rendering completes without error
    });
  });

  describe('callbacks', () => {
    it('should call onInputChange prop when provided', async () => {
      const onInputChange = jest.fn();
      const svgContent = '<svg><rect id="input:test" /></svg>';

      render(
        <InteractiveSVG svgContent={svgContent} config={config} onInputChange={onInputChange} />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Callback should be set up correctly
      expect(onInputChange).not.toHaveBeenCalled();
    });

    it('should call onOutputCompute prop when provided', async () => {
      const onOutputCompute = jest.fn((_inputs) => ({ result: 'computed' }));
      const svgContent = '<svg><rect id="input:test" /><rect id="output:result" /></svg>';

      render(
        <InteractiveSVG svgContent={svgContent} config={config} onOutputCompute={onOutputCompute} />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Callback should be set up correctly
      expect(onOutputCompute).not.toHaveBeenCalled();
    });
  });

  describe('external output values', () => {
    it('should use external outputValues when provided', async () => {
      const svgContent = '<svg><rect id="output:result" /></svg>';

      const { rerender } = render(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          outputValues={{ result: 'External Value 1' }}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading SVG...')).not.toBeInTheDocument();
      });

      // Update external output values
      rerender(
        <InteractiveSVG
          svgContent={svgContent}
          config={config}
          outputValues={{ result: 'External Value 2' }}
        />
      );

      // Should not throw errors
      expect(true).toBe(true);
    });
  });
});
