"""Bounded diagnostic ONLY: stop before SQL/name/executable admission."""
import pathlib,json,time,re,signal,sys,shlex
from run_deadline_proof import Proof,owned
PROBE=["/bin/sh","-c","IFS= read -r fixture_comm < /proc/1/comm && printf '%s\\n' \"$fixture_comm\""]
WRAPPER_READ="fixture_lines=0; while IFS= read -r fixture_line || [ -n \"$fixture_line\" ]; do fixture_lines=$((fixture_lines+1)); [ \"$fixture_lines\" -le 64 ] || exit 81; [ \"${#fixture_line}\" -le 4096 ] || exit 82; printf '%s\\n' \"$fixture_line\"; done < \"$1\""
def literal_exec_target(text):
 candidates=[]
 for line in text.splitlines():
  if not line.lstrip().startswith('exec '):continue
  tokens=shlex.split(line)
  if not tokens or tokens[0]!='exec':continue
  index=3 if tokens[1:2]==['-a'] else 1
  owned.require(len(tokens)>index,'incomplete wrapper exec')
  target=tokens[index]
  owned.require(re.fullmatch(NIX_EXECUTABLE_RE,target) is not None,'nonliteral/unapproved wrapper exec target')
  owned.require(not any(t in (';','|','&','&&','||','>','<') for t in tokens),'compound wrapper exec not admitted for capture')
  candidates.append(target)
 owned.require(len(candidates)==1,'wrapper does not have one literal exec target')
 return candidates[0]
