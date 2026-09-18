"""Preserve current DO structure; carry only reviewed text edits from PR 1370."""
from pathlib import Path
p=Path('app/do/DoHome.tsx');s=p.read_text()
changes={
'Work from the place\n              <br />\n              you’re already in.':'Choose the task.\n              <br />\n              Review the result.',
'DO is a small agent that sits where you already work. Click it when\n              you need help with that context. Pick or tweak a template. Connect a\n              tool only when you want to. The surface is not the agent — you stay\n              in your own work.':'Bring the relevant text or notes. Choose what DO should prepare.\n              Connect a tool only when the task needs it, then review the result\n              before using it.',
'Browser, desktop, or share surface — same agent, same context.':'Open the workspace or use the companion to bring selected context.',
'Start from a useful shape for the job in front of you.':'Choose a task and edit the instructions for your job.',
'Optional connectors. You review before anything consequential.':'Connect the tools the task needs. Review before external actions.',
'You can DO the work from the place you’re already in.':'Choose the task. Add the context. Review the result.'}
for old,new in changes.items():
 if new in s: continue
 if s.count(old)!=1: raise RuntimeError('Current DO copy changed; reconcile rather than overwrite: '+old[:60])
 s=s.replace(old,new,1)
p.write_text(s)
