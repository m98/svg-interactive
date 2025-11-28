import { useState, useEffect, useRef, RefObject, ReactNode, CSSProperties } from 'react';
import { FieldMapping, FieldData, InputFieldProps, OutputFieldProps } from '../types';
import { getFieldBoundingBoxes } from '../utils/svgParser';
import { createRoot, Root } from 'react-dom/client';

export interface UseFieldOverlayOptions {
  svgContainerRef: RefObject<HTMLDivElement>;
  mappings: FieldMapping[];
  inputValues: Record<string, string>;
  outputValues: Record<string, string>;
  onInputChange: (name: string, value: string) => void;
  renderInput?: (props: InputFieldProps) => ReactNode;
  renderOutput?: (props: OutputFieldProps) => ReactNode;
  inputClassName?: string;
  outputClassName?: string;
  inputStyle?: CSSProperties;
  outputStyle?: CSSProperties;
  theme?: string;
}

/**
 * Hook to create and manage foreignObject overlays on SVG elements
 */
export function useFieldOverlay({
  svgContainerRef,
  mappings,
  inputValues,
  outputValues,
  onInputChange,
  renderInput,
  renderOutput,
  inputClassName,
  outputClassName,
  inputStyle,
  outputStyle,
  theme,
}: UseFieldOverlayOptions): FieldData[] {
  const [fields, setFields] = useState<FieldData[]>([]);
  const fieldsRef = useRef<FieldData[]>([]);
  const foreignObjectsRef = useRef<SVGForeignObjectElement[]>([]);
  const reactRootsRef = useRef<Array<{ name: string; type: 'input' | 'output'; root: Root }>>([]);

  // Store callbacks in refs to avoid recreating foreignObjects when callbacks change
  const onInputChangeRef = useRef(onInputChange);
  const renderInputRef = useRef(renderInput);
  const renderOutputRef = useRef(renderOutput);

  // Update refs when callbacks change
  useEffect(() => {
    onInputChangeRef.current = onInputChange;
  }, [onInputChange]);

  useEffect(() => {
    renderInputRef.current = renderInput;
  }, [renderInput]);

  useEffect(() => {
    renderOutputRef.current = renderOutput;
  }, [renderOutput]);

  // Create stable reference for mappings that only changes when content changes
  // This prevents effect from re-running on reference changes
  const mappingsRef = useRef<FieldMapping[]>(mappings);

  const areMappingsEqual = (a: FieldMapping[], b: FieldMapping[]): boolean => {
    if (!a || !b) {
      return a === b;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      const aMap = a[i];
      const bMap = b[i];
      if (
        !aMap ||
        !bMap ||
        aMap.elementId !== bMap.elementId ||
        aMap.dataId !== bMap.dataId ||
        aMap.name !== bMap.name ||
        aMap.type !== bMap.type
      ) {
        return false;
      }
    }
    return true;
  };

  // Only update ref when content actually changes
  if (!areMappingsEqual(mappingsRef.current, mappings)) {
    mappingsRef.current = mappings;
  }
  const stableMappings = mappingsRef.current;

  const hasFieldLayoutChanged = (prev: FieldData[], next: FieldData[]) => {
    if (prev.length !== next.length) {
      return true;
    }

    for (let i = 0; i < next.length; i += 1) {
      const prevField = prev[i];
      const nextField = next[i];
      if (
        !prevField ||
        !nextField ||
        prevField.name !== nextField.name ||
        prevField.dataId !== nextField.dataId ||
        prevField.elementId !== nextField.elementId ||
        prevField.type !== nextField.type
      ) {
        return true;
      }

      const prevBbox = prevField.bbox;
      const nextBbox = nextField.bbox;
      if (
        (!prevBbox && nextBbox) ||
        (prevBbox && !nextBbox) ||
        (prevBbox &&
          nextBbox &&
          (prevBbox.x !== nextBbox.x ||
            prevBbox.y !== nextBbox.y ||
            prevBbox.width !== nextBbox.width ||
            prevBbox.height !== nextBbox.height))
      ) {
        return true;
      }
    }

    return false;
  };

  // Create foreignObjects when SVG loads or layout changes
  useEffect(() => {
    if (!svgContainerRef.current) {
      return;
    }

    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) {
      return;
    }

    // Clear refs before building (cleanup will handle actual unmounting/removal)
    foreignObjectsRef.current = [];
    reactRootsRef.current = [];

    // Get bounding boxes for all mappings (bbox may be null if the browser can't compute it)
    const fieldsWithBbox = getFieldBoundingBoxes(svgElement, stableMappings) as FieldData[];

    const shouldUpdateFields = hasFieldLayoutChanged(fieldsRef.current, fieldsWithBbox);
    fieldsRef.current = fieldsWithBbox;
    if (shouldUpdateFields) {
      setFields(fieldsWithBbox);
    }

    // Create foreignObject for each field that has layout info
    fieldsWithBbox.forEach((field) => {
      if (!field.bbox) {
        return;
      }

      const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');

      foreignObject.setAttribute('x', field.bbox.x.toString());
      foreignObject.setAttribute('y', field.bbox.y.toString());
      foreignObject.setAttribute('width', field.bbox.width.toString());
      foreignObject.setAttribute('height', field.bbox.height.toString());
      foreignObject.setAttribute('data-field-id', field.dataId);
      foreignObject.style.pointerEvents = 'auto'; // Ensure events are captured

      const themeClass = theme && theme !== 'none' ? `svg-field-${theme}` : '';
      const baseClass = `svg-field svg-field-${field.type}`;

      if (field.type === 'input') {
        const className = [baseClass, themeClass, inputClassName].filter(Boolean).join(' ');
        const style = Object.entries(inputStyle ?? {})
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
          .join(' ');

        // Create container div
        const containerDiv = document.createElementNS(
          'http://www.w3.org/1999/xhtml',
          'div'
        ) as any as HTMLDivElement; // eslint-disable-line @typescript-eslint/no-explicit-any
        containerDiv.style.width = '100%';
        containerDiv.style.height = '100%';
        containerDiv.style.display = 'flex';
        containerDiv.style.alignItems = 'center';

        foreignObject.appendChild(containerDiv);

        if (renderInputRef.current) {
          // Custom render function provided - mount React component
          try {
            const inputProps: InputFieldProps = {
              name: field.name,
              value: inputValues[field.name] ?? '',
              onChange: (value) => onInputChangeRef.current(field.name, value),
              className,
            };
            if (inputStyle) {
              inputProps.style = inputStyle;
            }
            const customComponent = renderInputRef.current(inputProps);

            // Create React root and render component
            const root = createRoot(containerDiv);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            root.render(customComponent as any);
            reactRootsRef.current.push({ name: field.name, type: 'input', root });
          } catch (e) {
            console.warn('Custom renderInput failed, falling back to default:', e);
            // Fall back to default rendering
            containerDiv.innerHTML = `
              <input
                type="text"
                id="input-field-${field.name}"
                data-field-name="${field.name}"
                placeholder="${field.name}"
                class="${className}"
                style="
                  width: 100%;
                  height: 100%;
                  border: var(--svg-field-border-width, 2px) solid var(--svg-input-border, #3B82F6);
                  border-radius: var(--svg-field-border-radius, 4px);
                  padding: var(--svg-field-padding, 2px 6px);
                  font-size: var(--svg-field-font-size, 12px);
                  box-sizing: border-box;
                  background: var(--svg-input-bg, white);
                  color: var(--svg-input-text, #000000);
                  ${style}
                "
                value="${inputValues[field.name] ?? ''}"
              />
            `;

            const input = containerDiv.querySelector('input');
            if (input) {
              input.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                onInputChangeRef.current(field.name, target.value);
              });
            }
          }
        } else {
          // Default rendering - use static HTML
          containerDiv.innerHTML = `
            <input
              type="text"
              id="input-field-${field.name}"
              data-field-name="${field.name}"
              placeholder="${field.name}"
              class="${className}"
              style="
                width: 100%;
                height: 100%;
                border: var(--svg-field-border-width, 2px) solid var(--svg-input-border, #3B82F6);
                border-radius: var(--svg-field-border-radius, 4px);
                padding: var(--svg-field-padding, 2px 6px);
                font-size: var(--svg-field-font-size, 12px);
                box-sizing: border-box;
                background: var(--svg-input-bg, white);
                color: var(--svg-input-text, #111827);
                ${style}
              "
              value="${inputValues[field.name] ?? ''}"
            />
          `;

          // Add event listener
          const input = containerDiv.querySelector('input');
          if (input) {
            input.addEventListener('input', (e) => {
              const target = e.target as HTMLInputElement;
              onInputChangeRef.current(field.name, target.value);
            });
          }
        }
      } else {
        // Output field
        const className = [baseClass, themeClass, outputClassName].filter(Boolean).join(' ');
        const style = Object.entries(outputStyle ?? {})
          .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
          .join(' ');

        // Create container div
        const containerDiv = document.createElementNS(
          'http://www.w3.org/1999/xhtml',
          'div'
        ) as any as HTMLDivElement; // eslint-disable-line @typescript-eslint/no-explicit-any
        containerDiv.style.width = '100%';
        containerDiv.style.height = '100%';
        containerDiv.style.display = 'flex';
        containerDiv.style.alignItems = 'center';

        foreignObject.appendChild(containerDiv);

        if (renderOutputRef.current) {
          // Custom render function provided - mount React component
          try {
            const outputProps: OutputFieldProps = {
              name: field.name,
              value: outputValues[field.name] ?? '',
              className,
            };
            if (outputStyle) {
              outputProps.style = outputStyle;
            }
            const customComponent = renderOutputRef.current(outputProps);

            // Create React root and render component
            const root = createRoot(containerDiv);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            root.render(customComponent as any);
            reactRootsRef.current.push({ name: field.name, type: 'output', root });
          } catch (e) {
            console.warn('Custom renderOutput failed, falling back to default:', e);
            // Fall back to default rendering
            containerDiv.innerHTML = `
              <div
                id="output-field-${field.name}"
                data-field-name="${field.name}"
                class="${className}"
                style="
                  width: 100%;
                  height: 100%;
                  border: var(--svg-field-border-width, 2px) solid var(--svg-output-border, #10B981);
                  border-radius: var(--svg-field-border-radius, 4px);
                  padding: var(--svg-field-padding, 2px 6px);
                  font-size: var(--svg-field-font-size, 12px);
                  box-sizing: border-box;
                  background: var(--svg-output-bg, #F0FDF4);
                  color: var(--svg-output-text, #000000);
                  display: flex;
                  align-items: center;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  ${style}
                "
              >${outputValues[field.name] ?? '...'}</div>
            `;
          }
        } else {
          // Default rendering - use static HTML
          containerDiv.innerHTML = `
            <div
              id="output-field-${field.name}"
              data-field-name="${field.name}"
              class="${className}"
              style="
                width: 100%;
                height: 100%;
                border: var(--svg-field-border-width, 2px) solid var(--svg-output-border, #10B981);
                border-radius: var(--svg-field-border-radius, 4px);
                padding: var(--svg-field-padding, 2px 6px);
                font-size: var(--svg-field-font-size, 12px);
                box-sizing: border-box;
                background: var(--svg-output-bg, #F0FDF4);
                color: var(--svg-output-text, #065f46);
                display: flex;
                align-items: center;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                ${style}
              "
            >${outputValues[field.name] ?? '...'}</div>
          `;
        }
      }

      svgElement.appendChild(foreignObject);
      foreignObjectsRef.current.push(foreignObject);
    });

    // Capture refs in closure for cleanup (critical for React StrictMode)
    const foreignObjectsToCleanup = [...foreignObjectsRef.current];
    const reactRootsToCleanup = [...reactRootsRef.current];

    return () => {
      // Clean up React roots (use captured array, not ref)
      reactRootsToCleanup.forEach(({ root }) => {
        try {
          root.unmount();
        } catch (e) {
          console.warn('Error unmounting React root:', e);
        }
      });

      // Clean up foreignObjects (use captured array, not ref)
      foreignObjectsToCleanup.forEach((fo) => {
        fo.remove();
      });
    };
    // inputValues and outputValues are intentionally excluded from deps to avoid
    // recreating all foreignObjects on every value change. Separate useEffects below
    // handle efficient value updates without DOM reconstruction.
    // Callbacks (onInputChange, renderInput, renderOutput) are stored in refs and
    // excluded from deps to prevent recreation when callback references change.
    // inputStyle, outputStyle, inputClassName, outputClassName, and theme are intentionally
    // EXCLUDED to prevent focus loss: when consumers pass inline objects/strings, every render
    // creates new references, which would cause this effect to re-run and destroy/recreate all inputs.
    // Style/className/theme updates are handled by the re-render effect below.
    // stableMappings is a ref that only changes when mapping content changes (not reference),
    // preventing unnecessary rebuilds when consumers don't memoize mappings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgContainerRef, stableMappings]);

  // Re-render custom React roots when values change
  useEffect(() => {
    if (!renderInputRef.current && !renderOutputRef.current) {
      return;
    }

    reactRootsRef.current.forEach(({ name, type, root }) => {
      const field = fieldsRef.current.find((f) => f.name === name && f.type === type);
      if (!field) {
        return;
      }

      const themeClass = theme && theme !== 'none' ? `svg-field-${theme}` : '';
      const baseClass = `svg-field svg-field-${field.type}`;

      if (type === 'input' && renderInputRef.current) {
        const className = [baseClass, themeClass, inputClassName].filter(Boolean).join(' ');
        const inputProps: InputFieldProps = {
          name: field.name,
          value: inputValues[field.name] ?? '',
          onChange: (value) => onInputChangeRef.current(field.name, value),
          className,
        };
        if (inputStyle) {
          inputProps.style = inputStyle;
        }
        const node = renderInputRef.current(inputProps);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        root.render(node as any);
      } else if (type === 'output' && renderOutputRef.current) {
        const className = [baseClass, themeClass, outputClassName].filter(Boolean).join(' ');
        const outputProps: OutputFieldProps = {
          name: field.name,
          value: outputValues[field.name] ?? '',
          className,
        };
        if (outputStyle) {
          outputProps.style = outputStyle;
        }
        const node = renderOutputRef.current(outputProps);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        root.render(node as any);
      }
    });
    // Note: inputStyle and outputStyle are intentionally excluded to prevent focus loss when
    // consumers pass inline style objects. Consumers should memoize styles if needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValues, outputValues, inputClassName, outputClassName, theme]);

  // Update output values when they change
  useEffect(() => {
    fieldsRef.current
      .filter((f) => f.type === 'output')
      .forEach((field) => {
        const outputDiv = document.getElementById(`output-field-${field.name}`);
        if (outputDiv) {
          outputDiv.textContent = outputValues[field.name] ?? '...';
        }
      });
  }, [outputValues]);

  // Update input values when they change externally
  useEffect(() => {
    fieldsRef.current
      .filter((f) => f.type === 'input')
      .forEach((field) => {
        const input = document.getElementById(`input-field-${field.name}`) as HTMLInputElement;
        if (input && input.value !== inputValues[field.name]) {
          input.value = inputValues[field.name] ?? '';
        }
      });
  }, [inputValues]);

  return fields;
}
