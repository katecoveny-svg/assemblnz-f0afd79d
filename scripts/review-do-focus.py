"""Actual Next/React UI; fake microphone and mocked auth/provider responses. No live model call."""
import asyncio, json, os
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright, expect
BASE=os.environ.get('DO_REVIEW_BASE','http://127.0.0.1:3000')
OUT=Path('visual-evidence/do-focus')
TEXT='Meeting notes\nThe team agreed to review the collection journey before deciding on a pilot.\n\nAttendees\nAvery and Jordan\n\nDecisions / outcomes\nPrepare a draft brief for review.\n\nAction items\nDraft the brief · Owner: Jordan · Due: not stated\n\nOpen questions\nThe pilot budget is not confirmed.\n\nSuggested specialist DO\nMeeting follow-up (draft)\n\nFollow-up email draft\nSubject: Collection journey review\nKia ora, here are the draft next steps for your review.'
SOURCE='Avery: We should review the collection journey before deciding on a pilot. Jordan: I will draft the brief. Avery: We have not confirmed a budget or deadline.'
DRAFT={'version':1,'id':'fixture-ui-only','task':'meeting-notes','title':'Meeting notes','text':TEXT,'createdAt':'2026-09-18T00:00:00Z','status':'draft','evidence':{'method':'model','model':'browser-test-double-not-live','sourceTitle':'Test transcript','sourceUrl':'','sourceHash':'a'*64,'sourceCharacters':len(SOURCE),'instructionHash':'b'*64,'outputHash':'c'*64,'consentAt':'2026-09-18T00:00:00Z','boundary':'Browser fixture only. No live provider call.'}}
async def main():
 OUT.mkdir(parents=True,exist_ok=True);report=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(args=['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'])
  for width in [375,1440]:
   ctx=await browser.new_context(viewport={'width':width,'height':1000},permissions=['microphone'],reduced_motion='reduce')
   calls=[];errors=[]
   async def route(r):
    req=r.request;url=urlparse(req.url)
    if url.netloc!=urlparse(BASE).netloc:await r.abort();return
    if not url.path.startswith('/api/'):await r.continue_();return
    calls.append((url.path,req.method));body={'message':'Blocked by UI fixture'};status=503
    if url.path=='/api/do/runtime':body={'signedIn':True,'trial':{'bypassed':True},'availability':{'preparation':'configured','label':'Fixture','note':'Browser fixture only.','extraction':'available','storage':'this-browser','externalActions':False}};status=200
    elif url.path=='/api/do/meetings/transcribe':body={'configured':True} if req.method=='GET' else {'transcript':SOURCE,'status':'review_required','provider':'mock'};status=200
    elif url.path=='/api/do/prepare':body={'draft':DRAFT};status=200
    elif url.path=='/api/do/live-token':body={'enabled':False,'configured':False,'signedIn':True};status=200
    await r.fulfill(status=status,content_type='application/json',body=json.dumps(body))
   await ctx.route('**/*',route)
   page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'/do/meetings',wait_until='networkidle')
   await expect(page.get_by_role('heading',name='Be in the conversation.')).to_be_visible()
   start=page.get_by_role('button',name='Start recording',exact=True);await expect(start).to_be_disabled()
   assert len([c for c in calls if c[1]=='POST'])==0,'Opening a page must not start work'
   assert not await page.get_by_text('Meeting DO to-do',exact=True).count()
   assert not await page.get_by_text('Needs you',exact=True).count()
   assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
   box=await start.bounding_box();assert box and box['y']+box['height']<1000
   await page.screenshot(path=str(OUT/f'meeting-ready-{width}.png'),full_page=True)
   await page.get_by_role('checkbox',name='Everyone has been informed and I have permission to record.').check()
   await start.click();await expect(page.get_by_role('button',name='Stop recording',exact=True)).to_be_visible()
   await page.wait_for_timeout(1200);await page.screenshot(path=str(OUT/f'meeting-recording-{width}.png'),full_page=True)
   await page.get_by_role('button',name='Stop recording',exact=True).click()
   await expect(page.get_by_role('link',name='Download recording',exact=True)).to_be_visible()
   await expect(page.get_by_role('button',name='Create transcript',exact=False)).to_be_disabled()
   await page.get_by_role('checkbox',name='Share this recording with Deepgram to make a transcript.').check()
   await page.get_by_role('button',name='Create transcript',exact=False).click()
   await expect(page.get_by_role('heading',name='First, check the words.')).to_be_visible()
   await page.get_by_role('checkbox',name='Use this transcript with DO’s preparation provider to write my notes.').check()
   await page.get_by_role('button',name='Prepare my notes',exact=False).click()
   await expect(page.get_by_role('heading',name='The conversation, assembled.')).to_be_visible()
   await expect(page.get_by_role('button',name='Prepare the follow-up',exact=False)).to_be_disabled()
   await page.get_by_role('checkbox',name='I checked the notes, including owners and dates.').check()
   await expect(page.get_by_role('button',name='Prepare the follow-up',exact=False)).to_be_enabled()
   await page.screenshot(path=str(OUT/f'meeting-notes-{width}.png'),full_page=True)
   await page.get_by_role('button',name='Edit notes',exact=True).click()
   await page.get_by_role('textbox',name='Edit notes',exact=True).fill(TEXT+'\nEdited for review.')
   await expect(page.get_by_role('checkbox',name='I checked the notes, including owners and dates.')).not_to_be_checked()
   await page.get_by_role('button',name='Transcript',exact=True).click()
   await page.get_by_role('button',name='Edit transcript and prepare again',exact=True).click()
   await expect(page.get_by_role('heading',name='First, check the words.')).to_be_visible()
   await expect(page.get_by_role('checkbox',name='Use this transcript with DO’s preparation provider to write my notes.')).not_to_be_checked()
   await page.goto(BASE+'/do/widget',wait_until='networkidle')
   await expect(page.get_by_role('heading',name='What needs doing?')).to_be_visible()
   await expect(page.get_by_role('combobox',name='Task',exact=True)).to_be_visible()
   assert not await page.get_by_text('This DO · next tasks',exact=True).count()
   assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
   await page.screenshot(path=str(OUT/f'workspace-ready-{width}.png'),full_page=True)
   await page.locator('#do-source').fill('Please prepare a clear reply asking when the reviewed draft is needed.')
   await page.get_by_role('combobox',name='Task',exact=True).select_option('reply')
   await page.get_by_role('checkbox',name='Use this text for this preparation.',exact=False).check()
   await page.get_by_role('button',name='Write a reply',exact=False).click()
   await expect(page.get_by_role('region',name='Prepared draft')).to_be_visible()
   await page.get_by_role('button',name='Talk',exact=True).click()
   await page.get_by_role('button',name='Write',exact=True).click()
   await expect(page.locator('#do-source')).to_have_value('Please prepare a clear reply asking when the reviewed draft is needed.')
   assert len([c for c in calls if c[1]=='POST'])==3,calls
   assert not errors,errors
   report.append({'width':width,'mockedAuthAndProviders':True,'realMediaRecorderWithFakeMicrophone':True,'recordingConsent':'passed','independentSharingConsents':'passed','reviewInvalidation':'passed','workspaceDraft':'passed','noExtraTaskBoards':True,'noHorizontalOverflow':True,'consoleErrors':errors})
   await ctx.close()
  ctx=await browser.new_context(viewport={'width':375,'height':1000},reduced_motion='reduce')
  await ctx.route('**/*',route)
  page=await ctx.new_page();await page.goto(BASE+'/do/meetings?previewNotes=1',wait_until='networkidle')
  await expect(page.get_by_text('Sample notes for layout review.',exact=False)).to_be_visible()
  await expect(page.get_by_role('button',name='Prepare the follow-up',exact=False)).to_be_disabled()
  await page.screenshot(path=str(OUT/'meeting-sample-375.png'),full_page=True)
  await ctx.close();await browser.close()
 (OUT/'report.json').write_text(json.dumps({'scope':'actual Next UI with simulated auth/provider dependencies; no live transcription proof','checks':report},indent=2))
asyncio.run(main())
