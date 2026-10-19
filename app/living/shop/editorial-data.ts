/** Images are cropped from the user's approved AI concept board, not sample photographs.
 * This visual layer does not alter the existing engineering catalogue or release status.
 */
export const PHOTO_ATLAS = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3CahIyM475Z0tCzR9ChiMC8ez4d/ff13d904-0662-46e0-91c7-0b7cf35d4a6d.webp';
export const CROPS = {
  hero:[0,0,1006,360], teen:[0,370,318,112], room:[320,370,295,112],
  kids:[640,370,296,112], pets:[960,370,296,112], home:[1280,370,311,112],
  pegboard:[0,510,235,161], vanity:[260,510,235,161], desk:[520,510,235,161],
  wardrobe:[780,510,233,161], petstation:[1040,510,232,161], fishing:[1300,510,232,161],
  cup:[520,545,55,99], tray:[301,560,152,100], pocket:[165,568,68,64]
} as const;
export type PhotoKey = keyof typeof CROPS;
export const ROOMS = [
  {id:'teen',name:'teen rooms',subtitle:'study · gaming · gear · style',photo:'teen',spaces:['my room','ride & adventure']},
  {id:'room',name:'my room',subtitle:'wardrobe · vanity · desk · calm',photo:'room',spaces:['vanity','wardrobe & drawers']},
  {id:'kids',name:'kids rooms',subtitle:'organise · learn · grow',photo:'kids',spaces:['my room','desk & study']},
  {id:'pets',name:'pets',subtitle:'feeding · walking · storage',photo:'pets',spaces:['pets & everyday']},
  {id:'home',name:'home',subtitle:'drawers · workspaces · everyday',photo:'home',spaces:['wardrobe & drawers','plants & light','desk & study']}
] as const;
export type Pack={id:string;name:string;tagline:string;photo:PhotoKey;primary:string;extras:string[];rooms:string[];note:string};
export const PACKS:Pack[] = [
  {id:'essentials',name:'The Essentials Pegboard Kit',tagline:'A place for everything you reach for.',photo:'pegboard',primary:'grid-starter',extras:['name-tag'],rooms:['teen','room','kids','home'],note:'Panel tiles, a small ledge, cup and label. Wall fixings, load ratings and connector fit still need approval.'},
  {id:'vanity',name:'Vanity Organiser Set',tagline:'Your routine, beautifully in order.',photo:'vanity',primary:'vanity-pack',extras:['tile-starter'],rooms:['teen','room','home'],note:'Brush, jewellery and tube organisers. Cosmetics, brushes and furniture are styling props, not included.'},
  {id:'desk',name:'Desk Reset Kit',tagline:'Less searching. More getting into it.',photo:'desk',primary:'tile-starter',extras:['cable-pack'],rooms:['teen','room','kids','home'],note:'A tray system with optional cable organisers. Desk, devices and stationery are not included.'},
  {id:'wardrobe',name:'Wardrobe Starter Set',tagline:'Make more of the storage you have.',photo:'wardrobe',primary:'stack-starter',extras:['tile-starter'],rooms:['teen','room','kids','home'],note:'Small risers and inserts for existing furniture. The full-height wardrobe in the room concept is not included or released for manufacture.'},
  {id:'petstation',name:'Pet Station Kit',tagline:'All their everyday things, together.',photo:'petstation',primary:'bowl-surround',extras:['walk-pack','name-tag'],rooms:['pets','home'],note:'A surround for your existing washable bowl, plus optional walking organisers. Bowls, leads and bags are not included. No restraint hardware or chew toys.'},
  {id:'adventure',name:'Fishing & Adventure Kit',tagline:'Good gear deserves a good home.',photo:'fishing',primary:'grid-starter',extras:['gear-pack','name-tag'],rooms:['teen','home'],note:'An accessory wall with optional leader and covered lure storage. Fishing equipment is not included. The image is a styling concept; sharp hooks need protection.'}
];
export const PRODUCT_PHOTOS:Record<string,PhotoKey> = {
  'grid-starter':'pegboard','tile-starter':'desk','stack-starter':'wardrobe','vanity-pack':'vanity',
  'gear-pack':'fishing','cable-pack':'desk','walk-pack':'pets','bowl-surround':'petstation',
  'planter-sleeve':'home','shade-study':'teen','rally-clip':'fishing','name-tag':'petstation'
};
export function recommendedPacks(room:string,goal:string):Pack[]{
 const ids=room==='pets'?['petstation','essentials','desk']:goal==='clothes'?['wardrobe','vanity','essentials']:goal==='gear'?['adventure','essentials','desk']:goal==='routine'?['vanity','desk','wardrobe']:['essentials','desk','vanity'];
 return ids.map(id=>PACKS.find(p=>p.id===id)!);
}
