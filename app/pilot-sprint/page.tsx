import { permanentRedirect } from 'next/navigation';

/** Retired public entry point. Preserve saved links without rendering legacy offers. */
export default function RetiredPage() {
  permanentRedirect('/pricing');
}
