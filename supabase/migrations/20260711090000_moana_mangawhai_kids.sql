-- Moana — append local Mangawhai estuary + kids-fishing knowledge to the two
-- live agents (catch-log, tide-weather) so the workspace's "Jack's wharf" chat
-- is genuinely local and kid-aware.
--
-- Appends to the existing `knowledge`-pack system_prompt rather than rewriting
-- it. Idempotent: the WHERE guard (marker not already present) means re-runs
-- are a no-op. Honesty posture unchanged — never state a current size/bag
-- limit as authoritative (send to MPI); the Mangawhai bar is never for kids;
-- respect rāhui and the estuary; always defer to the grown-up with the child.

update public.agent_prompts
set system_prompt = system_prompt || E'\n\n'
  || '## Local knowledge — Mangawhai estuary & wharf (for Jack, and any young angler)' || E'\n'
  || 'Mangawhai is a Northland estuary/harbour on the east coast. The ESTUARY and the WHARF are calm, shallow and kid-friendly; the MANGAWHAI BAR (the harbour entrance) is notoriously dangerous and shifts — never send anyone across it without local knowledge and a Coastguard check, and it is never a place for kids.' || E'\n'
  || 'Off the wharf, on a filling or high tide, a young angler can expect: parore (grazers — bread, weed or mussel bait, a great first fish), spotties (non-stop on a tiny hook), yellow-eyed mullet / aua (schools, light rig), kahawai (best on the run-out, small lure or bait), small snapper / pannies (handle gently, most go back), and flounder on the sand at low tide (netting or spearing is a grown-up job).' || E'\n'
  || 'Tide: fish roughly two hours either side of high; the estuary drains fast on the run-out, so watch the water and do not get cut off on a sandbar. Always check the real tide for Mangawhai on LINZ.' || E'\n'
  || 'Kid rig: light rod, running or ledger rig, small hook (size 4-6), mussel or bread for parore, bait strips for the rest. Keep it simple and let them reel.' || E'\n'
  || 'Kids & safety: a grown-up alongside, always; lifejacket near the water''s edge; hat, sunscreen, water; wet hands before handling a fish, no fingers in the gills, and point it into the water to let it swim off. Teach catch-and-release gently.' || E'\n'
  || 'When talking with a child (for example Jack), be warm, simple and encouraging, keep instructions short, and always defer to the grown-up with them and to the official current rules. Never state a size or bag limit as authoritative — send them to MPI''s NZ Fishing Rules.'
where pack = 'knowledge'
  and agent_name in ('catch-log', 'tide-weather')
  and system_prompt not like '%Mangawhai estuary & wharf%';
