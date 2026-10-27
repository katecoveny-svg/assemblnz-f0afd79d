import * as T from './vendor/three.module.js';
// Lightweight geometric renderer for devices without WebGL. Uses the same
// scene transforms and picking geometry; rounded primitives draw as flat faces.
export class TwinCanvasRenderer{
 constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d');if(!this.ctx)throw Error('Canvas unavailable');this.ratio=1;this.shadowMap={};}
 setPixelRatio(r){this.ratio=Math.min(r,1.5);}setClearColor(){}
 setSize(w,h){this.w=w;this.h=h;this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);this.domElement.style.width='100%';this.domElement.style.height='100%';}
 render(scene,camera){const ctx=this.ctx,w=this.w,h=this.h;if(!w||!h)return;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.clearRect(0,0,w,h);scene.updateMatrixWorld();camera.updateMatrixWorld();const polygons=[],direction=new T.Vector3(-.4,.9,.5).normalize();
 const projection=v=>{const p=v.clone().project(camera);return [(p.x+1)*w/2,(1-p.y)*h/2];};
 const visit=(node,parentVisible)=>{if(!parentVisible||!node.visible)return;
  if(node.isMesh&&!node.material.isShadowMaterial&&!node.material.map){const geometry=node.geometry;if(!geometry.boundingBox)geometry.computeBoundingBox();const b=geometry.boundingBox;if(b&&b.max.x-b.min.x<50){let points=[],faces=[];
   if(geometry.type==='CylinderGeometry'){const {radiusTop:rt,radiusBottom:rb,height:hh}=geometry.parameters;for(let y=0;y<2;y++)for(let i=0;i<12;i++){const a=i/12*Math.PI*2;points.push(new T.Vector3(Math.cos(a)*(y?rt:rb),(y?.5:-.5)*hh,Math.sin(a)*(y?rt:rb)));}faces.push([...Array(12)].map((_,i)=>11-i),[...Array(12)].map((_,i)=>i+12));for(let i=0;i<12;i++)faces.push([i,(i+1)%12,(i+1)%12+12,i+12]);}
   else{points=[new T.Vector3(b.min.x,b.min.y,b.min.z),new T.Vector3(b.max.x,b.min.y,b.min.z),new T.Vector3(b.max.x,b.max.y,b.min.z),new T.Vector3(b.min.x,b.max.y,b.min.z),new T.Vector3(b.min.x,b.min.y,b.max.z),new T.Vector3(b.max.x,b.min.y,b.max.z),new T.Vector3(b.max.x,b.max.y,b.max.z),new T.Vector3(b.min.x,b.max.y,b.max.z)];faces=[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]];}
   const world=points.map(p=>p.applyMatrix4(node.matrixWorld));for(const f of faces){const vertices=f.map(i=>world[i]);const normal=new T.Vector3().subVectors(vertices[1],vertices[0]).cross(new T.Vector3().subVectors(vertices[2],vertices[0])).normalize();const center=vertices.reduce((a,v)=>a.add(v),new T.Vector3()).multiplyScalar(1/f.length);if(normal.dot(new T.Vector3().subVectors(camera.position,center))<=0)continue;const shade=.79+Math.max(0,normal.dot(direction))*.23;let color=node.material.color.clone().multiplyScalar(shade);if(node.material.emissive)color.add(node.material.emissive.clone().multiplyScalar(node.material.emissiveIntensity));const view=center.clone().applyMatrix4(camera.matrixWorldInverse);polygons.push({p:vertices.map(projection),layer:node.userData.isFloor?1:vertices.every(v=>v.y<.13)?0:2,z:view.z,color:'#'+color.getHexString(),opacity:node.material.transparent?node.material.opacity:1});}
  }}for(const child of node.children)visit(child,true);
 };visit(scene,true);polygons.sort((a,b)=>a.layer-b.layer||a.z-b.z);for(const poly of polygons){ctx.beginPath();poly.p.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.globalAlpha=poly.opacity;ctx.fillStyle=poly.color;ctx.fill();ctx.strokeStyle='#63576228';ctx.lineWidth=.45;ctx.stroke();}ctx.globalAlpha=1;
 }
}
