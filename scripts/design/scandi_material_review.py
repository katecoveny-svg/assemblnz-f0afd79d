"""A second owned Blender study. Never rewires the production scene.
Transforms the committed authoring source, preserving reproducible provenance.
Render/export through the already-tested Blender compatibility adapter.
"""
from pathlib import Path
import runpy

path=Path('scripts/design/build_scandi_office.py')
s=path.read_text()
changes=[
 ("scandi-v1","scandi-v2"),
 ("visual-evidence/scandi","visual-evidence/scandi-v2"),
 ("'#CAB395'","'#BE9D72'"),
 ("'#D3C8B8'","'#CBBFAE'"),
 ("(18,51,.24)","(13,51,.24)"),
 ("range(40)","range(29)"),
 ("x=-8.8+i*.45","x=-6.3+i*.45"),
 ("(9,10,2.45)","(6.5,10,1.78)"),
 ("(.22,50,4.9)","(.22,50,3.56)"),
 ("(0,-14,2.45),(18,.2,4.9)","(0,-14,1.78),(13,.2,3.56)"),
 ("(0,35.5,2.45),(18,.25,4.9)","(0,35.5,1.78),(13,.25,3.56)"),
 ("(0,10.5,5.03),(18,51,.15)","(0,10.5,3.63),(13,51,.15)"),
 ("(0,y,4.88),(18,.09,.15)","(0,y,3.48),(13,.09,.15)"),
 ("(-8.82,y,2.43),(.1,.09,4.9)","(-6.32,y,1.78),(.1,.09,3.56)"),
 ("(-8.82,y,0.11)","(-6.32,y,0.11)"),
 ("(-8.82,10.5,4.89)","(-6.32,10.5,3.49)"),
 ("(-8.38,y,2.38),(.18,.48,4.63)","(-5.96,y,1.73),(.18,.48,3.33)"),
 ("(-8.28,y-.21+n*.078,2.38),.047,4.59", "(-5.86,y-.21+n*.078,1.73),.047,3.29"),
 ("range(35):box('Oak screen slat',(4.6+i*.12,y,2.06),(.045,.13,4.1)","range(26):box('Oak screen slat',(3.2+i*.12,y,1.66),(.045,.13,3.3)"),
 ("(7.9,y,.58),(1.12,5.4,1.12)","(5.93,y,.58),(1.0,5.4,1.12)"),
 ("(7.324,y-2.25+j*.9,.57)","(5.423,y-2.25+j*.9,.57)"),
 ("(7.6,y-1.1+j*.85","(5.65,y-1.1+j*.85"),
 ("plant(7.75,y+2.1","plant(5.85,y+2.1"),
 ("( -5.6,y,.745)","(-3.5,y,.745)"),
 ("[-7.05,-4.15]","[-4.95,-2.05]"),
 ("[-6.65,-4.65]","[-4.55,-2.55]"),
 ("plant(-7.7,","plant(-5.4,"),
 ("(4.65,13.5,.76),(4.15,1.5,.08)","(3.2,13.5,.76),(3.8,1.5,.08)"),
 ("[3.25,6.05]","[1.85,4.55]"),
 ("[3.25,4.65,6.05]","[1.85,3.2,4.55]"),
 ("(7.30,17.8,1.92)","(5.85,17.8,1.92)"),
 ("(7.237,y,1.95)","(5.787,y,1.95)"),
 ("(4.2,28,.023),(7.0,7.8,.023)","(3.1,28,.023),(6.4,7.8,.023)"),
 ("sofa(4.3,30)","sofa(3.4,30)"),
 ("[1.6,6.7]","[1.0,5.25]"),
 ("(4.2,27.6,","(3.2,27.6,"),
 ("(4.0,27.55,","(3.0,27.55,"),
 ("cup(4.57,27.5","cup(3.57,27.5"),
 ("plant(7.8,33","plant(5.7,33"),
 ("(8.82,y,2.70)","(6.32,y,2.1)"),
 ("(8.775,y,2.70)","(6.275,y,2.1)"),
 ("(8.73,y+","(6.23,y+"),
 ("2.7+math.sin(a)","2.1+math.sin(a)"),
 ("[(-5.6,-3),(-5.6,1.3),(4.65,13.5),(4.2,27.6)]","[(-3.5,-3),(-3.5,1.3),(3.2,13.5),(3.2,27.6)]"),
 ("(x,y,4.93),(x,y,3.25)","(x,y,3.5),(x,y,2.45)"),
 ("(x,y,3.14)","(x,y,2.34)"),
 ("(x,y,3.34)","(x,y,2.54)"),
 ("default_value=.42;bpy.context.scene.world", "default_value=.25;bpy.context.scene.world"),
 ("(-10.3,y,3.8),1700,7", "(-7.5,y,3.0),1000,5"),
 ("(2,y,4.6),320,5", "(2,y,3.35),120,4"),
 ("sun.energy=1.5;sun.angle=math.radians(8)","sun.energy=1.25;sun.angle=math.radians(4)"),
 ("scene.view_settings.exposure=.6","scene.view_settings.exposure=-.15"),
 ("(1.8,-10.2,1.75),(-4.8,1.8,1.4),24", "(-.25,-6.1,1.55),(-3.45,-1.2,1.15),32"),
 ("(-1.8,7.8,1.72),(4.5,15.0,1.35),26", "(.2,9.3,1.5),(3.25,13.6,1.08),31"),
 ("(-2.4,22.2,1.7),(4.3,29.3,1.12),26", "(-.5,23.5,1.5),(3.2,28.8,1.03),30"),
 ("scene.render.resolution_x=1400;scene.render.resolution_y=900", "scene.render.resolution_x=1280;scene.render.resolution_y=850")
]
for old,new in changes:
    if old not in s: raise RuntimeError('Authoring source changed; inspect patch: '+old)
    s=s.replace(old,new)
start=s.index('# Stylised harbour bridge')
end=s.index('# Render rig',start)
s=s[:start]+s[end:]
# An original procedural oak material: color grain, not just bump on white wood.
insert="""
nt=oak.node_tree
tex=nt.nodes.new('ShaderNodeTexCoord')
mapnode=nt.nodes.new('ShaderNodeMapping')
mapnode.inputs['Scale'].default_value=(5.5,.55,2.5)
noise=nt.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=7;noise.inputs['Detail'].default_value=3;noise.inputs['Roughness'].default_value=.7
ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.18;ramp.color_ramp.elements[0].color=rgba('#957047');ramp.color_ramp.elements[1].position=.85;ramp.color_ramp.elements[1].color=rgba('#D6BF9D')
nt.links.new(tex.outputs['Generated'],mapnode.inputs['Vector']);nt.links.new(mapnode.outputs['Vector'],noise.inputs['Vector']);nt.links.new(noise.outputs['Fac'],ramp.inputs['Fac']);nt.links.new(ramp.outputs['Color'],nt.nodes.get('Principled BSDF').inputs['Base Color'])
"""
s=s.replace("COL=bpy.data.collections.new('SCANDI_OFFICE')",insert+"\nCOL=bpy.data.collections.new('SCANDI_OFFICE')")
# Save the exact interpreted source with the outputs for future authors.
out=Path('visual-evidence/scandi-v2');out.mkdir(parents=True,exist_ok=True)
(out/'interpreted-authoring.py').write_text(s)
path.write_text(s)
runpy.run_path('scripts/design/render_scandi_review.py',run_name='__main__')
