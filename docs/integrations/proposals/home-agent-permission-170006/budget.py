import time
from contextlib import contextmanager
class Budget:
 def __init__(self,deadline,reserve=2,clock=time.monotonic):
  self.deadline=deadline;self.reserve=reserve;self.clock=clock;self.phases=[]
 @property
 def work_end(self):return self.deadline-self.reserve
 def end(self,seconds):
  end=min([self.work_end,self.clock()+seconds]+self.phases)
  if end<=self.clock():raise TimeoutError('effective work budget exhausted; cleanup reserve protected')
  return end
 def check(self,end=None):
  limit=min([self.work_end]+self.phases+([] if end is None else [end]))
  if self.clock()>=limit:raise TimeoutError('late completion rejected; cleanup reserve protected')
 @contextmanager
 def phase(self,seconds):
  end=self.end(seconds);self.phases.append(end)
  try:
   yield end
   self.check(end)
  finally:self.phases.pop()
