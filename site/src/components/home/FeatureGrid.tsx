import { Layers, Code2, Shield, Palette } from 'lucide-react';
import { Container } from '../layout/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

const features = [
  {
    icon: Layers,
    title: 'Universal SVG Support',
    description:
      'Works with draw.io, Figma, Inkscape, Illustrator, and hand-coded SVGs. No vendor lock-in.',
  },
  {
    icon: Code2,
    title: '5-Minute Setup',
    description: 'Parse SVG → Render component → Done. Zero configuration required to get started.',
  },
  {
    icon: Shield,
    title: '100% Type-Safe',
    description: 'Full TypeScript support with strict mode enabled. Comprehensive type definitions.',
  },
  {
    icon: Palette,
    title: 'Fully Customizable',
    description:
      'Custom renderers, themes, and patterns. Built-in themes or bring your own components.',
  },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-gray-200 py-20">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Why svg-interactive?</h2>
          <p className="mt-4 text-lg text-gray-600">
            Built for developers who need interactive diagrams without the complexity
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-gray-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
