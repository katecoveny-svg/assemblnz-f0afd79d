import { redirect } from 'next/navigation';

/**
 * Partner / Task DO Maker is not a public product door (Kate lock 2026-09-17).
 * Mode A/B · bp Road-Ready stays out of public nav and primary CTAs.
 */
export default function TaskDoMakerPage() {
  redirect('/creative-studio');
}
