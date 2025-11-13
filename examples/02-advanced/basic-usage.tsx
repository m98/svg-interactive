import React from 'react';
import { InteractiveSVG, FieldConfig } from 'svg-interactive-diagram';
import 'svg-interactive-diagram/styles';

/**
 * Basic usage example
 */
export function BasicExample() {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input-field-', type: 'input' },
      { prefix: 'output-field-', type: 'output' }
    ]
  };

  const handleOutputCompute = (inputs: Record<string, string>) => {
    // Concatenate all input values
    const gasValue = inputs.gas || '';
    return {
      gas: gasValue ? `Processed: ${gasValue}` : ''
    };
  };

  return (
    <InteractiveSVG
      svgUrl="/diagram.svg"
      config={config}
      onOutputCompute={handleOutputCompute}
      theme="default"
      debug={true}
    />
  );
}

/**
 * Advanced usage with custom patterns and callbacks
 */
export function AdvancedExample() {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input-field-', type: 'input' },
      { prefix: 'output-field-', type: 'output' },
      { regex: /^custom-input-(.*)/, type: 'input' },
      { regex: /^result-(.*)/, type: 'output' }
    ]
  };

  const handleInputChange = (name: string, value: string, allValues: Record<string, string>) => {
    console.log(`Input "${name}" changed to:`, value);
    console.log('All values:', allValues);
  };

  const handleOutputCompute = (inputs: Record<string, string>) => {
    // Complex computation example
    const results: Record<string, string> = {};

    Object.entries(inputs).forEach(([key, value]) => {
      if (value) {
        results[key] = `${key.toUpperCase()}: ${value}`;
      }
    });

    return results;
  };

  return (
    <InteractiveSVG
      svgUrl="/diagram.svg"
      config={config}
      onInputChange={handleInputChange}
      onOutputCompute={handleOutputCompute}
      theme="bordered"
      inputClassName="custom-input"
      outputClassName="custom-output"
      inputStyle={{ fontSize: '14px' }}
      outputStyle={{ fontWeight: 'bold' }}
      debug={true}
      onDebugInfo={(info) => console.log('Debug info:', info)}
    />
  );
}

/**
 * Custom render functions example
 */
export function CustomRenderExample() {
  const config: FieldConfig = {
    patterns: [
      { prefix: 'input-field-', type: 'input' },
      { prefix: 'output-field-', type: 'output' }
    ]
  };

  return (
    <InteractiveSVG
      svgUrl="/diagram.svg"
      config={config}
      onOutputCompute={(inputs) => ({ gas: inputs.gas || '' })}
      renderInput={(props) => (
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="px-3 py-2 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-300"
          placeholder={props.placeholder}
        />
      )}
      renderOutput={(props) => (
        <div className="px-3 py-2 bg-green-50 border-2 border-green-500 rounded-lg font-semibold">
          {props.value || 'No output yet'}
        </div>
      )}
    />
  );
}
