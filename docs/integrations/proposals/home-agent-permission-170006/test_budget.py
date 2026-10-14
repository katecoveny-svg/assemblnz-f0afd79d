import unittest
from unittest.mock import patch
from budget import Budget
from run_deadline_proof import Proof,owned
from contextlib import contextmanager
class Clock:
 value=0
 def __call__(self):return self.value
class Deadlines(unittest.TestCase):
 def test_nested_caps_propagate_phase_and_reserve(self):
  clock=Clock();b=Budget(20,reserve=2,clock=clock)
  with b.phase(7) as outer:
   clock.value=1
   with b.phase(8):self.assertEqual(b.end(10),outer)
  clock.value=17
  self.assertEqual(b.end(8),18)
  clock.value=18
  with self.assertRaises(TimeoutError):b.end(1)
  self.assertEqual(b.deadline-clock.value,2)
 def test_successful_nested_raw_return_after_phase_is_rejected(self):
  clock=Clock();f=Proof.__new__(Proof);f.deadline=100;f._budget=Budget(100,clock=clock)
  def late(*args,**kwargs):clock.value=8;return owned.Result(0,b'1\n',b'')
  with patch.object(owned.Fixture,'raw',late):
   with self.assertRaises(TimeoutError):
    with f.budget.phase(4):f.raw(b'SELECT 1;')
  self.assertEqual(f.budget.phases,[])
 def test_success_at_reserve_boundary_rejected(self):
  clock=Clock();f=Proof.__new__(Proof);f.deadline=10;f._budget=Budget(10,clock=clock)
  def late(*args,**kwargs):clock.value=8;return owned.Result(0,b'1\n',b'')
  with patch.object(owned.Fixture,'raw',late):
   with self.assertRaises(TimeoutError):f.raw(b'SELECT 1;')
  self.assertEqual(f.deadline-clock.value,2)
class PhaseExit(unittest.TestCase):
 def test_live_client_closed_when_final_phase_exit_raises(self):
  class FakeBudget:
   work_end=90
   @contextmanager
   def phase(self,seconds):
    yield 3
    raise TimeoutError('final phase exit')
   def check(self):pass
   def end(self,seconds):return 3
  class Client:
   closed=False
   def __init__(self,*args,**kwargs):pass
   def send(self,data):pass
   def close(self):self.closed=True
  f=Proof.__new__(Proof);f._budget=FakeBudget();f.deadline=100;f.env={}
  client=Client()
  with patch.object(f,'verify_server',lambda:None),patch.object(f,'args',lambda:[]),patch('run_deadline_proof.Live',return_value=client):
   with self.assertRaisesRegex(TimeoutError,'final phase exit'):f.live(b'SELECT 1;')
  self.assertTrue(client.closed)
if __name__=='__main__':unittest.main()
