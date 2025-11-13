import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { InteractiveSVGProps, DebugInfo } from '../types';
import { useSVGParser, UseSVGParserOptions } from '../hooks/useSVGParser';
import { useFieldOverlay, UseFieldOverlayOptions } from '../hooks/useFieldOverlay';
import { DebugPanel } from './DebugPanel';
import { validateFieldConfig } from '../utils/fieldMatcher';

/**
 * Main component for rendering interactive SVG diagrams
 */
export const InteractiveSVG: React.FC<InteractiveSVGProps> = ({
  svgUrl,
  svgContent,
  config,
  onInputChange,
  onOutputCompute,
  outputValues: externalOutputValues,
  onOutputUpdate,
  renderInput,
  renderOutput,
  inputClassName,
  outputClassName,
  inputStyle,
  outputStyle,
  theme = 'default',
  debug = false,
  onDebugInfo,
  className,
  style,
}) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [internalOutputValues, setInternalOutputValues] = useState<Record<string, string>>({});
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const prevMappingsRef = useRef<string>('');
  const prevFieldsRef = useRef<number>(0);

  // Use external output values if provided, otherwise use internal state
  const outputValues = externalOutputValues ?? internalOutputValues;

  // Validate configuration
  const configErrors = validateFieldConfig(config.patterns);
  if (configErrors.length > 0) {
    console.error('Invalid field configuration:', configErrors);
  }

  // Parse SVG and extract field mappings
  const svgParserOptions = useMemo(() => {
    const options: UseSVGParserOptions = { config };
    if (svgUrl) {
      options.svgUrl = svgUrl;
    }
    if (svgContent) {
      options.svgContent = svgContent;
    }
    return options;
  }, [svgUrl, svgContent, config]);

  const {
    mappings,
    svgText,
    isLoading,
    errors: parseErrors,
    detectedMode,
  } = useSVGParser(svgParserOptions);

  // Insert SVG into DOM
  useEffect(() => {
    if (svgText && svgContainerRef.current) {
      svgContainerRef.current.innerHTML = svgText;
    }
  }, [svgText]);

  // Initialize input values from mappings
  useEffect(() => {
    const mappingsKey = JSON.stringify(mappings.map((m) => m.name));
    if (prevMappingsRef.current !== mappingsKey) {
      prevMappingsRef.current = mappingsKey;

      setInputValues((prevValues) => {
        const initialValues: Record<string, string> = {};
        mappings
          .filter((m) => m.type === 'input')
          .forEach((m) => {
            // Preserve existing values if they exist
            initialValues[m.name] = prevValues[m.name] ?? '';
          });
        return initialValues;
      });
    }
  }, [mappings]);

  // Handle input changes
  const handleInputChange = useCallback(
    (name: string, value: string) => {
      setInputValues((prev) => {
        const newValues = { ...prev, [name]: value };

        if (onInputChange) {
          onInputChange(name, value, newValues);
        }

        // Only update outputs if not externally controlled
        if (!externalOutputValues) {
          // Compute output values using callbacks
          const computed: Record<string, string> = {};

          // If global onOutputCompute provided, use it
          if (onOutputCompute) {
            Object.assign(computed, onOutputCompute(newValues));
          }

          // Apply individual output callbacks
          if (onOutputUpdate) {
            Object.entries(onOutputUpdate).forEach(([outputName, callback]) => {
              computed[outputName] = callback(newValues);
            });
          }

          setInternalOutputValues(computed);
        }

        return newValues;
      });
    },
    [onInputChange, externalOutputValues, onOutputCompute, onOutputUpdate]
  );

  // Create field overlays - build options object conditionally for exactOptionalPropertyTypes
  // We don't use useMemo here because inputValues/outputValues change frequently
  // and memoization would cause infinite loops
  const buildFieldOverlayOptions = (): UseFieldOverlayOptions => {
    const options: UseFieldOverlayOptions = {
      svgContainerRef,
      mappings,
      inputValues,
      outputValues,
      onInputChange: handleInputChange,
    };

    if (renderInput) {
      options.renderInput = renderInput;
    }
    if (renderOutput) {
      options.renderOutput = renderOutput;
    }
    if (inputClassName) {
      options.inputClassName = inputClassName;
    }
    if (outputClassName) {
      options.outputClassName = outputClassName;
    }
    if (inputStyle) {
      options.inputStyle = inputStyle;
    }
    if (outputStyle) {
      options.outputStyle = outputStyle;
    }
    if (theme) {
      options.theme = theme;
    }

    return options;
  };

  // eslint-disable-next-line react-hooks/refs -- False positive: building options object, not updating ref
  const fields = useFieldOverlay(buildFieldOverlayOptions());

  // Update debug info and call callback
  useEffect(() => {
    if (fields.length > 0 && prevFieldsRef.current !== fields.length) {
      prevFieldsRef.current = fields.length;
      const svgElement = svgContainerRef.current?.querySelector('svg');
      const allErrors = [...configErrors, ...parseErrors];
      const newDebugInfo: DebugInfo = {
        totalFields: fields.length,
        inputFields: fields.filter((f) => f.type === 'input'),
        outputFields: fields.filter((f) => f.type === 'output'),
        rawMappings: mappings,
      };

      if (detectedMode) {
        newDebugInfo.matchingMode = detectedMode;
      }

      if (svgElement) {
        newDebugInfo.svgDimensions = {
          width: svgElement.clientWidth,
          height: svgElement.clientHeight,
        };
      }

      if (allErrors.length > 0) {
        newDebugInfo.errors = allErrors;
      }

      setDebugInfo(newDebugInfo);
      if (onDebugInfo) {
        onDebugInfo(newDebugInfo);
      }
    }
  }, [fields, mappings, detectedMode, configErrors, parseErrors, onDebugInfo]);

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading SVG...</div>;
  }

  if (configErrors.length > 0 || parseErrors.length > 0) {
    return (
      <div style={{ padding: '20px', color: '#DC2626' }}>
        <strong>Error loading interactive SVG:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          {[...configErrors, ...parseErrors].map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <style>{`
        .svg-container * {
          color: initial !important;
        }
        .svg-container svg text {
          fill: var(--svg-output-text, #000000) !important;
        }

        /* Theme: default - uses CSS variables */
        .svg-field-default.svg-field-input input {
          border-color: var(--svg-input-border, #3B82F6);
          background: var(--svg-input-bg, #FFFFFF);
          color: var(--svg-input-text, #000000);
        }
        .svg-field-default.svg-field-output div {
          border-color: var(--svg-output-border, #10B981);
          background: var(--svg-output-bg, #F0FDF4);
          color: var(--svg-output-text, #000000);
        }

        /* Theme: minimal - can be customized via CSS variables */
        .svg-field-minimal input,
        .svg-field-minimal div {
          border: 1px solid #D1D5DB;
          border-radius: 2px;
          background: var(--svg-input-bg, white);
          color: var(--svg-input-text, #000000);
        }

        /* Theme: bordered - uses CSS variables */
        .svg-field-bordered input {
          border: 3px solid var(--svg-input-border, #3B82F6);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
          background: var(--svg-input-bg, white);
          color: var(--svg-input-text, #000000);
        }
        .svg-field-bordered input:focus {
          border-color: var(--svg-input-focus, #2563EB);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .svg-field-bordered div {
          border: 3px solid var(--svg-output-border, #10B981);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
          background: var(--svg-output-bg, #F0FDF4);
          color: var(--svg-output-text, #000000);
        }
      `}</style>

      <div
        ref={svgContainerRef}
        className="svg-container"
        style={{
          border: '1px solid #D1D5DB',
          borderRadius: '8px',
          background: 'white',
          overflow: 'auto',
        }}
      />

      {debug && debugInfo && <DebugPanel debugInfo={debugInfo} />}
    </div>
  );
};
