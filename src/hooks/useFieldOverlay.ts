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

  const hasFieldLayoutChanged = (prev: FieldData[], next: FieldData[]) => {
    if (prev.length !== next.length) {
      return true;
    }

    for (let i = 0; i < next.length; i += 1) {
      const prevField = prev[i];
      const nextField = next[i];
      if (
        !prevField ||
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

  // Create foreignObjects when SVG loads
  useEffect(() => {
    if (!svgContainerRef.current) {
      return;
    }

    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) {
      return;
    }

    // Clear existing foreignObjects and React roots
    reactRootsRef.current.forEach(({ root }) => {
      try {
        root.unmount();
      } catch (e) {
        console.warn('Error unmounting React root:', e);
      }
    });
    reactRootsRef.current = [];

    foreignObjectsRef.current.forEach((fo) => fo.remove());
    foreignObjectsRef.current = [];

    // Get bounding boxes for all mappings (bbox may be null if the browser can't compute it)
    const fieldsWithBbox = getFieldBoundingBoxes(svgElement, mappings) as FieldData[];
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

        if (renderInput) {
          // Custom render function provided - mount React component
          try {
            const inputProps: InputFieldProps = {
              name: field.name,
              value: inputValues[field.name] ?? '',
              onChange: (value) => onInputChange(field.name, value),
              className,
            };
            if (inputStyle) {
              inputProps.style = inputStyle;
            }
            const customComponent = renderInput(inputProps);

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
                id="field-${field.name}"
                data-field-name="${field.name}"
                placeholder="${field.name}"
                class="${className}"
                style="
                  width: 100%;
                  height: 100%;
                  border: 2px solid #3B82F6;
                  border-radius: 4px;
                  padding: 2px 6px;
                  font-size: 12px;
                  box-sizing: border-box;
                  background: white;
                  color: #000000;
                  ${style}
                "
                value="${inputValues[field.name] ?? ''}"
              />
            `;

            const input = containerDiv.querySelector('input');
            if (input) {
              input.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                onInputChange(field.name, target.value);
              });
            }
          }
        } else {
          // Default rendering - use static HTML
          containerDiv.innerHTML = `
            <input
              type="text"
              id="field-${field.name}"
              data-field-name="${field.name}"
              placeholder="${field.name}"
              class="${className}"
              style="
                width: 100%;
                height: 100%;
                border: 2px solid #3B82F6;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 12px;
                box-sizing: border-box;
                background: white;
                color: #000000;
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
              onInputChange(field.name, target.value);
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

        if (renderOutput) {
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
            const customComponent = renderOutput(outputProps);

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
                id="output-${field.name}"
                data-field-name="${field.name}"
                class="${className}"
                style="
                  width: 100%;
                  height: 100%;
                  border: 2px solid #10B981;
                  border-radius: 4px;
                  padding: 2px 6px;
                  font-size: 12px;
                  box-sizing: border-box;
                  background: #F0FDF4;
                  color: #000000;
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
              id="output-${field.name}"
              data-field-name="${field.name}"
              class="${className}"
              style="
                width: 100%;
                height: 100%;
                border: 2px solid #10B981;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 12px;
                box-sizing: border-box;
                background: #F0FDF4;
                color: #000000;
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

    return () => {
      // Clean up React roots
      reactRootsRef.current.forEach(({ root }) => {
        try {
          root.unmount();
        } catch (e) {
          console.warn('Error unmounting React root:', e);
        }
      });
      reactRootsRef.current = [];

      // Clean up foreignObjects
      foreignObjectsRef.current.forEach((fo) => fo.remove());
      foreignObjectsRef.current = [];
    };
  }, [
    svgContainerRef,
    mappings,
    onInputChange,
    renderInput,
    renderOutput,
    theme,
    inputClassName,
    outputClassName,
    inputStyle,
    outputStyle,
  ]);

  // Re-render custom React roots when values change
  useEffect(() => {
    if (!renderInput && !renderOutput) {
      return;
    }

    reactRootsRef.current.forEach(({ name, type, root }) => {
      const field = fieldsRef.current.find((f) => f.name === name && f.type === type);
      if (!field) {
        return;
      }

      const themeClass = theme && theme !== 'none' ? `svg-field-${theme}` : '';
      const baseClass = `svg-field svg-field-${field.type}`;

      if (type === 'input' && renderInput) {
        const className = [baseClass, themeClass, inputClassName].filter(Boolean).join(' ');
        const inputProps: InputFieldProps = {
          name: field.name,
          value: inputValues[field.name] ?? '',
          onChange: (value) => onInputChange(field.name, value),
          className,
        };
        if (inputStyle) {
          inputProps.style = inputStyle;
        }
        const node = renderInput(inputProps);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        root.render(node as any);
      } else if (type === 'output' && renderOutput) {
        const className = [baseClass, themeClass, outputClassName].filter(Boolean).join(' ');
        const outputProps: OutputFieldProps = {
          name: field.name,
          value: outputValues[field.name] ?? '',
          className,
        };
        if (outputStyle) {
          outputProps.style = outputStyle;
        }
        const node = renderOutput(outputProps);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        root.render(node as any);
      }
    });
  }, [
    inputValues,
    outputValues,
    renderInput,
    renderOutput,
    inputClassName,
    outputClassName,
    inputStyle,
    outputStyle,
    theme,
    onInputChange,
  ]);

  // Update output values when they change
  useEffect(() => {
    fieldsRef.current
      .filter((f) => f.type === 'output')
      .forEach((field) => {
        const outputDiv = document.getElementById(`output-${field.name}`);
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
        const input = document.getElementById(`field-${field.name}`) as HTMLInputElement;
        if (input && input.value !== inputValues[field.name]) {
          input.value = inputValues[field.name] ?? '';
        }
      });
  }, [inputValues]);

  return fields;
}
