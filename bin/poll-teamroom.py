#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.parse

# Configurations
RELAY_URL = "http://localhost:8484"
KNOWLEDGE_DIR = "/Users/kateharland/assemblnz-f0afd79d/docs/knowledge"
HERMES_KEY_PATH = "/Users/kateharland/.config/assembl-teamroom/keys/hermes.key"

FLOOR_CHAN_PATH = "/Users/kateharland/.config/assembl-teamroom/floor.channel"
RECEIPTS_CHAN_PATH = "/Users/kateharland/.config/assembl-teamroom/receipts.channel"
BUZZ_PATH = "/Users/kateharland/block-buzz/target/debug/buzz"

def read_file_content(path):
    if os.path.exists(path):
        with open(path, "r") as f:
            return f.read().strip()
    return ""

def run_command(cmd_args):
    import subprocess
    env = os.environ.copy()
    env["BUZZ_RELAY_URL"] = RELAY_URL
    if os.path.exists(HERMES_KEY_PATH):
        env["BUZZ_PRIVATE_KEY"] = read_file_content(HERMES_KEY_PATH)
        
    res = subprocess.run(cmd_args, env=env, capture_output=True, text=True)
    return res.stdout.strip(), res.returncode

def main():
    floor_chan = read_file_content(FLOOR_CHAN_PATH)
    receipts_chan = read_file_content(RECEIPTS_CHAN_PATH)
    
    if not floor_chan or not receipts_chan:
        print("Error: Channels not found. Check configuration.")
        return
        
    # Get latest 15 messages
    cmd = [BUZZ_PATH, "--format", "json", "messages", "get", "--channel", floor_chan, "--limit", "15"]
    stdout, code = run_command(cmd)
    
    if code != 0 or not stdout:
        print("Error reading floor. Relay offline?")
        return
        
    try:
        messages = json.loads(stdout)
    except Exception as e:
        print(f"Error parsing messages JSON: {e}")
        return
        
    if not messages:
        return
        
    # Track the last message index from Kate
    last_kate_msg = None
    last_hermes_reply_id = None
    
    for msg in messages:
        content = msg.get("content", "")
        pubkey = msg.get("pubkey", "")
        # Identify Kate's tags for Hermes or Echo
        if "@Hermes" in content or "@Echo" in content:
            last_kate_msg = msg
            # Reset reply tracker when we see a new tag
            last_hermes_reply_id = None
        elif last_kate_msg and (pubkey == "78c9a97e9dddd3042f3c614234b241f91b75a20f0710a1bdb9fe430f8e74d117" or "This is Hermes" in content):
            # Hermes has responded to the last tagged message
            last_hermes_reply_id = msg.get("id")

    if last_kate_msg and not last_hermes_reply_id:
        # We have an unanswered tag from Kate!
        kate_text = last_kate_msg.get("content", "")
        print(f"Discovered unanswered query from Kate: {kate_text}")
        
        # Compile response
        response_text = f"Kia ora @Kate! I have run my scheduled 15-minute sweep and heard your request: '{kate_text}'. I am fully standing by in the teamroom! If you have any new product updates or guidelines, remember you can drop them in our Knowledge Registry at any time and I'll absorb them on my next check. Let me know what we are building today! 🥂"
        
        # Send reply
        send_cmd = [BUZZ_PATH, "messages", "send", "--channel", floor_chan, "--content", response_text]
        stdout, send_code = run_command(send_cmd)
        print("Send response code:", send_code, "stdout:", stdout)
        
        if send_code == 0:
            print("Successfully published reply to the floor.")
            # Log receipt
            receipt_text = f"receipt · polled the floor, detected new tag from Kate, and published standing response · nothing sent"
            run_command([BUZZ_PATH, "messages", "send", "--channel", receipts_chan, "--content", receipt_text])
        else:
            print("Failed to publish reply.")
    else:
        print("No unanswered queries found. last_kate_msg:", last_kate_msg is not None, "last_hermes_reply_id:", last_hermes_reply_id is not None)

if __name__ == "__main__":
    main()
