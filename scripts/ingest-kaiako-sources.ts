/**
 * ingest-kaiako-sources.ts — seed the Alphassembl / Kaiako grounding corpus.
 *
 * Loads a curated set of chunks from three P1 sources into
 * public.alphassembl_knowledge_chunks (created by migration
 * 20260717093500_alphassembl_kaiako_rag.sql). Retrieval is lexical (Postgres
 * FTS via match_alphassembl_knowledge), so no embeddings are generated here.
 *
 * Sources:
 *   - NZ Dog Control Act 1996 (legislation.govt.nz) — Crown copyright, tier A.
 *     Provisions summarised faithfully with their section numbers.
 *   - SPCA NZ advice (spca.nz/advice) — tier A. Guidance paraphrased in plain
 *     words (not copied) so the corpus stays force-free and NZ-first.
 *   - Ian Dunbar, Before/After You Get Your Puppy (dogstardaily.com) — tier A.
 *     The developmental deadlines paraphrased.
 *
 * Run (from the worktree, with .env.local providing SUPABASE creds):
 *   node_modules/.bin/tsx scripts/ingest-kaiako-sources.ts
 *
 * Idempotent: upserts on (source_slug, chunk_index).
 */
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Load .env.local without a dependency (KEY="value" or KEY=value lines).
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');

type Chunk = { source_slug: string; source_name: string; source_url: string; tier: 'A' | 'B' | 'C'; content: string };

const ACT = 'https://www.legislation.govt.nz/act/public/1996/0013/latest/whole.html';
const ACT_NAME = 'Dog Control Act 1996';
const SPCA_NAME = 'SPCA New Zealand — advice';
const SPCA = 'https://www.spca.nz/advice';
const DUNBAR_NAME = 'Ian Dunbar — Before/After You Get Your Puppy';
const DUNBAR = 'https://www.dogstardaily.com/free-downloads';

