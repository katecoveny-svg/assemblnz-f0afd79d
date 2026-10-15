'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let selected = null, current = null, busy = false;
  const send = async fields => { const r = await chrome.runtime.sendMessage({ type: 'do:browser-companion', ...fields }); if (!r?.ok) throw new Error(r?.error || 'Companion unavailable.'); return r.data; };
  function render(data) {
    const wasConnected = Boolean(current?.connected);
    current = data;
    const connected = Boolean(data?.connected);
    $('setup').hidden = connected;
    $('journal-setup').hidden = data?.journal?.ready !== false;
    $('journal-status').textContent = data?.journal?.message || '';
    $('recovery').hidden = !connected || !data.readGranted || !(data.recoveryNeeded || data.recovery);
    $('recover-read').disabled = busy || Boolean(data?.busy);
    $('recover-ack').hidden = !connected || !data?.recovery;
    $('recover-ack').disabled = busy || Boolean(data?.busy);
    $('recovery-items').replaceChildren(...(data?.recovery?.items || []).map(item => { const li=document.createElement('li');li.textContent=`${item.sku}: before ${item.before}, requested ${item.target}, current ${item.current ?? 'unknown'}`;return li; }));
    $('cancel').hidden = !connected;
    $('read-step').hidden = !connected || data.readGranted;
    $('next-step').hidden = !connected || !data.readGranted || Boolean(data.proposal) || Boolean(data.receipt) || Boolean(data.recoveryNeeded) || Boolean(data.recovery);
    $('result').hidden = !connected || !data.receipt;
    $('allow-read').disabled = !data?.connected || data.readGranted || busy;
    $('review').hidden = !data?.connected || !data.proposal || Boolean(data.receipt) || Boolean(data.recoveryNeeded);
    $('approve').disabled = busy || !data?.connected || data.busy || !data.proposal || data.journal?.ready === false || Boolean(data.recoveryNeeded);
    if (data?.connected) {
      $('status').textContent = `Test cart connected. Access ends at ${new Date(data.expiresAt).toLocaleTimeString()}.`;
      $('origin').textContent = data.target.url;
      $('brief').textContent = data.brief;
      $('items').replaceChildren(...(data.proposal?.items || []).map(item => { const li = document.createElement('li'); li.textContent = `${item.name} · ID/SKU: ${item.productId}${item.retailerProduct ? ` · ${item.retailerProduct.variant} · ${item.retailerProduct.packSize}` : ""}: ${item.quantity} → ${item.targetQuantity}, NZD ${(item.unitPriceCents / 100).toFixed(2)} each`; return li; }));
      $('receipt').textContent = data.receipt ? JSON.stringify(data.receipt, null, 2) : '';
      $('result-title').textContent = data.receipt?.status === 'verified' ? 'Test cart changes verified' : 'Stopped — check the test cart';
      $('result-items').replaceChildren(...(data.receipt?.items || []).map(item => {
        const li = document.createElement('li');
        li.textContent = `${item.productId}: ${item.status === 'verified' ? `verified quantity ${item.observedQuantity}` : item.status === 'not_attempted' ? 'not attempted' : 'result uncertain — do not retry automatically'}`;
        return li;
      }));
    } else { $('status').textContent = wasConnected ? 'Connection ended. Reconnect and review to continue.' : 'Not connected. Everyday shopping is not available in this pilot.'; $('receipt').textContent = ''; $('items').replaceChildren(); $('brief').textContent = ''; }
  }
  const fail = error => { $('error').hidden = false; $('error').textContent = error instanceof Error ? error.message : 'Connection unavailable. Try again.'; };
  const clearError = () => { $('error').hidden = true; $('error').textContent = ''; };
  $('inspect').onclick = async () => { try {
    clearError(); $('connection-choice').hidden = true; $('connect').disabled = true;
    const data = await send({ action: 'inspect' }); selected = data.selected;
    $('selected').textContent = selected ? 'Fictional cart found. Choose your DO tab below.' : (data.selectionIssue || 'Select the supported local storefront tab. Other websites are unavailable.');
    $('workspace').replaceChildren(...data.workspaces.map(tab => { const option = document.createElement('option'); option.value = String(tab.id); option.textContent = `Personal DO ${data.workspaces.length > 1 ? `(tab ${tab.id}) ` : ''}— ${new URL(tab.url).pathname}`; return option; }));
    $('connection-choice').hidden = !selected || !data.workspaces.length;
    if (selected && !data.workspaces.length) $('selected').textContent = 'Open a signed-in Personal DO tab in this Chrome window, then try again.';
    $('connect').disabled = !selected || !data.workspaces.length; render(data.connection);
  } catch (error) { fail(error); } };
  $('connect').onclick = async () => { clearError(); try { render(await send({ action: 'connect', targetId: selected?.id, workspaceId: Number($('workspace').value) })); } catch (error) { fail(error); } };
  $('cancel').onclick = async () => { clearError(); try { render(await send({ action: 'cancel' })); } catch (error) { fail(error); } };
  $('allow-read').onclick = async () => { if (!current?.connected) return; clearError(); try { render(await send({action:'allow-read', connectionId:current.connectionId})); } catch (error) { fail(error); } };
  $('approve').onclick = async () => { if (busy || !current?.connected) return; clearError(); busy = true; $('approve').disabled = true;
    try { render(await send({ action: 'approve', connectionId: current.connectionId, digest: current.digest })); } catch (error) { fail(error); } finally { busy = false; if (current) render(current); }
  };
  for (const [id,action] of [['setup-journal','setup-journal'],['recover-read','recover-read'],['recover-ack','recover-ack']]) {
    $(id).onclick = async () => {
      if (busy) return;
      clearError();busy=true;$(id).disabled=true;
      try { render(await send({action,connectionId:current?.connectionId,...(action==='recover-ack'?{digest:current?.recovery?.digest}:{})})); }
      catch(error){fail(error);}finally{busy=false;$(id).disabled=false;if(current)render(current);}
    };
  }
  void send({ action: 'status' }).then(render).catch(fail);
  // Poll only while the user is looking at the companion review. No automatic actions.
  setInterval(() => { if (!busy && !document.hidden) void send({ action: 'status' }).then(render).catch(fail); }, 2000);
})();
