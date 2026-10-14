"""Fail-closed Linux inference-thread egress restriction, installed BEFORE ML imports."""
import ctypes
import ctypes.util
import errno
import os
import sys

def restrict_inference_network():
    os.environ.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1",
                      HF_HUB_DISABLE_TELEMETRY="1", DO_NOT_TRACK="1",
                      ONNX_DISABLE_TELEMETRY="1", TOKENIZERS_PARALLELISM="false")
    if sys.platform != "linux":
        raise RuntimeError("This inference worker requires Linux seccomp.")
    name = ctypes.util.find_library("seccomp")
    if not name:
        raise RuntimeError("Install libseccomp2 before running inference.")
    lib = ctypes.CDLL(name, use_errno=True)
    lib.seccomp_init.argtypes = [ctypes.c_uint32]
    lib.seccomp_init.restype = ctypes.c_void_p
    lib.seccomp_syscall_resolve_name.argtypes = [ctypes.c_char_p]
    lib.seccomp_syscall_resolve_name.restype = ctypes.c_int
    lib.seccomp_rule_add.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int, ctypes.c_uint]
    lib.seccomp_load.argtypes = [ctypes.c_void_p]
    lib.seccomp_release.argtypes = [ctypes.c_void_p]
    ctx = lib.seccomp_init(0x7fff0000)
    if not ctx:
        raise RuntimeError("Cannot initialise the offline guard.")
    try:
        for call in (b"connect", b"sendto", b"sendmsg", b"sendmmsg"):
            number = lib.seccomp_syscall_resolve_name(call)
            if number < 0 or lib.seccomp_rule_add(ctx, 0x00050000 | errno.EPERM, number, 0):
                raise RuntimeError("Cannot configure the offline guard.")
        if lib.seccomp_load(ctx):
            raise RuntimeError("Cannot activate the offline guard.")
    finally:
        lib.seccomp_release(ctx)
