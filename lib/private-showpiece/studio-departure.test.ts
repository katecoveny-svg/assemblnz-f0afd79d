import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {describe,it,expect} from 'vitest';
import {studioHasUnsavedWork} from './section-controls';

// Execute the actual component's capture effect without mounting a router/server.
const source=readFileSync('components/client-hub-migration/original/app/hub/concept-studio.tsx','utf8');
const effect=source.split('\n').find(line=>line.includes("document.addEventListener('click',leave,true)"))!;
function mount(dirty:boolean,accepted:boolean){
 const hub={buyer:'FICTIONAL Hub',privateNotes:'FICTIONAL private note'},before=JSON.stringify(hub),focus={label:'Section headline'};
 const listeners=new Map<string,(event:unknown)=>void>();let confirmations=0,cleanup:undefined|(()=>void);
 class Element {href='https://example.test/pursuit';target='';download=false;closest(){return this;}hasAttribute(){return this.download;}}
 const document={activeElement:focus,addEventListener:(name:string,fn:(event:unknown)=>void,capture:boolean)=>{expect(capture).toBe(true);listeners.set(name,fn);},removeEventListener:(name:string,fn:(event:unknown)=>void,capture:boolean)=>{expect(capture).toBe(true);expect(listeners.get(name)).toBe(fn);listeners.delete(name);}};
 runInNewContext(ts.transpile(effect),{hasUnsavedWork:studioHasUnsavedWork(dirty,false,[]),Element,URL,location:{href:'https://example.test/review/private-showpiece',pathname:'/review/private-showpiece',search:''},document,window:{confirm:(message:string)=>{expect(message).toContain('Unsaved Hub changes');confirmations++;return accepted;}},useEffect:(callback:()=>undefined|(()=>void),deps:boolean[])=>{expect(deps).toEqual([dirty]);cleanup=callback();}});
 const target=new Element();let prevented=false,stopped=false;
 return {hub,before,focus,document,target,listeners,click:()=>{listeners.get('click')?.({target,preventDefault:()=>{prevented=true;},stopImmediatePropagation:()=>{stopped=true;}});return {prevented,stopped,confirmations};},cleanup:()=>cleanup?.()};
}
describe('actual Studio anchor capture effect',()=>{
 it('cancels Hub-only departure before the router, keeping exact Hub and current focus',()=>{const m=mount(true,false);expect(m.click()).toEqual({prevented:true,stopped:true,confirmations:1});expect(JSON.stringify(m.hub)).toBe(m.before);expect(m.document.activeElement).toBe(m.focus);m.cleanup();expect(m.listeners.size).toBe(0);});
 it('allows accepted departure without pretending to save or changing the Hub',()=>{const m=mount(true,true);expect(m.click()).toEqual({prevented:false,stopped:false,confirmations:1});expect(JSON.stringify(m.hub)).toBe(m.before);m.cleanup();});
 it('does not guard a clean Hub or downloads',()=>{expect(mount(false,false).click()).toEqual({prevented:false,stopped:false,confirmations:0});const m=mount(true,false);m.target.download=true;expect(m.click()).toEqual({prevented:false,stopped:false,confirmations:0});m.cleanup();});
 it('does not prompt for a same-page fragment',()=>{const m=mount(true,false);m.target.href='https://example.test/review/private-showpiece#ideas';expect(m.click()).toEqual({prevented:false,stopped:false,confirmations:0});m.cleanup();});
});
