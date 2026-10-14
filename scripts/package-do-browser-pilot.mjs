/** Staged native fixture pilot only. This script packages; it never installs. */
import {readFile,writeFile} from 'node:fs/promises';
import JSZip from 'jszip';
const root='apps/do/extension/';
const manifest=JSON.parse(await readFile(root+'pilot/manifest.json','utf8'));
const zip=new JSZip();
zip.file('manifest.json',JSON.stringify(manifest,null,2)+'\n');
zip.file('pilot-worker.js',await readFile(root+'pilot/worker.js'));
for(const file of ['browser-task-worker.js','browser-task-core.js','browser-task-relay.js','browser-connection.js','portable.css','icons/icon16.png','icons/icon32.png','icons/icon48.png','icons/icon128.png'])zip.file(file,await readFile(root+file));
zip.file('browser-connection.html',(await readFile(root+'browser-connection.html','utf8')).replace('<a href="portable.html">Back to DO</a>','<a href="https://www.assembl.co.nz/do" target="_blank" rel="noreferrer">Open Personal DO</a>'));
zip.file('README.md','# DO browser pilot\n\nFixture-only, not a retailer integration. Review the manifest and obtain explicit permission before installing this unpacked package or granting activeTab. No automatic installation. Only the selected fictional tab and an explicitly chosen first-party Personal DO tab participate. Native Chrome behavior remains unverified. No phone pairing, checkout or payment.\n');
await writeFile(`public/do/downloads/assembl-do-browser-pilot-${manifest.version}.zip`,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
