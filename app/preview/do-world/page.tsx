import type { Metadata } from 'next';
import World from './World';
export const metadata: Metadata = { title: { absolute: 'assembl · World study' }, robots: { index: false, follow: false } };
export default function Page() { return <World />; }
