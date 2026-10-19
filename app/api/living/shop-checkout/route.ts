import {NextResponse} from 'next/server';
/** Server-side release gate. A browser flag or exported JSON cannot authorise payment or manufacturing. */
export async function POST(){
 return NextResponse.json({code:'PRODUCT_RELEASE_REQUIRED',checkoutUrl:null,orderCreated:false,message:'This range is not yet released for purchase. No payment or manufacturing order was created.',requirements:['Approved physical product and manufacturing revision','Confirmed fulfilment and quote','Authenticated Shopify integration']},{status:409,headers:{'Cache-Control':'no-store'}});
}
