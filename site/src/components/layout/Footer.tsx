import { Container } from './Container';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 py-12">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">svg-interactive</h3>
            <p className="text-sm text-gray-600">
              Transform any SVG diagram into an interactive form with embedded input/output fields.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="https://github.com/m98/svg-interactive"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-900 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/svg-interactive"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-900 transition-colors"
                >
                  npm Package
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/m98/svg-interactive/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-900 transition-colors"
                >
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="https://github.com/m98/svg-interactive/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-900 transition-colors"
                >
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>
            Built with{' '}
            <a
              href="https://react.dev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              React
            </a>
            {' and '}
            <a
              href="https://vitejs.dev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Vite
            </a>
            .
          </p>
        </div>
      </Container>
    </footer>
  );
}
