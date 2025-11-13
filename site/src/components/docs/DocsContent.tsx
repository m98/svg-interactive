import { Book, Code2, FileText, Lightbulb, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

const quickLinks = [
  {
    icon: Book,
    title: 'Complete Documentation',
    description: 'Browse the full documentation on GitHub',
    href: 'https://github.com/m98/svg-interactive#readme',
  },
  {
    icon: Code2,
    title: 'API Reference',
    description: 'Detailed API documentation with examples',
    href: 'https://github.com/m98/svg-interactive/blob/main/docs/api.md',
  },
  {
    icon: FileText,
    title: 'Tool Guides',
    description: 'Step-by-step guides for draw.io, Figma, Inkscape, and more',
    href: 'https://github.com/m98/svg-interactive/blob/main/docs/',
  },
  {
    icon: Wrench,
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    href: 'https://github.com/m98/svg-interactive/blob/main/docs/troubleshooting.md',
  },
];

export function DocsContent() {
  return (
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-4 text-lg text-gray-600">
          Comprehensive guides and API reference for svg-interactive
        </p>
      </div>

      {/* Notice */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-blue-900">
                <strong>Documentation is hosted on GitHub.</strong> Click any link in the sidebar or
                cards below to access detailed guides, API references, and tool-specific
                instructions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="block no-underline"
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-gray-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          );
        })}
      </div>

      {/* Quick Start Preview */}
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Quick Start</h2>
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-100 p-6">
          <div>
            <h3 className="mb-2 font-semibold">1. Install</h3>
            <pre className="rounded-md border border-gray-200 bg-white px-4 py-2 font-mono text-sm">
              npm install svg-interactive
            </pre>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">2. Add IDs to your SVG</h3>
            <p className="text-sm text-gray-600">
              Use prefixes like <code>input-name</code> or <code>output-result</code> in your design
              tool.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">3. Parse and render</h3>
            <pre className="overflow-x-auto rounded-md border border-gray-200 bg-white p-4 font-mono text-xs leading-relaxed">
              {`import { InteractiveSVG, parseSVG } from 'svg-interactive';

const { mappings } = parseSVG(svgContent, {
  patterns: [
    { prefix: 'input-', type: 'input' },
    { prefix: 'output-', type: 'output' }
  ]
});

<InteractiveSVG mappings={mappings} svgContent={svgContent} />`}
            </pre>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          For complete examples and advanced usage, see the{' '}
          <a
            href="https://github.com/m98/svg-interactive#readme"
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-70"
          >
            full documentation on GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
