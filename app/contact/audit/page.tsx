import type { Metadata } from 'next';
import { PublicAuditDiagnostic } from '../../../components/business-audit/PublicAuditDiagnostic';
const title = 'Business audit | assembl';
const description = 'Find one useful improvement. Prepare a high-level business diagnostic, keep your outline or choose an email draft to assembl.';
const url = 'https://www.assembl.co.nz/contact/audit';
export const metadata: Metadata = {
    title: { absolute: title },
    description,
    alternates: { canonical: '/contact/audit' },
    openGraph: { title, description, url, type: 'website', locale: 'en_NZ', siteName: 'assembl' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: false, follow: false }, // Intentional until indexing is independently reviewed.
    referrer: 'no-referrer',
};
/** Public template only. No query inputs, private host context or persistence. */
export default function BusinessAuditPage() { return <PublicAuditDiagnostic />; }
