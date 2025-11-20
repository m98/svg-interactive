import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { SvgInteractive } from '../../src/components/SvgInteractive';
import { parseSVG } from '../../src/parsers/generic';
import { FieldPattern } from '../../src/types';

describe('Class Attribute Integration Tests', () => {
  beforeEach(() => {
    // Mock getBBox for consistent testing - need to mock on SVGElement for JSDOM
    // JSDOM doesn't properly inherit from SVGGraphicsElement
    const mockGetBBox = jest.fn().mockReturnValue({
      x: 10,
      y: 10,
      width: 120,
      height: 30,
    });

    SVGElement.prototype.getBBox = mockGetBBox;
    if (typeof SVGGraphicsElement !== 'undefined') {
      SVGGraphicsElement.prototype.getBBox = mockGetBBox;
    }
  });

  describe('Custom Attribute Matching', () => {
    it('should render fields matched by class attribute', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
          <rect class="field-input-name" x="10" y="10" width="120" height="30" fill="#e3f2fd" stroke="#1976d2"/>
          <rect class="field-output-greeting" x="160" y="10" width="120" height="30" fill="#e8f5e9" stroke="#388e3c"/>
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'class', prefix: 'field-input-', type: 'input' },
        { attribute: 'class', prefix: 'field-output-', type: 'output' },
      ];

      const { mappings } = parseSVG(svgContent, { patterns });

      expect(mappings).toHaveLength(2);
      expect(mappings[0]?.matchedAttribute).toBe('class');
      expect(mappings[1]?.matchedAttribute).toBe('class');

      render(<SvgInteractive mappings={mappings} svgContent={svgContent} />);

      await waitFor(
        () => {
          const input = document.querySelector('input[data-field-name="name"]');
          expect(input).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const output = document.getElementById('output-field-greeting');
      expect(output).toBeInTheDocument();
    });

    it('should handle input changes with class-matched fields', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
          <rect class="field-input-name" x="10" y="10" width="120" height="30" fill="#e3f2fd"/>
          <rect class="field-output-greeting" x="160" y="10" width="120" height="30" fill="#e8f5e9"/>
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'class', prefix: 'field-input-', type: 'input' },
        { attribute: 'class', prefix: 'field-output-', type: 'output' },
      ];

      const { mappings } = parseSVG(svgContent, { patterns });

      const onOutputCompute = jest.fn((inputs) => ({
        greeting: inputs.name ? `Hello, ${inputs.name}!` : '',
      }));

      render(
        <SvgInteractive
          mappings={mappings}
          svgContent={svgContent}
          onOutputCompute={onOutputCompute}
        />
      );

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="name"]') as HTMLInputElement;
        expect(input).toBeInTheDocument();
      });

      const input = document.querySelector('input[data-field-name="name"]') as HTMLInputElement;
      const output = document.getElementById('output-field-greeting');

      fireEvent.input(input, { target: { value: 'World' } });

      await waitFor(() => {
        expect(onOutputCompute).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(output?.textContent).toBe('Hello, World!');
      });
    });

    it('should work with data-* attributes', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
          <rect data-field="input-temperature" x="10" y="10" width="120" height="30"/>
          <rect data-field="output-result" x="160" y="10" width="120" height="30"/>
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'data-field', prefix: 'input-', type: 'input' },
        { attribute: 'data-field', prefix: 'output-', type: 'output' },
      ];

      const { mappings } = parseSVG(svgContent, { patterns });

      expect(mappings).toHaveLength(2);
      expect(mappings[0]?.matchedAttribute).toBe('data-field');
      expect(mappings[0]?.name).toBe('temperature');

      render(<SvgInteractive mappings={mappings} svgContent={svgContent} />);

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="temperature"]');
        expect(input).toBeInTheDocument();
      });
    });

    it('should prioritize id when element has both id and class', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
          <rect id="my-input" class="field-input-name" x="10" y="10" width="120" height="30"/>
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'class', prefix: 'field-input-', type: 'input' },
      ];

      const { mappings } = parseSVG(svgContent, { patterns });

      expect(mappings).toHaveLength(1);
      expect(mappings[0]?.elementId).toBe('my-input'); // Should use id
      expect(mappings[0]?.matchedAttribute).toBe('class');

      render(<SvgInteractive mappings={mappings} svgContent={svgContent} />);

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="name"]');
        expect(input).toBeInTheDocument();
      });
    });

    it('should handle regex patterns with class attribute', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">
          <rect class="custom-input-value" x="10" y="10" width="120" height="30"/>
          <rect class="custom-output-result" x="160" y="10" width="120" height="30"/>
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { attribute: 'class', regex: /^custom-input-(.+)$/, type: 'input' },
        { attribute: 'class', regex: /^custom-output-(.+)$/, type: 'output' },
      ];

      const { mappings } = parseSVG(svgContent, { patterns });

      expect(mappings).toHaveLength(2);
      expect(mappings[0]?.name).toBe('value');
      expect(mappings[1]?.name).toBe('result');

      render(<SvgInteractive mappings={mappings} svgContent={svgContent} />);

      await waitFor(() => {
        const input = document.querySelector('input[data-field-name="value"]');
        expect(input).toBeInTheDocument();
      });
    });

    it('should render fields matched by ids array', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="150">
          <rect id="username-field" x="10" y="10" width="120" height="30" fill="#e3f2fd"/>
          <rect id="email-field" x="10" y="50" width="120" height="30" fill="#e3f2fd"/>
          <rect id="greeting-output" x="160" y="30" width="120" height="30" fill="#e8f5e9"/>
          <rect id="other-element" x="10" y="90" width="120" height="30" fill="#ccc"/>
        </svg>
      `;

      const patterns: FieldPattern[] = [
        { ids: ['username-field', 'email-field'], type: 'input' },
        { ids: ['greeting-output'], type: 'output' },
      ];

      const { mappings } = parseSVG(svgContent, { patterns });

      expect(mappings).toHaveLength(3);
      expect(mappings[0]?.name).toBe('username-field');
      expect(mappings[1]?.name).toBe('email-field');
      expect(mappings[2]?.name).toBe('greeting-output');

      render(<SvgInteractive mappings={mappings} svgContent={svgContent} />);

      await waitFor(() => {
        const usernameInput = document.querySelector('input[data-field-name="username-field"]');
        const emailInput = document.querySelector('input[data-field-name="email-field"]');
        const greetingOutput = document.getElementById('output-field-greeting-output');
        expect(usernameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(greetingOutput).toBeInTheDocument();
      });

      // Verify other-element is not rendered as a field
      const otherElement = document.querySelector('input[data-field-name="other-element"]');
      expect(otherElement).not.toBeInTheDocument();
    });
  });
});
