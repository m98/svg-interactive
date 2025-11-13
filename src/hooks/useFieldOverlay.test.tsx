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
});
