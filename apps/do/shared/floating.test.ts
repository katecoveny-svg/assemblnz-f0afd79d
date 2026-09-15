import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
const source=readFileSync('apps/do/extension/floating.js','utf8');
// This fake models only pointer events and element geometry, not browser page access.
class Element {
  children: Element[]=[]; style:Record<string,string>={}; handlers:Record<string,(e:any)=>void>={}; textContent=''; className=''; capture=false; removed=false;
  append(...children:Element[]){this.children.push(...children);}
  attachShadow(){const root=new Element();this.children.push(root);return root;}
  setAttribute(){} addEventListener(name:string,fn:(e:any)=>void){this.handlers[name]=fn;}
  getBoundingClientRect(){return {left:Number.parseFloat(this.style.left||'100'),top:Number.parseFloat(this.style.top||'100')};}
  setPointerCapture(){this.capture=true;} hasPointerCapture(){return this.capture;} releasePointerCapture(){this.capture=false;}
  remove(){this.removed=true;}
}
function setup(){const page=new Element();const send=vi.fn((_m,cb)=>cb({ok:true}));runInNewContext(source,{document:{createElement:()=>new Element(),documentElement:page},chrome:{runtime:{sendMessage:send}},window:{addEventListener:vi.fn(),removeEventListener:vi.fn()},innerWidth:800,innerHeight:600});const root=page.children[0].children[0];const wrap=root.children[1];return{page,wrap,orb:wrap.children[0],send};}
describe('draggable page companion',()=>{
 it('does not read a page or open anything on injection',()=>{expect(setup().send).not.toHaveBeenCalled();});
 it('opens the panel only on a click, not after a drag',()=>{const s=setup();s.orb.handlers.pointerdown({button:0,clientX:110,clientY:110,pointerId:1});s.orb.handlers.pointermove({clientX:5000,clientY:5000});s.orb.handlers.pointerup({pointerId:1});s.orb.handlers.click({});expect(s.send).not.toHaveBeenCalled();expect(s.wrap.style.left).toBe('708px');expect(s.wrap.style.top).toBe('490px');s.orb.handlers.click({});expect(s.send).toHaveBeenCalledWith({type:'do:open-panel'},expect.any(Function));});
 it('offers keyboard movement and removal',()=>{const s=setup();const preventDefault=vi.fn();s.orb.handlers.keydown({key:'ArrowRight',preventDefault});expect(s.wrap.style.left).toBe('124px');expect(preventDefault).toHaveBeenCalled();s.wrap.children[2].handlers.click({});expect(s.page.children[0].removed).toBe(true);});
});