const CHUNKS: Chunk[] = [
  // ── NZ Dog Control Act 1996 (tier A) ──────────────────────────────────────
  {
    source_slug: 'nz-dog-control-act-1996', source_name: `${ACT_NAME} — s36 registration`, source_url: ACT, tier: 'A',
    content: `Dog Control Act 1996, section 36 — registration. Every dog must be registered by the time it is three months old, and re-registered every year. Registration runs on a dog-registration year beginning 1 July. Owners register with their territorial authority (local council) and pay the annual fee. Keeping an unregistered dog over three months old is an offence. A registered dog must wear its current registration label or disc when in a public place.`,
  },
  {
    source_slug: 'nz-dog-control-act-1996', source_name: `${ACT_NAME} — s36A microchipping`, source_url: ACT, tier: 'A',
    content: `Dog Control Act 1996, section 36A — microchipping. Dogs registered for the first time on or after 1 July 2006 must be implanted with an approved microchip transponder, generally within one month of first registration. Dogs classified as dangerous or menacing must also be microchipped. Working farm dogs (as defined in section 2 and registered as working dogs) are exempt from the microchipping requirement. Microchipping gives a dog permanent identification and helps reunite lost dogs with their owners.`,
  },
  {
    source_slug: 'nz-dog-control-act-1996', source_name: `${ACT_NAME} — s5 & s52A control`, source_url: ACT, tier: 'A',
    content: `Dog Control Act 1996 — owner obligations and control of dogs. Section 5 sets out the obligations of every dog owner: register the dog, keep it under control at all times, provide proper care and attention, food, water and shelter, and take reasonable steps to make sure the dog does not cause a nuisance or injure or endanger anyone. Section 52A makes it an offence to fail to keep a dog under control. Councils set which public places require dogs on a leash and which are off-leash or prohibited; a dog in a public place must be controlled so it does not rush at, attack, or intimidate people or other animals.`,
  },
  {
    source_slug: 'nz-dog-control-act-1996', source_name: `${ACT_NAME} — s31 dangerous dogs`, source_url: ACT, tier: 'A',
    content: `Dog Control Act 1996, section 31 — dangerous dogs. A council must classify a dog as dangerous if the dog has attacked and seriously injured a person or animal, if there is sworn evidence of aggressive behaviour, or if the owner has been convicted of a relevant offence. A dangerous-dog classification carries strict conditions: the dog must be neutered, microchipped, kept in a securely fenced part of the property, and muzzled and leashed in public. Owners may face a higher registration fee and must not let the dog be in a public place unmuzzled.`,
  },
  {
    source_slug: 'nz-dog-control-act-1996', source_name: `${ACT_NAME} — s33A/33C menacing dogs`, source_url: ACT, tier: 'A',
    content: `Dog Control Act 1996, sections 33A and 33C — menacing dogs. A council may classify a dog as menacing if it considers the dog may pose a threat because of observed or reported behaviour (section 33A), or because the dog belongs to one of the breeds or types listed in Schedule 4 (section 33C): the American Pit Bull Terrier, Brazilian Fila, Dogo Argentino, Japanese Tosa, and Perro de Presa Canario. A menacing dog must be muzzled in public and microchipped, and the council may require neutering. Menacing is a lower classification than dangerous but still carries control conditions.`,
  },
  {
    source_slug: 'nz-dog-control-act-1996', source_name: `${ACT_NAME} — attacks & liability`, source_url: ACT, tier: 'A',
    content: `Dog Control Act 1996 — dogs that attack. It is a serious offence for an owner's dog to attack and cause injury; a dog that rushes at or attacks a person or animal can be seized and, in serious cases, a court can order it destroyed. Owners can be fined and are liable for the harm their dog causes. If a dog attacks, keep everyone safe first, seek medical or veterinary help, and report the incident to the local council's animal management team. Prevention — socialisation, training, secure fencing and never leaving dogs unsupervised with children — is the owner's responsibility under section 5.`,
  },

  // ── SPCA NZ advice (tier A) ────────────────────────────────────────────────
  {
    source_slug: 'spca-nz-advice', source_name: `${SPCA_NAME} — puppy biting & mouthing`, source_url: SPCA, tier: 'A',
    content: `SPCA NZ advice — puppy biting and mouthing. Puppies explore the world with their mouths, and mouthing is normal, especially while teething. Teach bite inhibition with force-free methods: when a puppy bites too hard in play, give a brief "time-out" by calmly stopping the game and removing your attention for a few seconds, then resume. Redirect the puppy onto an appropriate chew toy. Never smack, hold the mouth shut, or use an "alpha roll" — punishment increases fear and can make biting worse. Keep sessions short, reward gentle mouth use, and give plenty of chew outlets.`,
  },
  {
    source_slug: 'spca-nz-advice', source_name: `${SPCA_NAME} — socialisation`, source_url: SPCA, tier: 'A',
    content: `SPCA NZ advice — socialising your puppy. Early, positive socialisation is one of the most important things you can do. Introduce your puppy to a wide range of people, gentle dogs, sounds, surfaces and handling in a calm, rewarding way while they are young. Keep every experience positive and let the puppy choose to approach rather than forcing it. Pair new things with treats and praise. Good socialisation builds a confident adult dog and helps prevent fear and reactivity later. Ask your vet about safe socialisation before the full vaccination course is complete.`,
  },
  {
    source_slug: 'spca-nz-advice', source_name: `${SPCA_NAME} — toilet training`, source_url: SPCA, tier: 'A',
    content: `SPCA NZ advice — toilet training. Take your puppy outside often: after waking, after eating or drinking, after play, and every hour or two in between. Choose a toilet spot, wait with the puppy, and reward calmly the moment they finish in the right place. Accidents are part of learning — clean them with an enzyme cleaner and never punish or rub the puppy's nose in it, which only teaches fear. Supervise closely indoors and watch for sniffing or circling. Consistency and reward, not punishment, is what builds a reliably house-trained dog.`,
  },
  {
    source_slug: 'spca-nz-advice', source_name: `${SPCA_NAME} — barking & separation`, source_url: SPCA, tier: 'A',
    content: `SPCA NZ advice — barking and time alone. Dogs bark to communicate — boredom, excitement, alarm, or distress at being left alone. Meet the underlying need: enough exercise and enrichment, a comfortable safe space, and gradual practice being alone starting with very short absences. Reward quiet, calm behaviour rather than telling the dog off, which can add stress. If a dog panics when left alone — destruction, non-stop howling, toileting, or self-injury — that can be separation distress and warrants advice from your vet or a qualified force-free behaviourist rather than being managed alone.`,
  },
  {
    source_slug: 'spca-nz-advice', source_name: `${SPCA_NAME} — force-free training & equipment`, source_url: SPCA, tier: 'A',
    content: `SPCA NZ advice — humane, reward-based training. SPCA recommends positive reinforcement: reward the behaviour you want and manage the environment so the dog is set up to succeed. SPCA opposes aversive equipment and methods — electric shock collars, prong collars, and choke chains — because they cause pain and fear and can worsen behaviour. Use a well-fitted flat collar or a front-clip harness and a standard lead. Reward-based training builds trust and a willing dog; fear-based methods damage the relationship and can trigger aggression.`,
  },
  {
    source_slug: 'spca-nz-advice', source_name: `${SPCA_NAME} — when to seek a professional`, source_url: SPCA, tier: 'A',
    content: `SPCA NZ advice — when behaviour needs a professional. Some behaviour is beyond home training and needs qualified help. See your vet or a certified force-free behaviourist if your dog has bitten and broken skin, shows aggression toward people or other animals, guards food or objects with teeth, has severe or sudden anxiety, or changes behaviour suddenly (which can signal pain or illness). A vet can rule out a medical cause. Getting the right help early is safer for everyone and kinder to the dog than trying to fix serious behaviour alone.`,
  },

  // ── Ian Dunbar — Before/After You Get Your Puppy (tier A) ───────────────────
  {
    source_slug: 'dunbar-puppy', source_name: `${DUNBAR_NAME} — socialisation deadline`, source_url: DUNBAR, tier: 'A',
    content: `Ian Dunbar — the socialisation deadline. Dr Dunbar stresses that the critical window for socialisation closes early: a puppy should meet many different, friendly people and have lots of positive experiences before about three months of age. Every day counts. Make a plan to introduce the puppy to a wide variety of people and gentle experiences, keeping each one rewarding and pressure-free. Early positive exposure is the single best insurance against fearfulness and aggression in the adult dog.`,
  },
  {
    source_slug: 'dunbar-puppy', source_name: `${DUNBAR_NAME} — bite inhibition`, source_url: DUNBAR, tier: 'A',
    content: `Ian Dunbar — bite inhibition is the most important lesson. Dunbar teaches that puppies must learn to control the force of their jaws through gentle play-biting before they lose their puppy teeth. Let the puppy mouth gently, and when a bite is too hard, give a short yelp or calm time-out so the puppy learns that hard bites end the fun. The goal is a soft mouth: an adult dog that has learned bite inhibition is far safer if it is ever startled or hurt. Never punish harshly — that teaches fear, not gentleness.`,
  },
  {
    source_slug: 'dunbar-puppy', source_name: `${DUNBAR_NAME} — chew toys & house-training`, source_url: DUNBAR, tier: 'A',
    content: `Ian Dunbar — chew-toy training and errorless house-training. Dunbar's method channels normal chewing onto stuffed chew toys (for example, a food-stuffed hollow toy) so the puppy learns what to chew and stays happily occupied. The same setup prevents house-training mistakes: use a short-term confinement area with the chew toy and a toilet spot, take the puppy to the right place on a schedule, and reward there. Manage the environment so the puppy rarely gets the chance to make a mistake, and reward the behaviour you want.`,
  },
  {
    source_slug: 'dunbar-puppy', source_name: `${DUNBAR_NAME} — lure-reward & preventing problems`, source_url: DUNBAR, tier: 'A',
    content: `Ian Dunbar — lure-reward training and prevention. Dunbar popularised gentle, off-leash lure-reward training: use a treat to lure the dog into a position (sit, down, come), reward, then fade the lure to a hand signal and word. It is fast, fun and force-free. Dunbar's core message is that prevention is far easier than cure — teach bite inhibition, socialise early, and channel chewing and toileting from day one, rather than trying to fix problems after they take hold.`,
  },
];

async function main() {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  // Number chunks per source for a stable (source_slug, chunk_index) key.
  const perSource: Record<string, number> = {};
  const rows = CHUNKS.map((c) => {
    const idx = (perSource[c.source_slug] = (perSource[c.source_slug] ?? -1) + 1);
    return {
      source_slug: c.source_slug,
      source_name: c.source_name,
      source_url: c.source_url,
      tier: c.tier,
      chunk_index: idx,
      content: c.content,
      content_hash: createHash('sha256').update(c.content).digest('hex').slice(0, 32),
    };
  });

  const { error } = await sb
    .from('alphassembl_knowledge_chunks')
    .upsert(rows, { onConflict: 'source_slug,chunk_index' });
  if (error) {
    console.error('ingest failed:', error.message);
    process.exit(1);
  }

  const { count } = await sb
    .from('alphassembl_knowledge_chunks')
    .select('id', { count: 'exact', head: true });
  console.log(`ingested ${rows.length} chunks; corpus now holds ${count} rows`);
}

main();
