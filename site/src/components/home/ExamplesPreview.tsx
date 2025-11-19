import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { exampleGroups } from '@examples/manifest';

export function ExamplesPreview() {
  // Get first 3 examples
  const previewExamples = exampleGroups.flatMap((group) => group.items).slice(0, 3);

  return (
    <section className="border-t border-gray-200 py-20">
      <Container>
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Examples</h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore interactive examples and see the library in action
            </p>
          </div>
          <Link to="/examples">
            <Button variant="outline" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {previewExamples.map((example) => {
            const ExampleComponent = example.Component;
            return (
              <Link key={example.id} to={`/playground?example=${example.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{example.title}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {example.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center rounded-md border border-gray-200 bg-gray-100 p-6 pointer-events-none">
                      <ExampleComponent />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
