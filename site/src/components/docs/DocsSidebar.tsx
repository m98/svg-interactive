import { ExternalLink } from 'lucide-react';

interface DocsSection {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

const docsSections: DocsSection[] = [
  {
    title: 'Getting Started',
    links: [
      { label: 'Introduction', href: 'https://github.com/m98/svg-interactive#readme' },
      { label: 'Quick Start', href: 'https://github.com/m98/svg-interactive#quick-start' },
      { label: 'How It Works', href: 'https://github.com/m98/svg-interactive#how-it-works' },
    ],
  },
  {
    title: 'Core Concepts',
    links: [
      { label: 'Field Matching', href: 'https://github.com/m98/svg-interactive#flexible-field-matching' },
      { label: 'Themes', href: 'https://github.com/m98/svg-interactive#styling' },
      { label: 'Debug Mode', href: 'https://github.com/m98/svg-interactive#debug-mode' },
    ],
  },
  {
    title: 'API Reference',
    links: [
      { label: 'Complete API', href: 'https://github.com/m98/svg-interactive/blob/main/docs/api.md' },
      { label: 'parseSVG()', href: 'https://github.com/m98/svg-interactive/blob/main/docs/api.md#parsesvg' },
      { label: 'InteractiveSVG', href: 'https://github.com/m98/svg-interactive/blob/main/docs/api.md#interactivesvg-component' },
      { label: 'TypeScript Types', href: 'https://github.com/m98/svg-interactive/blob/main/docs/api.md#typescript-types' },
    ],
  },
  {
    title: 'Tool Guides',
    links: [
      { label: 'draw.io', href: 'https://github.com/m98/svg-interactive/blob/main/docs/draw-io.md' },
      { label: 'Figma', href: 'https://github.com/m98/svg-interactive/blob/main/docs/figma.md' },
      { label: 'Inkscape', href: 'https://github.com/m98/svg-interactive/blob/main/docs/inkscape.md' },
      { label: 'Illustrator', href: 'https://github.com/m98/svg-interactive/blob/main/docs/illustrator.md' },
      { label: 'Hand-Coded SVG', href: 'https://github.com/m98/svg-interactive/blob/main/docs/hand-coded.md' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Troubleshooting', href: 'https://github.com/m98/svg-interactive/blob/main/docs/troubleshooting.md' },
      { label: 'GitHub Issues', href: 'https://github.com/m98/svg-interactive/issues' },
    ],
  },
];

export function DocsSidebar() {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="sticky top-20 space-y-6">
        {docsSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-600">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-900 hover:opacity-70 transition-opacity"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
