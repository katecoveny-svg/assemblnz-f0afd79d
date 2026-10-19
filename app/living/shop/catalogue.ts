import { CAD_PACK, PARTS } from '@/lib/living/catalogue';

/** Proposed Assembl range. No third-party models are included or licensed by this catalogue. */
export type Item={id:string;name:string;family:string;spaces:string[];description:string;parts:string;material:string;model:'curve'|'grid'|'stack'|null;fit:boolean;status:'prototype'|'concept';revision:string|null;art:string};
export const PALETTE=[['chalk','#f1eee6'],['oat','#ded2be'],['sage','#b4c5ac'],['muted rose','#d4afb9'],['deep plum','#4a2545'],['graphite','#363439'],['tomato','#e84a35'],['butter','#f6d565']] as const;
export const SPACES=['all spaces','my room','desk & study','vanity','wardrobe & drawers','pets & everyday','plants & light','ride & adventure'];
export const ITEMS:Item[]=[
{id:'grid-starter',name:'the everything wall',family:'grid',spaces:['my room','desk & study','vanity','ride & adventure'],description:'A modular wall for the things you want within reach. Choose the accessories, not a whole new system.',parts:'192 mm panel · 96 mm ledge · 48 mm cup',material:'PETG candidate',model:'grid',fit:true,status:'prototype',revision:CAD_PACK+' · digital validation only',art:'grid'},
{id:'tile-starter',name:'a place for the little things',family:'tile',spaces:['my room','desk & study','vanity','wardrobe & drawers'],description:'Connected open trays for jewellery, pens and everyday essentials. Layout and clearances need measurement.',parts:'96 × 96 mm tray · 96 × 48 mm tray · tile clips',material:'Matte PLA candidate',model:'curve',fit:true,status:'prototype',revision:CAD_PACK+' · digital validation only',art:'tray'},
{id:'stack-starter',name:'a little more room',family:'stack',spaces:['my room','desk & study','wardrobe & drawers','plants & light'],description:'A small freestanding riser. Make more of the surface you already have, without a full furniture replacement.',parts:'192 mm riser · optional tray configured separately',material:'PETG candidate',model:'stack',fit:true,status:'prototype',revision:CAD_PACK+' · digital validation only',art:'shelf'},
{id:'vanity-pack',name:'the getting-ready set',family:'accessory pack',spaces:['my room','vanity'],description:'A coordinated arrangement for brushes, hair clips, jewellery and your own cosmetic tubes.',parts:'Brush cup · jewellery tray · tube organiser',material:'Matte PLA candidate',model:'curve',fit:true,status:'concept',revision:null,art:'vanity'},
{id:'gear-pack',name:'the hobby collection',family:'accessory pack',spaces:['my room','ride & adventure'],description:'Turn your existing grid into a hobby wall. Fishing layout includes covered hook storage, not exposed lure hooks.',parts:'Leader cards · spool bays · covered lure trays',material:'PETG candidate',model:null,fit:false,status:'concept',revision:null,art:'gear'},
{id:'cable-pack',name:'less tangle, more desk',family:'accessory pack',spaces:['desk & study','my room'],description:'Small cable guides, a loose cable reel and a desk-side pocket for the things that disappear.',parts:'Cable guides · cable reel · small pocket',material:'PETG + separate TPU candidates',model:null,fit:true,status:'concept',revision:null,art:'cable'},
{id:'walk-pack',name:'walk, assembled',family:'pet kit',spaces:['pets & everyday'],description:'A refillable bag-roll case, used-bag holder and an entranceway dock. Bags supplied by you.',parts:'Roll case · accessory clip · organiser dock',material:'PETG candidate',model:null,fit:true,status:'concept',revision:null,art:'pet'},
{id:'bowl-surround',name:'a place for their bowl',family:'pet kit',spaces:['pets & everyday'],description:'A coordinated surround for an existing removable, washable bowl. No printed food-contact insert.',parts:'Bowl surround · personalised front panel',material:'PETG candidate',model:null,fit:true,status:'concept',revision:null,art:'bowl'},
{id:'planter-sleeve',name:'the soft-form planter',family:'object',spaces:['plants & light','my room'],description:'A sculptural sleeve for your existing nursery pot and saucer. Not sold as a watertight vessel.',parts:'Decorative sleeve',material:'Matte PLA or PETG candidates',model:'curve',fit:true,status:'concept',revision:null,art:'planter'},
{id:'shade-study',name:'light, in layers',family:'lighting study',spaces:['plants & light','my room','desk & study'],description:'A pleated, replaceable shade for a specified LED fitting. Thermal and fitting tests are still required.',parts:'Shade only · electrical parts excluded',material:'Grade and LED fitting not approved',model:null,fit:true,status:'concept',revision:null,art:'lamp'},
{id:'rally-clip',name:'the all-printed rally clip',family:'dayrally accessory',spaces:['ride & adventure','pets & everyday','my room'],description:'A personalised polymer accessory clip with a replaceable printed gate. Not for climbing or restraining animals.',parts:'Printed body · printed gate · optional keeper',material:'PETG / nylon candidates; gate testing required',model:null,fit:false,status:'concept',revision:null,art:'clip'},
{id:'name-tag',name:'this one is yours',family:'personal accessory',spaces:['pets & everyday','ride & adventure','my room'],description:'A lightweight name panel for bags, organisers or a future pet-tag fitting. Attachment and abrasion testing pending.',parts:'Personalised tag body',material:'PETG candidate',model:null,fit:false,status:'concept',revision:null,art:'tag'}
];
export type Selection={schemaVersion:1;id:string;productId:string;catalogueRevision:'SHOP-01';manufacturingRevision:null;colour:string;text:string;pattern:string;widthMm:number|null;depthMm:number|null;fitConfirmed:boolean;quantity:number;status:'saved-design';approvedForManufacture:false};
export function sanitiseSelection(raw:unknown):Selection|null{
 if(!raw||typeof raw!=='object')return null;
 const r=raw as Record<string,unknown>,p=ITEMS.find(x=>x.id===r.productId);
 if(!p||typeof r.id!=='string'||!r.id.trim()||r.id.length>80)return null;
 const dimension=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>0&&v<=2000?v:null;
 const w=dimension(r.widthMm),d=dimension(r.depthMm);
 return{schemaVersion:1,id:r.id,productId:p.id,catalogueRevision:'SHOP-01',manufacturingRevision:null,colour:PALETTE.some(c=>c[0]===r.colour)?String(r.colour):'chalk',text:typeof r.text==='string'?r.text.slice(0,24):'',pattern:['smooth','fine rib','soft wave'].includes(String(r.pattern))?String(r.pattern):'smooth',widthMm:w,depthMm:d,fitConfirmed:(!p.fit||!!(w&&d))&&r.fitConfirmed===true,quantity:typeof r.quantity==='number'&&Number.isFinite(r.quantity)?Math.min(20,Math.max(1,Math.floor(r.quantity))):1,status:'saved-design',approvedForManufacture:false};
}
export const PURCHASE_BLOCKERS=['Physical product validation and approved manufacturing revision','Confirmed manufacturer, assembly, NZ delivery and price','Shopify product variants, payment and fulfilment connection'];

/** Shop concepts never become manufacturing authority. Resolve evidence from the
 * canonical catalogue, including when loading an untrusted saved kit. */
const ENGINEERING: Record<string, { partIds: string[]; studioHref: string }> = {
  'grid-starter': { partIds: ['grid-panel-192', 'grid-ledge-96', 'grid-cup-48'], studioHref: '/living/studio?kit=setup-wall' },
  'tile-starter': { partIds: ['tile-tray-96x96', 'tile-tray-96x48', 'tile-clip'], studioHref: '/living/studio?kit=vanity-drawer' },
  'stack-starter': { partIds: ['stack-riser-192'], studioHref: '/living/studio?surface=desk' },
};
export function engineeringFor(productId: string) {
  const entry = ENGINEERING[productId];
  if (!entry) return null;
  return { pack: CAD_PACK, studioHref: entry.studioHref, parts: entry.partIds.map(id => {
    const part = PARTS.find(p => p.id === id);
    if (!part) throw new Error(`Missing canonical Living part: ${id}`);
    return part;
  }) };
}
