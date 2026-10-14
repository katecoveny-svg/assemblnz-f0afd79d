import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import JSZip from 'jszip';
it('stages a narrow pilot with no global content scripts, optional hosts, stored grants or general tabs grant',async()=>{
  const m=JSON.parse(readFileSync('apps/do/extension/pilot/manifest.json','utf8'));
  expect(m.permissions).toEqual(['activeTab','scripting','sidePanel']);expect(m.host_permissions).toEqual(['https://www.assembl.co.nz/*']);
  for(const key of ['content_scripts','optional_host_permissions','externally_connectable'])expect(m[key]).toBeUndefined();
  const zip=await JSZip.loadAsync(readFileSync(`public/do/downloads/assembl-do-browser-pilot-${m.version}.zip`));
  expect(JSON.parse(await zip.file('manifest.json')!.async('string'))).toEqual(m);
  for(const [name,file] of Object.entries(zip.files)){
    if(file.dir || name==='README.md' || name==='manifest.json' || name==='browser-connection.html')continue;
    const source=name==='pilot-worker.js'?'pilot/worker.js':name;
    expect((await file.async('nodebuffer')).equals(readFileSync('apps/do/extension/'+source)),name).toBe(true);
  }
  const html=await zip.file('browser-connection.html')!.async('string');expect(html).not.toContain('href="portable.html"');expect(html).toContain('id="allow-read"');
});
