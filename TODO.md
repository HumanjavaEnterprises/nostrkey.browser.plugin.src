# NostrKey Browser Plugin TODO

## NIP-46 nsecBunker UX — Remote Signing via NostrKeep Relay

**Status:** Planned
**Depends on:** `relay.nostrkeep.app` deployment (`nostrkeep.srvr.relay.src` Phase 1 complete)
**Related:** `nostrkeep.bizdocs.src` TODO (business model + relay details)

### Summary

Add a Remote Signing (nsecBunker) settings panel to NostrKey. Default bunker relay is `wss://relay.nostrkeep.app` (free, provided by NostrKeep). Users can override with their own relay URL. The nsec never leaves the device — NostrKeep only carries encrypted NIP-46 messages.

### UX Reference

#### Settings Panel

```
┌─────────────────────────────────────────────┐
│  Remote Signing (nsecBunker)                │
│                                             │
│  ✅ Enable remote signing                   │
│                                             │
│  Bunker relay:                              │
│  ┌─────────────────────────────────────┐    │
│  │ wss://relay.nostrkeep.app           │    │
│  └─────────────────────────────────────┘    │
│  Free relay provided by NostrKeep.          │
│  Or enter your own relay URL.               │
│                                             │
│  Your bunker address:                       │
│  ┌─────────────────────────────────────┐    │
│  │ bunker://5189fd3b...?relay=wss://   │    │
│  │ relay.nostrkeep.app                 │    │
│  └─────────────────────────────────────┘    │
│  [Copy]  [QR Code]                          │
│                                             │
│  Paste this into any Nostr client that      │
│  supports NIP-46 login. Your private key    │
│  stays on this device.                      │
└─────────────────────────────────────────────┘
```

#### Signing Request Approval

```
┌─────────────────────────────────────────────┐
│  🔔 Signing Request                         │
│                                             │
│  Primal wants to sign:                      │
│  Kind 1 (note)                              │
│  "Just posted from Primal using my..."      │
│                                             │
│  [Approve]  [Approve All Kind 1]  [Deny]    │
└─────────────────────────────────────────────┘
```

### Key Design Decisions

- **NostrKey is the bunker** (holds key, signs) — **NostrKeep is the relay** (carries messages)
- NIP-46 messages are NIP-44 encrypted end-to-end — relay cannot read them
- Default relay: `wss://relay.nostrkeep.app` (free, ephemeral events cost ~nothing)
- Editable text field for users who want their own relay
- Bunker address auto-generated from active profile pubkey + relay URL
- Copy button + QR code for easy sharing
- Signing approval with per-kind "always allow" option

### Implementation Notes

- NIP-46 uses kind 24133 (ephemeral range) — relay already bypasses allowlist for these
- Bunker connection string format: `bunker://<pubkey>?relay=<relay-url>`
- Subscribe to kind 24133 events addressed to active profile pubkey
- Decrypt requests with NIP-44, sign requested events, encrypt + publish response
- Extension already has NIP-46 support — this adds the UX layer + NostrKeep default relay

### Tasks

- [ ] Add "Remote Signing" section to settings page
- [ ] Bunker relay URL field with `wss://relay.nostrkeep.app` default
- [ ] Auto-generate bunker address from active profile + relay URL
- [ ] Copy-to-clipboard + QR code for bunker address
- [ ] Signing request notification/approval UI
- [ ] Per-kind "always allow" permission management
- [ ] Connect to bunker relay WebSocket when remote signing is enabled
- [ ] Handle NIP-46 request/response lifecycle (decrypt → sign → encrypt → publish)
- [ ] Mirror UX to iOS and Android apps
