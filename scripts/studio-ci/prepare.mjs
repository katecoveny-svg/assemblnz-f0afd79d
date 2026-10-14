import {readFileSync,writeFileSync,existsSync,mkdirSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
const component='components/client-hub-migration/original/app/hub/concept-studio.tsx';
const copy='components/client-hub-migration/original/app/hub/studio-ci-generated.tsx';
const route='app/studio-ci-fixture';
const marker='stage1-studio-ci-generated-only';
const original=readFileSync(component,'utf8');
const needle='import { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";';
if(original.split(needle).length!==2)throw Error('Reviewed transport import changed; stop rather than rewrite heuristically.');
const digest=createHash('sha256').update(original).digest('hex');
if(process.argv.includes('--check')){console.log(JSON.stringify({component,digest,copy,route,transportOnlyReplacement:true}));process.exit(0);}
if(process.env.CI!=='true'||process.env.GITHUB_ACTIONS!=='true')throw Error('Fixture generation is restricted to the isolated hosted CI runner.');
if(process.argv.includes('--clean')){
 for(const path of [copy,`${route}/page.tsx`])if(existsSync(path)&&!readFileSync(path,'utf8').includes(marker))throw Error('Refusing to remove an unmarked file.');
 rmSync(copy,{force:true});if(existsSync(`${route}/page.tsx`))rmSync(route,{recursive:true});process.exit(0);
}
if(existsSync(copy)||existsSync(route))throw Error('Fixture output already exists; refusing overwrite.');
writeFileSync(copy,`// ${marker}; NEVER COMMIT OR DEPLOY THIS GENERATED FILE.\n`+original.replace(needle,'import { migrationFetch as fetch } from "@/scripts/studio-ci/transport";'));
mkdirSync(route,{recursive:true});
writeFileSync(`${route}/page.tsx`,`// ${marker}; NEVER COMMIT OR DEPLOY THIS GENERATED ROUTE.\nimport Studio from '@/components/client-hub-migration/original/app/hub/studio-ci-generated';\nimport '@/app/review/client-hub/review.css';\nexport const metadata={robots:{index:false,follow:false},title:'FICTIONAL Studio CI fixture'};\nexport default function Fixture(){return <div className="client-hub-migration-review"><aside role="note">FICTIONAL LOCAL UI VERIFICATION — synthetic transport; no account persistence, authentication or provider proof.</aside><Studio ownerMode/></div>;}\n`);
console.log(JSON.stringify({component,digest,copy,route,transportOnlyReplacement:true,productionAuthUnchanged:true}));
