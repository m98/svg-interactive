import React from 'react';
import { InputFieldProps } from '../types';

/**
 * Default input field component
 * Users can override this with custom renderInput prop
 */
export const InputField: React.FC<InputFieldProps> = ({
  name,
  value,
  onChange,
  placeholder,
  className = '',
  style = {},
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? name}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        border: '2px solid #3B82F6',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '12px',
        boxSizing: 'border-box',
        background: 'white',
        color: '#000000',
        ...style,
      }}
    />
  );
};
