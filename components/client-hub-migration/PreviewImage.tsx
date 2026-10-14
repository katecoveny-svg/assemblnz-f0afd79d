import type { ComponentProps } from 'react';

// These original editor previews include user-supplied blob/data URLs and
// canvas media with dimensions established by the original CSS. Keep direct
// browser decoding; do not send private previews to an optimisation endpoint.
export default function PreviewImage(props: ComponentProps<'img'>) {
  // eslint-disable-next-line @next/next/no-img-element -- intentionally local/private editor preview; preserve intrinsic sizing and canvas decoding
  return <img {...props} alt={props.alt || ''} />;
}
