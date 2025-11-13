import { Image, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { CopyButton } from '../ui/CopyButton';
import type { ExampleEntry } from '@examples/manifest';

interface CodeViewerProps {
  example: ExampleEntry;
}

export function CodeViewer({ example }: CodeViewerProps) {
  // For now, show configuration - in future could show actual TSX source
  const configCode = JSON.stringify(
    {
      patterns: example.patterns,
      theme: example.theme,
      debug: example.debug,
      defaultInputs: example.defaultInputs,
    },
    null,
    2
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Tabs defaultValue="svg">
        <div className="border-b border-gray-200 px-4 py-2">
          <TabsList>
            <TabsTrigger value="svg">
              <Image className="h-4 w-4" />
              SVG
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="svg" className="p-0">
          <div className="relative">
            <pre className="overflow-x-auto p-4 text-xs">
              <code>{example.svgContent}</code>
            </pre>
            <div className="absolute right-2 top-2">
              <CopyButton value={example.svgContent} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="p-0">
          <div className="relative">
            <pre className="overflow-x-auto p-4 text-xs">
              <code>{configCode}</code>
            </pre>
            <div className="absolute right-2 top-2">
              <CopyButton value={configCode} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
