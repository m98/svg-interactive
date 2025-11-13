import { Container } from '../components/layout/Container';
import { DocsSidebar } from '../components/docs/DocsSidebar';
import { DocsContent } from '../components/docs/DocsContent';

export function Docs() {
  return (
    <div className="py-8">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row">
          <DocsSidebar />
          <DocsContent />
        </div>
      </Container>
    </div>
  );
}
