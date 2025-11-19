import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from './InputField';
import { InputFieldProps } from '../types';

describe('InputField', () => {
  const defaultProps: InputFieldProps = {
    name: 'testField',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render input element with correct value', () => {
      render(<InputField {...defaultProps} value="test value" />);

      const input = screen.getByDisplayValue('test value');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render with empty value when not provided', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByPlaceholderText('testField');
      expect(input).toHaveValue('');
    });

    it('should use name as placeholder when placeholder prop is not provided', () => {
      render(<InputField {...defaultProps} name="username" />);

      const input = screen.getByPlaceholderText('username');
      expect(input).toBeInTheDocument();
    });

    it('should use provided placeholder when given', () => {
      render(<InputField {...defaultProps} placeholder="Enter your name" />);

      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });

    it('should render with empty placeholder when placeholder is empty string', () => {
      render(<InputField {...defaultProps} placeholder="" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', '');
    });
  });

  describe('className handling', () => {
    it('should apply default empty className when not provided', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input.className).toBe('');
    });

    it('should apply custom className when provided', () => {
      render(<InputField {...defaultProps} className="custom-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should apply multiple classNames', () => {
      render(<InputField {...defaultProps} className="class1 class2 class3" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('style handling', () => {
    it('should apply default styles', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByRole('textbox');

      // Check some default styles
      expect(input.style.width).toBe('100%');
      expect(input.style.height).toBe('100%');
      expect(input.style.border).toBe('2px solid rgb(59, 130, 246)');
      expect(input.style.borderRadius).toBe('4px');
      expect(input.style.fontSize).toBe('12px');
      expect(input.style.boxSizing).toBe('border-box');
      expect(input.style.background).toBe('white');
      expect(input.style.color).toBe('rgb(0, 0, 0)');
    });

    it('should merge custom styles with default styles', () => {
      render(<InputField {...defaultProps} style={{ fontSize: '16px', fontWeight: 'bold' }} />);

      const input = screen.getByRole('textbox');

      // Custom style should override
      expect(input.style.fontSize).toBe('16px');
      expect(input.style.fontWeight).toBe('bold');

      // Default styles should still be present
      expect(input.style.width).toBe('100%');
      expect(input.style.border).toBe('2px solid rgb(59, 130, 246)');
    });

    it('should allow custom styles to override default styles', () => {
      render(
        <InputField {...defaultProps} style={{ border: '1px solid red', background: 'yellow' }} />
      );

      const input = screen.getByRole('textbox');

      // Custom styles should override defaults
      expect(input.style.border).toBe('1px solid red');
      expect(input.style.background).toBe('yellow');
    });

    it('should handle empty style object', () => {
      render(<InputField {...defaultProps} style={{}} />);

      const input = screen.getByRole('textbox');

      // Should still have default styles
      expect(input.style.width).toBe('100%');
      expect(input.style.border).toBe('2px solid rgb(59, 130, 246)');
    });
  });

  describe('onChange behavior', () => {
    it('should call onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('should call onChange with empty string when input is cleared', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} value="initial" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should call onChange multiple times for multiple changes', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, 'a');
      expect(onChange).toHaveBeenNthCalledWith(2, 'ab');
      expect(onChange).toHaveBeenNthCalledWith(3, 'abc');
    });

    it('should handle onChange with special characters', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '!@#$%^&*()' } });

      expect(onChange).toHaveBeenCalledWith('!@#$%^&*()');
    });
  });

  describe('edge cases', () => {
    it('should handle name with special characters', () => {
      render(<InputField {...defaultProps} name="field-name_123" />);

      const input = screen.getByPlaceholderText('field-name_123');
      expect(input).toBeInTheDocument();
    });

    it('should handle very long values', () => {
      const longValue = 'a'.repeat(1000);
      render(<InputField {...defaultProps} value={longValue} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(longValue);
    });

    it('should handle numeric string values', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '12345' } });

      expect(onChange).toHaveBeenCalledWith('12345');
    });

    it('should handle value updates from props', () => {
      const { rerender } = render(<InputField {...defaultProps} value="initial" />);

      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

      rerender(<InputField {...defaultProps} value="updated" />);

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('should handle undefined value gracefully', () => {
      // @ts-expect-error Testing edge case
      render(<InputField {...defaultProps} value={undefined} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });
  });

  describe('accessibility', () => {
    it('should be accessible via role', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should have correct input type', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('props combination', () => {
    it('should handle all props together', () => {
      const onChange = jest.fn();
      render(
        <InputField
          name="fullTest"
          value="test value"
          onChange={onChange}
          placeholder="Enter text"
          className="my-custom-class"
          style={{ fontSize: '20px', color: 'blue' }}
        />
      );

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('test value');
      expect(input).toHaveClass('my-custom-class');
      expect(input.style.fontSize).toBe('20px');
      expect(input.style.color).toBe('blue');

      fireEvent.change(input, { target: { value: 'new value' } });
      expect(onChange).toHaveBeenCalledWith('new value');
    });
  });
});
