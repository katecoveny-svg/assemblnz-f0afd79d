-- REVIEW ONLY. Separate from frozen draft schema. No application authorized.
-- Requires reviewed owner draft schema, including extensions.pg_jsonschema.
begin;
create table public.studio_owner_run_policies (
 owner_user_id uuid not null references auth.users(id),
 policy_id text not null check(length(policy_id) between 1 and 100),
 policy jsonb not null check(extensions.jsonb_matches_schema($policy${"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"id":{"type":"string","minLength":1,"maxLength":100},"ownerId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"expiresAt":{"type":"string","format":"date-time","pattern":"^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"},"maxRuns":{"type":"number","const":1},"provider":{"type":"string","enum":["openai","anthropic"]},"accountRef":{"type":"string","minLength":1,"maxLength":100},"model":{"type":"string","minLength":1,"maxLength":100},"pricingVersion":{"type":"string","minLength":1,"maxLength":100},"maxCalls":{"type":"integer","minimum":1,"maximum":10},"maxInputTokens":{"type":"integer","minimum":1,"maximum":200000},"maxOutputTokens":{"type":"integer","minimum":1,"maximum":6000},"maxUsdMicros":{"type":"integer","minimum":1,"maximum":10000000},"inputUsdMicrosPerMillion":{"type":"integer","minimum":0,"maximum":1000000000},"outputUsdMicrosPerMillion":{"type":"integer","minimum":0,"maximum":1000000000},"tools":{"type":"boolean","const":false},"cache":{"type":"boolean","const":false},"retries":{"type":"number","const":0},"repairs":{"type":"number","const":0}},"required":["id","ownerId","expiresAt","maxRuns","provider","accountRef","model","pricingVersion","maxCalls","maxInputTokens","maxOutputTokens","maxUsdMicros","inputUsdMicrosPerMillion","outputUsdMicrosPerMillion","tools","cache","retries","repairs"],"additionalProperties":false}$policy$::json,policy)),
 primary key(owner_user_id,policy_id),
 check(policy->>'id'=policy_id and policy->>'ownerId'=owner_user_id::text),
 check(policy->>'maxRuns'='1' and policy->>'tools'='false' and policy->>'cache'='false' and policy->>'retries'='0' and policy->>'repairs'='0'),
 check((policy->>'maxCalls')::integer between 1 and 10),
 check((policy->>'maxInputTokens')::integer between 1 and 200000),
 check((policy->>'maxOutputTokens')::integer between 1 and 6000),
 check((policy->>'maxUsdMicros')::bigint between 1 and 10000000),
 check((policy->>'inputUsdMicrosPerMillion')::bigint between 0 and 1000000000),
 check((policy->>'outputUsdMicrosPerMillion')::bigint between 0 and 1000000000),
 check(policy ?& array['id','ownerId','expiresAt','maxRuns','provider','accountRef','model','pricingVersion','maxCalls','maxInputTokens','maxOutputTokens','maxUsdMicros','inputUsdMicrosPerMillion','outputUsdMicrosPerMillion','tools','cache','retries','repairs']),
 check(policy->>'provider' in ('openai','anthropic')),
 check(length(policy->>'accountRef') between 1 and 100 and length(policy->>'model') between 1 and 100 and length(policy->>'pricingVersion') between 1 and 100)
);
create table public.studio_owner_runs (
 owner_user_id uuid not null,
 run_id uuid not null,
 policy_id text not null,
 receipt jsonb not null,
 primary key(owner_user_id,run_id),
 unique(owner_user_id,policy_id), -- One approved policy cannot fund unlimited runs.
 foreign key(owner_user_id,policy_id) references public.studio_owner_run_policies(owner_user_id,policy_id),
 check(octet_length(receipt::text)<=150000)
);
alter table public.studio_owner_run_policies enable row level security;
alter table public.studio_owner_runs enable row level security;
revoke all on public.studio_owner_run_policies,public.studio_owner_runs from public,anon,authenticated,service_role;
grant select on public.studio_owner_runs to authenticated;
create policy studio_owner_run_read on public.studio_owner_runs for select to authenticated using (
 owner_user_id=(select auth.uid()) and coalesce((select auth.jwt())->>'is_anonymous','false')<>'true'
 and exists(select 1 from public.studio_owner_access a where a.owner_user_id=(select auth.uid()) and a.enabled)
);

