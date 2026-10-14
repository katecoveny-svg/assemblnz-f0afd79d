'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let selected = null, current = null, busy = false;
  const send = async fields => { const r = await chrome.runtime.sendMessage({ type: 'do:browser-companion', ...fields }); if (!r?.ok) throw new Error(r?.error || 'Companion unavailable.'); return r.data; };
  function render(data) {
    current = data;
    $('allow-read').disabled = !data?.connected || data.readGranted || busy;
    $('review').hidden = !data?.connected || !data.proposal || Boolean(data.receipt);
    $('approve').disabled = busy || !data?.connected || data.busy || !data.proposal;
    if (data?.connected) {
      $('status').textContent = `Connected only to ${data.target.url}. Expires ${new Date(data.expiresAt).toLocaleTimeString()}.`;
      $('origin').textContent = data.target.url;
      $('brief').textContent = data.brief;
      $('items').replaceChildren(...(data.proposal?.items || []).map(item => { const li = document.createElement('li'); li.textContent = `${item.name} · ID/SKU: ${item.productId}${item.retailerProduct ? ` · ${item.retailerProduct.variant} · ${item.retailerProduct.packSize}` : ""}: ${item.quantity} → ${item.targetQuantity}, NZD ${(item.unitPriceCents / 100).toFixed(2)} each`; return li; }));
      $('receipt').textContent = data.receipt ? JSON.stringify(data.receipt, null, 2) : '';
    } else { $('status').textContent = data?.reason || 'Disconnected.'; $('receipt').textContent = ''; $('items').replaceChildren(); $('brief').textContent = ''; }
  }
  const fail = error => { $('status').textContent = error instanceof Error ? error.message : 'Connection unavailable.'; };
  $('inspect').onclick = async () => { try {
    const data = await send({ action: 'inspect' }); selected = data.selected;
    $('selected').textContent = selected ? `Selected: ${selected.url}` : (data.selectionIssue || 'Select the supported local storefront tab. Other websites are unavailable.');
    $('workspace').replaceChildren(...data.workspaces.map(tab => { const option = document.createElement('option'); option.value = String(tab.id); option.textContent = `Tab ${tab.id}: ${tab.url}`; return option; }));
    $('connect').disabled = !selected || !data.workspaces.length; render(data.connection);
  } catch (error) { fail(error); } };
  $('connect').onclick = async () => { try { render(await send({ action: 'connect', targetId: selected?.id, workspaceId: Number($('workspace').value) })); } catch (error) { fail(error); } };
  $('cancel').onclick = async () => { try { render(await send({ action: 'cancel' })); } catch (error) { fail(error); } };
  $('allow-read').onclick = async () => { if (!current?.connected) return; try { render(await send({action:'allow-read', connectionId:current.connectionId})); } catch (error) { fail(error); } };
  $('approve').onclick = async () => { if (busy || !current?.connected) return; busy = true; $('approve').disabled = true;
    try { render(await send({ action: 'approve', connectionId: current.connectionId, digest: current.digest })); } catch (error) { fail(error); } finally { busy = false; }
  };
  // Poll only while the user is looking at the companion review. No automatic actions.
  setInterval(() => { if (!busy && !document.hidden) void send({ action: 'status' }).then(render).catch(fail); }, 2000);
})();
