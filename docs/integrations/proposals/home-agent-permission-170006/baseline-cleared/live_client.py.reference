"""Bounded nonblocking client control; server observation is always independent."""
import os,selectors,subprocess,time,signal
class Live:
 def __init__(self,argv,env,deadline,limit=65536,cleanup_deadline=None,deadline_fn=None):
  self.deadline=deadline;self.cleanup_deadline=cleanup_deadline if cleanup_deadline is not None else deadline;self.limit=limit;self.out=bytearray();self.err=bytearray()
  self.deadline_fn=deadline_fn
  self.p=subprocess.Popen(argv,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=env,start_new_session=True,bufsize=0)
  self.sel=selectors.DefaultSelector()
  for stream,label in [(self.p.stdout,'out'),(self.p.stderr,'err')]:
   os.set_blocking(stream.fileno(),False);self.sel.register(stream,selectors.EVENT_READ,label)
  os.set_blocking(self.p.stdin.fileno(),False)
 def poll(self):return self.p.poll()
 @property
 def stdin_open(self):return not self.p.stdin.closed
 def pump(self,until,pending=None):
  end=min(self.deadline,until)
  while self.sel.get_map() or self.p.poll() is None:
   remaining=end-time.monotonic()
   if remaining<=0:raise TimeoutError('live client monotonic deadline')
   events=self.sel.select(min(remaining,.05))
   for key,mask in events:
    if key.data=='in':
     try:n=os.write(key.fd,pending)
     except BrokenPipeError:n=len(pending)
     del pending[:n]
     if not pending:self.sel.unregister(key.fileobj)
    else:
     try:b=os.read(key.fd,8192)
     except BlockingIOError:continue
     if not b:self.sel.unregister(key.fileobj)
     else:
      target=self.out if key.data=='out' else self.err;target.extend(b)
      if len(self.out)+len(self.err)>self.limit:raise RuntimeError('live output cap')
   if time.monotonic()>=end:raise TimeoutError('late live completion rejected')
   if pending is not None and not pending:return
  if time.monotonic()>=end:raise TimeoutError('late live completion rejected')
  self.p.wait(timeout=max(.001,min(self.deadline,end)-time.monotonic()))
  if time.monotonic()>=end:raise TimeoutError('late live exit rejected')
 def send(self,data,seconds=3):
  pending=bytearray(data);self.sel.register(self.p.stdin,selectors.EVENT_WRITE,'in')
  self.pump(self.deadline_fn(seconds) if self.deadline_fn else time.monotonic()+seconds,pending)
 def collect(self,seconds=3):
  self.p.stdin.close();self.pump(self.deadline_fn(seconds) if self.deadline_fn else time.monotonic()+seconds)
  return self.p.returncode,bytes(self.out),bytes(self.err)
 def close(self):
  # Caller reserves cleanup time inside the unchanged whole-run deadline.
  if self.p.poll() is None:
   os.killpg(self.p.pid,signal.SIGKILL)
   self.p.wait(timeout=max(.001,min(2,self.cleanup_deadline-time.monotonic())))
  self.sel.close()
  for stream in [self.p.stdin,self.p.stdout,self.p.stderr]:
   if not stream.closed:stream.close()
