import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldBuild, buildDecision } from './vercel-ignore-build.mjs';

for (const file of ['docs/context/CURRENT.md', 'docs/build-cost-workflow.md', 'research/note.md', '.pr-assets/phone.png', 'security-proposals/nz-edge-maintenance/proposed/mcp-nz-govt/index.ts']) {
  test(`skip audited path: ${file}`, () => assert.equal(shouldBuild([file]), false));
}
for (const file of ['app/docs/content/guide.mdx', 'docs/new-dependency.json', 'docs/knowledge/REGISTRY.md', 'apps/do/macos/DOCompanion.swift', 'apps/do/extension/manifest.json', 'apps/do/shared/do-tasks.ts', 'content/spark-winter-series/session.md', 'lib/auth/session.ts', 'middleware.ts', 'public/proposal.pdf', 'tsconfig.json', 'pnpm-lock.yaml', 'scripts/vercel-ignore-build.mjs', '.github/workflows/builderdoo-validation.yml']) {
  test(`build dependent or unknown path: ${file}`, () => assert.equal(shouldBuild([file]), true));
}
test('mixed authoring/runtime changes build', () => assert.equal(shouldBuild(['docs/context/CURRENT.md', 'app/do/page.tsx']), true));
test('empty diff builds for environment redeploy', () => assert.equal(shouldBuild([]), true));
test('evidence branch cannot suppress runtime changes', () => assert.equal(buildDecision({VERCEL_GIT_COMMIT_REF:'fix/screenshots',VERCEL_GIT_PREVIOUS_SHA:'base'}, () => 'app/do/page.tsx\0'), true));
test('missing previous deployment builds without HEAD^ fallback', () => assert.equal(buildDecision({}, () => {throw Error('must not diff');}), true));
test('invalid/shallow history builds', () => assert.equal(buildDecision({VERCEL_GIT_PREVIOUS_SHA:'base'}, () => {throw Error('missing');}), true));
test('uses whole previous deployment range and preserves whitespace', () => {
  assert.equal(buildDecision({VERCEL_GIT_PREVIOUS_SHA:'base'}, (_cmd,args) => {
    assert.deepEqual(args, ['diff','--name-only','-z','--no-renames','base','HEAD']);
    return 'docs/context/note.md\0 app/runtime.ts\0';
  }), true);
});

// Exercise real Git and the CLI, including a batched range and rename across
// the dependency boundary. These catch exit-code/path parsing regressions.
import { mkdtempSync, writeFileSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
test('real Git range, cross-boundary rename, and legacy wrapper', () => {
  const root = mkdtempSync(join(tmpdir(), 'assembl-build-decision-'));
  const cli = resolve('scripts/vercel-ignore-build.mjs');
  const wrapper = resolve('scripts/vercel-ignore-build.sh');
  const git = (...args) => execFileSync('git', args, {cwd:root,encoding:'utf8'}).trim();
  const commit = () => {git('add','.');git('commit','-qm','fixture');return git('rev-parse','HEAD');};
  const run = (base, entry=cli) => spawnSync(entry === cli ? process.execPath : 'bash', [entry], {
    cwd:root,env:{...process.env,VERCEL_GIT_PREVIOUS_SHA:base,VERCEL_GIT_COMMIT_REF:'assets/screens'},encoding:'utf8',
  }).status;
  try {
    git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
    mkdirSync(join(root,'docs/context'),{recursive:true});
    writeFileSync(join(root,'docs/context/note.md'),'base');const base=commit();
    writeFileSync(join(root,'docs/context/note.md'),'authoring');const docs=commit();
    assert.equal(run(base),0);assert.equal(run(base,wrapper),0);
    mkdirSync(join(root,'app'),{recursive:true});writeFileSync(join(root,'app/page.tsx'),'runtime');commit();
    writeFileSync(join(root,'docs/context/note.md'),'last docs');const beforeRename=commit();
    assert.equal(run(docs),1); // Runtime change predates last commit in push.
    renameSync(join(root,'app/page.tsx'),join(root,'docs/context/runtime.md'));commit();
    assert.equal(run(beforeRename),1); // Deleted runtime path must remain visible.
    assert.equal(run('missing-sha'),1);
    assert.equal(run(git('rev-parse','HEAD')),1);
  } finally {rmSync(root,{recursive:true,force:true});}
});

for (const directory of ['pr-evidence', '.pr-assets', '.pr-screenshots', '.pr-shots']) {
  for (const extension of ['ts', 'tsx', 'js', 'mjs', 'json', 'html', 'unknown']) {
    test(`unknown or executable evidence builds: ${directory}/proof.${extension}`, () =>
      assert.equal(shouldBuild([`${directory}/proof.${extension}`]), true));
  }
  test(`audited screenshot skips: ${directory}/phone.png`, () =>
    assert.equal(shouldBuild([`${directory}/phone.png`]), false));
}
