"""Local-only PostgreSQL integration tests. Container has --network none, no ports.
Usage: python3 scripts/test-do-connector-jobs.py
Creates a unique database in the explicitly named test container; never touches production.
"""
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import uuid

ROOT = Path(__file__).resolve().parents[1]
CONTAINER = 'assembl-do-contract-test'
DB = 'do_test_' + uuid.uuid4().hex[:12]
A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'


def sql(text, role=None, owner=None, expect_error=False):
    prefix = f'SET ROLE {role};' if role else ''
    if owner:
        prefix += f"SET request.jwt.claim.sub='{owner}';"
    p = subprocess.run(['docker', 'exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', DB, '-XAt', '-v', 'ON_ERROR_STOP=1'], input=prefix+text, capture_output=True, text=True)
    if expect_error:
        assert p.returncode != 0, 'Expected database denial'
        return p.stderr
    if p.returncode:
        raise AssertionError(p.stderr)
    lines = [s for s in p.stdout.splitlines() if s not in ('SET', '')]
    return '\n'.join(lines)


def literal(value):
    return "'" + str(value).replace("'", "''") + "'"


def rpc(name, *args):
    values = [literal(json.dumps(v))+"::jsonb" if isinstance(v, (dict, list)) else literal(v) for v in args]
    result = sql(f'SELECT public.{name}({",".join(values)});', 'service_role')
    return json.loads(result) if result else None


