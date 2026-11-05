# NostrKey Browser Plugin — TODO

**Current:** v1.8.5, live on Firefox, Chrome and Safari (iOS + macOS) since 2026-11-03. Covered by an extensive automated suite, CI-gated. See [CHANGELOG.md](CHANGELOG.md) for what shipped.

## Shipped highlights
- Hybrid per-kind nsecBunker (per-connection records, single-use secrets, default-deny per-kind allowlist)
- Encrypted at rest by default (non-extractable device-key vault); "Instrument" UX redesign
- npub-poisoning (lookalike) detection; guided NIP-06/NIP-49 backup; L0–L3 security ladder

## Open (contributor-relevant)
- [ ] Mirror the bunker UX to the iOS and Android apps
- [x] Extend the lookalike guard to bunker-connect / import entry points (1.8.6 A9: new profile, seed replace, key import, remote signer connect; warns, Cancel default). Not covered: sync arrivals, backup restore summary, iOS share, inbound client keys
- [ ] Show the version number on the Safari app screen (iOS + macOS), read from the bundle
- [ ] Tailwind CSS v3 → v4 migration (deferred; own QA'd window — v4 is a full engine rewrite)
- [ ] HTTP-402 micropayments research (NWC + Cashu, NUT-24/NUT-18): 402 interceptor, NUT-18 decoder, NWC client, payment-approval UX — technical feasibility only

Release process and store roadmap are maintained privately.
