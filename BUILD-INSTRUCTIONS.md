# NostrKey v1.8.1 — Build Instructions for AMO Reviewers

## Environment
- Node.js 24 (see `.nvmrc`)
- npm (bundled with Node)
- No other toolchain. The only build tools are **esbuild** and **Tailwind CSS 3.4.x**,
  both installed by `npm install`. No machine-generated source is included — the
  `*.build.js` / `*.build.css` files are produced by the steps below.

## Build
```bash
npm install
npm run build:firefox:prod
```
Output: `distros/firefox/` — the unpacked extension exactly as submitted
(`distros/nostrkey-firefox-v1.8.1.zip` is that directory zipped).

Reproducibility note: esbuild minification is deterministic for a given
dependency tree; `package-lock.json` is included.

## Testing without an account
NostrKey needs no account or server. To exercise it:
1. Load `distros/firefox/` as a temporary add-on (`about:debugging`).
2. Open the popup — a local key profile can be generated entirely offline.
3. Visit https://nostrkey.com/test.html — buttons exercise every
   `window.nostr` (NIP-07) method against the extension; results render on
   the page. Signing prompts appear in-page; approve to see the signed event.
4. Optional: set a master password in Settings → Key Protection, lock, and
   unlock to exercise the encrypted vault.
