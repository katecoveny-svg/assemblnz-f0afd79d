/** Browser/server shared URL selection only; no resolution or network. Actual
 * collection independently rechecks DNS and pins the public address. */
export function selectedPublicUrl(raw:string):string{
 if(raw.length>1500)throw Error('Source URL is too long.');const url=new URL(raw),host=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443'||/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)||host.startsWith('[')||!host.includes('.')||host.endsWith('.')||['localhost','local','internal','test','invalid','example'].some(s=>host===s||host.endsWith(`.${s}`)))throw Error('Choose a public HTTPS company or job page, or paste its text.');
 url.hash='';return url.href;
}
