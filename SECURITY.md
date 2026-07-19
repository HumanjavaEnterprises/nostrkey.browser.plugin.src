# Security Policy

NostrKey is a Nostr **key manager and signer** — it handles private keys (nsec), seed phrases, and encrypted vault data. Security reports are taken seriously and handled with priority.

> **v1.7.0 is a security-hardening release.** It hardens key handling, makes at-rest encryption the default, and tightens remote-signing (NIP-46) permissioning. It is staged and will ship to the stores shortly. **If you use v1.6.2, upgrade to v1.7.0 when it lands.** Full details will be published together with the store release.

## Reporting a vulnerability

**Please report security issues privately — do not open a public GitHub issue.**

- Email **security@humanjava.com** with details and reproduction steps.
- For sensitive reports, you may encrypt to the maintainer's Nostr key (NIP-44/NIP-04 DM); request the current npub in your first email.

Please include:
- A clear description and the impact (what an attacker could do).
- Steps to reproduce, or a proof of concept.
- Affected version(s), browser/platform, and build (Chrome / Firefox / Safari).

### What to expect
- Acknowledgement within **3 business days**.
- An initial assessment and severity within **7 business days**.
- Coordinated disclosure: we'll agree a timeline with you before any public detail, and credit you (if you wish) once a fix ships.

## Supported versions

Security fixes target the **latest version** — v1.7.0 once it ships to the stores; the v1.6.x line remains the currently-published release until then. Older versions are not patched — please update before reporting.

| Version | Supported |
|---|---|
| 1.7.x | ✅ (staged; hardening release) |
| 1.6.x | ✅ (currently published; upgrade when 1.7.0 ships) |
| < 1.6 | ❌ |

## In scope
- Private-key / seed-phrase exposure or exfiltration (memory, storage, logs, sync).
- Vault or API-key encryption weaknesses.
- NIP-07 / NIP-46 (nsecBunker) signing or permission bypass; cross-origin permission escalation.
- NIP-44 / NIP-49 cryptographic implementation flaws.
- Master-password / unlock bypass; auto-lock or brute-force-protection bypass.
- Cross-device sync data leakage.

## Out of scope
- Vulnerabilities in third-party Nostr clients or relays NostrKey connects to.
- Social-engineering or physical-access attacks requiring an already-compromised device.
- Issues requiring a malicious browser build or OS-level compromise.
- Reports generated solely by automated scanners without a demonstrated impact.

## Good-faith safe harbor
We will not pursue or support legal action against researchers who act in good faith, avoid privacy violations and service disruption, and give us reasonable time to remediate before public disclosure.

## Project context
NostrKey is open source (MIT) and part of a multi-build ecosystem (browser extension, Python SDK, agent plugin, mobile app) that shares one crypto core. A vulnerability in shared crypto may affect multiple builds — please note if your finding is in shared code (`nostr-crypto-utils`) versus this extension specifically.
