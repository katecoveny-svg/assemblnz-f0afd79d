import * as T from './vendor/three.module.js';

const PI=Math.PI;
let seed=79; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const range=(a,b)=>a+rand()*(b-a);
export const places={
  street:{camera:[0,2.3,16],target:[0,1.7,-7],title:'Life between the stones.',number:'01 / THE STREET',description:'A raised crossing, worn paving and the shops beside it. Read the clues in an ordinary street.',clue:'crossing'},
  counter:{camera:[2.5,2.55,12.3],target:[8.5,1.1,12],title:'Lunch, out in the city.',number:'02 / THE FOOD COUNTER',description:'Look inside a thermopolium. Built-in jars tell us something about food, but leave other questions open.',clue:'counter'},
  bakery:{camera:[2.1,2.6,-.1],target:[9,1.25,-.8],title:'Behind every loaf.',number:'03 / THE BAKERY',description:'Explore the mill and oven. Whose labour made the comforts of city life possible?',clue:'mill'},
  courtyard:{camera:[-6.8,2.8,-1.3],target:[-10.8,1.3,-10.7],title:'A little sky, indoors.',number:'04 / THE COURTYARD HOME',description:'Follow the rain into the basin, then look at the painted walls. Beauty and practical design shared a room.',clue:'water'}
};
export const anchors={crossing:[-.6,.7,6],counter:[6.4,1.7,11.9],mill:[7.2,1.9,-1.6],water:[-10.5,.6,-8],fresco:[-15.65,2.1,-11],amphora:[8.1,1.4,15]};

