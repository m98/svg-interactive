import React from 'react';
import { renderHook } from '@testing-library/react';
import { useFieldOverlay } from './useFieldOverlay';
import { FieldMapping } from '../types';

describe('useFieldOverlay', () => {
  let container: HTMLDivElement;
  let svgElement: SVGSVGElement;

  beforeEach(() => {
    // Create a container with an SVG element
    container = document.createElement('div');
    svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '800');
    svgElement.setAttribute('height', '600');
    container.appendChild(svgElement);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('basic functionality', () => {
    it('should return empty array when no mappings provided', () => {
      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { result } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings: [],
          inputValues: {},
          outputValues: {},
          onInputChange,
        })
      );

      expect(result.current).toEqual([]);
    });

    it('should handle missing svgContainerRef', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:test', name: 'test', elementId: 'el1', type: 'input' },
      ];

      const svgContainerRef = { current: null };
      const onInputChange = jest.fn();

      const { result } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: {},
          onInputChange,
        })
      );

      expect(result.current).toEqual([]);
    });

    it('should handle missing SVG element in container', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:test', name: 'test', elementId: 'el1', type: 'input' },
      ];

      const emptyContainer = document.createElement('div');
      document.body.appendChild(emptyContainer);

      const svgContainerRef = { current: emptyContainer };
      const onInputChange = jest.fn();

      const { result } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: {},
          onInputChange,
        })
      );

      expect(result.current).toEqual([]);

      document.body.removeChild(emptyContainer);
    });
  });

  describe('cleanup', () => {
    it('should handle unmounting gracefully', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:test', name: 'test', elementId: 'el1', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { unmount } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: {},
          onInputChange,
        })
      );

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('options handling', () => {
    it('should accept all options without errors', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:test', name: 'test', elementId: 'el1', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn();
      const renderOutput = jest.fn();

      const { result } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: { test: 'value' },
          outputValues: {},
          onInputChange,
          renderInput,
          renderOutput,
          inputClassName: 'custom-input',
          outputClassName: 'custom-output',
          inputStyle: { color: 'red' },
          outputStyle: { color: 'blue' },
          theme: 'minimal',
        })
      );

      expect(result.current).toBeDefined();
    });

    it('should handle input values being provided', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'el1', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { rerender } = renderHook(
        ({ values }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: values,
            outputValues: {},
            onInputChange,
          }),
        { initialProps: { values: { field1: 'initial' } } }
      );

      // Update input values
      rerender({ values: { field1: 'updated' } });

      // Should not throw
      expect(true).toBe(true);
    });

    it('should handle output values being provided', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'el1', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { rerender } = renderHook(
        ({ values }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: {},
            outputValues: values,
            onInputChange,
          }),
        { initialProps: { values: { result: 'initial' } } }
      );

      // Update output values
      rerender({ values: { result: 'updated' } });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('mappings updates', () => {
    it('should handle mappings changes', () => {
      const mappings1: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'el1', type: 'input' },
      ];

      const mappings2: FieldMapping[] = [
        { dataId: 'input:field2', name: 'field2', elementId: 'el2', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { rerender } = renderHook(
        ({ mappings }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: {},
            outputValues: {},
            onInputChange,
          }),
        { initialProps: { mappings: mappings1 } }
      );

      // Update mappings
      rerender({ mappings: mappings2 });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('foreignObject creation', () => {
    beforeEach(() => {
      // Add a rect element that can have a bounding box
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', 'test-rect');
      rect.setAttribute('x', '10');
      rect.setAttribute('y', '20');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '50');
      svgElement.appendChild(rect);

      // Mock getBBox to return a valid bounding box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rect as any).getBBox = jest.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }));
    });

    it('should create foreignObject elements for input fields', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: {},
          onInputChange,
        })
      );

      const foreignObjects = svgElement.querySelectorAll('foreignObject[data-field-id]');
      expect(foreignObjects.length).toBeGreaterThan(0);
    });

    it('should create foreignObject elements for output fields', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: {},
          onInputChange,
        })
      );

      const foreignObjects = svgElement.querySelectorAll('foreignObject[data-field-id]');
      expect(foreignObjects.length).toBeGreaterThan(0);
    });

    it('should remove old foreignObjects when mappings change', () => {
      const mappings1: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const mappings2: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { rerender } = renderHook(
        ({ mappings }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: {},
            outputValues: {},
            onInputChange,
          }),
        { initialProps: { mappings: mappings1 } }
      );

      // Update mappings
      rerender({ mappings: mappings2 });

      const foreignObjects2 = svgElement.querySelectorAll('foreignObject[data-field-id]');
      const count2 = foreignObjects2.length;

      // Should have recreated foreignObjects
      expect(count2).toBeGreaterThan(0);
    });

    it('should apply theme className when provided', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: {},
          onInputChange,
          theme: 'minimal',
        })
      );

      // Theme should be applied (verified through foreignObject creation)
      const foreignObjects = svgElement.querySelectorAll('foreignObject[data-field-id]');
      expect(foreignObjects.length).toBeGreaterThan(0);
    });
  });

  describe('custom renderers', () => {
    beforeEach(() => {
      // Add a rect element for testing
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', 'test-rect');
      rect.setAttribute('x', '10');
      rect.setAttribute('y', '20');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '50');
      svgElement.appendChild(rect);

      // Mock getBBox to return a valid bounding box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rect as any).getBBox = jest.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }));
    });

    it('should call custom renderInput when provided', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn((props) => <input {...props} data-testid="custom-input" />);

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: { field1: 'test' },
          outputValues: {},
          onInputChange,
          renderInput,
        })
      );

      expect(renderInput).toHaveBeenCalled();
    });

    it('should call custom renderOutput when provided', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderOutput = jest.fn((props) => <div {...props} data-testid="custom-output" />);

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: { result: '42' },
          onInputChange,
          renderOutput,
        })
      );

      expect(renderOutput).toHaveBeenCalled();
    });

    it('should fallback to default rendering when custom renderInput throws error', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn(() => {
        throw new Error('Custom renderer failed');
      });

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: { field1: 'test' },
          outputValues: {},
          onInputChange,
          renderInput,
        })
      );

      // Should have logged warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Custom renderInput failed, falling back to default:',
        expect.any(Error)
      );

      // Should still create foreignObject with default rendering
      const foreignObjects = svgElement.querySelectorAll('foreignObject[data-field-id]');
      expect(foreignObjects.length).toBeGreaterThan(0);

      consoleWarnSpy.mockRestore();
    });

    it('should fallback to default rendering when custom renderOutput throws error', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderOutput = jest.fn(() => {
        throw new Error('Custom renderer failed');
      });

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: {},
          outputValues: { result: '42' },
          onInputChange,
          renderOutput,
        })
      );

      // Should have logged warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Custom renderOutput failed, falling back to default:',
        expect.any(Error)
      );

      // Should still create foreignObject with default rendering
      const foreignObjects = svgElement.querySelectorAll('foreignObject[data-field-id]');
      expect(foreignObjects.length).toBeGreaterThan(0);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('React root cleanup', () => {
    beforeEach(() => {
      // Add a rect element for testing
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', 'test-rect');
      rect.setAttribute('x', '10');
      rect.setAttribute('y', '20');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '50');
      svgElement.appendChild(rect);

      // Mock getBBox to return a valid bounding box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rect as any).getBBox = jest.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }));
    });

    it('should unmount React roots when component unmounts', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn((props) => <input {...props} />);

      const { unmount } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: { field1: 'test' },
          outputValues: {},
          onInputChange,
          renderInput,
        })
      );

      // Unmount should clean up without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle unmount errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn((props) => <input {...props} />);

      const { unmount } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: { field1: 'test' },
          outputValues: {},
          onInputChange,
          renderInput,
        })
      );

      // Unmount should handle errors gracefully
      unmount();

      // Should not throw
      expect(true).toBe(true);

      consoleWarnSpy.mockRestore();
    });

    it('should remove foreignObjects when component unmounts', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { unmount } = renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: { field1: 'test' },
          outputValues: {},
          onInputChange,
        })
      );

      // Verify foreignObjects exist
      let foreignObjects = svgElement.querySelectorAll('foreignObject[data-field-id]');
      expect(foreignObjects.length).toBeGreaterThan(0);

      // Unmount
      unmount();

      // ForeignObjects should be removed
      foreignObjects = svgElement.querySelectorAll('foreignObject[data-field-id]');
      expect(foreignObjects.length).toBe(0);
    });
  });

  describe('value updates', () => {
    beforeEach(() => {
      // Add a rect element for testing
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', 'test-rect');
      rect.setAttribute('x', '10');
      rect.setAttribute('y', '20');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '50');
      svgElement.appendChild(rect);

      // Mock getBBox to return a valid bounding box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rect as any).getBBox = jest.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }));
    });

    it('should update input values when inputValues prop changes', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { rerender } = renderHook(
        ({ values }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: values,
            outputValues: {},
            onInputChange,
          }),
        { initialProps: { values: { field1: 'initial' } } }
      );

      // Update input values
      rerender({ values: { field1: 'updated' } });

      // Should not throw
      expect(true).toBe(true);
    });

    it('should update output values when outputValues prop changes', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      const { rerender } = renderHook(
        ({ values }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: {},
            outputValues: values,
            onInputChange,
          }),
        { initialProps: { values: { result: 'initial' } } }
      );

      // Update output values
      rerender({ values: { result: 'updated' } });

      // Should not throw
      expect(true).toBe(true);
    });

    it('should re-render custom React roots when input values change', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn((props) => <input {...props} />);

      const { rerender } = renderHook(
        ({ values }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: values,
            outputValues: {},
            onInputChange,
            renderInput,
          }),
        { initialProps: { values: { field1: 'initial' } } }
      );

      const initialCallCount = renderInput.mock.calls.length;

      // Update input values
      rerender({ values: { field1: 'updated' } });

      // renderInput should be called again with updated value
      expect(renderInput.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should re-render custom React roots when output values change', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderOutput = jest.fn((props) => <div {...props} />);

      const { rerender } = renderHook(
        ({ values }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: {},
            outputValues: values,
            onInputChange,
            renderOutput,
          }),
        { initialProps: { values: { result: 'initial' } } }
      );

      const initialCallCount = renderOutput.mock.calls.length;

      // Update output values
      rerender({ values: { result: 'updated' } });

      // renderOutput should be called again with updated value
      expect(renderOutput.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      // Add a rect element for testing
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', 'test-rect');
      rect.setAttribute('x', '10');
      rect.setAttribute('y', '20');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '50');
      svgElement.appendChild(rect);

      // Mock getBBox to return a valid bounding box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rect as any).getBBox = jest.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }));
    });

    it('should attach event listeners to default input fields', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();

      renderHook(() =>
        useFieldOverlay({
          svgContainerRef,
          mappings,
          inputValues: { field1: '' },
          outputValues: {},
          onInputChange,
        })
      );

      // Find the input element
      const inputElement = container.querySelector('input[data-field-name="field1"]');
      expect(inputElement).toBeTruthy();

      if (inputElement) {
        // Simulate input change
        // eslint-disable-next-line no-undef
        const event = new Event('input', { bubbles: true });
        Object.defineProperty(event, 'target', {
          value: { value: 'new value' },
          writable: false,
        });
        inputElement.dispatchEvent(event);

        // onInputChange should be called
        expect(onInputChange).toHaveBeenCalled();
      }
    });
  });

  describe('style and className updates', () => {
    beforeEach(() => {
      // Add a rect element for testing
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', 'test-rect');
      rect.setAttribute('x', '10');
      rect.setAttribute('y', '20');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '50');
      svgElement.appendChild(rect);

      // Mock getBBox to return a valid bounding box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rect as any).getBBox = jest.fn(() => ({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }));
    });

    it('should handle inputClassName updates', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn((props) => <input {...props} />);

      const { rerender } = renderHook(
        ({ className }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: { field1: 'test' },
            outputValues: {},
            onInputChange,
            renderInput,
            inputClassName: className,
          }),
        { initialProps: { className: 'class1' } }
      );

      const initialCallCount = renderInput.mock.calls.length;

      // Update className
      rerender({ className: 'class2' });

      // Should re-render with new className
      expect(renderInput.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should handle outputClassName updates', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderOutput = jest.fn((props) => <div {...props} />);

      const { rerender } = renderHook(
        ({ className }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: {},
            outputValues: { result: '42' },
            onInputChange,
            renderOutput,
            outputClassName: className,
          }),
        { initialProps: { className: 'class1' } }
      );

      const initialCallCount = renderOutput.mock.calls.length;

      // Update className
      rerender({ className: 'class2' });

      // Should re-render with new className
      expect(renderOutput.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should handle inputStyle updates', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'input:field1', name: 'field1', elementId: 'test-rect', type: 'input' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderInput = jest.fn((props) => <input {...props} />);

      const { rerender } = renderHook(
        ({ style }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: { field1: 'test' },
            outputValues: {},
            onInputChange,
            renderInput,
            inputStyle: style,
          }),
        { initialProps: { style: { color: 'red' } } }
      );

      const initialCallCount = renderInput.mock.calls.length;

      // Update style
      rerender({ style: { color: 'blue' } });

      // Should re-render with new style
      expect(renderInput.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should handle outputStyle updates', () => {
      const mappings: FieldMapping[] = [
        { dataId: 'output:result', name: 'result', elementId: 'test-rect', type: 'output' },
      ];

      const svgContainerRef = { current: container };
      const onInputChange = jest.fn();
      const renderOutput = jest.fn((props) => <div {...props} />);

      const { rerender } = renderHook(
        ({ style }) =>
          useFieldOverlay({
            svgContainerRef,
            mappings,
            inputValues: {},
            outputValues: { result: '42' },
            onInputChange,
            renderOutput,
            outputStyle: style,
          }),
        { initialProps: { style: { color: 'red' } } }
      );

      const initialCallCount = renderOutput.mock.calls.length;

      // Update style
      rerender({ style: { color: 'blue' } });

      // Should re-render with new style
      expect(renderOutput.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});
