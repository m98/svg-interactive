import { Hero } from '../components/home/Hero';
import { FeatureGrid } from '../components/home/FeatureGrid';
import { QuickStart } from '../components/home/QuickStart';
import { ExamplesPreview } from '../components/home/ExamplesPreview';

export function Home() {
  return (
    <div>
      <Hero />
      <FeatureGrid />
      <QuickStart />
      <ExamplesPreview />
    </div>
  );
}
