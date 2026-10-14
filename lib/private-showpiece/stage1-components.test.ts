import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {describe,it,expect} from 'vitest';
import {emptyOwnerHub} from '@/lib/client-hub-migration/owner-policy';
import {newOwnerIdea} from '@/lib/client-hub-migration/owner-idea';
import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {creativePrefix,projectCreativeReferences} from './creative-references';
import {contentContext} from './agency-content';
import {inspectBrandMarkup} from './brand-review';
type Node={type:unknown;props:Record<string,unknown>};
const jsx=(type:unknown,props:Record<string,unknown>)=>({type,props});
function children(node:unknown):Node[]{if(Array.isArray(node))return node.flatMap(children);if(!node||typeof node!=='object'||!('props' in node))return [];const n=node as Node;return [n,...children(n.props.children)];}
function words(node:unknown):string{if(Array.isArray(node))return node.map(words).join(' ');if(node&&typeof node==='object'&&'props' in node)return words((node as Node).props.children);return typeof node==='string'?node:'';}
async function renderer(file:string,initial:Record<string,unknown>={}){
 const source=readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),names:string[]=[];
 function visit(node:ts.Node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='useState'&&ts.isVariableDeclaration(node.parent)&&ts.isArrayBindingPattern(node.parent.name))names.push(node.parent.name.elements[0].getText(ast));ts.forEachChild(node,visit);}visit(ast);
 const modules:Record<string,unknown>={},values={...initial};let cursor=0;const requests:unknown[]=[],confirmations:string[]=[];let allow=false;
 for(const node of ast.statements){if(!ts.isImportDeclaration(node)||!ts.isStringLiteral(node.moduleSpecifier))continue;const spec=node.moduleSpecifier.text;
  if(spec.startsWith('@/lib/')||spec.includes('/original/lib/'))modules[spec]=spec.includes('use-committed-callback')?{useCommittedCallback:(fn:unknown)=>fn}:await import(spec);
 }
 const loaded={exports:{}};const hook={useState:(input:unknown)=>{const name=names[cursor++];if(!(name in values))values[name]=typeof input==='function'?(input as ()=>unknown)():input;return [values[name],(next:unknown)=>{values[name]=typeof next==='function'?(next as (old:unknown)=>unknown)(values[name]):next;}];},useRef:(value:unknown)=>({current:value}),useEffect:()=>{},useLayoutEffect:()=>{}};
 runInNewContext(ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:loaded,exports:loaded.exports,require:(spec:string)=>spec==='react'?hook:spec==='react/jsx-runtime'?{jsx,jsxs:jsx}:modules[spec]||new Proxy({default:()=>null},{get:(target,key)=>key==='default'?target.default:()=>undefined}),crypto,TextEncoder,URL,Blob,AbortController,setTimeout,structuredClone,history:{replaceState:()=>{}},window:{confirm:(message:string)=>{confirmations.push(message);return allow;}},fetch:(...args:unknown[])=>{requests.push(args);throw Error('No network in component fixtures');}});
 return {render:(props:Record<string,unknown>)=>{cursor=0;return (loaded.exports as {default:(props:Record<string,unknown>)=>Node}).default(props);},values,requests,confirmations,setConfirm:(value:boolean)=>{allow=value;}};
}
function savedHub(packet:string):Hub{const hub=emptyOwnerHub(),idea=newOwnerIdea(hub);return hubSchema.parse({...hub,buyer:'Fictional saved client',engine:{...hub.engine!,brief:'Fictional original saved brief',researchPacket:packet,concepts:[idea],selected:idea.id},sources:[{id:'source',title:'Fictional public extract',url:'https://example.org',claim:'Fictional supplied fact',status:'source',checked:'unverified',include:true}]});}
const desk='components/private-showpiece/AgencyContentDesk.tsx';
describe('actual Stage1 component functions with deterministic hooks; fictional saved full Hubs',()=>{
 it('renders legacy prose, JSON primitives and malformed bindings without changing original full Hub',async()=>{
  for(const packet of ['Fictional ordinary research prose','null','[]','{"other":"legacy context"}','{"agencyCreativeReferences":[{"sourceId":"source"}]}']){
   const hub=savedHub(packet),before=JSON.stringify(hub),render=await renderer(desk);const tree=render.render({hub,workspaceKey:'hub:fixture',busy:false});expect(words(tree)).toContain('One brief.');expect(contentContext(hub).creativeReferences).toEqual([]);expect(JSON.stringify(hub)).toBe(before);expect(render.requests).toEqual([]);
  }
 });
 it('retains valid selected bindings but excludes malformed or changed creative bindings from evidence',()=>{
  const hub=savedHub('{}'),ref={sourceId:'creative',archiveSha256:'a'.repeat(64),brandId:'brand_assembl',boardId:'board',boardRevision:1,referenceId:'reference',referenceRevision:1,title:'Fictional creative reference',url:'https://example.org/reference',excerpt:'Fictional visual observation',observedAt:'fixture',provenance:'owner-selected imported archive; unverified',purpose:'creative inspiration only; never cited evidence'};
  hub.engine!.researchPacket=JSON.stringify({agencyCreativeReferences:[ref]});hub.sources.push({id:ref.sourceId,title:ref.title,url:ref.url,claim:creativePrefix+ref.excerpt,status:'concept',checked:ref.observedAt,include:true});expect(projectCreativeReferences(hub)).toHaveLength(1);
  hub.sources[1].status='source';expect(projectCreativeReferences(hub)).toEqual([]);expect(contentContext(hub).sources.map(source=>source.id)).toEqual(['source']);
 });
 it('renders only existing canonical glass/room image paths',async()=>{const render=await renderer(desk),tree=render.render({hub:savedHub('prose'),workspaceKey:'hub:fixture',busy:false});const paths=children(tree).flatMap(node=>typeof node.props.src==='string'?[node.props.src]:[]);expect(paths).toEqual(['/do/world/atelier-glass-poster.webp','/brand/do-assembled-plum.webp']);for(const path of paths)expect(existsSync('public'+path)).toBe(true);});
 it('disables absent source endpoint even with URL, and handler cannot fetch it',async()=>{const render=await renderer('components/private-showpiece/SourceReview.tsx',{url:'https://example.org'}),tree=render.render({hub:savedHub('prose'),onApply:()=>{}});const button=children(tree).find(node=>node.type==='button'&&words(node).includes('Collect this public page'))!;expect(button.props.disabled).toBe(true);await (button.props.onClick as ()=>Promise<void>)();expect(render.requests).toEqual([]);expect(words(tree)).toContain('Public collection is unavailable.');});
 it('disables absent brand/CSS/logo endpoints while allowing manual pasted metadata review',async()=>{
  const review=inspectBrandMarkup('<link rel="stylesheet" href="/brand.css"><img src="/logo.png" alt="Fictional logo">','https://example.org','manual-paste','a'.repeat(64));
  const render=await renderer('components/private-showpiece/BrandReview.tsx',{url:'https://example.org',review,logoUrl:'https://example.org/logo.png'}),tree=render.render({hub:savedHub('prose'),onApply:()=>{}});
  for(const label of ['Discover from this selected page','Review this stylesheet','Prepare bounded raster logo']){const button=children(tree).find(node=>node.type==='button'&&words(node).includes(label));expect(button).toBeDefined();expect(button!.props.disabled).toBe(true);await (button!.props.onClick as ()=>Promise<void>)();}
  expect(render.requests).toEqual([]);render.values.paste='<style>body{color:#492B3E}</style>';const manual=children(render.render({hub:savedHub('prose'),onApply:()=>{}})).find(node=>node.type==='button'&&words(node).includes('Review pasted metadata'))!;expect(manual.props.disabled).toBe(false);
 });
 it('saved legacy brief remains displayed/editable and destructive replacement requires explicit confirmation',async()=>{
  const hub=savedHub('Fictional original research prose'),before=JSON.stringify(hub),render=await renderer('components/client-hub-migration/original/app/hub/concept-studio.tsx',{h:hub,ready:true});let tree=render.render({ownerMode:true});
  const brief=children(tree).find(node=>node.type==='textarea'&&node.props.value===hub.engine!.brief)!;expect(brief).toBeDefined();(brief.props.onChange as (event:unknown)=>void)({target:{value:'Edited legacy brief'}});expect((render.values.h as Hub).engine?.brief).toBe('Edited legacy brief');expect((render.values.h as Hub).engine?.concepts).toEqual(hub.engine!.concepts);expect((render.values.h as Hub).sources).toEqual(hub.sources);
  const replace=children(tree).find(node=>node.type==='button'&&words(node).includes('Prepare a replacement job or prospect brief'))!;(replace.props.onClick as ()=>void)();tree=render.render({ownerMode:true});const intake=children(tree).find(node=>typeof node.props.onApply==='function'&&node.props.hub===render.values.h)!;const edited=JSON.stringify(render.values.h);(intake.props.onApply as (hub:Hub)=>void)(emptyOwnerHub());expect(JSON.stringify(render.values.h)).toBe(edited);expect(render.confirmations.at(-1)).toContain('clears current ideas and selected sources');expect(JSON.stringify(hub)).toBe(before);
 });
 it('refresh without a captured create offers export and explicit navigation, never an invented retry',async()=>{const hub=savedHub('prose'),render=await renderer('components/client-hub-migration/original/app/hub/concept-studio.tsx',{h:hub,ready:true,panel:'drafts',saveUncertain:true});const tree=render.render({ownerMode:true});expect(words(tree)).toContain('unavailable after refresh');expect(words(tree)).toContain('Export private backup');expect(words(tree)).not.toContain('Retry original create');const button=children(tree).find(node=>node.type==='button'&&words(node)==='Start a separate project')!;(button.props.onClick as ()=>void)();expect(render.values.h).toBe(hub);render.setConfirm(true);(button.props.onClick as ()=>void)();expect((render.values.h as Hub).engine?.brief).toBe('');expect(render.values.saveUncertain).toBe(false);expect(render.requests).toEqual([]);});
 it('intake fallback uses original company/brief without inventing a job ad or truncating',async()=>{const hub=savedHub('prose');hub.engine!.brief='x'.repeat(4800);const render=await renderer('components/private-showpiece/Intake.tsx'),tree=render.render({hub,onApply:()=>{},busy:false});const state=render.values.v as {company:string;brief:string;kind:string};expect(state.company).toBe(hub.buyer);expect(state.brief).toBe(hub.engine!.brief);expect(state.kind).toBe('prospect');expect(children(tree).some(node=>node.type==='textarea'&&node.props.value===hub.engine!.brief)).toBe(true);});
});
