(()=>{
if(globalThis.__assemblBridge)return;globalThis.__assemblBridge=true;
const origin='https://kitchen-machine-kate.katecoveny.chatgpt.site';
if(location.origin!==origin||window.top!==window)return;
const allowed=new Set(['status','prepare','open','disconnect']);
window.addEventListener('message',async e=>{
 const m=e.data;if(e.source!==window||e.origin!==origin||m?.channel!=='assembl.newworld.request'||!allowed.has(m.action)||typeof m.id!=='string'||m.id.length>100)return;
 try{const r=await chrome.runtime.sendMessage({from:'kitchen-site',action:m.action,plan:m.plan});window.postMessage({channel:'assembl.newworld.response',id:m.id,...r},origin);}catch{window.postMessage({channel:'assembl.newworld.response',id:m.id,ok:false,error:'Companion disconnected. Open the extension to reconnect.'},origin);}
});
})();