export function createWorld(canvas,onReady){
  const mobile=innerWidth<700;
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  const scene=new T.Scene(); scene.background=new T.Color('#e7dac2'); scene.fog=new T.FogExp2('#e3d1b4',.008);
  const camera=new T.PerspectiveCamera(48,innerWidth/innerHeight,.1,260);camera.position.set(24,22,35);camera.lookAt(-1,1,-5);
  const sun=new T.DirectionalLight('#fff0d7',3.4);sun.position.set(-25,42,24);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-39;sun.shadow.camera.right=39;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;sun.shadow.camera.far=120;sun.shadow.normalBias=.035;sun.shadow.bias=-.00014;sun.shadow.radius=3;scene.add(sun);
  scene.add(new T.HemisphereLight('#e7f0eb','#ae8761',2));const bounce=new T.DirectionalLight('#f7dfbe',.6);bounce.position.set(15,9,-10);scene.add(bounce);
  const root=new T.Group();scene.add(root);const roofs=new T.Group();root.add(roofs);const mills=[];const smoke=[];
  const boxGeo=new T.BoxGeometry(1,1,1);const temp=new T.Object3D();
  function texture(type,size=512){
    const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');
    if(type==='stone'){x.fillStyle='#988d7e';x.fillRect(0,0,size,size);for(let row=0;row<8;row++)for(let col=-1;col<8;col++){let xx=col*75+(row%2)*35,yy=row*65;x.fillStyle=`hsl(32 10% ${range(48,66)}%)`;x.fillRect(xx+3,yy+3,69,59);x.strokeStyle='#ffffff13';x.lineWidth=2;x.strokeRect(xx+5,yy+5,64,52);}}
    if(type==='plaster'){x.fillStyle='#e3cfb0';x.fillRect(0,0,size,size);for(let i=0;i<10000;i++){x.fillStyle=`rgba(${rand()>.5?'255,249,227':'116,86,50'},${rand()*.055})`;x.fillRect(rand()*size,rand()*size,rand()*15,rand()*4);}}
    if(type==='roof'){x.fillStyle='#b76c4c';x.fillRect(0,0,size,size);for(let r=0;r<8;r++)for(let j=0;j<12;j++){const xx=j*43,yy=r*64;const gr=x.createLinearGradient(xx,0,xx+43,0);gr.addColorStop(0,'#804b36');gr.addColorStop(.3,'#c78b62');gr.addColorStop(.65,'#b97c52');gr.addColorStop(1,'#9a5c3e');x.fillStyle=gr;x.fillRect(xx,yy,43,64);x.strokeStyle='#6f402a65';x.lineWidth=3;x.beginPath();x.moveTo(xx,yy+60);x.quadraticCurveTo(xx+21,yy+68,xx+43,yy+60);x.stroke();}}
    if(type==='wood'){x.fillStyle='#695035';x.fillRect(0,0,size,size);for(let i=0;i<150;i++){x.strokeStyle=`rgba(31,23,12,${rand()*.24})`;x.lineWidth=range(1,3);x.beginPath();const xx=rand()*size;x.moveTo(xx,0);x.bezierCurveTo(xx+range(-8,8),130,xx+range(-8,8),390,xx,size);x.stroke();}for(let i=0;i<7;i++){x.fillStyle='#33291a';x.fillRect(i*85,0,3,size);}}
    if(type==='mosaic'){x.fillStyle='#e8dcc3';x.fillRect(0,0,size,size);for(let y=0;y<32;y++)for(let j=0;j<32;j++){let black=(j%16<2||y%16<2);x.fillStyle=black?'#554e43':`hsl(39 28% ${range(72,86)}%)`;x.fillRect(j*16+1,y*16+1,14,14);}x.strokeStyle='#544a3b';x.lineWidth=6;x.strokeRect(64,64,384,384);x.strokeRect(75,75,362,362);}
    if(type==='fresco'){x.fillStyle='#a14b3d';x.fillRect(0,0,size,size);for(let i=0;i<7000;i++){x.fillStyle=`rgba(229,189,142,${rand()*.08})`;x.fillRect(rand()*size,rand()*size,rand()*5+1,rand()*12+1);}x.fillStyle='#302f27';x.fillRect(0,390,512,122);x.fillStyle='#bc9b57';x.fillRect(0,382,512,5);x.fillRect(0,43,512,5);x.strokeStyle='#d4b47d';x.lineWidth=3;x.strokeRect(55,75,402,271);x.lineWidth=1;x.strokeRect(64,84,384,253);for(let a=0;a<5;a++){x.strokeStyle='#ceac6e';x.beginPath();x.moveTo(80+a*88,50);x.lineTo(80+a*88,74);x.stroke();}x.save();x.translate(256,210);x.strokeStyle='#c0a56d';x.lineWidth=2;x.beginPath();x.ellipse(0,0,42,60,0,0,PI*2);x.stroke();for(let i=0;i<12;i++){x.rotate(PI/6);x.beginPath();x.ellipse(0,-33,5,13,.7,0,PI*2);x.stroke();}x.restore();}
    if(type==='counter'){x.fillStyle='#c6a26d';x.fillRect(0,0,size,size);x.fillStyle='#8e342c';x.fillRect(0,370,size,142);x.fillRect(0,25,size,13);x.strokeStyle='#ebd5a4';x.lineWidth=4;x.strokeRect(35,65,442,270);for(let a=0;a<3;a++){const xx=110+a*145;x.strokeStyle='#6c6550';x.lineWidth=4;x.beginPath();x.moveTo(xx,300);x.quadraticCurveTo(xx-35,220,xx,150);x.quadraticCurveTo(xx+35,220,xx,300);x.stroke();x.beginPath();x.moveTo(xx-17,174);x.quadraticCurveTo(xx-63,150,xx-35,222);x.moveTo(xx+17,174);x.quadraticCurveTo(xx+63,150,xx+35,222);x.stroke();}}
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return tex;
  }
  const tex={};for(const t of ['stone','plaster','roof','wood','mosaic','fresco','counter'])tex[t]=texture(t);
  const mat={
    plaster:new T.MeshStandardMaterial({map:tex.plaster,roughness:.95,color:'#f3e6ca',bumpMap:tex.plaster,bumpScale:.06}),
    stone:new T.MeshStandardMaterial({map:tex.stone,roughness:1,bumpMap:tex.stone,bumpScale:.08}),
    red:new T.MeshStandardMaterial({color:'#924a3e',roughness:.95,map:tex.plaster}),
    cream:new T.MeshStandardMaterial({color:'#e3d4b2',roughness:.8}),
    white:new T.MeshStandardMaterial({color:'#efe2c8',roughness:.8}),
    dark:new T.MeshStandardMaterial({color:'#473c31',roughness:1}),
    wood:new T.MeshStandardMaterial({map:tex.wood,roughness:.85}),
    roof:new T.MeshStandardMaterial({map:tex.roof,roughness:.9,side:T.DoubleSide,bumpMap:tex.roof,bumpScale:.055}),
    terra:new T.MeshStandardMaterial({color:'#b27651',roughness:.86}),
    potdark:new T.MeshStandardMaterial({color:'#704c35',roughness:.95}),
    iron:new T.MeshStandardMaterial({color:'#3f3931',metalness:.4,roughness:.8}),
    basalt:new T.MeshStandardMaterial({color:'#645f53',roughness:1,map:tex.stone}),
    sand:new T.MeshStandardMaterial({color:'#b7a483',roughness:1}),
    mosaic:new T.MeshStandardMaterial({map:tex.mosaic,roughness:.72}),
    fresco:new T.MeshStandardMaterial({map:tex.fresco,roughness:.9}),
    counter:new T.MeshStandardMaterial({map:tex.counter,roughness:.9}),
    green:new T.MeshStandardMaterial({color:'#727a45',roughness:.9}),
    bread:new T.MeshStandardMaterial({color:'#b88144',roughness:1})
  };
  function cube(x,y,z,w,h,d,m=mat.plaster,parent=root){let obj=new T.Mesh(boxGeo,m);obj.position.set(x,y,z);obj.scale.set(w,h,d);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
  function cyl(x,y,z,r1,r2,h,m=mat.cream,parent=root,n=20){let obj=new T.Mesh(new T.CylinderGeometry(r1,r2,h,n),m);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;}
  function ball(x,y,z,r,m,parent=root,sx=1,sy=1,sz=1){const obj=new T.Mesh(new T.SphereGeometry(r,12,8),m);obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);obj.castShadow=true;parent.add(obj);return obj;}
  function plane(vertices,uv,material,parent=root){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();let mesh=new T.Mesh(g,material);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function roof(cx,cy,cz,w,d){const rise=w*.2;
    for(const s of [-1,1]){plane([cx,cy+rise,cz-d/2,cx+s*w/2,cy,cz-d/2,cx+s*w/2,cy,cz+d/2,cx,cy+rise,cz+d/2],[0,0,w/5,0,w/5,d/5,0,d/5],mat.roof,roofs);}
    const ridge=cyl(cx,cy+rise+.04,cz,.12,.12,d+.15,mat.terra,roofs,10);ridge.rotation.x=PI/2;
    for(const z of [-1,1]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([cx-w/2,cy,cz+z*d/2,cx+w/2,cy,cz+z*d/2,cx,cy+rise,cz+z*d/2],3));g.computeVertexNormals();const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:'#cfb798',roughness:1,side:T.DoubleSide}));roofs.add(mesh);}
  }
  function wall(x,z,w,d,h=4,lower=true){cube(x,h/2+.12,z,w,h,d);cube(x,.45,z,w+.015,.7,d+.015,mat.stone);if(lower)cube(x,1.13,z,w+.025,1,d+.025,mat.red);cube(x,h+.05,z,w+.1,.18,d+.1,mat.cream);}
  function column(x,z,height=3.5){cyl(x,.21,z,.43,.45,.3);cyl(x,.44,z,.32,.36,.18);cyl(x,height/2+.45,z,.225,.28,height-.3);cyl(x,height+.3,z,.35,.29,.18);cube(x,height+.46,z,.71,.17,.71,mat.white);}
  function amphora(x,z,scale=1,rotation=0,parent=root){
    const group=new T.Group();group.position.set(x,.18,z);group.scale.setScalar(scale);group.rotation.y=rotation;parent.add(group);
    const profile=[[.02,0],[.12,.12],[.35,.4],[.39,.7],[.28,.96],[.13,1.06],[.12,1.3],[.17,1.34],[.17,1.4],[.11,1.4]];
    const mesh=new T.Mesh(new T.LatheGeometry(profile.map(v=>new T.Vector2(...v)),24),mat.terra);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
    const mouth=cyl(0,1.395,0,.102,.102,.012,mat.dark,group,24);
    for(const sign of [-1,1]){const h=new T.Mesh(new T.TorusGeometry(.19,.047,8,18,PI*1.5),mat.terra);h.position.set(sign*.2,1.06,0);h.rotation.z=sign>0?-PI*.26:PI*.76;h.scale.set(.65,1.2,1);group.add(h);}
    return group;
  }
  function bowl(x,y,z,r=.3){const p=[[0,0],[r*.5,.02],[r,.15],[r,.19],[r*.89,.18],[r*.5,.07],[0,.06]];let mesh=new T.Mesh(new T.LatheGeometry(p.map(v=>new T.Vector2(...v)),20),mat.terra);mesh.position.set(x,y,z);mesh.castShadow=true;root.add(mesh);}
  function bread(x,y,z,s=.35){cyl(x,y,z,s,s*1.03,.16,mat.bread,root,32);const cutmat=new T.MeshStandardMaterial({color:'#75502d',roughness:1});for(let i=0;i<4;i++){const c=cube(x,y+.084,z,s*1.87,.007,.012,cutmat);c.rotation.y=i*PI/4;}const ring=new T.Mesh(new T.TorusGeometry(s*.94,.012,5,32),cutmat);ring.position.set(x,y-.025,z);ring.rotation.x=PI/2;root.add(ring);}
  function arch(x,y,z,width,height,depth,rotation=0){const group=new T.Group();group.position.set(x,y,z);group.rotation.y=rotation;root.add(group);const radius=width/2;for(let i=0;i<9;i++){const a=i/8*PI;const b=cube(Math.cos(a)*radius,height-radius+Math.sin(a)*radius,0,.42,.48,depth,mat.cream,group);b.rotation.z=a-PI/2;}cube(-radius,height/2-radius/2,0,.4,height-radius,depth,mat.cream,group);cube(radius,height/2-radius/2,0,.4,height-radius,depth,mat.cream,group);}
  function tree(x,z,s=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(s);root.add(g);const trunk=cyl(0,1.7,0,.11,.21,3.4,mat.wood,g,9);trunk.rotation.z=.08;for(let i=0;i<5;i++){const branch=cyl(Math.sin(i)*.42,2.6+i*.12,Math.cos(i)*.4,.04,.11,1.6,mat.wood,g,7);branch.rotation.z=(i%2?1:-1)*.7;branch.rotation.y=i;}const geo=new T.IcosahedronGeometry(.7,1);const leaves=new T.InstancedMesh(geo,mat.green,45);for(let i=0;i<45;i++){temp.position.set(range(-1.3,1.3),range(3,4.3),range(-1.2,1.2));temp.scale.set(range(.7,1.3),range(.4,.85),range(.6,1.2));temp.rotation.set(rand()*PI,rand()*PI,0);temp.updateMatrix();leaves.setMatrixAt(i,temp.matrix);leaves.setColorAt(i,new T.Color().setHSL(.18,.18,range(.28,.42)));}leaves.castShadow=true;g.add(leaves);}
  // Broad ground and individually worn road stones.
  cube(0,-.25,-2,130,.4,150,mat.sand);cube(0,-.035,-1,5.4,.15,52,mat.dark);
  const cobbleGeo=new T.BoxGeometry(.8,.16,1.03,1,1,1);const cobbles=new T.InstancedMesh(cobbleGeo,new T.MeshStandardMaterial({color:'#ada394',roughness:.96}),7*48);let idx=0;
  for(let j=0;j<48;j++)for(let i=0;i<7;i++){temp.position.set(-2.47+i*.82+(j%2)*.08,range(.015,.065),-24+j*1.06);temp.rotation.set(range(-.035,.035),range(-.055,.055),range(-.035,.035));temp.scale.set(range(.89,1),1,range(.87,.99));temp.updateMatrix();cobbles.setMatrixAt(idx,temp.matrix);cobbles.setColorAt(idx++,new T.Color().setHSL(.09,.08,range(.36,.57)));}cobbles.receiveShadow=true;root.add(cobbles);
  for(const s of [-1,1]){cube(s*3.45,.13,-1,1.35,.4,52,mat.stone);cube(s*2.83,.25,-1,.28,.42,52,mat.cream);for(let z=-24;z<25;z+=1.6)cube(s*3.45,.343,z,1.25,.025,.025,mat.dark);}
  for(let x=-1.6;x<2;x+=1.6){const stone=new T.Mesh(new T.CylinderGeometry(.52,.59,.47,8),mat.basalt);stone.scale.z=.74;stone.position.set(x,.28,6);stone.castShadow=stone.receiveShadow=true;root.add(stone);}
  // Shops and houses down both sides of the neighbourhood.
  function frontage(cx,cz,w,d,h=4.3,shade=false){const side=cx>0?-1:1;wall(cx,cz-d/2,w,.42,h);wall(cx,cz+d/2,w,.42,h);wall(cx-side*w/2,cz,.42,d,h);const face=cx+side*w/2;wall(face,cz-d/2+1.1,.42,2.2,h);wall(face,cz+d/2-1.1,.42,2.2,h);cube(face,h-.48,cz,.42,.95,d-4.4);cube(cx,.13,cz,w,.1,d,mat.stone);roof(cx,h+.22,cz,w+.7,d+.8);for(const z of [-1,1]){cube(face+side*.16,1.6,cz+z*1.55,.12,2.8,.16,mat.wood);}if(shade){plane([face,3.5,cz-1.85,face+side*2.4,3.15,cz-1.85,face+side*2.4,3.15,cz+1.85,face,3.5,cz+1.85],[0,0,1,0,1,1,0,1],new T.MeshStandardMaterial({color:'#c9b586',side:T.DoubleSide,roughness:1}));}}
  frontage(8.1,-1,8.2,9,4.4);frontage(8.1,12,8.2,8.8,4.2,true);
  frontage(8,-15,8,9,4.5);frontage(8,23,8,7,4.8);
  frontage(-8.1,10.5,8.2,9,4.4,true);frontage(-8.1,23,8.2,8,4.5);frontage(-8,-23,8,8,4.4);
  // A second layer of rooftops gives the street an urban context.
  for(let side of [-1,1])for(let i=0;i<5;i++){const x=side*21,z=-22+i*11;cube(x,1.9,z,9,4,8,mat.plaster);cube(x,.7,z,9.03,1,8.03,mat.red);roof(x,4,z,9.6,9);if(i%2===0)tree(side*28,z+3,.8);}
  for(let i=0;i<6;i++){const x=-25+i*10;cube(x,1.5,-36,8,3.2,7,mat.plaster);roof(x,3.2,-36,8.7,7.8);}
  // Wooden shutters, lintels, stone sills and windows.
  for(let side of [-1,1])for(const z of [-20,-14,10,21]){const x=side*4.1;const sh=cube(x,2.5,z,.1,.95,.78,mat.wood);cube(x+side*.05,1.98,z,.27,.13,1.04,mat.cream);cube(x+side*.05,3.03,z,.3,.13,1.04,mat.cream);}
  // Food counter with open dolia, not solid dots on its surface.
  cube(6.6,.73,12,1.6,1.18,4.8,mat.counter);cube(6.6,1.36,12,1.83,.12,5.02,mat.cream);
  for(let i=0;i<4;i++){let z=10.2+i*1.17;cyl(6.6,1.431,z,.39,.39,.012,mat.dark,root,32);let ring=new T.Mesh(new T.TorusGeometry(.39,.055,9,32),mat.terra);ring.rotation.x=PI/2;ring.position.set(6.6,1.44,z);ring.receiveShadow=true;root.add(ring);}
  cube(9.6,.73,14.1,4.4,1.18,1.2,mat.counter);cube(9.6,1.36,14.1,4.55,.12,1.4,mat.cream);
  for(let i=0;i<4;i++){amphora(8.0+i*.82,15.45,range(.8,1.08),rand()*PI);}
  bowl(9.5,1.44,14.2,.27);bowl(10.5,1.44,14,.23);bread(8.6,1.53,14,.26);
  cube(11.7,2.35,12,.27,.14,5.2,mat.wood);for(let i=0;i<5;i++){const a=amphora(11.65,10+i*.85,.5);a.position.y=2.42;}
  // Bakery: hourglass lava mills and a masonry oven.
  function mill(x,z){cyl(x,.32,z,1.01,1.1,.3,mat.basalt,root,24);cyl(x,.65,z,.53,.95,.45,mat.basalt,root,24);const spin=new T.Group();spin.position.set(x,.87,z);root.add(spin);const points=[[.61,0],[.36,.5],[.79,1.25],[.78,1.4],[.58,1.4],[.25,.57],[.42,.05]];const mesh=new T.Mesh(new T.LatheGeometry(points.map(v=>new T.Vector2(...v)),28),mat.basalt);mesh.castShadow=mesh.receiveShadow=true;spin.add(mesh);cube(0,.5,0,2.75,.15,.17,mat.wood,spin);cube(1.25,.13,0,.14,.86,.14,mat.wood,spin);cube(-1.25,.13,0,.14,.86,.14,mat.wood,spin);mills.push(spin);}
  mill(7.25,-1.6);mill(9.9,1.8);
  cube(10.3,.71,-3.9,3.1,1.25,2.3,mat.stone);const oven=ball(10.3,1.32,-3.95,1.5,mat.stone,root,1,.82,1);cube(10.3,1.57,-2.52,1.25,.73,.06,mat.dark);arch(10.3,1.15,-2.47,1.32,1.07,.22);cube(10.3,1.16,-2.29,1.7,.13,.7,mat.cream);const glow=new T.PointLight('#ff6d17',2,4,2);glow.position.set(10.3,1.5,-2.25);root.add(glow);
  for(let i=0;i<6;i++){const log=cyl(9.8+(i%3)*.31,.37+Math.floor(i/3)*.23,-2.35,.1,.13,.7,mat.wood,root,8);log.rotation.x=PI/2;}
  cube(5.1,1.02,-3.3,1.45,.15,2.5,mat.wood);for(let z of [-4.2,-2.4])for(let x of [4.65,5.55])cube(x,.56,z,.13,1,.13,mat.wood);for(let i=0;i<4;i++)bread(5.1,1.18,-4+i*.5,.26);
  for(let i=0;i<3;i++){ball(11.35,.65,-.8+i*.85,.5,new T.MeshStandardMaterial({color:'#bcad87',roughness:1}),root,.8,1.25,.8);cyl(11.35,1.25,-.8+i*.85,.19,.14,.16,mat.wood);}
  // Courtyard / atrium house. Rooms remain open towards the atrium.
  const hx=-10.5,hz=-8;
  cube(hx,.12,hz,12.5,.25,16,mat.mosaic);wall(-16.75,hz,.45,16,3.85,false);wall(hx,-16,12.5,.45,3.85,false);wall(hx,0,12.5,.45,3.85,false);wall(-4.25,-12,.45,8,3.85,false);wall(-4.25,-2,.45,4,3.85,false);cube(-4.25,3.43,-6,.45,.85,4);
  // Newly authored Roman-inspired panels, not reproductions of archaeological art.
  for(let i=0;i<4;i++){const panel=new T.Mesh(new T.PlaneGeometry(3.4,3.25),mat.fresco);panel.rotation.y=PI/2;panel.position.set(-16.49,1.95,-13.7+i*3.8);panel.receiveShadow=true;root.add(panel);}
  for(let i=0;i<3;i++){const panel=new T.Mesh(new T.PlaneGeometry(3.6,3.25),mat.fresco);panel.position.set(-14.7+i*4.1,1.95,-15.74);panel.receiveShadow=true;root.add(panel);}
  const frontpanel=new T.Mesh(new T.PlaneGeometry(11.9,3.25),mat.fresco);frontpanel.rotation.y=PI;frontpanel.position.set(hx,1.95,-.25);frontpanel.receiveShadow=true;root.add(frontpanel);
  for(let x of [-13.6,-7.4])for(let z of [-12,-4])column(x,z,3.35);
  // Inward-sloping roof surrounding the compluvium, with a genuine opening above the basin.
  const yout=4.25,yin=3.78;
  plane([-16.9,yout,-16.2,-12.4,yin,-11.2,-12.4,yin,-4.8,-16.9,yout,.2],[0,0,1,0,1,3,0,3],mat.roof,roofs);
  plane([-8.6,yin,-11.2,-4.1,yout,-16.2,-4.1,yout,.2,-8.6,yin,-4.8],[0,0,1,0,1,3,0,3],mat.roof,roofs);
  plane([-16.9,yout,-16.2,-4.1,yout,-16.2,-8.6,yin,-11.2,-12.4,yin,-11.2],[0,0,3,0,3,1,0,1],mat.roof,roofs);
  plane([-12.4,yin,-4.8,-8.6,yin,-4.8,-4.1,yout,.2,-16.9,yout,.2],[0,0,3,0,3,1,0,1],mat.roof,roofs);
  for(let x of [-12.4,-8.6])cube(x,3.73,-8,.12,.18,6.55,mat.wood,roofs);for(let z of [-11.2,-4.8])cube(-10.5,3.73,z,3.9,.18,.12,mat.wood,roofs);
  // Impluvium basin and gently rippling water.
  cube(hx,.255,hz,3.0,.09,4.8,mat.white);cube(hx,.31,hz,2.5,.06,4.3,mat.dark);for(let x of [-1.4,1.4])cube(hx+x,.45,hz,.28,.38,4.8,mat.white);for(let z of [-2.25,2.25])cube(hx,.45,hz+z,3,.38,.3,mat.white);
  const waterMaterial=new T.MeshPhysicalMaterial({color:'#668f83',metalness:.25,roughness:.17,transparent:true,opacity:.85,clearcoat:1,clearcoatRoughness:.1});
  const water=new T.Mesh(new T.PlaneGeometry(2.55,4.3,16,24),waterMaterial);water.rotation.x=-PI/2;water.position.set(hx,.445,hz);root.add(water);const waterBase=water.geometry.attributes.position.array.slice();
  const poolRing=new T.Group();for(let i=0;i<4;i++){let ring=new T.Mesh(new T.TorusGeometry(.4+i*.22,.007,4,42),new T.MeshBasicMaterial({color:'#d2dfc1',transparent:true,opacity:.3}));ring.rotation.x=PI/2;ring.position.set(hx-.4,.465,hz-.8);poolRing.add(ring);}root.add(poolRing);
  // Domestic objects, couch and table.
  cube(-14.6,.67,-13.8,1.35,.26,2.5,mat.wood);cube(-14.6,.88,-13.8,1.4,.25,2.55,new T.MeshStandardMaterial({color:'#b38667',roughness:.95}));for(let x of [-15.13,-14.07])for(let z of [-14.7,-12.9])cube(x,.38,z,.12,.6,.12,mat.wood);
  cyl(-13,1.02,-14.1,.65,.65,.13,mat.wood);cyl(-13,.62,-14.1,.1,.23,.8,mat.wood);bowl(-13,1.1,-14.1,.23);amphora(-15.8,-2.3,.85);amphora(-15.2,-1.8,.7);
  // A small garden behind the house and street fountain.
  for(let i=0;i<3;i++)tree(-18.6,-10+i*5,.82);tree(15,8,1.15);
  cube(-3.4,.63,11,.9,1.1,1.7,mat.cream);cube(-3.4,1.2,11,.72,.07,1.4,mat.dark);cube(-3.85,1.49,11,.25,1.15,.8,mat.stone);cyl(-3.57,1.65,11,.1,.1,.2,mat.iron).rotation.z=PI/2;
  // Street-side crates and a cart.
  for(let i=0;i<3;i++){cube(-4.8+i*.85,.55,13.3,.7,.7,.8,mat.wood);for(let j=0;j<3;j++)ball(-4.8+i*.85+range(-.2,.2),1,13.3+range(-.2,.2),.12,new T.MeshStandardMaterial({color:'#a68839',roughness:1}));}
  cube(-3.5,.72,19.8,1.2,.18,2,mat.wood);for(let z of [-1,1])cube(-3.5,1.03,19.8+z,.125,.55,1.28,mat.wood).rotation.y=PI/2;for(let x of [-1,1]){const wh=new T.Mesh(new T.TorusGeometry(.52,.07,7,28),mat.wood);wh.rotation.y=PI/2;wh.position.set(-3.5+x*.75,.55,19.7);root.add(wh);for(let j=0;j<6;j++){const spoke=cube(-3.5+x*.75,.55,19.7,.05,1,.06,mat.wood);spoke.rotation.x=j*PI/3;}}
  // Mountain silhouette: illustrative landscape, not a reconstruction of Vesuvius's ancient profile.
  function mountain(cx,cz,height,rad){const g=new T.ConeGeometry(rad,height,60,9,true);const p=g.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i),x=p.getX(i),z=p.getZ(i);const a=Math.atan2(z,x),f=.92+Math.sin(a*7+y*.1)*.04+Math.sin(a*13)*.025;p.setXYZ(i,x*f,y+Math.sin(a*9)*.5,z*f);}g.computeVertexNormals();const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:'#9c9d85',roughness:1}));mesh.position.set(cx,height/2-1,cz);mesh.scale.z=.55;scene.add(mesh);}
  mountain(0,-107,27,55);mountain(23,-110,17,40);
  // Distant cypresses.
  for(let i=0;i<14;i++){let x=range(-42,42),z=range(-47,-41);cyl(x,2,z,.12,.22,4,mat.wood);const g=new T.Mesh(new T.ConeGeometry(.75,5,10),mat.green);g.position.set(x,4,z);g.castShadow=true;root.add(g);}
  const dustGeo=new T.BufferGeometry(),dustPos=[];for(let i=0;i<110;i++)dustPos.push(range(-18,18),range(.8,9),range(-22,22));dustGeo.setAttribute('position',new T.Float32BufferAttribute(dustPos,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:'#fff2d3',size:.025,transparent:true,opacity:.55,depthWrite:false}));root.add(dust);
  // Camera movement: authored journeys and a bounded free-explore mode.
  let yaw=0,pitch=0,travel=null,entered=false,overviewMode=true,roofOff=false,current='street',lastTime=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoAngle=0,drag=false,px=0,py=0;const keys=new Set();
  function syncAngles(){const dir=new T.Vector3();camera.getWorldDirection(dir);yaw=Math.atan2(-dir.x,-dir.z);pitch=Math.asin(dir.y);}
  function fly(pos,target,duration=1900){const from=camera.position.clone();const fromQ=camera.quaternion.clone();const test=camera.clone();test.position.set(...pos);test.lookAt(...target);travel={from,to:new T.Vector3(...pos),fromQ,toQ:test.quaternion.clone(),start:performance.now(),duration:reduced?1:duration,arc:from.y<4&&pos[1]<4&&from.distanceTo(new T.Vector3(...pos))>5?5.5:0};}
  function go(id){if(!places[id])return;current=id;entered=true;overviewMode=false;const p=places[id];fly(p.camera,p.target);}
  function overview(){overviewMode=true;fly(innerWidth<700?[30,30,42]:[24,22,35],[-1,1,-5],2100);}
  function canMove(p){if(p.x>-2.5&&p.x<2.5&&p.z>-25&&p.z<25)return true;if(p.x>-4.4&&p.x<4.1&&p.z>-23&&p.z<23)return true;if(p.x>4&&p.x<11.8&&p.z>-4.9&&p.z<2.9)return true;if(p.x>4&&p.x<11.8&&p.z>8.1&&p.z<15.9)return true;if(p.x>-16.1&&p.x<-4&&p.z>-15.3&&p.z<-.7)return true;return false;}
  canvas.addEventListener('pointerdown',e=>{if(!entered)return;canvas.focus({preventScroll:true});drag=true;px=e.clientX;py=e.clientY;travel=null;overviewMode=false;syncAngles();canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-px)*.004;pitch=Math.max(-1,Math.min(.9,pitch-(e.clientY-py)*.003));px=e.clientX;py=e.clientY;camera.quaternion.setFromEuler(new T.Euler(pitch,yaw,0,'YXZ'));});
  canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
  addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|BUTTON/.test(document.activeElement?.tagName)||document.querySelector('#drawer:not([hidden])'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase());}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
  const moveMap={forward:'w',back:'s',left:'a',right:'d'};document.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(moveMap[b.dataset.move]);});for(let ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(moveMap[b.dataset.move]));});
  const projected=new T.Vector3(),dir=new T.Vector3(),anchorWorld=new T.Vector3();let first=true;
  function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;if(document.hidden)return;
    if(travel){const t=Math.min((now-travel.start)/travel.duration,1),s=t*t*(3-2*t);camera.position.lerpVectors(travel.from,travel.to,s);camera.position.y+=Math.sin(PI*s)*travel.arc;camera.quaternion.slerpQuaternions(travel.fromQ,travel.toQ,s);if(t===1){travel=null;syncAngles();}}
    else if(!entered&&!reduced){autoAngle+=dt*.015;camera.position.set(24+Math.sin(autoAngle)*3,22,35+Math.cos(autoAngle)*1.5);camera.lookAt(-1,1,-5);}
    if(entered&&keys.size&&!travel){if(overviewMode){go(current);keys.clear();}else{const speed=dt*3.1;const v=new T.Vector3();if(keys.has('w')||keys.has('arrowup'))v.z-=speed;if(keys.has('s')||keys.has('arrowdown'))v.z+=speed;if(keys.has('a')||keys.has('arrowleft'))v.x-=speed;if(keys.has('d')||keys.has('arrowright'))v.x+=speed;v.applyAxisAngle(new T.Vector3(0,1,0),yaw);const next=camera.position.clone().add(v);next.y=2.25;if(canMove(next))camera.position.copy(next);}}
    if(!reduced){mills.forEach((m,i)=>m.rotation.y=Math.sin(now*.00012+i)*.12);dust.rotation.y=Math.sin(now*.00002)*.08;poolRing.children.forEach((m,i)=>{const s=1+Math.sin(now*.0007+i)*.12;m.scale.setScalar(s);});const a=water.geometry.attributes.position;for(let i=0;i<a.count;i++){a.setZ(i,Math.sin(waterBase[i*3]*4+now*.001)*Math.cos(waterBase[i*3+1]*3+now*.0008)*.009);}a.needsUpdate=true;}
    renderer.render(scene,camera);
    camera.getWorldDirection(dir);document.querySelectorAll('.hotspot').forEach(el=>{const id=el.dataset.evidence;if(!anchors[id])return;anchorWorld.set(...anchors[id]);projected.copy(anchorWorld).project(camera);let dist=anchorWorld.distanceTo(camera.position),facing=anchorWorld.clone().sub(camera.position).dot(dir)>0;const visible=entered&&facing&&projected.z<1&&Math.abs(projected.x)<.92&&Math.abs(projected.y)<.77&&dist<(overviewMode?48:18);el.hidden=!visible;el.style.left=(projected.x*.5+.5)*innerWidth+'px';el.style.top=(-projected.y*.5+.5)*innerHeight+'px';});
    if(first){first=false;setTimeout(()=>onReady?.(),100);}
  }
  requestAnimationFrame(animate);
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.dispatchEvent(new CustomEvent('scene-lost'));});
  return {go,overview,toggleRoof(){roofOff=!roofOff;roofs.visible=!roofOff;return roofOff},setTime(mode){sun.color.set(mode==='morning'?'#ffddb0':mode==='evening'?'#ffb487':'#fff0d7');sun.intensity=mode==='evening'?2.6:3.4;sun.position.set(mode==='morning'?-32:mode==='evening'?25:-25,mode==='evening'?19:42,24);renderer.toneMappingExposure=mode==='evening'?1.12:1.25},setQuality(low){renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.75));sun.shadow.mapSize.set(low?1024:2048,low?1024:2048);sun.shadow.map?.dispose();sun.shadow.map=null;renderer.setSize(innerWidth,innerHeight)},get current(){return current}};
}
