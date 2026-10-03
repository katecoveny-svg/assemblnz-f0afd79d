async page => {
  const image = 'repo/output/playwright/notes/synthetic-1.jpg';
  const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'; const b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const ensure = (ok, message) => { if (!ok) throw new Error(message); };
  const notes = () => page.getByRole('region', {name:'Handwritten notes',exact:true});
  const open = async () => { await page.getByRole('button',{name:'Look',exact:true}).click();await page.getByText('Show DO',{exact:false}).first().click(); };
  const add = async () => { await notes().getByLabel('Add handwritten note photos',{exact:true}).setInputFiles(image);await notes().getByRole('status').filter({hasText:'1 page(s) added'}).waitFor();await notes().getByRole('textbox',{name:/Page 1 text/}).fill('Private synthetic draft'); };
  const empty = async () => { await open();ensure(await notes().locator('img').count()===0,'new verified scope adopted old photos'); };
  await open();await add();
  await page.evaluate(a=>window.privacy.event(a),a);await empty(); // guest -> owner
  await add();await page.evaluate(b=>window.privacy.event(b),b);await empty(); // owner A -> B
  await add();await page.evaluate(()=>window.privacy.event('guest','SIGNED_OUT'));await empty();
  await add();
  await page.evaluate(()=>{window.privacy.fail(true);window.privacy.focus();});
  await page.getByRole('status').filter({hasText:'could not verify'}).waitFor();
  ensure(await notes().count()===0,'failed response retained workspace');
  await page.evaluate(()=>{window.privacy.fail(false);window.privacy.setOwner(null);window.privacy.focus();});
  await page.getByRole('status').filter({hasText:'could not verify'}).waitFor();
  ensure(await notes().count()===0,'null response retained workspace');
  await page.evaluate(a=>{window.privacy.setOwner(a);window.privacy.focus();},a);await empty();await add();
  const calls=await page.evaluate(()=>window.privacy.calls);
  await page.evaluate(()=>window.privacy.focus());await page.waitForFunction(n=>window.privacy.calls>n,calls);
  ensure(await notes().getByRole('textbox',{name:/Page 1 text/}).inputValue()==='Private synthetic draft','same-owner focus lost draft');
  await page.evaluate(a=>window.privacy.event(a,'TOKEN_REFRESHED'),a);
  ensure(await notes().getByRole('textbox',{name:/Page 1 text/}).inputValue()==='Private synthetic draft','same-owner token refresh lost draft');
  // Old focus response ignores abort on purpose. A newer auth verification wins.
  await page.evaluate(b=>{window.privacy.defer();window.privacy.focus();window.privacy.event(b);},b);
  await empty();await add();await page.evaluate(()=>window.privacy.release());
  ensure(await notes().getByRole('textbox',{name:/Page 1 text/}).inputValue()==='Private synthetic draft','old owner response remounted current workspace');
  // Actual photo request cleanup via the real Focus -> DoVision -> DoPhotoNotes tree.
  await notes().getByRole('textbox',{name:/Page 1 text/}).fill('');
  await page.evaluate(()=>window.synthetic.setMode('delayed'));
  await notes().getByRole('checkbox',{name:/Send only page 1 /}).check();await notes().getByRole('button',{name:'Transcribe page 1',exact:true}).click();
  await page.evaluate(()=>{window.privacy.defer();window.privacy.event('guest','SIGNED_OUT');});
  await page.getByRole('status').filter({hasText:'Checking this workspace'}).waitFor();
  ensure(await page.evaluate(()=>window.synthetic.aborted),'auth invalidation did not abort active photo');
  ensure(await notes().count()===0,'auth invalidation retained visible private notes');
  await page.evaluate(()=>{window.synthetic.release();window.privacy.release();});await empty();
  // Active synthetic camera stream must stop on invalidation without capturing any screen.
  await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=10;canvas.height=10;const stream=canvas.captureStream();window.__syntheticTrack=stream.getVideoTracks()[0];navigator.mediaDevices.getDisplayMedia=async()=>stream;HTMLMediaElement.prototype.play=async()=>{};});
  await page.getByRole('button',{name:/Choose a tab or window/}).click();
  await page.evaluate(a=>window.privacy.event(a),a);await empty();
  ensure(await page.evaluate(()=>window.__syntheticTrack.readyState==='ended'),'auth invalidation did not stop synthetic camera');
  await page.getByText('Build or customise a DO',{exact:true}).click();
  await page.getByRole('button',{name:'Open the builder',exact:true}).click();
  await page.getByRole('region',{name:'DO builder workspace',exact:true}).getByText('Show DO',{exact:false}).first().click();
  await add();
  await page.evaluate(b=>window.privacy.event(b),b);
  await page.getByRole('button',{name:'Write',exact:true}).waitFor();
  await page.getByText('Build or customise a DO',{exact:true}).click();
  await page.getByRole('button',{name:'Open the builder',exact:true}).click();
  await page.getByRole('region',{name:'DO builder workspace',exact:true}).getByText('Show DO',{exact:false}).first().click();
  ensure(await notes().locator('img').count()===0,'production boundary retained builder images across owner switch');
  await page.screenshot({path:'repo/output/playwright/notes-privacy/verified-builder-reset-mobile.png',fullPage:true});
  await page.evaluate(()=>{window.privacy.defer();window.privacy.focus();});
  await page.getByRole('button',{name:'Unmount synthetic widget'}).click();
  await page.evaluate(()=>window.privacy.release());
  ensure(await page.evaluate(()=>window.privacy.unsubscriptions===1),'auth subscription cleanup missing');
  const finalCalls=await page.evaluate(()=>window.privacy.calls);
  await page.evaluate(()=>window.privacy.focus());
  ensure(await page.evaluate(()=>window.privacy.calls)===finalCalls,'focus listener survived cleanup');
  ensure(await page.evaluate(()=>localStorage.length===0&&sessionStorage.length===0),'privacy boundary created storage');
}
