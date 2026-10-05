import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {it,expect} from 'vitest';
it('generator dry-run binds the exact component and refuses non-CI writes',()=>{
 const component='components/client-hub-migration/original/app/hub/concept-studio.tsx',before=readFileSync(component);
 const result=JSON.parse(execFileSync(process.execPath,['scripts/studio-ci/prepare.mjs','--check'],{encoding:'utf8'}));
 expect(result.digest).toBe(createHash('sha256').update(before).digest('hex'));
 expect(result.transportOnlyReplacement).toBe(true);expect(existsSync(result.copy)).toBe(false);expect(existsSync(result.route)).toBe(false);
 expect(()=>execFileSync(process.execPath,['scripts/studio-ci/prepare.mjs'],{env:{...process.env,CI:'false',GITHUB_ACTIONS:'false'},stdio:'pipe'})).toThrow();
 expect(readFileSync(component)).toEqual(before);expect(existsSync(result.copy)).toBe(false);expect(existsSync(result.route)).toBe(false);
});
