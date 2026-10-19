import type { Metadata } from 'next';
import ConfiguratorPreview from './ConfiguratorPreview';

export const metadata: Metadata = {
  title: 'Assembl Living · Concept configurator preview',
  robots: { index: false, follow: false },
};

export default function ConfiguratorPreviewPage() {
  return <ConfiguratorPreview />;
}
