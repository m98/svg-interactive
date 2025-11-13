import { useSearchParams } from 'react-router-dom';
import { Playground as PlaygroundComponent } from '../components/playground/Playground';

export function Playground() {
  const [searchParams] = useSearchParams();
  const exampleId = searchParams.get('example');

  return <PlaygroundComponent initialExampleId={exampleId ?? undefined} />;
}
