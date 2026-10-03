const esbuild = require(process.env.ASSEMBL_ESBUILD_MODULE || '../../../node_modules/.pnpm/esbuild@0.28.0/node_modules/esbuild');
const stubs = {
  '@/lib/supabase/client': `export function createClient(){return {auth:{onAuthStateChange(callback){window.privacy.subscribe(callback);return {data:{subscription:{unsubscribe(){window.privacy.unsubscribe()}}}}}}}}`,
  'next/dynamic': 'export default function dynamic(){return ()=>null}',
  'next/image': 'export default function Image({priority,unoptimized,fill,...p}){return <img {...p}/>}',
  './ChecklistCloud': 'export function ChecklistCloud(){return null}',
  './LifeAdminTraffic': 'export function LifeAdminTraffic(){return null}',
  './PersonalDoCharacter': 'export function PersonalDoCharacter(){return null}',
  './DoGeminiLive': 'export function DoGeminiLive(){return <div>Synthetic voice, no media.</div>}',
  './DoTextWorkspace': 'export function DoTextWorkspace(){return <div>Synthetic builder task surface.</div>}',

  '@/app/do/DoTextWorkspace': 'export function DoTextWorkspace(p){return <label>Write draft<textarea aria-label="Write draft" onChange={e=>p.onSourceChange(e.target.value)} /></label>}',
  '@/app/do/DoGeminiLive': 'export function DoGeminiLive(p){return <div data-talk-context={p.context}>Synthetic voice surface; no media or provider calls.</div>}',
  './DoProductFrame': 'import styles from "@/components/do/do-product-focus.module.css"; export function DoProductFrame(p){return <main className={styles.shell}>{p.children}</main>} export function useDoEmbeddedSurface(){return false}',
  './DoGlassHero': 'export function DoGlassHero(){return null}',
  'next/link': 'export default function Link({children,...p}){return <a {...p}>{children}</a>}',
};
esbuild.build({entryPoints:[__dirname+'/entry.tsx'],bundle:true,outfile:__dirname+'/bundle.js',jsx:'automatic',tsconfig:__dirname+'/../../../tsconfig.json',loader:{'.css':'local-css'},plugins:[{name:'bounded-synthetic-surfaces',setup(build){build.onResolve({filter:/.*/},args=>stubs[args.path]?{path:args.path,namespace:'synthetic'}:undefined);build.onLoad({filter:/.*/,namespace:'synthetic'},args=>({contents:stubs[args.path],loader:'tsx',resolveDir:__dirname+'/../../..'}));}}]}).catch(error=>{console.error(error);process.exitCode=1});
