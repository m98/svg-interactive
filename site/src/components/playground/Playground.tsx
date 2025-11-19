import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Upload, RotateCcw, Info } from 'lucide-react';
import { InteractiveSVG, parseSVG, type DebugInfo, type FieldPattern, type ThemeType } from 'svg-interactive';
import 'svg-interactive/styles';
import { examples } from '@examples/manifest';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

const themeOptions: ThemeType[] = ['default', 'bordered', 'minimal', 'none'];

interface PlaygroundProps {
  initialExampleId?: string;
}

export function Playground({ initialExampleId }: PlaygroundProps) {
  const firstExample = examples[0];
  if (!firstExample) {
    return <div>No examples available</div>;
  }

  const [selectedExampleId, setSelectedExampleId] = useState(initialExampleId ?? firstExample.id);
  const example = examples.find((ex) => ex.id === selectedExampleId) ?? firstExample;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customSvg, setCustomSvg] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [inputPrefix, setInputPrefix] = useState(() => extractPrefix(example.patterns, 'input'));
  const [outputPrefix, setOutputPrefix] = useState(() => extractPrefix(example.patterns, 'output'));
  const [inputIds, setInputIds] = useState(() => extractIds(example.patterns, 'input'));
  const [outputIds, setOutputIds] = useState(() => extractIds(example.patterns, 'output'));
  const [inputMatchType, setInputMatchType] = useState<'prefix' | 'ids'>(() =>
    detectMatchType(example.patterns, 'input')
  );
  const [outputMatchType, setOutputMatchType] = useState<'prefix' | 'ids'>(() =>
    detectMatchType(example.patterns, 'output')
  );
  const [theme, setTheme] = useState<ThemeType>(example.theme ?? 'default');
  const [debug, setDebug] = useState(example.debug ?? false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    setCustomSvg(null);
    setUploadedName(null);
    setInputPrefix(extractPrefix(example.patterns, 'input'));
    setOutputPrefix(extractPrefix(example.patterns, 'output'));
    setInputIds(extractIds(example.patterns, 'input'));
    setOutputIds(extractIds(example.patterns, 'output'));
    setInputMatchType(detectMatchType(example.patterns, 'input'));
    setOutputMatchType(detectMatchType(example.patterns, 'output'));
    setTheme(example.theme ?? 'default');
    setDebug(example.debug ?? false);
    setInputValues({});
    setDebugInfo(null);
  }, [example]);

  const svgContent = customSvg ?? example.svgContent;

  const derivedPatterns = useMemo<FieldPattern[]>(() => {
    return example.patterns.map((pattern) => {
      // Handle input patterns
      if (pattern.type === 'input') {
        if (inputMatchType === 'ids') {
          const idsArray = inputIds
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
          return { ...pattern, ids: idsArray, prefix: undefined, regex: undefined };
        } else if (pattern.prefix && inputPrefix.trim()) {
          return { ...pattern, prefix: inputPrefix.trim(), ids: undefined };
        }
      }
      // Handle output patterns
      if (pattern.type === 'output') {
        if (outputMatchType === 'ids') {
          const idsArray = outputIds
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
          return { ...pattern, ids: idsArray, prefix: undefined, regex: undefined };
        } else if (pattern.prefix && outputPrefix.trim()) {
          return { ...pattern, prefix: outputPrefix.trim(), ids: undefined };
        }
      }
      return pattern;
    });
  }, [example.patterns, inputPrefix, outputPrefix, inputIds, outputIds, inputMatchType, outputMatchType]);

  const parserResult = useMemo(
    () => parseSVG(svgContent, { patterns: derivedPatterns }),
    [svgContent, derivedPatterns]
  );
  const inputCount = parserResult.mappings.filter((mapping) => mapping.type === 'input').length;
  const outputCount = parserResult.mappings.filter((mapping) => mapping.type === 'output').length;

  const liveOutputs = useMemo(() => {
    if (!example.onOutputCompute) {
      return {};
    }
    return example.onOutputCompute(inputValues);
  }, [example, inputValues]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setCustomSvg(text);
      setUploadedName(file.name);
      setInputValues({});
    };
    reader.readAsText(file);

    event.target.value = '';
  }, []);

  const handleInputChange = useCallback(
    (_name: string, _value: string, values: Record<string, string>) => {
      setInputValues(values);
    },
    []
  );

  const handleReset = useCallback(() => {
    setCustomSvg(null);
    setUploadedName(null);
    setInputValues({});
  }, []);

  const sourceLabel = customSvg ? uploadedName ?? 'Custom SVG' : `${example.title} preset`;

  return (
    <div className="min-h-screen bg-gray-100">
      <Container size="wide" className="py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Playground</h1>
          <p className="mt-2 text-gray-600">
            Inspect and tweak any SVG live. Upload your own or use presets.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Fields Detected</CardDescription>
              <CardTitle className="text-3xl">{parserResult.mappings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Inputs</CardDescription>
              <CardTitle className="text-3xl">{inputCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Outputs</CardDescription>
              <CardTitle className="text-3xl">{outputCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Row 1: Example, Theme, Debug */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Example Select */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Example</label>
                  <Select
                    value={selectedExampleId}
                    onChange={(e) => setSelectedExampleId(e.target.value)}
                  >
                    {examples.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Theme */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Theme</label>
                  <Select value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)}>
                    {themeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Debug Toggle */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Debug Overlay</label>
                  <Button
                    type="button"
                    variant={debug ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setDebug((prev) => !prev)}
                  >
                    {debug ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>

              {/* Row 2: Input Matching */}
              <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-medium">Input Match Type</label>
                  <Select
                    value={inputMatchType}
                    onChange={(e) => setInputMatchType(e.target.value as 'prefix' | 'ids')}
                  >
                    <option value="prefix">Prefix</option>
                    <option value="ids">IDs Array</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {inputMatchType === 'prefix' ? 'Input Prefix' : 'Input IDs (comma-separated)'}
                  </label>
                  {inputMatchType === 'prefix' ? (
                    <input
                      type="text"
                      value={inputPrefix}
                      onChange={(e) => setInputPrefix(e.target.value)}
                      placeholder="input-"
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                      spellCheck={false}
                    />
                  ) : (
                    <input
                      type="text"
                      value={inputIds}
                      onChange={(e) => setInputIds(e.target.value)}
                      placeholder="temp, pressure, volume"
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                      spellCheck={false}
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Output Matching */}
              <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-medium">Output Match Type</label>
                  <Select
                    value={outputMatchType}
                    onChange={(e) => setOutputMatchType(e.target.value as 'prefix' | 'ids')}
                  >
                    <option value="prefix">Prefix</option>
                    <option value="ids">IDs Array</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {outputMatchType === 'prefix'
                      ? 'Output Prefix'
                      : 'Output IDs (comma-separated)'}
                  </label>
                  {outputMatchType === 'prefix' ? (
                    <input
                      type="text"
                      value={outputPrefix}
                      onChange={(e) => setOutputPrefix(e.target.value)}
                      placeholder="output-"
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                      spellCheck={false}
                    />
                  ) : (
                    <input
                      type="text"
                      value={outputIds}
                      onChange={(e) => setOutputIds(e.target.value)}
                      placeholder="result, average, total"
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                      spellCheck={false}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={handleUploadClick}>
                <Upload className="h-4 w-4" />
                Upload SVG
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset to {example.title}
              </Button>
              <span className="flex items-center text-sm text-gray-600">
                Source: {sourceLabel}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,.svg"
              hidden
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>

        {/* Parser Errors */}
        {parserResult.errors.length > 0 && (
          <Card className="mb-6 border-orange-500 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                <Info className="h-5 w-5" />
                Parser Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-orange-800">
                {parserResult.errors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center rounded-md border border-gray-200 bg-white p-8 min-h-[400px]">
                <InteractiveSVG
                  mappings={parserResult.mappings}
                  svgContent={svgContent}
                  defaultInputs={example.defaultInputs}
                  onInputChange={handleInputChange}
                  onOutputCompute={example.onOutputCompute}
                  theme={theme}
                  debug={debug}
                  onDebugInfo={setDebugInfo}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inspector */}
          <div className="space-y-6">
            {/* Live Values */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Inputs</h4>
                  {Object.keys(inputValues).length === 0 ? (
                    <p className="text-sm text-gray-600">
                      Interact with the SVG to populate values.
                    </p>
                  ) : (
                    <dl className="space-y-2">
                      {Object.entries(inputValues).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b border-gray-200 pb-1"
                        >
                          <dt className="text-sm text-gray-600">{key}</dt>
                          <dd className="text-sm font-medium">{value || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Outputs</h4>
                  {Object.keys(liveOutputs).length === 0 ? (
                    <p className="text-sm text-gray-600">
                      Outputs compute automatically once mapped.
                    </p>
                  ) : (
                    <dl className="space-y-2">
                      {Object.entries(liveOutputs).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b border-gray-200 pb-1"
                        >
                          <dt className="text-sm text-gray-600">{key}</dt>
                          <dd className="text-sm font-medium">{value || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Debug Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Debug Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo ? (
                  <dl className="space-y-2">
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <dt className="text-sm text-gray-600">SVG Size</dt>
                      <dd className="text-sm font-medium">
                        {debugInfo.svgDimensions
                          ? `${debugInfo.svgDimensions.width} × ${debugInfo.svgDimensions.height}`
                          : 'auto'}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <dt className="text-sm text-gray-600">Inputs</dt>
                      <dd className="text-sm font-medium">{debugInfo.inputFields.length}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <dt className="text-sm text-gray-600">Outputs</dt>
                      <dd className="text-sm font-medium">{debugInfo.outputFields.length}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-600">
                    Enable debug to inspect bounding boxes & overlays.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

function extractPrefix(patterns: FieldPattern[], type: FieldPattern['type']) {
  const pattern = patterns.find((entry) => entry.type === type && typeof entry.prefix === 'string');
  if (pattern && pattern.prefix) {
    return pattern.prefix;
  }
  return type === 'input' ? 'input-' : 'output-';
}

function extractIds(patterns: FieldPattern[], type: FieldPattern['type']) {
  const pattern = patterns.find((entry) => entry.type === type && Array.isArray(entry.ids));
  if (pattern && pattern.ids) {
    return pattern.ids.join(', ');
  }
  return '';
}

function detectMatchType(
  patterns: FieldPattern[],
  type: FieldPattern['type']
): 'prefix' | 'ids' {
  const pattern = patterns.find((entry) => entry.type === type);
  if (pattern && Array.isArray(pattern.ids) && pattern.ids.length > 0) {
    return 'ids';
  }
  return 'prefix';
}
