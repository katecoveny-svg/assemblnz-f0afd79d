const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const failures=[];
for(const [width,height,motion] of [[1440,1000,'no-preference'],[375,812,'no-preference'],[375,812,'reduce']]) {
 const page=await browser.newPage({viewport:{width,height},reducedMotion:motion});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL || 'http://127.0.0.1:3000',{waitUntil:'networkidle',timeout:120000});
 const data=await page.evaluate(()=>{
  const a=[...document.querySelectorAll('a')].find(a=>a.textContent.includes('Give DO a job'));
  const input=document.getElementById('atw-do-intent');
  const submit=document.querySelector('form[aria-label="Give DO a job"] button');
  const rect=submit.getBoundingClientRect();const top=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
  return {color:getComputedStyle(a).color,bg:getComputedStyle(a).backgroundColor,inputBottom:input.getBoundingClientRect().bottom,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,submitUsable:top===submit||submit.contains(top)};
 });
 for(const [check,fn] of [['CTA contrast',()=>assert.notEqual(data.color,data.bg)],['Job input available on arrival',()=>assert.ok(data.inputBottom<=data.height)],['No overflow',()=>assert.equal(data.overflow,false)],['Submit not covered by DO',()=>assert.equal(data.submitUsable,true)],['No hydration errors',()=>assert.deepEqual(errors,[])]])try{fn();}catch{failures.push({width,height,motion,check,data,errors});}
 await page.close();
}
await browser.close();console.log(JSON.stringify(failures,null,2));assert.equal(failures.length,0,'Public hero acceptance failures');