NIX_EXECUTABLE_RE='/nix/store/[a-z0-9]{32}-[A-Za-z0-9_.+-]+/bin/[A-Za-z0-9_.+-]+'
class CapturedBeforeAdmission(Exception):pass
class Capture(Proof):
 def raw(self,*args,**kwargs):raise RuntimeError('diagnostic forbids all SQL requests')
 def psql_args(self,*args,**kwargs):raise RuntimeError('diagnostic forbids libpq connection construction')
 def image_command(self,args):
  if args==PROBE:
   owned.require(not getattr(self,'captured',False),'capture may occur only once')
   self.captured=True
   with self.budget.phase(20):self.capture_identity()
   raise CapturedBeforeAdmission('PID1 identity captured; NO SQL/admission executed')
  return super().image_command(args)
 def capture_identity(self):
  evidence={'scope':'capture only; no identity admission or permission SQL','image':owned.IMAGE,'declared_path':owned.POSTGRES,'wrapper_relationship_admitted':False}
  def save():
   (self.record_dir/'pid1-executable-capture.json').write_text(json.dumps(evidence,indent=2)+'\n')
  def command(args):return super(Capture,self).image_command(args)
  def fixed_path(path):
   owned.require(re.fullmatch('/[A-Za-z0-9_./-]+',path) is not None,'invalid captured executable path')
   self.checked(command(['/bin/sh','-c','test -f "$1" && test -x "$1"','capture-file-check',path]),'captured regular executable')
   return path
  def resolved(path):
   value=self.checked(command(['/usr/bin/readlink','-f',path]),'captured readlink').decode().strip()
   owned.require(re.fullmatch(NIX_EXECUTABLE_RE,value) is not None,'resolved executable escapes approved Nix store/bin namespace')
   return fixed_path(value)
  def hashed(path):
   value=self.checked(command(['/usr/bin/sha256sum',path]),'captured file hash').decode()
   match=re.fullmatch(r'([0-9a-f]{64})  '+re.escape(path)+r'\n',value)
   owned.require(match is not None,'malformed captured hash')
   return match.group(1)
  save()
  # Existing startup logs may establish when capture is useful; never admit SQL from logs.
  with self.budget.phase(10) as end:
   while True:
    result=self.docker(['logs',self.cid],seconds=min(1,max(0,end-time.monotonic())))
    owned.require(result.code==0,'startup log capture failed')
    if b'database system is ready to accept connections' in result.stdout+result.stderr:break
    self.budget.check(end);time.sleep(min(.1,max(0,end-time.monotonic())))
  evidence['ready_log_observed']=True;save()
  # Executable facts are retained BEFORE any comm classification. No names are admitted.
  evidence['pid1_executable_path']=resolved('/proc/1/exe');save()
  evidence['pid1_executable_sha256']=hashed(evidence['pid1_executable_path']);save()
  evidence['pid1_running_executable_sha256']=hashed('/proc/1/exe');save()
  owned.require(evidence['pid1_running_executable_sha256']==evidence['pid1_executable_sha256'],'running executable differs from pathname bytes')
  evidence['declared_resolved_path']=resolved(owned.POSTGRES);save()
  evidence['declared_sha256']=hashed(evidence['declared_resolved_path']);save()
  owned.require(evidence['declared_resolved_path']==owned.POSTGRES and evidence['declared_sha256']==owned.IMAGE_FILES[owned.POSTGRES],'declared pinned executable changed')
  result=command(PROBE);evidence['pid1_comm_result']={'code':result.code,'stdout':result.stdout.decode(errors='replace'),'stderr':result.stderr.decode(errors='replace')};save()
  owned.require(result.code==0 and not result.stderr,'comm capture failed')
  # Read only the pinned declared file using already observed shell builtins.
  result=command(['/bin/sh','-c',WRAPPER_READ,'capture-pinned-wrapper',owned.POSTGRES])
  evidence['declared_wrapper_result']={'code':result.code,'stdout':result.stdout.decode(errors='replace'),'stderr':result.stderr.decode(errors='replace'),'copied_sha256':owned.digest(result.stdout)};save()
  owned.require(result.code==0 and not result.stderr and owned.digest(result.stdout)==evidence['declared_sha256'],'wrapper text not a complete exact-byte copy; relationship remains unverified')
  evidence['actual_path_mentioned_in_wrapper']=evidence['pid1_executable_path'] in result.stdout.decode();save()
  # Capture a bounded literal launcher chain without executing any discovered target.
  evidence['launcher_chain']=[];current=evidence['declared_resolved_path'];text=result.stdout.decode()
  for depth in range(4):
   target=literal_exec_target(text);target_resolved=resolved(target);target_sha=hashed(target_resolved)
   record={'from':current,'literal_exec_target':target,'target_resolved':target_resolved,'target_sha256':target_sha}
   evidence['launcher_chain'].append(record);save()
   if target_resolved==evidence['pid1_executable_path']:
    owned.require(target_sha==evidence['pid1_executable_sha256'],'launcher terminal hash changed')
    evidence['launcher_chain_reaches_observed_executable']=True;save();break
   owned.require(target_resolved not in [evidence['declared_resolved_path']]+[row['from'] for row in evidence['launcher_chain']],'launcher chain cycle')
   current=target_resolved
   copied=command(['/bin/sh','-c',WRAPPER_READ,'capture-literal-wrapper',current])
   record['wrapper_result']={'code':copied.code,'stdout':copied.stdout.decode(errors='replace'),'stderr':copied.stderr.decode(errors='replace'),'copied_sha256':owned.digest(copied.stdout)};save()
   owned.require(copied.code==0 and not copied.stderr and owned.digest(copied.stdout)==target_sha,'intermediate launcher not complete exact text')
   text=copied.stdout.decode()
  else:raise RuntimeError('launcher chain exceeds four captured targets; no identity admission')

  evidence['pid1_executable_path_after_capture']=resolved('/proc/1/exe');save()
  evidence['pid1_executable_sha256_after_capture']=hashed(evidence['pid1_executable_path_after_capture']);save()
  evidence['pid1_running_executable_sha256_after_capture']=hashed('/proc/1/exe');save()
  owned.require(evidence['pid1_running_executable_sha256_after_capture']==evidence['pid1_executable_sha256_after_capture'],'running executable changed from pathname bytes after capture')
  owned.require((evidence['pid1_executable_path'],evidence['pid1_executable_sha256'],evidence['pid1_running_executable_sha256'])==(evidence['pid1_executable_path_after_capture'],evidence['pid1_executable_sha256_after_capture'],evidence['pid1_running_executable_sha256_after_capture']),'PID1 changed during capture; no stable identity proof')
  evidence['capture_complete']=True;save()
def main():
 owned.require(len(sys.argv)==1,'no routing or mode arguments')
 def stop(signum,frame):raise TimeoutError('outer owned diagnostic deadline')
 signal.signal(signal.SIGTERM,stop)
 fixture=Capture()
 try:
  try:fixture.create()
  except CapturedBeforeAdmission:print('Diagnostic capture complete; SQL and identity admission intentionally not executed')
  else:raise RuntimeError('capture interception missing; never proceed to permission SQL')
 finally:fixture.close()
if __name__=='__main__':main()
