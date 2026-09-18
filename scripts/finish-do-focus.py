from pathlib import Path
import hashlib
ROOT=Path(__file__).resolve().parents[1]
def once(s,old,new):
 if s.count(old)!=1:raise SystemExit('Expected inspected source boundary: '+old[:80])
 return s.replace(old,new,1)
def blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
changes={}
p='scripts/public-front-door-guard.mjs';data=(ROOT/p).read_bytes()
if blob(data)!='72b09ff243211c3dcfdb8966bbbe03b07afb7a1f':raise SystemExit('Front-door guard changed; reconcile before applying.')
s=data.decode()
s=once(s,"const meetingUi = read('app/do/meetings/MeetingDo.tsx');","const meetingUi = read('app/do/meetings/MeetingDo.tsx') + (existsSync('app/do/meetings/MeetingDoExperience.tsx') ? read('app/do/meetings/MeetingDoExperience.tsx') : '');")
s=once(s,'if (!/Turn audio into notes/.test(meetingChrome)) {','if (!/Turn audio into notes|Create transcript/.test(meetingChrome)) {')
s=once(s,'Meeting DO transcribe heading must be human: Turn audio into notes','Meeting DO must explain transcription in plain language')
changes[p]=s
p='app/do/meetings/MeetingDoExperience.tsx';s=(ROOT/p).read_text()
s=once(s,'No invented progress percentage. You can stop this request.','You can stop this request. Your source stays here.')
s=once(s,'The ring shows recording activity, not sound levels.','Recording locally. Stay with your meeting.')
changes[p]=s
p='components/do/DoFocusWorkspace.tsx';s=(ROOT/p).read_text().replace('useContext','acceptContext');changes[p]=s
p='app/do/DoTextWorkspace.tsx';s=(ROOT/p).read_text()
s=once(s,'      const data = await response.json();','      const data = await response.json();\n      if (controller.signal.aborted) return;')
s=once(s,"      setSource(event.data.text.slice(0, DO_SOURCE_LIMIT));", "      abort.current?.abort(); setDraft(null);\n      setSource(event.data.text.slice(0, DO_SOURCE_LIMIT));")
changes[p]=s
for p,s in changes.items():(ROOT/p).write_text(s)
print('Updated extracted-presentation guard, human state copy and stale-request handling.')
