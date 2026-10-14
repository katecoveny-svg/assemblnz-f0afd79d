import subprocess
import sys
from pathlib import Path

def test_linux_inference_thread_cannot_connect():
    script = "from offline import restrict_inference_network; restrict_inference_network(); import socket,errno; s=socket.socket();\ntry: s.connect(('127.0.0.1',9))\nexcept OSError as e: assert e.errno==errno.EPERM\nelse: raise AssertionError('connect unexpectedly allowed')"
    result=subprocess.run([sys.executable,"-c",script],cwd=Path(__file__).parent,capture_output=True,text=True,timeout=10)
    assert result.returncode==0,result.stderr
