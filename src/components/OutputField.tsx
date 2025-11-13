import React from 'react';
import { OutputFieldProps } from '../types';

/**
 * Default output field component
 * Users can override this with custom renderOutput prop
 */
export const OutputField: React.FC<OutputFieldProps> = ({
  name: _name,
  value,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        border: '2px solid #10B981',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '12px',
        boxSizing: 'border-box',
        background: '#F0FDF4',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        ...style,
      }}
    >
      {value || '...'}
    </div>
  );
};
