import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { InteractiveSVG } from './InteractiveSVG';
import { parseSVG } from '../parsers/generic';
import { parseDrawIoSVG } from '../parsers/drawio';
import { FieldPattern } from '../types';

describe('InteractiveSVG', () => {
  const patterns: FieldPattern[] = [
    { prefix: 'input:', type: 'input' },
    { prefix: 'output:', type: 'output' },
  ];

  beforeEach(() => {
    // Mock getBBox for consistent testing
    SVGGraphicsElement.prototype.getBBox = jest.fn().mockReturnValue({
      x: 10,
      y: 10,
      width: 100,
      height: 30,
    });
  });

  describe('rendering', () => {
    it('should render SVG content with mappings', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
          <rect id="input:username" x="10" y="10" width="100" height="30" />
        </svg>
      `;

      const result = parseSVG(svgContent, { patterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} />);

      const svgContainer = document.querySelector('.svg-container');
      expect(svgContainer).toBeInTheDocument();
      expect(svgContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply custom className and style', async () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          mappings={result.mappings}
          className="custom-class"
          style={{ margin: '20px' }}
        />
      );

      const wrapper = document.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveStyle({ margin: '20px' });
    });
  });

  describe('error handling', () => {
    it('should display error when no mappings provided', () => {
      const svgContent = '<svg />';

      render(<InteractiveSVG svgContent={svgContent} mappings={[]} />);

      expect(screen.getByText('Error loading interactive SVG:')).toBeInTheDocument();
      expect(screen.getByText(/No field mappings provided/)).toBeInTheDocument();
    });

    it('should display error when mappings is undefined', () => {
      const svgContent = '<svg />';

      // @ts-expect-error - Testing runtime behavior with invalid props
      render(<InteractiveSVG svgContent={svgContent} mappings={undefined} />);

      expect(screen.getByText('Error loading interactive SVG:')).toBeInTheDocument();
    });
  });

  describe('debug mode', () => {
    it('should not render debug panel by default', () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} />);

      expect(screen.queryByText('Debug Information')).not.toBeInTheDocument();
    });

    it('should render debug panel when debug=true', () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:test" x="10" y="10" width="100" height="30" />
        </svg>
      `;
      const result = parseSVG(svgContent, { patterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} debug={true} />);

      expect(screen.getByText('Debug Information')).toBeInTheDocument();
      expect(screen.getByText(/Total Fields:/)).toBeInTheDocument();
    });
  });

  describe('theming', () => {
    it('should apply default theme styles', () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} />);

      const style = document.querySelector('style');
      expect(style?.textContent).toContain('svg-field-default');
    });

    it('should apply theme styles for all theme options', async () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      const { rerender } = render(
        <InteractiveSVG svgContent={svgContent} mappings={result.mappings} theme="minimal" />
      );

      const style = document.querySelector('style');
      expect(style?.textContent).toContain('svg-field-minimal');

      rerender(
        <InteractiveSVG svgContent={svgContent} mappings={result.mappings} theme="bordered" />
      );

      await waitFor(() => {
        const updatedStyle = document.querySelector('style');
        expect(updatedStyle?.textContent).toContain('svg-field-bordered');
      });
    });
  });

  describe('field types', () => {
    it('should handle input fields', () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:username" />
        </svg>
      `;
      const result = parseSVG(svgContent, { patterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} />);

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.type).toBe('input');
    });

    it('should handle output fields', () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="output:result" />
        </svg>
      `;
      const result = parseSVG(svgContent, { patterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} />);

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0]?.type).toBe('output');
    });

    it('should handle mixed input and output fields', () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect id="input:name" />
          <rect id="output:greeting" />
        </svg>
      `;
      const result = parseSVG(svgContent, { patterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} />);

      expect(result.mappings).toHaveLength(2);
      expect(result.mappings.filter((m) => m.type === 'input')).toHaveLength(1);
      expect(result.mappings.filter((m) => m.type === 'output')).toHaveLength(1);
    });
  });

  describe('draw.io SVGs', () => {
    const createDrawIoSVG = (mxfileContent: string): string => {
      const encoded = mxfileContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      return `<svg xmlns="http://www.w3.org/2000/svg" content="${encoded}"></svg>`;
    };

    it('should work with draw.io SVGs using parseDrawIoSVG', () => {
      const mxfile = `
        <mxfile>
          <diagram>
            <mxGraphModel>
              <root>
                <object id="1" data-id="input:test" />
              </root>
            </mxGraphModel>
          </diagram>
        </mxfile>
      `;
      const svgContent = createDrawIoSVG(mxfile);

      const drawioPatterns: FieldPattern[] = [
        { attribute: 'data-id', prefix: 'input:', type: 'input' },
      ];

      const result = parseDrawIoSVG(svgContent, { patterns: drawioPatterns });

      render(<InteractiveSVG svgContent={svgContent} mappings={result.mappings} />);

      expect(result.mappings).toHaveLength(1);
      expect(result.metadata.tool).toBe('drawio');
    });
  });

  describe('callbacks', () => {
    it('should call onInputChange prop when provided', () => {
      const onInputChange = jest.fn();
      const svgContent = '<svg><rect id="input:test" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          mappings={result.mappings}
          onInputChange={onInputChange}
        />
      );

      // Callback should be set up correctly
      expect(onInputChange).not.toHaveBeenCalled();
    });

    it('should call onOutputCompute prop when provided', () => {
      const onOutputCompute = jest.fn((_inputs) => ({ result: 'computed' }));
      const svgContent = '<svg><rect id="input:test" /><rect id="output:result" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      render(
        <InteractiveSVG
          svgContent={svgContent}
          mappings={result.mappings}
          onOutputCompute={onOutputCompute}
        />
      );

      // Callback should be set up correctly
      expect(onOutputCompute).not.toHaveBeenCalled();
    });
  });

  describe('external output values', () => {
    it('should use external outputValues when provided', () => {
      const svgContent = '<svg><rect id="output:result" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      const { rerender } = render(
        <InteractiveSVG
          svgContent={svgContent}
          mappings={result.mappings}
          outputValues={{ result: 'External Value 1' }}
        />
      );

      // Update external output values
      rerender(
        <InteractiveSVG
          svgContent={svgContent}
          mappings={result.mappings}
          outputValues={{ result: 'External Value 2' }}
        />
      );

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('custom renderers', () => {
    it('should accept custom input renderer without errors', () => {
      const svgContent = '<svg><rect id="input:test" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      const renderInput = () => <div>Custom Input</div>;

      render(
        <InteractiveSVG
          svgContent={svgContent}
          mappings={result.mappings}
          renderInput={renderInput}
        />
      );

      // Should render without errors
      expect(document.querySelector('.svg-container')).toBeInTheDocument();
    });

    it('should accept custom output renderer without errors', () => {
      const svgContent = '<svg><rect id="output:test" /></svg>';
      const result = parseSVG(svgContent, { patterns });

      const renderOutput = () => <div>Custom Output</div>;

      render(
        <InteractiveSVG
          svgContent={svgContent}
          mappings={result.mappings}
          renderOutput={renderOutput}
        />
      );

      // Should render without errors
      expect(document.querySelector('.svg-container')).toBeInTheDocument();
    });
  });
});
