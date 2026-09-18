"""Preserve the accepted DO headline and positioning; improve supporting copy only.
Do not weaken the front-door guard to make an unrelated packaging change pass.
"""
from pathlib import Path
p=Path('app/do/DoHome.tsx');s=p.read_text()
changes={
'Browser, desktop, or share surface — same agent, same context.':'Open the workspace or use the companion to bring selected context.',
'Start from a useful shape for the job in front of you.':'Choose a task and edit the instructions for your job.',
'Optional connectors. You review before anything consequential.':'Connect the tools the task needs. Review before external actions.',
'You can DO the work from the place you’re already in.':'Choose the task. Add the context. Review the result.'}
for old,new in changes.items():
 if new in s: continue
 if s.count(old)!=1: raise RuntimeError('Current DO copy changed; reconcile rather than overwrite: '+old[:60])
 s=s.replace(old,new,1)
p.write_text(s)
