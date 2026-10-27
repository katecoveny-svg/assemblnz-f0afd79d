/* Only documented, rendered shopping controls. No cookies, tokens, network APIs,
   private account data, page stores, checkout fields or hidden application state. */
(function(root){
const tid=(id)=>'[data-testid="'+id+'"]';
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const one=(parent,selector)=>{const a=[...parent.querySelectorAll(selector)];if(a.length!==1)throw new Error('New World’s page layout changed. Use the retailer directly.');return a[0];};
function read(doc,url,now=Date.now()){
 const u=new URL(url);if(u.origin!=='https://www.newworld.co.nz'||!/^\/shop\/product\/\d+_(ea|kgm)_\w+$/.test(u.pathname))throw new Error('Open a product page on New World first.');
 const title=one(doc,'h1'+tid('product-title')),p=one(doc,tid('product'));
 const store=[...new Set([...doc.querySelectorAll(tid('choose-store'))].map(text).filter(Boolean))];if(store.length!==1||!store[0].startsWith('New World '))throw new Error('Choose your New World store first.');
 const dollars=text(one(p,tid('price-dollars'))),cents=text(one(p,tid('price-cents')));
 if(!/^\d+$/.test(dollars)||!/^\d{2}$/.test(cents))throw new Error('The displayed price cannot be read safely.');
 const quantity=Number(one(p,tid('quantity-edit')).value);
 const selects=[...p.querySelectorAll('select')];
 if(selects.length>1)throw new Error('Quantity unit is ambiguous.');
 const unit=selects.length?text(selects[0].selectedOptions?.[0]||selects[0].querySelector('option:checked')):text(one(p,tid('quantity-unit')));
 const priceUnit=text(one(p,tid('price-per')));
 const add=one(p,tid('add-to-cart'));
 const loginRequired=[...doc.querySelectorAll('button')].some(b=>text(b)==='Log in'&&!b.hidden);
 const promotion=p.querySelector(tid('non-promo-info-btn'))?'Regular / non-Club+ price. Offers may reduce the trolley total.':'Displayed price. Any multibuy or membership conditions must be checked on New World.';
 return {version:1,url:u.origin+u.pathname,sku:u.pathname.split('/').pop(),name:text(title),store:store[0],priceCents:Number(dollars)*100+Number(cents),priceUnit,unit,quantity,promotion,comparison:text(p.querySelector(tid('non-promo-comparative-price'))),observedAt:now,loginRequired,addMode:add.disabled?'Unavailable':text(add)};
}
function cart(doc,url){
 const p=doc.querySelector(tid('cart-preview'));if(!p)throw new Error('Open the New World trolley to verify this item.');
 const path=new URL(url).pathname;
 const links=[...p.querySelectorAll('a[href]')].filter(a=>{try{return new URL(a.getAttribute('href'),'https://www.newworld.co.nz').pathname===path;}catch{return false;}});
 if(!links.length)return {quantity:null,found:false,empty:/Your trolley is empty/i.test(text(p)),subtotal:text(p.querySelector(tid('cart-preview-subtotal'))),fees:text(p.querySelector(tid('cart-preview-fees')))};
 // Only accept an exact SKU row with one quantity and one unit. A changed layout fails closed.
 for(const link of links){let row=link.parentElement;while(row&&row!==p){const inputs=row.querySelectorAll(tid('quantity-edit'));
   const products=new Set([...row.querySelectorAll('a[href*="/shop/product/"]')].map(a=>new URL(a.getAttribute('href'),'https://www.newworld.co.nz').pathname));
   if(inputs.length===1&&products.size===1){const units=row.querySelectorAll(tid('quantity-unit')),selects=row.querySelectorAll('select');let unit=units.length===1?text(units[0]):selects.length===1?text(selects[0].selectedOptions?.[0]||selects[0].querySelector('option:checked')):null;
    return {found:true,quantity:Number(inputs[0].value),unit,subtotal:text(p.querySelector(tid('cart-preview-subtotal'))),fees:text(p.querySelector(tid('cart-preview-fees')))};
   }row=row.parentElement;
 }}
 return {found:true,quantity:null,unit:null,subtotal:text(p.querySelector(tid('cart-preview-subtotal'))),fees:text(p.querySelector(tid('cart-preview-fees')))};
}
root.NWDOM={read,cart,text,tid};
})(globalThis);
