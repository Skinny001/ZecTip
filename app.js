let qrVisible = false;
let activeCodeTab = 'html';

// Fields whose values should persist across page reloads
const PERSIST_FIELDS = ['g-name', 'g-addr', 'g-label', 'g-memo', 'g-color', 'g-tcolor'];
const STORAGE_PREFIX = 'zectip:';

function val(id) { return document.getElementById(id).value.trim(); }

// Saves a single field's current value to localStorage.
// Called on every keystroke/change so a reload never loses data.
function persistField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    if (el.value === '') {
      localStorage.removeItem(STORAGE_PREFIX + id);
    } else {
      localStorage.setItem(STORAGE_PREFIX + id, el.value);
    }
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — fail silently
  }
}

// Restores all persisted fields on page load, before the first render.
// If nothing was saved yet, the field keeps whatever is in the HTML
// (e.g. the placeholder example address) so first-time visitors still
// see a helpful example.
function restoreFields() {
  try {
    PERSIST_FIELDS.forEach(id => {
      const saved = localStorage.getItem(STORAGE_PREFIX + id);
      const el = document.getElementById(id);
      if (saved !== null && el) {
        el.value = saved;
      }
    });
  } catch (e) {
    // localStorage unavailable — just fall back to HTML defaults
  }
}

// Wires up a "save on every change" listener for each persisted field.
function attachPersistence() {
  PERSIST_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => persistField(id));
  });
}

function base64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Matches transparent (t1/t3/tm), Sapling shielded (zs1), legacy sprout (zt),
// and Unified Addresses (u1 mainnet, utest1 testnet, ztestsapling testnet shielded)
function isValidZcashAddr(addr) {
  return /^(zs1|t1|t3|tm|zt|u1|utest1|ztestsapling)[0-9a-z]+$/i.test(addr) && addr.length >= 10;
}

// Per ZIP-321, a memo is only valid when the recipient is a shielded or
// unified address. Transparent addresses (t1/t3/tm) cannot carry a memo —
// including one will make the whole payment URI spec-invalid.
function memoAllowed(addr) {
  return /^(zs1|zt|u1|utest1|ztestsapling)/i.test(addr);
}

function validateAddr() {
  const addr = val('g-addr');
  const hint = document.getElementById('addr-hint');
  if (!addr) {
    hint.textContent = '';
    return;
  }
  hint.textContent = isValidZcashAddr(addr) ? '✓ valid address' : '⚠ address may be invalid';
  hint.style.color = isValidZcashAddr(addr) ? 'var(--teal)' : '#e0a030';
}

// Checks whether the current address + memo combination would produce a
// spec-invalid ZIP-321 URI, and surfaces a warning near the memo field if so.
function validateMemoCompat() {
  const addr = val('g-addr');
  const memo = val('g-memo');
  const warnEl = document.getElementById('memo-hint');
  if (!warnEl) return true; // hint element optional; caller still gets safe URI either way

  if (memo && addr && isValidZcashAddr(addr) && !memoAllowed(addr)) {
    warnEl.textContent = '⚠ memos aren\'t supported on transparent addresses — memo will be dropped from the QR/link';
    warnEl.style.color = '#e0a030';
    return false;
  }
  warnEl.textContent = '';
  return true;
}

function buildURI() {
  const addr = val('g-addr') || 'zs1example';
  const memo = val('g-memo');
  let uri = `zcash:${addr}`;
  if (memo && memoAllowed(addr)) {
    uri += `?memo=${base64url(memo)}`;
  }
  return uri;
}

