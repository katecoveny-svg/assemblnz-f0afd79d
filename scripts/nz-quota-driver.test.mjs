import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import { proposedQuotaDriver, normalizeQuotaConnection } from '../security-proposals/nz-plugin-hosting/quota-driver.mjs';
const configuration={host:'db.fictional.supabase.co',port:5432,user:'nz_freight_runtime',database:'postgres',password:'fictional-only',ssl:{rejectUnauthorized:true,ca:'-----BEGIN CERTIFICATE-----\nfictional'}};
class Configured extends EventEmitter {
 constructor(config){super();this.connectionParameters={...config,connect_timeout:0};this._connectionTimeoutMillis=config.connectionTimeoutMillis;}
}
test('noncooperative driver retains4 slots after timeout and only actual end restores capacity', async () => {
  const clients=[];
  class Hung extends Configured {
    constructor(config) { super(config); clients.push(this); }
    connect() { return new Promise(()=>{}); }
    end() { return new Promise(()=>{}); }
  }
  const driver=proposedQuotaDriver(Hung,configuration);
  const first=Array.from({length:4},()=>driver.claim({invocationId:'fictional',kind:'mcp'}));
  assert.equal(await driver.claim({invocationId:'fifth',kind:'mcp'}),null);
  assert.deepEqual(await Promise.all(first),[null,null,null,null]);
  assert.equal(driver.active(),4); assert.equal(clients.length,4);
  assert.equal(await driver.claim({invocationId:'sixth',kind:'mcp'}),null);
  clients[0].emit('end'); assert.equal(driver.active(),3);
  const controller=new AbortController();
  const next=driver.claim({invocationId:'fresh',kind:'mcp'},controller.signal);
  controller.abort(); assert.equal(await next,null);
  assert.equal(driver.active(),4); assert.equal(clients.length,5);
});
test('constructor and connect errors return fixed null without exposing errors', async () => {
  class Broken { constructor() { throw new Error('private connection string'); } }
  const driver=proposedQuotaDriver(Broken,configuration);
  assert.equal(await driver.claim({invocationId:'fictional',kind:'mcp'}),null); assert.equal(driver.active(),0);
  class Rejected extends Configured {
    async connect() { throw new Error('private connection string'); }
    async end() { this.emit('end'); }
  }
  const rejected=proposedQuotaDriver(Rejected,configuration);
  assert.equal(await rejected.release('fictional',1),null); assert.equal(rejected.active(),0);
});

test('strict normalization rejects connection strings, overrides, partial fields and TLS weakening before constructing pg', async()=>{
 let constructors=0;
 class Counted { constructor(){constructors++;} }
 const invalid=[{...configuration,connectionString:'postgres://fictional/?statement_timeout=0&lock_timeout=0&query_timeout=0'}, {...configuration,options:'-c statement_timeout=0'}, {...configuration,ssl:{rejectUnauthorized:false,ca:'fictional'}}, {...configuration,password:''}, {...configuration,query_timeout:0}, {...configuration,ssl:{...configuration.ssl,servername:'other.invalid'}}];
 for(const key of ['host','port','user','database','password','ssl']){const partial={...configuration};delete partial[key];invalid.push(partial);}
 const accessor={...configuration};Object.defineProperty(accessor,'password',{get(){throw new Error('must not read accessor');}});invalid.push(accessor);
 for(const input of invalid){assert.equal(normalizeQuotaConnection(input),null);assert.equal(await proposedQuotaDriver(Counted,input).claim({invocationId:'fictional',kind:'mcp'}),null);}
 assert.equal(constructors,0);
});
test('altered final effective pg settings fail closed before connect and release never-connected capacity',async()=>{
 let connects=0;
 class Altered extends Configured {
  constructor(config){super(config);this.connectionParameters.query_timeout=0;}
  async connect(){connects++;}
  async end(){}
 }
 const driver=proposedQuotaDriver(Altered,configuration);
 assert.equal(await driver.claim({invocationId:'fictional',kind:'mcp'}),null);assert.equal(connects,0);assert.equal(driver.active(),0);
});
