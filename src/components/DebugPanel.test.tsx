import React from 'react';
import { render, screen } from '@testing-library/react';
import { DebugPanel } from './DebugPanel';
import { DebugInfo, FieldData } from '../types';

describe('DebugPanel', () => {
  const createDebugInfo = (overrides?: Partial<DebugInfo>): DebugInfo => ({
    totalFields: 0,
    inputFields: [],
    outputFields: [],
    rawMappings: [],
    errors: [],
    ...overrides,
  });

  it('should render debug information', () => {
    const debugInfo = createDebugInfo({
      totalFields: 5,
      inputFields: [
        { dataId: 'input:a', name: 'a', elementId: 'el1', type: 'input', bbox: null },
      ] as FieldData[],
      outputFields: [
        { dataId: 'output:b', name: 'b', elementId: 'el2', type: 'output', bbox: null },
        { dataId: 'output:c', name: 'c', elementId: 'el3', type: 'output', bbox: null },
      ] as FieldData[],
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.getByText('Debug Information')).toBeInTheDocument();
    expect(screen.getByText(/Total Fields: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Input Fields: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Output Fields: 2/)).toBeInTheDocument();
  });

  it('should display matching mode for data-id', () => {
    const debugInfo = createDebugInfo({
      matchingMode: 'data-id',
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.getByText('Matching Mode:')).toBeInTheDocument();
    expect(screen.getByText('data-id (draw.io)')).toBeInTheDocument();
  });

  it('should display matching mode for direct-id', () => {
    const debugInfo = createDebugInfo({
      matchingMode: 'direct-id',
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.getByText('Matching Mode:')).toBeInTheDocument();
    expect(screen.getByText('direct-id (custom SVG)')).toBeInTheDocument();
  });

  it('should not display matching mode if not provided', () => {
    const debugInfo = createDebugInfo();

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.queryByText('Matching Mode:')).not.toBeInTheDocument();
  });

  it('should display SVG dimensions', () => {
    const debugInfo = createDebugInfo({
      svgDimensions: { width: 800, height: 600 },
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.getByText(/SVG Dimensions: 800 × 600/)).toBeInTheDocument();
  });

  it('should not display SVG dimensions if not provided', () => {
    const debugInfo = createDebugInfo();

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.queryByText(/SVG Dimensions:/)).not.toBeInTheDocument();
  });

  it('should display errors when present', () => {
    const debugInfo = createDebugInfo({
      errors: ['Error 1: Something went wrong', 'Error 2: Another issue'],
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.getByText('Errors:')).toBeInTheDocument();
    expect(screen.getByText('Error 1: Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error 2: Another issue')).toBeInTheDocument();
  });

  it('should not display errors section if no errors', () => {
    const debugInfo = createDebugInfo({ errors: [] });

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.queryByText('Errors:')).not.toBeInTheDocument();
  });

  it('should render field details in collapsible section', () => {
    const inputField: FieldData = {
      dataId: 'input:username',
      name: 'username',
      elementId: 'el1',
      type: 'input',
      bbox: { x: 10, y: 20, width: 100, height: 30 },
    };

    const outputField: FieldData = {
      dataId: 'output:result',
      name: 'result',
      elementId: 'el2',
      type: 'output',
      bbox: { x: 50, y: 60, width: 120, height: 40 },
    };

    const debugInfo = createDebugInfo({
      inputFields: [inputField],
      outputFields: [outputField],
      rawMappings: [
        { dataId: 'input:username', name: 'username', elementId: 'el1', type: 'input' },
      ],
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    const detailsElement = screen.getByText('View Field Details');
    expect(detailsElement).toBeInTheDocument();

    // Check that the JSON contains expected data
    const preElement = detailsElement.closest('details')?.querySelector('pre');
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toContain('username');
    expect(preElement?.textContent).toContain('result');
  });

  it('should handle empty field arrays', () => {
    const debugInfo = createDebugInfo({
      totalFields: 0,
      inputFields: [],
      outputFields: [],
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    expect(screen.getByText(/Total Fields: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Input Fields: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Output Fields: 0/)).toBeInTheDocument();
  });

  it('should apply correct styling for data-id mode badge', () => {
    const debugInfo = createDebugInfo({
      matchingMode: 'data-id',
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    const badge = screen.getByText('data-id (draw.io)');
    expect(badge).toHaveStyle({
      background: '#DBEAFE',
      padding: '2px 6px',
      borderRadius: '4px',
    });
  });

  it('should apply correct styling for direct-id mode badge', () => {
    const debugInfo = createDebugInfo({
      matchingMode: 'direct-id',
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    const badge = screen.getByText('direct-id (custom SVG)');
    expect(badge).toHaveStyle({
      background: '#D1FAE5',
      padding: '2px 6px',
      borderRadius: '4px',
    });
  });

  it('should render multiple errors in list format', () => {
    const debugInfo = createDebugInfo({
      errors: ['First error', 'Second error', 'Third error'],
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    const errorList = screen.getByText('First error').closest('ul');
    expect(errorList?.children).toHaveLength(3);
  });

  it('should format JSON in field details with proper indentation', () => {
    const debugInfo = createDebugInfo({
      inputFields: [
        { dataId: 'input:test', name: 'test', elementId: 'el1', type: 'input', bbox: null },
      ] as FieldData[],
    });

    render(<DebugPanel debugInfo={debugInfo} />);

    const preElement = screen
      .getByText('View Field Details')
      .closest('details')
      ?.querySelector('pre');
    const jsonContent = preElement?.textContent || '';

    // Check that JSON is formatted (has newlines and indentation)
    expect(jsonContent).toContain('\n');
    expect(jsonContent).toContain('  '); // Should have 2-space indentation
  });
});
