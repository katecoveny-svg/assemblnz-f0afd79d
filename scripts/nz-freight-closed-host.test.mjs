import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
const output=resolve(import.meta.dirname,'../.local-plugin-packages/freight-closed-host/.vercel/output');
test('closed build has one function, no static app and exact catch-all routing',()=>{
 assert.deepEqual(readdirSync(output).sort(),['config.json','functions']);
 assert.deepEqual(readdirSync(resolve(output,'functions')),['closed.func']);
 assert.deepEqual(JSON.parse(readFileSync(resolve(output,'config.json'))),{version:3,routes:[{src:'/.*',dest:'/closed'}]});
 const code=readFileSync(resolve(output,'functions/closed.func/index.mjs'),'utf8');
 for(const forbidden of ['process.env','supabase','stripe','createSpecialistServer','fetch(','node:child_process']) assert(!code.includes(forbidden));
});
test('actual closed Node entry denies unknown hosts/static/internal paths; no body or errors returned',async()=>{
 const {default:handler}=await import(pathToFileURL(resolve(output,'functions/closed.func/index.mjs')).href);
 const server=createServer(handler); await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try {
  for(const [host,path,method,status] of [['nz-freight.assembl.co.nz','/mcp','POST',503],['nz-freight.assembl.co.nz','/privacy','GET',503],['nz-freight.assembl.co.nz','/.well-known/openai-apps-challenge','GET',503],['nz-freight.assembl.co.nz','/_next/static/x','GET',404],['nz-freight.assembl.co.nz','/api/mcp','POST',404],['assembl.co.nz','/mcp','POST',404],['nz-rfi.assembl.co.nz','/mcp','POST',404]]){
   const response=await new Promise((resolve,reject)=>{
    const req=request(base+path,{method,headers:{host,'content-type':'application/json'}},res=>{
     let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));
    });req.on('error',reject);req.end(method==='POST'?'fictional private body':undefined);
   });
   assert.equal(response.status,status); assert.equal(response.body,''); assert.equal(response.headers['cache-control'],'no-store');
  }
 } finally { await new Promise(r=>server.close(r)); }
});
