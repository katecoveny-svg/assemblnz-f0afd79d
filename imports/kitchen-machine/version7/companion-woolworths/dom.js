/* Rendered shopping DOM only. No cookies, private APIs or page application state. */
(function(root){
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const cls=prefix=>'[class*="'+prefix+'"]';
const one=(parent,selector)=>{const list=[...parent.querySelectorAll(selector)];if(list.length!==1)throw new Error('Woolworths page layout is unclear. Use the retailer directly.');return list[0];};
function product(doc){return one(doc,cls('price-panel_pricePanel__'));}
function addButton(doc){const p=product(doc),buttons=[...p.querySelectorAll('button')].filter(b=>text(b)==='Add to cart');if(buttons.length!==1||buttons[0].disabled)throw new Error('The product is unavailable, already in the trolley, or its Add control changed. Review it on Woolworths.');return buttons[0];}
function read(doc,url,now=Date.now()){
 const u=new URL(url);if(u.origin!=='https://www.woolworths.co.nz'||!/^\/shop\/product-details\/\d+\/[a-z0-9-]+\/?$/.test(u.pathname))throw new Error('Open a product page on Woolworths NZ.');
 const p=product(doc),name=text(one(p,'h1'));
 const value=text(one(p,cls('product-price_value__'))),priceUnit=text(one(p,cls('product-price_unit__'))) || 'ea';
 if(!/^\$\d+\.\d{2}$/.test(value))throw new Error('The displayed price cannot be read safely.');
 // A fixed-price Add button adds one pack. Never infer the weight behind a unit toggle.
 if(priceUnit!=='ea'||p.querySelector('[role="radiogroup"]')||p.querySelector('input'))throw new Error('Set weighed products and larger quantities directly on Woolworths. This pilot adds one fixed-price pack.');
 const locations=[...doc.querySelectorAll(cls('fulfilment-bar_textContainer__'))].filter(e=>/^(Pick ?up|Collection):$/i.test(text(e.querySelector(cls('fulfilment-bar_label__')))));
 if(locations.length!==1)throw new Error('Choose a pickup store on Woolworths first. Delivery support is still being validated.');
 const storeName=text(one(locations[0],'button'));
 if(!storeName||/select|choose|loading/i.test(storeName)||storeName.length>120)throw new Error('Choose a pickup store on Woolworths first.');
 const account=[...doc.querySelectorAll('button')].filter(e=>String(e.className).includes('login-button_loginControl__'));
 // Missing account controls do not establish a signed-in session. Do not record the account name.
 const loginRequired=account.length!==1||/log\s?in|sign\s?up/i.test(text(account[0]));
 const promotion=[...p.querySelectorAll(cls('tag_core-tag-label__'))].map(text).join(' · ')||'Displayed price';
 const b=addButton(doc);
 return {version:1,url:u.origin+u.pathname.replace(/\/$/,''),sku:u.pathname.split('/')[3],name,store:'Woolworths pickup · '+storeName,priceCents:Math.round(Number(value.slice(1))*100),priceUnit:'ea',unit:'ea',quantity:1,promotion:promotion+'. Check membership and multibuy conditions on Woolworths.',comparison:text(p.querySelector(cls('product-cup-price_price__'))),observedAt:now,loginRequired,addMode:text(b)};
}
root.WWDOM={read,addButton,text};
})(globalThis);
