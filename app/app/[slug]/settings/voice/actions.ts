'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

type VoiceCompression = {
  summary: string;
  facts: Array<{ key: string; value: string; confidence: number }>;
  decisions?: string[];
  pending_actions?: string[];
};

export async function trainVoiceProfileAction(slug: string, formData: FormData) {
  const { tenant, userId, service } = await requireTenantAccess(slug);
  const files = formData
    .getAll('examples')
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (files.length < 5 || files.length > 10) {
    redirect(`/app/${slug}/settings/voice?error=${encodeURIComponent('Upload 5-10 example emails.')}`);
  }

  const examples = await Promise.all(files.map(readExampleFile));
  const compression = await compressVoiceExamples(examples);
  const profile = buildVoiceProfile(compression, examples);

  await service.from('business_memory').insert({
    user_id: userId,
    tenant_id: tenant.id,
    category: 'voice_profile',
    tags: ['operator_voice', 'industry_pack'],
    content: profile.content,
    metadata: {
      ...profile.metadata,
      tenant_slug: tenant.slug,
      example_count: examples.length,
      source_files: files.map((file) => file.name),
      trained_at: new Date().toISOString(),
    },
    relevance_score: 0.95,
  });

  redirect(`/app/${slug}/settings/voice?saved=1`);
}

async function requireTenantAccess(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/app/${slug}/settings/voice`)}`);

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) throw new Error('Tenant not found.');

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenant.id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);

  if (!member && !admin) throw new Error('You do not have access to this tenant.');

  return { tenant: tenant as Tenant, userId: user.id, service };
}

async function readExampleFile(file: File) {
  const text = await file.text();
  return text.trim().slice(0, 8000);
}

async function compressVoiceExamples(examples: string[]): Promise<VoiceCompression> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return fallbackCompression(examples);

  try {
    const response = await fetch(`${url}/functions/v1/compress-context`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        agentId: 'operator-voice-profile',
        messages: examples.map((content, index) => ({
          role: 'operator',
          content: `Example email ${index + 1}:\n${content}`,
        })),
      }),
    });

    if (!response.ok) return fallbackCompression(examples);
    return (await response.json()) as VoiceCompression;
  } catch {
    return fallbackCompression(examples);
  }
}

function buildVoiceProfile(compression: VoiceCompression, examples: string[]) {
  const facts = compression.facts ?? [];
  const tone = facts
    .filter((fact) => fact.key.includes('tone') || fact.key.includes('preference'))
    .map((fact) => fact.value)
    .slice(0, 6);
  const signoffs = examples
    .map((example) => example.split('\n').map((line) => line.trim()).filter(Boolean).slice(-2).join(' '))
    .filter(Boolean)
    .slice(0, 5);

  return {
    content: compression.summary || fallbackSummary(examples),
    metadata: {
      tone,
      vocabulary: facts
        .filter((fact) => fact.key.includes('vocabulary') || fact.key.includes('phrase'))
        .map((fact) => fact.value)
        .slice(0, 12),
      signoffs,
      facts,
      decisions: compression.decisions ?? [],
    },
  };
}

function fallbackCompression(examples: string[]): VoiceCompression {
  return {
    summary: fallbackSummary(examples),
    facts: [
      {
        key: 'preference.tone',
        value: 'Use plain NZ business English, keep messages concise, and preserve the operator sign-off style.',
        confidence: 0.65,
      },
    ],
    decisions: [],
    pending_actions: [],
  };
}

function fallbackSummary(examples: string[]) {
  const averageLength = Math.round(
    examples.reduce((total, example) => total + example.length, 0) / Math.max(1, examples.length),
  );
  return `Voice profile generated from ${examples.length} operator emails. Average example length ${averageLength} characters.`;
}
