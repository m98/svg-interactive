import { useState, useEffect } from 'react';
import { FieldConfig, FieldMapping } from '../types';
import { parseSVGContent } from '../utils/svgParser';

export interface UseSVGParserOptions {
  svgUrl?: string;
  svgContent?: string;
  config: FieldConfig;
}

export interface UseSVGParserResult {
  mappings: FieldMapping[];
  svgText: string | null;
  isLoading: boolean;
  errors: string[];
  detectedMode?: 'data-id' | 'direct-id';
}

/**
 * Hook to load and parse SVG content
 * @param options - SVG source and configuration
 * @returns Parsed field mappings and SVG text
 */
export function useSVGParser({
  svgUrl,
  svgContent,
  config,
}: UseSVGParserOptions): UseSVGParserResult {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [svgText, setSvgText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [detectedMode, setDetectedMode] = useState<'data-id' | 'direct-id'>();

  useEffect(() => {
    const loadAndParse = async () => {
      setIsLoading(true);
      setErrors([]);

      try {
        let content: string;

        if (svgContent) {
          content = svgContent;
        } else if (svgUrl) {
          const response = await fetch(svgUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.statusText}`);
          }
          content = await response.text();
        } else {
          setErrors(['Either svgUrl or svgContent must be provided']);
          setIsLoading(false);
          return;
        }

        setSvgText(content);

        const result = parseSVGContent(content, config);
        setMappings(result.mappings);
        setDetectedMode(result.detectedMode);

        if (result.errors.length > 0) {
          setErrors(result.errors);
        }
      } catch (error) {
        setErrors([error instanceof Error ? error.message : 'Unknown error occurred']);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAndParse();
  }, [svgUrl, svgContent, config]);

  const result: UseSVGParserResult = {
    mappings,
    svgText,
    isLoading,
    errors,
  };

  if (detectedMode) {
    result.detectedMode = detectedMode;
  }

  return result;
}
