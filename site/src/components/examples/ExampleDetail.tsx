import { X, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CodeViewer } from './CodeViewer';
import type { ExampleEntry } from '@examples/manifest';
import { Link } from 'react-router-dom';

interface ExampleDetailProps {
  example: ExampleEntry;
  onClose: () => void;
}

export function ExampleDetail({ example, onClose }: ExampleDetailProps) {
  const ExampleComponent = example.Component;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/80 backdrop-blur-sm">
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-6xl rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 p-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{example.title}</h2>
              <p className="mt-2 text-gray-600">{example.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {example.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            {/* Live Demo */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                Live Demo
              </h3>
              <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 p-8 min-h-[300px]">
                <ExampleComponent />
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/playground?example=${example.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open in Playground
                  </Button>
                </Link>
              </div>
            </div>

            {/* Code */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                Code
              </h3>
              <CodeViewer example={example} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
