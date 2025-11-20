import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../layout/Container';
import { useState } from 'react';
import { SvgInteractive, parseSVG } from 'svg-interactive';
import { calculatorPreset } from '@examples/01-basic/calculator';

export function Hero() {
  const [_inputValues, setInputValues] = useState<Record<string, string>>({
    a: '5',
    b: '3',
  });

  const { mappings } = parseSVG(calculatorPreset.svgContent, {
    patterns: calculatorPreset.patterns,
  });

  return (
    <section className="relative py-20 md:py-32">
      <Container size="narrow">
        <div className="flex flex-col items-center text-center">
          {/* Hero Text */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Transform any SVG into an{' '}
            <span className="text-gray-600">interactive form</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-600">
            Works with draw.io, Figma, Inkscape, and custom SVGs. No rebuilding layouts, no manual
            positioning. Just parse and render.
          </p>

          {/* Install Command */}
          <div className="mt-8 flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 font-mono text-sm">
            <span className="text-gray-600">$</span>
            <code className="flex-1 bg-transparent">npm install svg-interactive</code>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2"
              onClick={() => {
                navigator.clipboard.writeText('npm install svg-interactive');
              }}
            >
              Copy
            </Button>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/docs">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/playground">
              <Button size="lg" variant="outline">
                Try Playground
              </Button>
            </Link>
          </div>

          {/* Demo */}
          <div className="mt-16 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <p className="mb-4 text-sm font-medium text-gray-600">
              Live demo: Try the calculator
            </p>
            <div className="flex justify-center">
              <SvgInteractive
                mappings={mappings}
                svgContent={calculatorPreset.svgContent}
                onInputChange={(_name, _value, values) => setInputValues(values)}
                onOutputCompute={calculatorPreset.onOutputCompute}
                theme="default"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