-- Only trusted server service_role can call. The server MUST derive p_owner
-- from verified ownerSession; clients never receive this credential/permission.
-- No grant permitting authenticated mutation or caller-approved policies.
create function public.studio_owner_run_command(p_owner uuid,p_command text,p_input jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 r jsonb; pol jsonb; c jsonb; claims jsonb; rid uuid; aid uuid; cid uuid;
 idx integer; rev bigint; reserve bigint; numerator numeric; actual bigint;
 state text; complete boolean; input_tokens bigint; output_tokens bigint;
begin
 perform 1 from public.studio_owner_access where owner_user_id=p_owner and enabled for share;
 if not found then raise exception 'run_owner_denied' using errcode='42501';end if;
 if jsonb_typeof(p_input)<>'object' then raise exception 'run_input_invalid';end if;
  case p_command
 when 'create' then if not extensions.jsonb_matches_schema($create${"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"runId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"inputFingerprint":{"type":"string","pattern":"^[a-f0-9]{64}$"},"selectedSourceReceipts":{"maxItems":40,"type":"array","items":{"type":"object","properties":{"id":{"type":"string","minLength":1,"maxLength":100},"sha256":{"type":"string","pattern":"^[a-f0-9]{64}$"},"scope":{"type":"string","enum":["public","owner-selected"]},"checkedAt":{"type":"string","format":"date-time","pattern":"^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"}},"required":["id","sha256","scope","checkedAt"],"additionalProperties":false}},"policyId":{"type":"string","minLength":1,"maxLength":100}},"required":["runId","inputFingerprint","selectedSourceReceipts","policyId"],"additionalProperties":false}$create$::json,p_input) then raise exception 'run_input_invalid';end if;
 when 'claim' then if not extensions.jsonb_matches_schema($claim${"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"runId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"actionId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"action":{"type":"string","enum":["develop","build"]},"inputFingerprint":{"type":"string","pattern":"^[a-f0-9]{64}$"},"expectedRevision":{"type":"integer","minimum":0,"maximum":9007199254740991}},"required":["runId","actionId","action","inputFingerprint","expectedRevision"],"additionalProperties":false}$claim$::json,p_input) then raise exception 'run_input_invalid';end if;
 when 'start' then if not extensions.jsonb_matches_schema($start${"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"runId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"claimId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"expectedRevision":{"type":"integer","minimum":0,"maximum":9007199254740991}},"required":["runId","claimId","expectedRevision"],"additionalProperties":false}$start$::json,p_input) then raise exception 'run_input_invalid';end if;
 when 'outcome' then if not extensions.jsonb_matches_schema($outcome${"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"runId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"claimId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"},"expectedRevision":{"type":"integer","minimum":0,"maximum":9007199254740991},"status":{"type":"string","enum":["complete","failed","usage-unverified"]},"providerRequestId":{"type":"string","minLength":1,"maxLength":200},"usage":{"type":"object","properties":{"inputTokens":{"type":"integer","minimum":0,"maximum":1000000},"outputTokens":{"type":"integer","minimum":0,"maximum":1000000},"cacheTokens":{"type":"number","const":0},"toolCalls":{"type":"number","const":0}},"required":["inputTokens","outputTokens","cacheTokens","toolCalls"],"additionalProperties":false},"validatedOutputFingerprint":{"type":"string","pattern":"^[a-f0-9]{64}$"},"providerEvidence":{"type":"object","properties":{"provider":{"type":"string","enum":["openai","anthropic"]},"model":{"type":"string","minLength":1,"maxLength":100},"accountRef":{"type":"string","minLength":1,"maxLength":100}},"required":["provider","model","accountRef"],"additionalProperties":false}},"required":["runId","claimId","expectedRevision","status"],"additionalProperties":false}$outcome$::json,p_input) then raise exception 'run_input_invalid';end if;
 when 'lookup' then if not extensions.jsonb_matches_schema($lookup${"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"runId":{"type":"string","format":"uuid","pattern":"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"}},"required":["runId"],"additionalProperties":false}$lookup$::json,p_input) then raise exception 'run_input_invalid';end if;
 else raise exception 'run_command_invalid';end case;
 rid:=(p_input->>'runId')::uuid;
 if rid is null then raise exception 'run_input_invalid';end if;
 if p_command='create' then
  -- Policy row lock serializes competing run IDs for the same approval.
  select policy into pol from public.studio_owner_run_policies where owner_user_id=p_owner and policy_id=p_input->>'policyId' for update;
  if pol is null then raise exception 'run_policy_denied';end if;
  select receipt into r from public.studio_owner_runs where owner_user_id=p_owner and run_id=rid for update;
  if r is not null then
   if r->>'inputFingerprint'<>p_input->>'inputFingerprint' or r->'policy'->>'id'<>p_input->>'policyId' or r->'selectedSourceReceipts' is distinct from p_input->'selectedSourceReceipts' then raise exception 'run_input_conflict';end if;
   return r;
  end if;
  if (pol->>'expiresAt')::timestamptz<=clock_timestamp() then raise exception 'run_policy_expired';end if;
  if exists(select 1 from public.studio_owner_runs where owner_user_id=p_owner and policy_id=p_input->>'policyId') then raise exception 'run_policy_already_used';end if;
  if p_input->>'inputFingerprint' !~ '^[a-f0-9]{64}$' or p_input->>'inputFingerprint' is null or jsonb_typeof(p_input->'selectedSourceReceipts') is distinct from 'array' or jsonb_array_length(p_input->'selectedSourceReceipts')>40 then raise exception 'run_input_invalid';end if;
  numerator:=(pol->>'maxInputTokens')::numeric*(pol->>'inputUsdMicrosPerMillion')::numeric+(pol->>'maxOutputTokens')::numeric*(pol->>'outputUsdMicrosPerMillion')::numeric;
  reserve:=ceil(numerator/1000000)::bigint;
  if reserve>(pol->>'maxUsdMicros')::bigint then raise exception 'run_budget_exceeded';end if;
  r:=jsonb_build_object('runId',rid,'ownerId',p_owner,'inputFingerprint',p_input->>'inputFingerprint','policy',pol,'selectedSourceReceipts',p_input->'selectedSourceReceipts','revision',0,'reservedUsdMicros',0,'claims','[]'::jsonb);
  insert into public.studio_owner_runs values(p_owner,rid,p_input->>'policyId',r);return r;
 end if;
 select receipt into r from public.studio_owner_runs where owner_user_id=p_owner and run_id=rid for update;
 if r is null then raise exception 'run_unavailable';end if;
 if p_command='lookup' then return r;end if;
 pol:=r->'policy';claims:=r->'claims';rev:=(r->>'revision')::bigint;
 if p_command='claim' then
  aid:=(p_input->>'actionId')::uuid;
  if aid is null or p_input->>'action' not in ('develop','build') or p_input->>'action' is null or p_input->>'inputFingerprint' is distinct from r->>'inputFingerprint' then raise exception 'run_input_conflict';end if;
  select value into c from jsonb_array_elements(claims) where value->>'actionId'=aid::text;
  if c is not null then
   if c->>'action'<>p_input->>'action' then raise exception 'run_input_conflict';end if;
   return jsonb_build_object('kind','existing','receipt',r);
  end if;
 end if;
 if (p_input->>'expectedRevision')::bigint is distinct from rev then raise exception 'run_revision_conflict';end if;
 if p_command in ('claim','start') and (pol->>'expiresAt')::timestamptz<=clock_timestamp() then raise exception 'run_policy_expired';end if;
 if p_command='claim' then
  numerator:=(pol->>'maxInputTokens')::numeric*(pol->>'inputUsdMicrosPerMillion')::numeric+(pol->>'maxOutputTokens')::numeric*(pol->>'outputUsdMicrosPerMillion')::numeric;
  reserve:=ceil(numerator/1000000)::bigint;
  if jsonb_array_length(claims)>=(pol->>'maxCalls')::integer or (r->>'reservedUsdMicros')::bigint+reserve>(pol->>'maxUsdMicros')::bigint then raise exception 'run_budget_exceeded';end if;
  cid:=gen_random_uuid();c:=jsonb_build_object('claimId',cid,'actionId',aid,'action',p_input->>'action','state','reserved','reservedUsdMicros',reserve);
  r:=r||jsonb_build_object('claims',claims||jsonb_build_array(c),'reservedUsdMicros',(r->>'reservedUsdMicros')::bigint+reserve,'revision',rev+1);
 elsif p_command in ('start','outcome') then
  cid:=(p_input->>'claimId')::uuid;
  select value,(ordinality-1)::integer into c,idx from jsonb_array_elements(claims) with ordinality where value->>'claimId'=cid::text;
  if c is null then raise exception 'run_claim_unavailable';end if;
  if p_command='start' then
   if c->>'state'<>'reserved' then raise exception 'run_dispatch_denied';end if;
   c:=c||jsonb_build_object('state','started');
  else
   if c->>'state'<>'started' or p_input->>'status' not in ('complete','failed','usage-unverified') or p_input->>'status' is null then raise exception 'run_outcome_denied';end if;
   complete:=false;
   if p_input ? 'usage' then
    input_tokens:=(p_input->'usage'->>'inputTokens')::bigint;output_tokens:=(p_input->'usage'->>'outputTokens')::bigint;
    if input_tokens is null or output_tokens is null or input_tokens<0 or output_tokens<0 or input_tokens>9007199254740991 or output_tokens>9007199254740991 or p_input->'usage'->>'cacheTokens' is distinct from '0' or p_input->'usage'->>'toolCalls' is distinct from '0' then raise exception 'run_usage_invalid';end if;
    actual:=ceil((input_tokens::numeric*(pol->>'inputUsdMicrosPerMillion')::numeric+output_tokens::numeric*(pol->>'outputUsdMicrosPerMillion')::numeric)/1000000)::bigint;
    complete:=p_input->'providerEvidence'->>'provider'=pol->>'provider' and p_input->'providerEvidence'->>'model'=pol->>'model' and p_input->'providerEvidence'->>'accountRef'=pol->>'accountRef' and input_tokens<=(pol->>'maxInputTokens')::bigint and output_tokens<=(pol->>'maxOutputTokens')::bigint and length(p_input->>'providerRequestId') between 1 and 200 and (p_input->>'status'<>'complete' or p_input->>'validatedOutputFingerprint' ~ '^[a-f0-9]{64}$');
    c:=c||jsonb_build_object('usage',p_input->'usage','actualUsdMicros',actual);
   end if;
   state:=case when coalesce(complete,false) then p_input->>'status' else 'usage-unverified' end;
   c:=c||jsonb_build_object('state',state);
   if p_input ? 'providerEvidence' then c:=c||jsonb_build_object('providerEvidence',p_input->'providerEvidence');end if;
   if p_input ? 'providerRequestId' then c:=c||jsonb_build_object('providerRequestId',p_input->>'providerRequestId');end if;
   if state='complete' then c:=c||jsonb_build_object('outputFingerprint',p_input->>'validatedOutputFingerprint');end if;
  end if;
  r:=r||jsonb_build_object('claims',jsonb_set(claims,array[idx::text],c),'revision',rev+1);
 else raise exception 'run_command_invalid';end if;
 update public.studio_owner_runs set receipt=r where owner_user_id=p_owner and run_id=rid;
 if p_command='claim' then return jsonb_build_object('kind','claimed','claimId',cid,'receipt',r);end if;
 if p_command='start' then return jsonb_build_object('dispatch',true,'receipt',r);end if;
 return r;
end $$;
revoke all on function public.studio_owner_run_command(uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.studio_owner_run_command(uuid,text,jsonb) to service_role;
-- Operators alone provision immutable policies. Do not schedule cleanup or
-- refund uncertainty. No table mutation grant to service_role is necessary.
commit;
