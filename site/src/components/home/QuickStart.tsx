import { Container } from '../layout/Container';
import { CopyButton } from '../ui/CopyButton';

const code = `import { SvgInteractive, parseSVG } from 'svg-interactive';
import 'svg-interactive/styles';

function Calculator() {
  const { mappings } = parseSVG(svgContent, {
    patterns: [
      { prefix: 'input-', type: 'input' },
      { prefix: 'output-', type: 'output' }
    ]
  });

  return (
    <SvgInteractive
      mappings={mappings}
      svgContent={svgContent}
      onOutputCompute={(inputs) => ({
        sum: String(Number(inputs.a) + Number(inputs.b))
      })}
    />
  );
}`;

export function QuickStart() {
  return (
    <section className="border-t border-gray-200 py-20 bg-gray-100">
      <Container size="narrow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Quick Start</h2>
          <p className="mt-4 text-lg text-gray-600">
            Three simple steps to get started
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white font-semibold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold">Install the package</h3>
              <pre className="mt-2 rounded-md border border-gray-200 bg-white px-4 py-2 font-mono text-sm">
                npm install svg-interactive
              </pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white font-semibold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold">Add IDs to your SVG elements</h3>
              <p className="mt-2 text-sm text-gray-600">
                Use prefixes like <code>input-name</code> or <code>output-result</code> in your
                design tool.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white font-semibold text-sm">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Parse and render</h3>
              <div className="relative mt-2">
                <pre className="overflow-x-auto rounded-md border border-gray-200 bg-white p-4 font-mono text-xs leading-relaxed">
                  <code>{code}</code>
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton value={code} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
