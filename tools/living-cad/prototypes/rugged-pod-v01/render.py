"""Render actual exported STEP geometry, not concept imagery. Optional matplotlib."""
from pathlib import Path
import cadquery as cq
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
R=Path(__file__).resolve().parent
colors={'shell':'#f3bd26','lid':'#e96942','gasket':'#575369','carrier':'#c8c7c4','foam_deck':'#d8cfae'}
fig=plt.figure(figsize=(15,8),facecolor='#fffdf8')
fig.text(.05,.93,'dayrally / rugged pod',fontsize=27,weight='bold',color='#3c3130')
fig.text(.05,.885,'RP01 · actual CAD geometry · standard 128 × 72 mm shell',fontsize=13,color='#625954')
for i,(title,keys,offsets,lim) in enumerate([
('separate, serviceable parts',['carrier','shell','foam_deck','gasket','lid'],{'carrier':-7,'shell':10,'foam_deck':25,'gasket':45,'lid':65},(0,135)),
('continuous storage floor',['shell'],{},(24,65)),
('assembled prototype',['carrier','shell','lid'],{},(0,90))]):
    ax=fig.add_axes([.015+i*.33,.17,.33,.65],projection='3d',computed_zorder=False)
    ax.set_facecolor('#fffdf8')
    for name in keys:
        shape=cq.importers.importStep(str(R/'generated'/'step'/f'standard-{name}.step')).val()
        vs,fs=shape.tessellate(.16,.2)
        verts=np.array([v.toTuple() for v in vs]); verts[:,2]+=offsets.get(name,0)
        faces=verts[np.array(fs)]
        normals=np.cross(faces[:,1]-faces[:,0],faces[:,2]-faces[:,0]); normals/=np.maximum(1e-12,np.linalg.norm(normals,axis=1))[:,None]
        from matplotlib.colors import to_rgb
        shade=.62+.38*np.abs(normals@np.array([-.3,-.4,.866]))
        col=np.clip(np.array(to_rgb(colors[name]))[None,:]*shade[:,None],0,1)
        pc=Poly3DCollection(faces,facecolors=col,edgecolors='none',zsort='average')
        ax.add_collection3d(pc)
    ax.set_xlim(-85,85); ax.set_ylim(-60,60); ax.set_zlim(*lim)
    ax.set_box_aspect((170,120,lim[1]-lim[0])); ax.view_init(27,-60); ax.set_axis_off()
    ax.set_title(title,fontsize=14,color='#3c3130',y=.97)
fig.text(.06,.15,'Coral: ruler lid  •  Grey ring: TPU gasket\nYellow: sealed-cavity shell  •  Grey: TURN carrier',fontsize=11,color='#625954')
fig.text(.40,.15,'2.6 mm walls · 3.2 mm floor\nExternal screws stay outside the cavity',fontsize=11,color='#625954')
fig.text(.73,.15,'Four screw compression stations\nExisting TURN interface below',fontsize=11,color='#625954')
fig.text(.05,.055,'UNTESTED PROTOTYPE   /   Hardware omitted. No water, flotation or mounting rating.',fontsize=12,weight='bold',color='#a23c28')
fig.savefig(R/'generated'/'preview.png',dpi=150,facecolor=fig.get_facecolor())
