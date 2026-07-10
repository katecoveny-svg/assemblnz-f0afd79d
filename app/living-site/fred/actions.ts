'use server';

import { storeEnquiry } from '@/lib/customers/auckland-dog-trainer/genome-store';

export type EnquiryState = {
  status: 'idle' | 'sent' | 'error';
  message?: string;
};

/**
 * Public enquiry from Fred's landing page → living_site_enquiries.
 * Draft-only story: nothing emails Fred's clients — the enquiry just lands
 * on his desk, where the intake agent drafts a reply for his approval.
 */
export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // Honeypot — bots fill every field; humans never see this one.
  if (String(formData.get('website') ?? '').trim() !== '') {
    return { status: 'sent' };
  }

  const name = String(formData.get('name') ?? '').trim().slice(0, 120);
  const email = String(formData.get('email') ?? '').trim().slice(0, 200);
  const dog = String(formData.get('dog') ?? '').trim().slice(0, 120);
  const message = String(formData.get('message') ?? '').trim().slice(0, 2000);

  if (!name || !email.includes('@') || !message) {
    return {
      status: 'error',
      message: 'Your name, a working email, and a line about your dog are all we need.',
    };
  }

  const ok = await storeEnquiry({ name, email, dog: dog || undefined, message });
  if (!ok) {
    return {
      status: 'error',
      message: 'The desk is unreachable right now — please try again in a minute.',
    };
  }
  return { status: 'sent' };
}
