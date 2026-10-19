"""Render only the supplied CAD-derived GLBs, not generative product images."""
import vtk
from vtk.util.numpy_support import numpy_to_vtk,numpy_to_vtkIdTypeArray
from common import *
from PIL import Image,ImageDraw,ImageFont

def render(path,out,w=1200,h=880,view='iso'):
    scene=trimesh.load(str(path),force='scene')
    ren=vtk.vtkRenderer();ren.SetBackground(.979,.972,.959)
    bounds=scene.bounds;ctr=(bounds[0]+bounds[1])/2;span=np.max(bounds[1]-bounds[0]);ext=bounds[1]-bounds[0]
    for node in scene.graph.nodes_geometry:
        tf,name=scene.graph[node];g=scene.geometry[name].copy();g.apply_transform(tf)
        pd=vtk.vtkPolyData();pts=vtk.vtkPoints();pts.SetData(numpy_to_vtk(g.vertices.astype(np.float64),deep=True));pd.SetPoints(pts)
        faces=np.column_stack((np.full(len(g.faces),3),g.faces)).astype(np.int64).ravel()
        cells=vtk.vtkCellArray();cells.SetCells(len(g.faces),numpy_to_vtkIdTypeArray(faces,deep=True));pd.SetPolys(cells)
        normals=vtk.vtkPolyDataNormals();normals.SetInputData(pd);normals.SetFeatureAngle(35);normals.SplittingOn();normals.ConsistencyOn();normals.Update()
        mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(normals.GetOutputPort());mapper.ScalarVisibilityOff()
        actor=vtk.vtkActor();actor.SetMapper(mapper)
        rgba=np.asarray(getattr(g.visual.material,'baseColorFactor',[160,160,160,255]),float);rgba=rgba/255 if rgba.max()>1 else rgba
        prop=actor.GetProperty();prop.SetColor(*rgba[:3]);prop.SetInterpolationToPhong();prop.SetAmbient(.22);prop.SetDiffuse(.7);prop.SetSpecular(.18);prop.SetSpecularPower(25)
        ren.AddActor(actor)
    # neutral ground plane (context, not another product component)
    plane=vtk.vtkPlaneSource();pz=bounds[0,2]-span*.008
    plane.SetOrigin(ctr[0]-span*2,ctr[1]-span*2,pz);plane.SetPoint1(ctr[0]+span*2,ctr[1]-span*2,pz);plane.SetPoint2(ctr[0]-span*2,ctr[1]+span*2,pz)
    mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(plane.GetOutputPort());floor=vtk.vtkActor();floor.SetMapper(mapper);floor.GetProperty().SetColor(.973,.962,.943);floor.GetProperty().SetAmbient(.5);floor.GetProperty().SetDiffuse(.5);ren.AddActor(floor)
    cam=ren.GetActiveCamera();direction=np.array([1.1,-1.75,.95]) if view=='iso' else np.array([0,-2,.28])
    # Straightish view helps bikes and a more elevated view helps organisers.
    if 'desk' in path.name or 'vanity' in path.name or 'case-open' in path.name:direction=np.array([.9,-1.1,1.25])
    if 'rule' in path.name:direction=np.array([.15,-.45,1.8])
    cam.SetPosition(*(ctr+direction*span*2));cam.SetFocalPoint(*ctr);cam.SetViewUp(0,0,1);cam.ParallelProjectionOn()
    # Fit projected bbox with camera basis rather than inflating scale for ground.
    f=-direction/np.linalg.norm(direction);right=np.cross(f,[0,0,1]);right/=np.linalg.norm(right);up=np.cross(right,f)
    corners=np.array([[x,y,z] for x in bounds[:,0] for y in bounds[:,1] for z in bounds[:,2]])-ctr
    vw=np.ptp(corners@right);vh=np.ptp(corners@up)
    cam.SetParallelScale(max(vh/2,vw*h/w/2)*1.19)
    cam.SetClippingRange(span*.05,span*20)
    ren.AutomaticLightCreationOff()
    for pos,intensity in [((-1,-2,3),.85),((2,-.5,2),.5),((1,2,3),.6)]:
        l=vtk.vtkLight();l.SetLightTypeToSceneLight();l.SetPosition(*(ctr+np.array(pos)*span));l.SetFocalPoint(*ctr);l.SetIntensity(intensity);ren.AddLight(l)
    # Screen-space ambient occlusion emphasizes real cavities/contact.
    basic=vtk.vtkRenderStepsPass();ssao=vtk.vtkSSAOPass();ssao.SetDelegatePass(basic);ssao.SetRadius(span*.025);ssao.SetBias(span*.0008);ssao.SetKernelSize(96);ssao.BlurOn();ren.SetPass(ssao)
    win=vtk.vtkRenderWindow();win.SetOffScreenRendering(1);win.AddRenderer(ren);win.SetSize(w,h);win.SetMultiSamples(4);win.Render()
    capture=vtk.vtkWindowToImageFilter();capture.SetInput(win);capture.ReadFrontBufferOff();capture.Update();writer=vtk.vtkPNGWriter();writer.SetFileName(str(out));writer.SetInputConnection(capture.GetOutputPort());writer.Write();win.Finalize()
    im=Image.open(out).convert('RGB');im.save(str(out).replace('.png','.webp'),quality=91)
    print('rendered',path.stem,flush=True)

def main():
    for path in sorted((ROOT/'assemblies/glb').glob('*.glb')):
        render(path,ROOT/'previews'/f'{path.stem}.png')
    # A catalogue contact sheet made from those exact renders.
    paths=list((ROOT/'previews').glob('*.png'));cols=3;cw,ch=590,470;rows=math.ceil(len(paths)/cols)
    im=Image.new('RGB',(cols*cw,rows*ch+130),'#faf8f4');d=ImageDraw.Draw(im)
    ft='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    d.text((34,22),'assembl / living + dayrally',font=ImageFont.truetype(ft,38),fill='#492B3E')
    d.text((36,80),'AC-02  •  ACTUAL CAD GEOMETRY  •  UNPRINTED DIGITAL PROTOTYPES',font=ImageFont.truetype(ft,17),fill='#916A70')
    for i,p in enumerate(paths):
        x=(i%cols)*cw;y=(i//cols)*ch+130
        photo=Image.open(p).convert('RGB');photo.thumbnail((cw-20,ch-68));im.paste(photo,(x+(cw-photo.width)//2,y))
        d.text((x+24,y+ch-53),p.stem.replace('-',' '),font=ImageFont.truetype(ft,19),fill='#492B3E')
    im.save(ROOT/'previews/collection-overview.jpg',quality=94)
if __name__=='__main__':main()
