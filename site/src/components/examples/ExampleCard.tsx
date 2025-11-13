import { Badge } from '../ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import type { ExampleEntry } from '@examples/manifest';

interface ExampleCardProps {
  example: ExampleEntry;
  onClick: () => void;
}

export function ExampleCard({ example, onClick }: ExampleCardProps) {
  const ExampleComponent = example.Component;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-lg">{example.title}</CardTitle>
        <CardDescription>{example.description}</CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          {example.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center rounded-md border border-gray-200 bg-gray-100 p-6 min-h-[200px]">
          <ExampleComponent />
        </div>
      </CardContent>
    </Card>
  );
}