function liveUpdate() {
  const name = val('g-name') || 'Creator';
  const label = val('g-label') || 'Tip me in ZEC';
  const color = document.getElementById('g-color').value;
  const tcolor = document.getElementById('g-tcolor').value;
  const memo = val('g-memo');
  const addr = val('g-addr');

  document.getElementById('prev-name').textContent = name;
  const btn = document.getElementById('prev-btn');
  btn.textContent = label;
  btn.style.background = color;
  btn.style.color = tcolor;

  document.getElementById('g-color-hex').textContent = color;
  document.getElementById('g-tcolor-hex').textContent = tcolor;

  document.getElementById('prev-addr').textContent = addr || 'no address set';

  // Only show the memo in the preview if it will actually be included in the URI
  const memoWillApply = memo && isValidZcashAddr(addr) && memoAllowed(addr);
  document.getElementById('prev-memo').textContent = memoWillApply ? `"${memo}"` : '';

  validateAddr();
  validateMemoCompat();
  if (qrVisible) drawQR();
  buildCodeOutputs();
}

function togglePreviewQR() {
  qrVisible = !qrVisible;
  const wrap = document.getElementById('qr-wrap');
  const hint = document.getElementById('qr-hint');
  wrap.style.display = qrVisible ? 'flex' : 'none';
  hint.style.display = qrVisible ? 'none' : 'block';
  if (qrVisible) drawQR();
}

function drawQR() {
  const uri = buildURI();
  const img = document.getElementById('qr-img');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(uri)}`;
  img.onerror = () => { img.src = ''; };
}

function buildCodeOutputs() {
  const name = val('g-name') || 'Creator';
  const addr = val('g-addr') || 'zs1example';
  const label = val('g-label') || 'Tip me in ZEC';
  const color = document.getElementById('g-color').value;
  const tcolor = document.getElementById('g-tcolor').value;
  const memo = val('g-memo');

  // Only attach the memo when it's actually valid for this address type,
  // so the generated widget never produces a spec-invalid URI.
  const memoApplies = memo && memoAllowed(addr);

  let uri = `zcash:${addr}`;
  if (memoApplies) uri += `?memo=${base64url(memo)}`;

  const html = `<!-- ZecTip widget — ${name} -->
<div id="zectip" style="display:inline-block;text-align:center;font-family:sans-serif;">
  <button
    onclick="var q=document.getElementById('zectip-qr');q.style.display=q.style.display==='none'?'flex':'none'"
    style="display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:999px;background:${color};color:${tcolor};border:none;font-size:15px;font-weight:600;cursor:pointer;">
    ${label.replace(/</g,'&lt;')}
  </button>
  <div id="zectip-qr" style="display:none;flex-direction:column;align-items:center;gap:10px;margin-top:14px;">
    <img
      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(uri)}"
      width="180" height="180"
      alt="Scan to tip in ZEC"
      style="border-radius:12px;" />
    <p style="font-size:10px;font-family:monospace;color:#888;word-break:break-all;max-width:220px;">${addr}</p>
    ${memoApplies ? `<p style="font-size:12px;color:#aaa;font-style:italic;">"${memo.replace(/"/g,'&quot;')}"</p>` : ''}
    <span style="font-size:11px;color:#3ecfb2;">🔒 shielded transaction</span>
  </div>
</div>`;

  const script = `<script
  src="https://zectip.app/widget.js"
  data-name="${name.replace(/"/g,'&quot;')}"
  data-address="${addr}"
  data-label="${label.replace(/"/g,'&quot;').replace(/</g,'&lt;')}"
  data-memo="${memoApplies ? memo.replace(/"/g,'&quot;') : ''}"
  data-color="${color}"
  data-text-color="${tcolor}">
<\/script>`;

  document.getElementById('tab-html').textContent = html;
  document.getElementById('tab-script').textContent = script;
}

function generateWidget() {
  buildCodeOutputs();
  document.getElementById('generate').scrollIntoView({ behavior: 'smooth' });
  if (!qrVisible) togglePreviewQR();
}

function switchCodeTab(name, el) {
  activeCodeTab = name;
  document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.code-body').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

function copyCode() {
  const el = document.getElementById('tab-' + activeCodeTab);
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.classList.add('copied');
    btn.textContent = '✓ copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = '📋 copy code';
    }, 2000);
  });
}

restoreFields();
attachPersistence();
setTimeout(liveUpdate, 100);