import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import { proposedQuotaDriver } from '../security-proposals/nz-plugin-hosting/quota-driver.mjs';
test('noncooperative driver retains4 slots after timeout and only actual end restores capacity', async () => {
  const clients=[];
  class Hung extends EventEmitter {
    constructor() { super(); clients.push(this); }
    connect() { return new Promise(()=>{}); }
    end() { return new Promise(()=>{}); }
  }
  const driver=proposedQuotaDriver(Hung,{});
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
  const driver=proposedQuotaDriver(Broken,{});
  assert.equal(await driver.claim({invocationId:'fictional',kind:'mcp'}),null); assert.equal(driver.active(),0);
  class Rejected extends EventEmitter {
    async connect() { throw new Error('private connection string'); }
    async end() { this.emit('end'); }
  }
  const rejected=proposedQuotaDriver(Rejected,{});
  assert.equal(await rejected.release('fictional',1),null); assert.equal(rejected.active(),0);
});
