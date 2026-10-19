/* assembl / living — store embed loader (v1)
 * Drops the product widget into a store page as an iframe and attaches the
 * customer's choices to the page's own add-to-cart form as line item
 * properties. The widget never adds to a cart. Plain script, no build step.
 *
 *   <div id="assembl-widget"></div>
 *   <script src="https://shop.assembl.co.nz/living/widget.js"
 *           data-handle="{{ product.handle }}" data-mount="#assembl-widget" async></script>
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var handle = script.getAttribute('data-handle');
  if (!handle) return;
  var base;
  try { base = new URL(script.src, location.href).origin; } catch (e) { return; }
  var mountSel = script.getAttribute('data-mount');
  var mount = mountSel ? document.querySelector(mountSel) : null;
  if (!mount) {
    mount = document.createElement('div');
    script.parentNode.insertBefore(mount, script);
  }
  mount.setAttribute('data-assembl-widget', handle);

  var iframe = document.createElement('iframe');
  iframe.src = base + '/living/widget/' + encodeURIComponent(handle) + '?embed=1&origin=' + encodeURIComponent(location.origin);
  iframe.title = 'Make it yours — assembl / living';
  iframe.loading = 'lazy';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.style.cssText = 'width:100%;border:0;display:block;height:640px;background:transparent;border-radius:20px;';
  mount.appendChild(iframe);

  var variants = null;
  fetch('/products/' + encodeURIComponent(handle) + '.js', { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (p) { variants = (p && p.variants) || []; })
    .catch(function () { variants = []; });

  function form() {
    return mount.closest('form[action*="/cart/add"]') || document.querySelector('form[action*="/cart/add"]');
  }
  function submitButtons(f) {
    return f.querySelectorAll('button[type="submit"], input[type="submit"], button[name="add"]');
  }
  function clearProps(f) {
    var old = f.querySelectorAll('input[data-assembl]');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
  }
  function setProp(f, name, value) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'properties[' + name + ']';
    input.value = value;
    input.setAttribute('data-assembl', '1');
    f.appendChild(input);
  }
  function selectVariant(f, value) {
    if (!variants || !variants.length) return;
    var want = String(value).toLowerCase();
    var match = null;
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      var opts = [v.option1, v.option2, v.option3];
      for (var j = 0; j < opts.length; j++) if (opts[j] && String(opts[j]).toLowerCase() === want) match = v;
      if (match) break;
    }
    if (!match) return;
    var id = f.querySelector('input[name="id"], select[name="id"]');
    if (!id) return;
    if (String(id.value) !== String(match.id)) {
      id.value = String(match.id);
      id.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  function setQuantity(f, qty) {
    var q = f.querySelector('input[name="quantity"]');
    if (q && String(q.value) !== String(qty)) {
      q.value = String(qty);
      q.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  function gate(f, ok, reason) {
    var buttons = submitButtons(f);
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = !ok;
      if (ok) buttons[i].removeAttribute('title'); else buttons[i].title = reason || 'Finish your choices above';
    }
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== base || e.source !== iframe.contentWindow) return;
    var m = e.data;
    if (!m || typeof m.type !== 'string') return;
    if (m.type === 'assembl:size' && typeof m.height === 'number') {
      iframe.style.height = Math.max(320, Math.ceil(m.height)) + 'px';
      return;
    }
    var f = form();
    if (m.type === 'assembl:item' && m.item && m.properties) {
      if (f) {
        clearProps(f);
        Object.keys(m.properties).forEach(function (k) { setProp(f, k, m.properties[k]); });
        if (m.variant && m.variant.value) selectVariant(f, m.variant.value);
        setQuantity(f, m.item.qty || 1);
        gate(f, true);
      }
      document.dispatchEvent(new CustomEvent('assembl:item', { detail: m.item }));
    } else if (m.type === 'assembl:invalid') {
      if (f) { clearProps(f); gate(f, false, (m.issues && m.issues[0]) || 'Finish your choices above'); }
      document.dispatchEvent(new CustomEvent('assembl:invalid', { detail: m.issues || [] }));
    }
  });
})();
