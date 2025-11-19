import React from 'react';
import { render, screen } from '@testing-library/react';
import { OutputField } from './OutputField';
import { OutputFieldProps } from '../types';

describe('OutputField', () => {
  const defaultProps: OutputFieldProps = {
    name: 'testField',
    value: '',
  };

  describe('rendering', () => {
    it('should render div element with correct value', () => {
      render(<OutputField {...defaultProps} value="test output" />);

      const output = screen.getByText('test output');
      expect(output).toBeInTheDocument();
    });

    it('should render with fallback "..." when value is empty string', () => {
      render(<OutputField {...defaultProps} value="" />);

      const output = screen.getByText('...');
      expect(output).toBeInTheDocument();
    });

    it('should render with fallback "..." when value is not provided', () => {
      render(<OutputField {...defaultProps} />);

      const output = screen.getByText('...');
      expect(output).toBeInTheDocument();
    });

    it('should render "0" value correctly (not show fallback)', () => {
      render(<OutputField {...defaultProps} value="0" />);

      const output = screen.getByText('0');
      expect(output).toBeInTheDocument();
    });

    it('should render "false" value correctly (not show fallback)', () => {
      render(<OutputField {...defaultProps} value="false" />);

      const output = screen.getByText('false');
      expect(output).toBeInTheDocument();
    });
  });

  describe('className handling', () => {
    it('should apply default empty className when not provided', () => {
      const { container } = render(<OutputField {...defaultProps} value="test" />);

      const output = container.querySelector('div');
      expect(output?.className).toBe('');
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <OutputField {...defaultProps} value="test" className="custom-output" />
      );

      const output = container.querySelector('div');
      expect(output).toHaveClass('custom-output');
    });

    it('should apply multiple classNames', () => {
      const { container } = render(
        <OutputField {...defaultProps} value="test" className="class1 class2 class3" />
      );

      const output = container.querySelector('div');
      expect(output).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('style handling', () => {
    it('should apply default styles', () => {
      const { container } = render(<OutputField {...defaultProps} value="test" />);

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        expect(output.style.width).toBe('100%');
        expect(output.style.height).toBe('100%');
        expect(output.style.border).toBe('2px solid rgb(16, 185, 129)');
        expect(output.style.borderRadius).toBe('4px');
        expect(output.style.fontSize).toBe('12px');
        expect(output.style.boxSizing).toBe('border-box');
        expect(output.style.background).toBe('rgb(240, 253, 244)');
        expect(output.style.color).toBe('rgb(0, 0, 0)');
        expect(output.style.display).toBe('flex');
        expect(output.style.alignItems).toBe('center');
        expect(output.style.overflow).toBe('hidden');
        expect(output.style.whiteSpace).toBe('nowrap');
        expect(output.style.textOverflow).toBe('ellipsis');
      }
    });

    it('should merge custom styles with default styles', () => {
      const { container } = render(
        <OutputField
          {...defaultProps}
          value="test"
          style={{ fontSize: '16px', fontWeight: 'bold' }}
        />
      );

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        // Custom style should override
        expect(output.style.fontSize).toBe('16px');
        expect(output.style.fontWeight).toBe('bold');

        // Default styles should still be present
        expect(output.style.width).toBe('100%');
        expect(output.style.border).toBe('2px solid rgb(16, 185, 129)');
      }
    });

    it('should allow custom styles to override default styles', () => {
      const { container } = render(
        <OutputField
          {...defaultProps}
          value="test"
          style={{ border: '1px solid red', background: 'yellow' }}
        />
      );

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        // Custom styles should override defaults
        expect(output.style.border).toBe('1px solid red');
        expect(output.style.background).toBe('yellow');
      }
    });

    it('should handle empty style object', () => {
      const { container } = render(<OutputField {...defaultProps} value="test" style={{}} />);

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        // Should still have default styles
        expect(output.style.width).toBe('100%');
        expect(output.style.border).toBe('2px solid rgb(16, 185, 129)');
      }
    });
  });

  describe('text overflow handling', () => {
    it('should have ellipsis for text overflow', () => {
      const { container } = render(<OutputField {...defaultProps} value="test" />);

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        expect(output.style.overflow).toBe('hidden');
        expect(output.style.whiteSpace).toBe('nowrap');
        expect(output.style.textOverflow).toBe('ellipsis');
      }
    });

    it('should render very long values (with ellipsis handling)', () => {
      const longValue = 'a'.repeat(1000);
      const { container } = render(<OutputField {...defaultProps} value={longValue} />);

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        expect(output.textContent).toBe(longValue);
        expect(output.style.textOverflow).toBe('ellipsis');
      }
    });
  });

  describe('value handling', () => {
    it('should handle numeric string values', () => {
      render(<OutputField {...defaultProps} value="12345" />);

      const output = screen.getByText('12345');
      expect(output).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<OutputField {...defaultProps} value="123.45" />);

      const output = screen.getByText('123.45');
      expect(output).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      render(<OutputField {...defaultProps} value="-42" />);

      const output = screen.getByText('-42');
      expect(output).toBeInTheDocument();
    });

    it('should handle special characters in value', () => {
      render(<OutputField {...defaultProps} value="!@#$%^&*()" />);

      const output = screen.getByText('!@#$%^&*()');
      expect(output).toBeInTheDocument();
    });

    it('should handle multiline text (displayed on one line due to nowrap)', () => {
      const multilineValue = 'Line 1\nLine 2\nLine 3';
      const { container } = render(<OutputField {...defaultProps} value={multilineValue} />);

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        expect(output.textContent).toBe(multilineValue);
        expect(output.style.whiteSpace).toBe('nowrap');
      }
    });

    it('should handle value updates from props', () => {
      const { rerender } = render(<OutputField {...defaultProps} value="initial" />);

      expect(screen.getByText('initial')).toBeInTheDocument();

      rerender(<OutputField {...defaultProps} value="updated" />);

      expect(screen.getByText('updated')).toBeInTheDocument();
      expect(screen.queryByText('initial')).not.toBeInTheDocument();
    });

    it('should handle empty to non-empty value transition', () => {
      const { rerender } = render(<OutputField {...defaultProps} value="" />);

      expect(screen.getByText('...')).toBeInTheDocument();

      rerender(<OutputField {...defaultProps} value="new value" />);

      expect(screen.getByText('new value')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('should handle non-empty to empty value transition', () => {
      const { rerender } = render(<OutputField {...defaultProps} value="initial value" />);

      expect(screen.getByText('initial value')).toBeInTheDocument();

      rerender(<OutputField {...defaultProps} value="" />);

      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.queryByText('initial value')).not.toBeInTheDocument();
    });
  });

  describe('name prop handling', () => {
    it('should accept name prop (even though not used in rendering)', () => {
      // Name is accepted but prefixed with _ in destructuring (unused)
      render(<OutputField {...defaultProps} name="testName" value="test" />);

      const output = screen.getByText('test');
      expect(output).toBeInTheDocument();
    });

    it('should handle name with special characters', () => {
      render(<OutputField {...defaultProps} name="field-name_123" value="test" />);

      const output = screen.getByText('test');
      expect(output).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only values', () => {
      const { container } = render(<OutputField {...defaultProps} value="   " />);

      const output = container.querySelector('div');
      expect(output?.textContent).toBe('   ');
    });

    it('should handle HTML entities in value', () => {
      const { container } = render(<OutputField {...defaultProps} value="&lt;div&gt;" />);

      const output = container.querySelector('div');
      // HTML entities in textContent are rendered as decoded by the browser
      expect(output?.textContent).toBe('<div>');
    });

    it('should handle undefined value gracefully (show fallback)', () => {
      // @ts-expect-error Testing edge case
      render(<OutputField {...defaultProps} value={undefined} />);

      const output = screen.getByText('...');
      expect(output).toBeInTheDocument();
    });

    it('should handle null value gracefully (show fallback)', () => {
      // @ts-expect-error Testing edge case
      render(<OutputField {...defaultProps} value={null} />);

      const output = screen.getByText('...');
      expect(output).toBeInTheDocument();
    });
  });

  describe('props combination', () => {
    it('should handle all props together', () => {
      render(
        <OutputField
          name="fullTest"
          value="test output"
          className="my-custom-class"
          style={{ fontSize: '20px', color: 'blue' }}
        />
      );

      const output = screen.getByText('test output');
      expect(output).toBeInTheDocument();
      expect(output).toHaveClass('my-custom-class');
      expect(output.style.fontSize).toBe('20px');
      expect(output.style.color).toBe('blue');
    });

    it('should handle all props with fallback value', () => {
      render(
        <OutputField
          name="fullTest"
          value=""
          className="my-custom-class"
          style={{ fontSize: '20px', color: 'blue' }}
        />
      );

      const output = screen.getByText('...');
      expect(output).toBeInTheDocument();
      expect(output).toHaveClass('my-custom-class');
      expect(output.style.fontSize).toBe('20px');
      expect(output.style.color).toBe('blue');
    });
  });

  describe('layout and positioning', () => {
    it('should have flex display with center alignment', () => {
      const { container } = render(<OutputField {...defaultProps} value="test" />);

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        expect(output.style.display).toBe('flex');
        expect(output.style.alignItems).toBe('center');
      }
    });

    it('should have 100% width and height', () => {
      const { container } = render(<OutputField {...defaultProps} value="test" />);

      const output = container.querySelector('div');
      expect(output).not.toBeNull();

      if (output) {
        expect(output.style.width).toBe('100%');
        expect(output.style.height).toBe('100%');
      }
    });
  });
});
