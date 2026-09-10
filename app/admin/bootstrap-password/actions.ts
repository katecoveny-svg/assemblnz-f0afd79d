'use server';

import {
  bootstrapFounderPassword,
  type BootstrapPasswordResult,
} from '@/lib/admin/bootstrap-password';

/**
 * Founder password bootstrap — see lib/admin/bootstrap-password.ts.
 * Outside the (hub) gate so it can run before Kate can sign in.
 */
export async function bootstrapFounderPasswordAction(
  _prev: BootstrapPasswordResult | null,
  formData: FormData,
): Promise<BootstrapPasswordResult> {
  const secret = formData.get('secret');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirm = formData.get('confirm');

  return bootstrapFounderPassword({
    secret: typeof secret === 'string' ? secret : '',
    email: typeof email === 'string' ? email : '',
    password: typeof password === 'string' ? password : '',
    confirm: typeof confirm === 'string' ? confirm : '',
  });
}
