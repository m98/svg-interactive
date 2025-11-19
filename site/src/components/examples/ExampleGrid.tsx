import { Container } from '../layout/Container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { ExampleCard } from './ExampleCard';
import { exampleGroups } from '@examples/manifest';

export function ExampleGrid() {
  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Examples</h1>
        <p className="mt-4 text-lg text-gray-600">
          Explore interactive examples and see the library in action
        </p>
      </div>

      <Tabs defaultValue={exampleGroups[0]?.id ?? 'basics'}>
        <TabsList className="mb-8">
          {exampleGroups.map((group) => (
            <TabsTrigger key={group.id} value={group.id}>
              {group.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {exampleGroups.map((group) => (
          <TabsContent key={group.id} value={group.id}>
            <div className="mb-6">
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((example) => (
                <ExampleCard key={example.id} example={example} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Container>
  );
}
