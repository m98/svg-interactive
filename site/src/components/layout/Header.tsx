import { Link, NavLink } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from './Container';
import { cn } from '../../lib/utils';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold no-underline">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>svg-interactive</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <NavLink
              to="/examples"
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:opacity-70 no-underline',
                  isActive ? 'text-gray-900' : 'text-gray-600'
                )
              }
            >
              Examples
            </NavLink>
            <NavLink
              to="/playground"
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:opacity-70 no-underline',
                  isActive ? 'text-gray-900' : 'text-gray-600'
                )
              }
            >
              Playground
            </NavLink>
            <NavLink
              to="/docs"
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:opacity-70 no-underline',
                  isActive ? 'text-gray-900' : 'text-gray-600'
                )
              }
            >
              Docs
            </NavLink>
            <a
              href="https://github.com/m98/svg-interactive"
              target="_blank"
              rel="noreferrer"
              className="no-underline"
            >
              <Button variant="ghost" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
          </nav>
        </div>
      </Container>
    </header>
  );
}
