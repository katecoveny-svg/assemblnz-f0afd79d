import { Suspense } from 'react';
import Enquiries from './Enquiries';
export const metadata = { title: 'DO Enquiries — assembl', description: 'Enquiry, approved reply, and a clear record of what happened.' };
export default function Page() { return <Suspense><Enquiries /></Suspense>; }
