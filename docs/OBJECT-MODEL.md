# NostrKey — Object Model

The plugin is a **containment hierarchy**, and the UI is built to read as one.
This is the rule for deciding where any control or feature belongs.

```
Plugin object  ───────────────────────  the extension itself (root)
│
├─ PLUGIN-LEVEL   (app-wide — true of the WHOLE)
│     Security    lock · master password · auto-lock · frame protection
│     Settings    accessibility (viewport-level) · sync · about
│
└─ Profiles  ─────────────────────────  collection of nostr-profile objects
      │
      └─ Profile object   (select one → its detail view)
            ├─ Identity          npub · name · avatar
            └─ FEATURE-OBJECTS   (properties of THIS identity, shown inline)
                  Keys · Seed phrase · Relays · App permissions · Bunker
```

## The placement rule

| A thing is true of… | …so it lives at… |
|---|---|
| the whole plugin | app-level — the Settings / Security surfaces |
| one identity | that profile's detail view |
| one feature of an identity | that feature-object, inline on the profile |

- **Accessibility is plugin/viewport-level**, not per-profile (it's a property of the surface).
- **Keys, seed phrase, relays, app permissions, bunker are per-profile** — manage them by selecting the profile they belong to, never from a global list.
- **Site grants (connected sites) are per identity and per device.** They are stored on the
  profile as `hosts[origin][action]`, keyed by the identity's public key when written, and
  never sync or go into a backup. One store, two doors: the side panel (Apps tab, profile
  view) and the profile tab's Connected sites section draw them through one renderer,
  `renderGrantList` in `src/utilities/grant-list.js`. The profile tab can add a site
  (`normaliseOrigin`: https, or http on localhost, stored as the origin) and set each action
  to Ask, Allow (1 hour, 1 day, 30 days, Forever, cut to the kind's maximum by the same
  clamp the worker uses) or Deny. It writes from the extension page with no message kind.
- **Saved list versions (History) are per identity and per device.** Kinds 0, 3, 10000 and
  10002 are kept in IndexedDB (`src/utilities/list-store.js`), never in `profiles`, never
  synced, never in a backup, and cleared when the identity is deleted. The profile tab's
  History section lists them and can restore one (re-signed with a new date, effect preview
  and tick, published to the identity's write relays). A version only signed here is labelled
  "Signed, not seen on relays" until relays return it.
- **Slow-shrink check (consent).** A follow, mute or relay list change is compared with the
  current version and also with the oldest version seen on relays in the last 24 hours (or
  the version last approved with "I understand"). If the change against that baseline is
  destructive, the request prompts with the tick even under a grant. Limits: it reaches back
  24 hours only, so one small step a day is not caught; a fresh device, or one whose history
  was cleared, has no baseline until it has seen a version; and it only knows versions this
  device saw.
- **No accordions for structure** — a feature-object shows inline; collapsing it would hide the object, not reveal the containment.

## Where it lives in the code

- **Profile detail view** — `src/sidepanel.html` `#view-profile-view`: identity header +
  five inline feature-object sections (`#pd-keys`, `#pd-seed`, `#pd-relays`,
  `#pd-permissions`, `#pd-bunker`), each painted by `renderPD*(index)` in
  `src/sidepanel.js` for `state.detailProfileIndex`. The profile tab
  (`src/profile.html`, one per identity) has the editable Connected sites section
  (`src/profiles/connected-sites.js`). Bunker-type profiles hide
  Keys/Seed via `#view-profile-view[data-profile-type="bunker"]`.
- **Plugin-level settings** — `src/full_settings.html` / `src/options.js`: accessibility,
  sync, security/master-password, protocol handler, about. No per-profile controls here.

The fuller architecture write-up is maintained privately.
