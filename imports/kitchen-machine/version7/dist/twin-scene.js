import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {zones,jobState} from './twin-model.js';
import {TwinCanvasRenderer} from './twin-canvas.js';

export function initTwin(container,onSelect){
 const scene=new T.Scene(),root=new T.Group();scene.add(root);const camera=new T.PerspectiveCamera(36,1,.1,100),target=new T.Vector3(0,.3,0);
 let renderer,compatibility=false;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{renderer=new TwinCanvasRenderer();compatibility=true;container.dataset.renderer='canvas';document.querySelector('#sceneHint').textContent='Illustrated 3D · drag to orbit · tap an area';}if(!compatibility)container.dataset.renderer='webgl';
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0xeeeeE7,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;container.replaceChildren(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 scene.add(new T.HemisphereLight(0xffffff,0xb9acb0,2.6));const sun=new T.DirectionalLight(0xfff6e5,3);sun.position.set(-4,9,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.bias=-.001;scene.add(sun);
 const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
 const C={white:'#f8f5ec',wall:'#ddd8d1',plum:'#69475e',rose:'#cda2b7',sage:'#a5b8a4',green:'#597c69',blue:'#9aaebf',navy:'#43536b',orange:'#cd976e',silver:'#b7c0bd',dark:'#45424b',glass:'#a3c8c6'};
 let kind='',selected='',roofOn=false,labelOn=true,plan=false,distance=17.5,angle=.66,elevation=.7,goalAngle=angle,goalElevation=elevation;let roofGroup,solarGroup,batteryGroup,labels=[],zoneMeshes={},anchors={},cars=[],flows=[],lastData=null,lastHour=12;
 const resources=[];const mats=[];
 const mat=(color,extra={})=>{let m=new T.MeshStandardMaterial({color:C[color]||color,roughness:.65,metalness:.02,...extra});mats.push(m);return m;};
 function box(w,h,d,x,y,z,color,parent=root,r=.025){const g=r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d);resources.push(g);const m=new T.Mesh(g,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function cyl(r,h,x,y,z,color,parent=root){const g=new T.CylinderGeometry(r,r,h,20);resources.push(g);const m=new T.Mesh(g,mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
 function textPlane(text,x,y,z,w=2,rot=0){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=100;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,100);ctx.font='500 44px Arial';ctx.fillStyle='#5b4d57';ctx.textAlign='center';ctx.fillText(text,256,65);const tex=new T.CanvasTexture(canvas);resources.push(tex);const geo=new T.PlaneGeometry(w,w*.195);resources.push(geo);const mm=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});mats.push(mm);const mesh=new T.Mesh(geo,mm);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=rot;mesh.position.set(x,y,z);root.add(mesh);}
 function addZone(id,name,x,z,w,d,color='white'){const floor=box(w,.04,d,x,.09,z,color);floor.userData.zone=id;floor.userData.isFloor=true;zoneMeshes[id]=floor;anchors[id]=new T.Vector3(x,.9,z);const el=document.createElement('span');el.className='scene-label';el.textContent=name;el.setAttribute('aria-hidden','true');container.append(el);labels.push({el,id,name,position:anchors[id]});return floor;}
 function wall(w,x,z){box(w,1.4,.13,x,.75,z,'wall');}
 function sidewall(d,x,z){box(.13,1.4,d,x,.75,z,'wall');}
 function windowBlock(x,z,w=1.4){box(w,.65,.03,x,.94,z,'glass').material.transparent=true;}
 function roofBase(w,d){roofGroup=new T.Group();root.add(roofGroup);box(w,.13,d,0,1.86,0,'white',roofGroup);roofGroup.visible=roofOn;}
 function solar(x,z,rows=2,cols=4){solarGroup=new T.Group();solarGroup.userData.zone='solar';root.add(solarGroup);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const p=box(.68,.04,.9,x+c*.73,2.08,z+r*.96,'navy',solarGroup,.01);p.rotation.x=-.14;for(let a=0;a<3;a++)box(.005,.005,.88,x+c*.73-.22+a*.22,2.11,z+r*.96,'silver',solarGroup,0);}return solarGroup;}
 function car(x,z,color,scale=1){const g=new T.Group();root.add(g);g.position.set(x,.13,z);g.scale.setScalar(scale);box(.93,.25,1.9,0,.3,0,color,g,.1);box(.78,.31,.93,0,.57,-.1,color,g,.09);box(.68,.22,.04,0,.58,.38,'glass',g);box(.68,.22,.04,0,.58,-.58,'glass',g);box(.03,.21,.71,-.4,.58,-.1,'glass',g);box(.03,.21,.71,.4,.58,-.1,'glass',g);box(.7,.06,.07,0,.26,1,'silver',g);for(const xx of [-.47,.47])for(const zz of [-.6,.6]){const wh=cyl(.19,.13,xx,.2,zz,'dark',g);wh.rotation.z=Math.PI/2;const hub=cyl(.1,.14,xx,.2,zz,'silver',g);hub.rotation.z=Math.PI/2;}for(const xx of [-.3,.3])box(.2,.07,.04,xx,.38,.96,'white',g);return g;}
 function plant(x,z,s=1){const g=new T.Group();g.position.set(x,.1,z);g.scale.setScalar(s);root.add(g);cyl(.14,.27,0,.14,0,'rose',g);cyl(.025,.45,0,.48,0,'green',g);for(let i=0;i<5;i++){const ge=new T.SphereGeometry(.15,8,6);resources.push(ge);const m=new T.Mesh(ge,mat('sage'));m.position.set(Math.sin(i*2)*.12,.62+(i%2)*.13,Math.cos(i*2)*.12);m.scale.y=1.45;g.add(m);}return g;}
 function desk(x,z,parent=root){box(.8,.07,.48,x,.6,z,'white',parent);for(const s of [-1,1])box(.035,.5,.04,x+s*.3,.33,z,'silver',parent);box(.34,.05,.32,x,.34,z+.45,'sage',parent);box(.34,.28,.05,x,.5,z+.6,'sage',parent);}
 function flow(x1,z1,x2,z2){const from=new T.Vector3(x1,.18,z1),to=new T.Vector3(x2,.18,z2),g=new T.BufferGeometry().setFromPoints([from,to]);resources.push(g);const material=new T.LineDashedMaterial({color:0xb699af,dashSize:.12,gapSize:.12});mats.push(material);const line=new T.Line(g,material);line.computeLineDistances();root.add(line);const dot=new T.Mesh(new T.SphereGeometry(.055,8,6),mat('plum'));resources.push(dot.geometry);root.add(dot);flows.push({dot,from,to});}
 function clear(){for(const l of labels)l.el.remove();labels=[];for(const o of [...root.children])root.remove(o);for(const g of resources)g.dispose();for(const m of mats)m.dispose();resources.length=0;mats.length=0;zoneMeshes={};anchors={};cars=[];flows=[];roofGroup=null;solarGroup=null;batteryGroup=null;}
 function buildWorkshop(){
  box(11,.18,8,0,-.02,0,'white');wall(10.8,0,-3.8);sidewall(7.5,-5.4,0);windowBlock(-3.8,-3.72);windowBlock(3.8,-3.72);roofBase(11.1,8.1);
  const bays=[['inspect','INSPECTION',-3.7,-2],['bay1','BAY 01',-1.25,-2],['bay2','BAY 02',1.25,-2],['bay3','BAY 03',3.7,-2]];
  for(const [id,name,x,z] of bays){addZone(id,name,x,z,2.2,3.15,id==='inspect'?'#dedbd7':'#d6e1d7');for(const dx of [-.9,.9]){box(.12,1.4,.16,x+dx,.78,z,'plum');box(.23,.08,1.8,x+dx*.7,.2,z,'silver');}box(.5,.7,.28,x+.6,.45,-3.5,'rose');textPlane(name,x,.08,z+1.15,1.5);}
  addZone('quality','FINAL CHECKS',3.7,2,2.25,2.8,'#e5d5dc');addZone('parts','WAITING / HOLD',1.25,2,2.25,2.8,'#e7dfd3');addZone('lounge','CUSTOMER LOUNGE',-3.7,2,2.4,2.8,'#e0dfd0');addZone('arrival','ARRIVAL',-1.25,2,2.2,2.8,'#e8e2dd');
  box(2.1,.5,.42,-3.8,.35,2.8,'sage');box(.38,.5,1.5,-4.7,.35,2.25,'sage');cyl(.36,.07,-3.8,.45,1.9,'white');cyl(.07,.36,-3.8,.23,1.9,'silver');box(.8,.7,.45,-4.7,.45,.9,'white');plant(-2.8,3.05);box(1.1,.7,.4,-1.3,.45,3.05,'rose');box(.35,.25,.08,-1.3,.92,3,'dark');
  for(let j=0;j<3;j++)box(.45,.22,.35,.65+j*.55,.25,3,'white');
  textPlane('W I N G E R   /   S P A T I A L   S T U D Y',0,.1,3.85,5);for(const x of [-3.7,-1.25,1.25,3.7])flow(x,0,x,-1.4);
  for(let i=0;i<13;i++){let c=car(0,0,['sage','white','rose','blue','silver'][i%5],.88);c.visible=false;cars.push(c);}
 }
 function buildHome(){
  box(9.4,.18,7,0,-.02,0,'white');wall(9.2,0,-3.4);sidewall(6.7,-4.6,0);wall(6.5,-1.3,.2);sidewall(3.3,.5,-1.6);sidewall(3,1.8,1.8);roofBase(9.5,7.1);windowBlock(-2.5,-3.32,2.4);windowBlock(2.7,-3.32,2.2);
  addZone('living','LIVING',-2.5,1.8,3.8,3,'#e2d5dd');addZone('kitchen','KITCHEN',-2.2,-1.7,4.5,2.9,'#e0e4d8');addZone('bedrooms','BEDROOMS',2.5,-1.7,3.8,2.9,'#d9e0df');addZone('garage','GARAGE / EV',3,1.8,2.6,3,'#ddd9d2');
  box(2,.48,.75,-2.6,.4,2.6,'rose');box(.3,.4,.8,-3.7,.55,2.6,'rose');box(2.2,.35,.22,-2.6,.65,2.97,'rose');box(1.2,.12,.75,-2.5,.42,1.25,'white');plant(-4.1,2.6,1.2);box(1.5,.75,.45,-2.5,.5,.55,'white');box(1.1,.55,.07,-2.5,1.15,.55,'dark');
  box(3.4,.7,.6,-2.7,.45,-2.85,'white');box(.8,1.35,.7,-4,.78,-1.65,'sage');box(1.8,.8,.85,-1.7,.5,-1.1,'white');for(const x of [-2.15,-1.3])cyl(.2,.08,x,.61,-.38,'rose');box(.65,.03,.4,-2.9,.82,-2.8,'silver');box(.5,.04,.4,-1.3,.82,-2.8,'dark');
  for(const x of [1.5,3.5]){box(1.4,.3,1.8,x,.32,-1.7,'white');box(1.4,.14,1.1,x,.53,-1.4,'sage');box(1,.15,.4,x,.57,-2.3,'white');}car(3,1.65,'white',.9);box(.2,.65,.35,4.15,.65,.6,'plum');
  addZone('solar','SOLAR',-.8,-2.1,.01,.01,'white');anchors.solar.set(-1,2.3,-2);solar(-1.8,-2.5,2,4);
  addZone('battery','BATTERY',.9,2.7,.7,.7,'white');batteryGroup=new T.Group();root.add(batteryGroup);box(.6,.95,.3,.9,.65,2.6,'white',batteryGroup);box(.3,.06,.02,.9,.8,2.77,'green',batteryGroup);flow(-1.4,-2,.8,2.5);flow(.8,2.5,-2.5,1.8);flow(.8,2.5,3,1.5);textPlane('H O M E   /   E N E R G Y   S T U D Y',-.5,.1,3.35,5);
 }
 function buildBusiness(k){
  box(11,.18,8,0,-.02,0,'white');wall(10.8,0,-3.85);sidewall(7.6,-5.4,0);wall(10.8,0,.1);sidewall(3.6,.1,-1.8);sidewall(3.2,1.5,2);roofBase(11.1,8.1);
  const ids=zones[k].filter(z=>!['solar','plant'].includes(z[0]));const pos=[[-2.6,-1.8,5,3.5],[2.75,-1.8,5,3.5],[-1.9,2,6.5,3.4],[3.4,2,3.3,3.4]];
  ids.forEach(([id,name],i)=>addZone(id,name.toUpperCase(),...pos[i],['#dce3da','#e7d7df','#e4dfd0','#d6dfe4'][i]));
  if(k==='school'){
   for(const offset of [-2.6,2.75])for(let r=0;r<2;r++)for(let c=0;c<3;c++)desk(offset-1.5+c*1.45,-2.7+r*1.45);
   for(const x of [-2.5,2.8])box(2.4,.65,.06,x,1.1,-3.73,'green');for(let r=0;r<2;r++)box(4,.3,.4,-1.7,.3,1.4+r*.9,'white');desk(2.6,1.5);desk(4.1,2.7);plant(4.6,.7);
  }else if(k==='grocery'){
   for(let c=0;c<4;c++){box(.9,1.15,.6,-4.4+c*1.15,.68,-3.35,'sage');box(.76,.85,.04,-4.4+c*1.15,.73,-3.02,'glass');for(let r=0;r<3;r++)for(let j=0;j<3;j++)box(.13,.16,.1,-4.65+c*1.15+j*.23,.35+r*.3,-3,'white');}
   for(let r=0;r<2;r++)for(let c=0;c<3;c++){box(.9,.7,.65,1+c*1.5,.45,-2.8+r*1.6,'white');for(let j=0;j<4;j++)box(.12,.2,.22,.67+c*1.5+j*.2,.91,-2.8+r*1.6,['rose','sage','orange'][j%3]);}
   box(4,.75,.8,-2,.5,2.1,'white');box(1,.85,.75,-4,.55,1,'silver');for(let j=0;j<3;j++)box(.8,.6,.75,2.2+j*1.1,.4,2.3,'orange');
  }else{
   for(let c=0;c<3;c++){box(1.2,.25,1.5,-4+c*1.65,.25,-1.6,'white');box(.7,.55,.6,-4+c*1.65,.65,-1.6,['rose','sage','blue'][c]);}
   for(let c=0;c<4;c++)for(let r=0;r<2;r++)box(.8,.6,.8,1+c*1.05,.4+r*.65,-2.7,'orange');box(3,.8,.65,-2,.5,2,'rose');box(.5,.35,.1,-1.5,1.1,2,'dark');desk(3,1.5);plant(4.5,3);
  }
  addZone('plant','ESSENTIAL',4.6,3.3,.4,.4,'white');box(.55,.75,.4,4.8,.5,3.4,'silver');addZone('solar','SOLAR',-.9,-.5,.01,.01,'white');anchors.solar.set(-.6,2.4,-.6);solar(-2.2,-.85,1,5);
  flow(-1.1,-.8,-2.5,-1.8);flow(-1.1,-.8,2.8,-1.8);flow(-1.1,-.8,-1.9,2);flow(-1.1,-.8,3.5,2);textPlane(k.toUpperCase()+'   /   SPATIAL STUDY',0,.11,3.85,5);
 }
 function build(k){clear();kind=k;if(k==='winger')buildWorkshop();else if(k==='home')buildHome();else buildBusiness(k);if(solarGroup)solarGroup.visible=false;for(const l of labels)l.position=anchors[l.id];}
 function set(data){lastData=data;if(kind!==data.kind)build(data.kind);lastHour=data.hour??12;
  for(const l of labels){const value=data.values?.[l.id];l.el.textContent=l.name+(value===undefined?'':data.kind==='winger'?' · '+value:'\n'+value.toFixed(1)+' kW');}
  for(const [id,floor] of Object.entries(zoneMeshes)){const v=data.values?.[id]??0;floor.material.emissive.set(id===selected?'#956480':data.kind==='winger'?'#000000':'#93774e');floor.material.emissiveIntensity=id===selected?.17:Math.min(v/30,.17);}
  if(data.kind==='winger'){
   const counts={};data.result.jobs.forEach((job,i)=>{const status=jobState(job,data.minute),g=cars[i];g.visible=!['not-arrived','complete'].includes(status);if(!g.visible)return;const a=anchors[status]||anchors.arrival,n=counts[status]||0;counts[status]=n+1;g.position.set(a.x+(status==='arrival'||status==='parts'?(n%2)*.5-.3:0),status.startsWith('bay')?.5:.13,a.z+(status==='arrival'||status==='parts'?Math.floor(n/2)*.65-.5:0));g.scale.setScalar(status==='arrival'||status==='parts'?.5:.88);g.userData.zone=status;});for(let i=data.result.jobs.length;i<cars.length;i++)cars[i].visible=false;
   for(const id of ['bay1','bay2','bay3'])if(Number(id.slice(3))>data.result.bays)zoneMeshes[id].material.color.set('#c9c4c0');else zoneMeshes[id].material.color.set('#d6e1d7');
  }else{if(solarGroup)solarGroup.visible=data.solar>0;if(batteryGroup)batteryGroup.visible=data.battery>0;}
 }
 function select(id){selected=id;labels.forEach(l=>l.el.classList.toggle('selected',l.id===id));if(lastData)set(lastData);}
 function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(container);resize();
 let drag=null,moved=0;renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY};moved=0;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved+=Math.abs(dx)+Math.abs(dy);if(!plan){goalAngle-=dx*.009;goalElevation=Math.max(.25,Math.min(1.35,goalElevation+dy*.006));}drag={x:e.clientX,y:e.clientY};});
 const ray=new T.Raycaster();renderer.domElement.addEventListener('pointerup',e=>{if(drag&&moved<6){const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);for(const hit of ray.intersectObjects(root.children,true)){let o=hit.object;while(o&&!o.userData.zone)o=o.parent;if(o?.userData.zone){onSelect(o.userData.zone);break;}}}drag=null;});renderer.domElement.addEventListener('pointercancel',()=>drag=null);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let visible=true;new IntersectionObserver(es=>visible=es[0].isIntersecting).observe(container);
 let lastFrame=0;function render(t){requestAnimationFrame(render);if(!visible||document.hidden||compatibility&&t-lastFrame<65)return;lastFrame=t;angle+=(goalAngle-angle)*.1;elevation+=(goalElevation-elevation)*.1;const aspect=container.clientWidth/container.clientHeight;const d=distance*(aspect<1?1.16:1);if(plan){camera.position.set(0,d*.9,.001);camera.up.set(0,0,-1);}else{camera.up.set(0,1,0);camera.position.set(Math.sin(angle)*Math.cos(elevation)*d,Math.sin(elevation)*d,Math.cos(angle)*Math.cos(elevation)*d);}camera.lookAt(target);camera.updateMatrixWorld();for(const l of labels){l.el.hidden=!labelOn||roofOn&&l.id!=='solar';if(l.el.hidden)continue;const p=l.position.clone().project(camera);l.el.style.left=(p.x*.5+.5)*container.clientWidth+'px';l.el.style.top=(-p.y*.5+.5)*container.clientHeight+'px';}
  flows.forEach((f,i)=>{const a=reduce?.5:(t*.00015+i*.23)%1;f.dot.position.lerpVectors(f.from,f.to,a);f.dot.visible=kind==='winger'||(lastData?.solarOutput||0)>.05;});renderer.render(scene,camera);
 }requestAnimationFrame(render);
 return {set,select,roof(v){roofOn=v;if(roofGroup)roofGroup.visible=v;},labels(v){labelOn=v;},view(v){plan=v==='plan';},zoom(v){distance=Math.max(11,Math.min(28,distance-v*1.5));},reset(){distance=17.5;goalAngle=.66;goalElevation=.7;}};
}
