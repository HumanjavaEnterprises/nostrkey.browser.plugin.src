# INSTRUMENT design system — spec (feat/instrument-ux)

Single source of truth: **`src/instrument.css`** (plain CSS, no Tailwind pass; copied verbatim to every distro by `build.js`). Load it **alongside** `options.build.css`:

```html
<link rel="stylesheet" href="options.build.css" />   <!-- root pages -->
<link rel="stylesheet" href="instrument.css" />
<!-- subdirectory pages (permission/, security/, …) use root-relative: -->
<link rel="stylesheet" href="/options.build.css" />
<link rel="stylesheet" href="/instrument.css" />
```

Then add `class="ins"` to `<body>` (or the page container) to opt into the graphite base surface. MV3 CSP: no inline `<style>`, no inline handlers — everything you need is a class.

## Vocabulary

| Idea | Rule |
|---|---|
| Surfaces | graphite tiers `--ins-base #0E0F13` → `--ins-panel #16181D` → `--ins-raised #1E2128`; 1px `--ins-hair #2A2E37` dividers. **No shadows/gradients/glass** — only `.is-live` may glow. |
| Accent | **one** violet `--ins-signal #c084fc`, LIVE/active only. Green exists **only** as the `.led--green` status dot. Amber `--ins-amber` = caution, red `--ins-red` = destructive. |
| Type | UI = `--ins-font-ui` (system grotesque). **All technical readouts (npub/hex/kind/relay/JSON) = `.mono`**. Panel headers = `.micro-label` / `.module-header` (uppercase, letter-spaced). |
| Layout | rack/module: `.rack` > `.module`s separated by hairlines. Every identity / connected app / permission group is a module. |

## Component classes (complete list)

- **Tokens:** `--ins-base` `--ins-panel` `--ins-raised` `--ins-hair` `--ins-text` `--ins-muted` `--ins-signal` `--ins-signal-dim` `--ins-led-green` `--ins-amber` `--ins-red` `--ins-amber-dim` `--ins-red-dim` `--ins-font-ui` `--ins-font-mono` `--ins-gap` `--ins-radius`
- **Base:** `.ins` (surface opt-in) · `.mono` · `.micro-label`
- **Rack:** `.rack` · `.module` · `.module-header` (+ inner `.header-end`) · `.module-body` · `.module-row` (+ `.row-label` / `.row-value`)
- **LED:** `.led` with `.led--green` `.led--amber` `.led--red` `.led--signal` `.led--off` · `.led-label` (dot+text pair)
- **Identity:** `.channel-strip` · `.strip-avatar` · `.strip-id` · `.strip-name` · `.strip-npub` · `.strip-end`
- **Readout:** `.readout` (mono block, `<pre>`) · `.readout-param` · `.readout-key` · `.readout-val` · `.readout-unverified` ("claimed — not verified" tag)
- **Kind:** `.kind-channel` (+ inner `.kind-num`) with `.kind-channel--warn` / `.kind-channel--danger`
- **Warnings:** `.warn-strip` with `.warn-strip--amber` / `.warn-strip--red` (use `role="alert"`)
- **Trust meter:** `.meter` (vertical default; `data-level="0..3"`) · `.meter-seg` (`data-seg="0..3"`) · `.meter--h` horizontal · `.meter-scale` (L3…L0 side labels)
- **Permissions:** `.patch-point` (`<button aria-pressed>`; inner `.patch-jack`) with `.patch-point--session` (amber, expiring grant) / `.patch-point--danger` (Tier-B kinds)
- **Controls:** `.dial` (+ `.dial-pointer`, steps `.dial--p0`…`.dial--p10` or set `--dial-angle` via `el.style.setProperty`) · `.dial-value` · `.slider` (on `input[type=range]`)
- **Buttons:** `.btn` with `.btn--primary` (violet outline = confirm) · `.btn--ghost` · `.btn--destructive` · `.btn--sm`
- **Live state:** `.is-live` (the ONE sanctioned violet glow) · `.is-live--pulse` (only while actively signing; reduced-motion safe)
- **Utilities:** `.ins-hr` · `.ins-muted` · `.ins-truncate`
- **Inputs:** `.ins-input` (text field; add `.mono` for secrets/hex/npub)

## Copy-paste: channel strip + trust-ladder meter

```html
<div class="rack">
  <div class="channel-strip is-live">
    <img class="strip-avatar" src="images/avatar.png" alt="" />
    <div class="strip-id">
      <div class="strip-name">Vergel <span class="led led--green" aria-label="Backed up"></span></div>
      <div class="strip-npub mono ins-truncate">npub1qy352euf40x77qfrg4ncn27daau…7fk2</div>
    </div>
    <div class="strip-end">
      <div class="meter-scale"><span>L3</span><span>L2</span><span>L1</span><span>L0</span></div>
      <div class="meter" data-level="2" role="img" aria-label="Security level 2 of 3">
        <span class="meter-seg" data-seg="3"></span>
        <span class="meter-seg" data-seg="2"></span>
        <span class="meter-seg" data-seg="1"></span>
        <span class="meter-seg" data-seg="0"></span>
      </div>
    </div>
  </div>
  <div class="module">
    <div class="module-header">Signing request <span class="header-end"><span class="led led--signal"></span></span></div>
    <div class="module-body">
      <div class="warn-strip warn-strip--amber" role="alert">This event replaces your follow list.</div>
      <div class="readout-param">
        <span class="readout-key">Kind</span>
        <span class="readout-val"><span class="kind-channel kind-channel--warn"><span class="kind-num mono">3</span> Replace your follow list</span></span>
      </div>
      <pre class="readout">{"kind":3,"tags":[["p","91cf9…4e5ca"]],"content":""}</pre>
    </div>
  </div>
</div>
```

**Meter rules:** vertical segments are authored **top-down (3,2,1,0)** so the meter fills upward; horizontal (`.meter--h`) authored 0→3 left-to-right. Segments below the level light graphite; the current level lights violet. Ladder meaning: L0 instant key · L1 backed up · L2 master password + auto-lock · L3 bunker/enclave.

**Do:** default-deny patch points (`aria-pressed="false"` initial); `.btn--primary` only for the single confirming action per surface; `.readout-unverified` on any bunker-claimed app name; say loudly when a field can't be decoded (amber `.warn-strip`).
**Don't:** reuse violet for anything idle; add shadows/gradients; put technical values in UI font; use green anywhere but a `.led--green`.
