<div align="center">
  <h1>ZecTip</h1>
  <p><strong>Shielded ZEC tip buttons — embed anywhere, zero fees, full privacy.</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#usage">Usage</a> •
    <a href="#why-zcash">Why Zcash</a>
  </p>
</div>

---

A client-side widget generator that lets creators embed a "Tip me in ZEC" button on any website. Supporters scan a QR code with their Zcash wallet and send a shielded tip with an optional private memo. No accounts, no backend, no platform fees.

---

## Features

- **⚡ One-click embed** — Generate an HTML snippet or script tag, paste it anywhere
- **🔒 Shielded by default** — Tips use Zcash shielded addresses (z-addr) with full privacy
- **💬 Encrypted memos** — Supporters leave a private note that only you can read
- **🎨 Customizable** — Button color, text color, label, and default memo
- **📱 QR-first UX** — Scan with any Zcash wallet (Ywallet, Zashi, ZecWallet, etc.)
- **🌐 Embeds everywhere** — Ghost, Substack, WordPress, personal site, GitHub README
- **💰 Zero fees** — No platform cut. Tips go straight to your wallet.

## Quick Start

1. Open [zec-tip.app](https://zec-tip.vercel.app/)
2. Enter your Zcash address (zs1... or t1...)
3. Customize colors and label
4. Copy the embed code
5. Paste into your website

## Usage

### HTML snippet

```html
<!-- Paste this anywhere on your site -->
<div id="zectip" style="display:inline-block;text-align:center;font-family:sans-serif;">
  <button onclick="var q=document.getElementById('zectip-qr');q.style.display=q.style.display==='none'?'flex':'none'"
    style="display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:999px;background:#f4b942;color:#0c0c0d;border:none;font-size:15px;font-weight:600;cursor:pointer;">
    ⚡ Tip me in ZEC
  </button>
  <div id="zectip-qr" style="display:none;flex-direction:column;align-items:center;gap:10px;margin-top:14px;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=..." width="180" height="180" alt="Scan to tip in ZEC" style="border-radius:12px;" />
    <span style="font-size:11px;color:#3ecfb2;">🔒 shielded transaction</span>
  </div>
</div>
```

### Script tag

```html
<script
  src="https://zectip.app/widget.js"
  data-name="Your Name"
  data-address="zs1..."
  data-label="⚡ Tip me in ZEC"
  data-memo="Thanks for your support!"
  data-color="#f4b942"
  data-text-color="#0c0c0d">
</script>
```

## How it works

| Step | Description |
|------|-------------|
| **1** | Enter your Zcash address and customize your button |
| **2** | Copy the generated embed code |
| **3** | Supporters click the button, scan the QR with their wallet, and send a shielded tip |

The QR encodes a [ZIP-321](https://zips.z.cash/zip-0321) compliant `zcash:` URI with the address and an optional base64url-encoded memo. When scanned, the device OS opens the user's Zcash wallet automatically.

## Why Zcash

- **zk-SNARKs** hide sender, receiver, and amount on-chain
- **Shielded addresses** (z-addr) provide full privacy by default
- **Encrypted memos** allow private messages alongside tips
- **No middleman** — funds go directly to your wallet, not through a platform

## Local development

```bash
# Serve locally
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Built with

- Vanilla JS (no framework)
- [QRServer API](https://goqr.me/api/) for QR generation
- [ZIP-321](https://zips.z.cash/zip-0321) Zcash URI standard
- Fonts: Syne, DM Sans, DM Mono

## License

MIT
