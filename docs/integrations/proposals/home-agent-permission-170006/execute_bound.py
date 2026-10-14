"""Reviewed binding wrapper: signal-owned no-prompt proof; no target options."""
import pathlib,runpy,signal,sys
if len(sys.argv)!=1:raise RuntimeError('no routing or mode arguments accepted')
def stop(signum,frame):raise TimeoutError('outer permission fixture deadline')
signal.signal(signal.SIGTERM,stop)
runpy.run_path(str(pathlib.Path(__file__).with_name('run_deadline_proof.py')),run_name='__main__')
