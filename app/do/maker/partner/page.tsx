import { redirect } from 'next/navigation';

/** Partner maker index is not a public door (Kate lock 2026-09-17). */
export default function PartnerDoMakerIndexPage() {
  redirect('/creative-studio');
}