def main():
    meta = json.loads(subprocess.check_output(['docker', 'inspect', CONTAINER], text=True))[0]
    assert meta['HostConfig']['NetworkMode'] == 'none', 'Refuse networked container'
    subprocess.run(['docker', 'exec', CONTAINER, 'createdb', '-U', 'postgres', DB], check=True)
    for name in ['scripts/do-connector-test-bootstrap.sql', 'supabase/migrations/20260916090000_do_office_persistence.sql', 'supabase/migrations/20260916120000_do_job_events_and_receipt_kinds.sql', 'supabase/migrations/20260917090000_do_action_cloud.sql']:
        sql((ROOT/name).read_text())
    migration = ROOT/'supabase/migrations/20260917130000_do_connector_jobs.sql'
    if migration.exists():
        sql(migration.read_text())
    snapshot = {'schemaVersion': 1, 'agentSpec': {'name': 'Calendar brief', 'primitive': 'prepare', 'brief': 'Prepare my calendar brief'}, 'task': {'action': 'list_calendar_events', 'app': 'google_calendar', 'accountId': 'apn_synthetic', 'inputs': {'calendarId': 'primary', 'timeMin': '2026-09-17T00:00:00Z', 'timeMax': '2026-09-18T00:00:00Z', 'maxResults': 10}}}
    first = rpc('prepare_owner_connector_job', A, 'synthetic-prepare-1', 'sha256:'+'a'*64, snapshot)
    assert isinstance(first, dict)
    assert first['state'] == 'awaiting_approval'
    assert first['owner_id'] == A
    assert first['snapshot'] == snapshot
    assert first['job_id'] and first['permit_id'] and first['prep_id']
    again = rpc('prepare_owner_connector_job', A, 'synthetic-prepare-1', 'sha256:'+'a'*64, snapshot)
    assert again == first, 'Preparation retry must return same work'
    conflict = sql(f"SELECT public.prepare_owner_connector_job('{A}','synthetic-prepare-1','sha256:{'b'*64}',{literal(json.dumps(snapshot))}::jsonb);", 'service_role', expect_error=True)
    assert 'Preparation content changed' in conflict
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        raced = list(pool.map(lambda _: rpc('prepare_owner_connector_job', A, 'synthetic-race-1', 'sha256:'+'a'*64, snapshot), range(4)))
    assert all(isinstance(r, dict) for r in raced)
    assert len({r['job_id'] for r in raced if isinstance(r, dict)}) == 1
    assert rpc('get_owner_connector_job', B, first['job_id']) is None
    assert sql(f"SELECT count(*) FROM public.do_agents WHERE id='{first['job_id']}';", 'authenticated', B) == '0'
    assert sql(f"SELECT count(*) FROM public.do_agents WHERE id='{first['job_id']}';", 'authenticated', A) == '1'
    sql(f"UPDATE public.do_agents SET runtime_kind='legacy', status='done' WHERE id='{first['job_id']}';", 'authenticated', A, expect_error=True)
    sql(f"UPDATE public.do_permits SET decision='approved' WHERE permit_id={literal(first['permit_id'])};", 'authenticated', A, expect_error=True)
    sql(f"SELECT public.prepare_owner_connector_job('{A}','forged-prepare-1','sha256:{'a'*64}',{literal(json.dumps(snapshot))}::jsonb);", 'authenticated', A, expect_error=True)
    expected = {k: first[k] for k in ['generation', 'prep_id', 'permit_id', 'args_hash']}
    approved = rpc('decide_owner_connector_job', A, first['job_id'], expected, 'approved')
    assert isinstance(approved, dict)
    assert approved['state'] == 'approved'
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        claims = list(pool.map(lambda _: rpc('claim_owner_connector_action', A, first['job_id'], expected), range(4)))
    assert all(isinstance(c, dict) for c in claims)
    claims = [c for c in claims if isinstance(c, dict)]
    assert sum(c['claimed'] is True for c in claims) == 1
    assert all(c['job']['state'] == 'running' for c in claims)
    winner = next(c['job'] for c in claims if c['claimed'])
    result = {'events': [], 'draft': 'No events returned for this window.', 'boundary': 'Read only. Nothing sent.'}
    proof = {'method': 'provider-schema', 'passed': True, 'complete': False}
    final = rpc('finalize_owner_connector_action', A, first['job_id'], expected, winner['claim_id'], result, 'sha256:'+'c'*64, proof)
    assert isinstance(final, dict)
    assert final['state'] == 'succeeded' and final['receipt_id']
    assert final['result'] == result
    assert rpc('finalize_owner_connector_action', A, first['job_id'], expected, winner['claim_id'], result, 'sha256:'+'c'*64, proof) == final
    assert rpc('get_owner_connector_job', A, first['job_id']) == final
    assert sql(f"SELECT count(*) FROM public.do_action_receipts WHERE action_id={literal(first['action_id'])};", 'service_role') == '1'
    # Wrong owners and stale review payloads must fail even on cached completion.
    for fn, extra in [('decide_owner_connector_job', ",'approved'"), ('claim_owner_connector_action', '')]:
        for owner, review in [(B, expected), (A, {}), (A, {**expected, 'generation': 2})]:
            sql(f"SELECT public.{fn}('{owner}','{first['job_id']}',{literal(json.dumps(review))}::jsonb{extra});", 'service_role', expect_error=True)
    final_call = f"'{A}','{first['job_id']}',{literal(json.dumps(expected))}::jsonb,'{winner['claim_id']}'"
    sql(f"SELECT public.finalize_owner_connector_action({final_call},{literal(json.dumps({**result, 'draft': 'Changed'}))}::jsonb,'sha256:{'c'*64}',{literal(json.dumps(proof))}::jsonb);", 'service_role', expect_error=True)
    for table, assignments, where in [
        ('do_action_runs', "namespace='demo',result='{}'::jsonb", f"action_id={literal(first['action_id'])}"),
        ('do_receipts', "summary='forged'", f"do_agent_id='{first['job_id']}'"),
        ('do_workspaces', f"owner_id='{B}'", f"id='{first['workspace_id']}'"),
    ]:
        sql(f'UPDATE public.{table} SET {assignments} WHERE {where};', 'authenticated', A, expect_error=True)
    assert sql(f"SELECT count(*) FROM public.do_action_receipts WHERE action_id={literal(first['action_id'])};", 'authenticated', B) == '0'
    declined = rpc('prepare_owner_connector_job', A, 'synthetic-decline-1', 'sha256:'+'d'*64, snapshot)
    assert isinstance(declined, dict)
    review = {k: declined[k] for k in ['generation', 'prep_id', 'permit_id', 'args_hash']}
    rpc('decide_owner_connector_job', A, declined['job_id'], review, 'rejected')
    sql(f"SELECT public.claim_owner_connector_action('{A}','{declined['job_id']}',{literal(json.dumps(review))}::jsonb);", 'service_role', expect_error=True)
    # Restart only this disposable, network-isolated test container.
    if os.environ.get('DO_TEST_RESTART') == '1':
        subprocess.run(['docker', 'restart', CONTAINER], check=True, capture_output=True)
        subprocess.run(['docker', 'exec', CONTAINER, 'pg_isready', '-t', '15'], check=True, capture_output=True)
        assert rpc('get_owner_connector_job', A, first['job_id']) == final
    print(json.dumps({'passed': True, 'database': DB, 'restart_verified': os.environ.get('DO_TEST_RESTART') == '1', 'checks': ['atomic_prepare', 'same_content_retry', 'changed_content_conflict', 'concurrent_prepare', 'owner_read_isolation', 'owner_cannot_forge_state_or_permit', 'service_only_rpc', 'explicit_approval', 'single_claim_winner', 'atomic_receipt', 'idempotent_finalization', 'stale_review_denial', 'decline_no_claim', 'proof_mutation_denial']}))


if __name__ == '__main__':
    main()
