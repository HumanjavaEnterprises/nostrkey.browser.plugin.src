# Security Policy

NostrKey is a Nostr **key manager and signer** — it handles private keys (nsec), seed phrases, and encrypted vault data. Security reports are taken seriously and handled with priority.

> **Always run the latest version.** Security and key-handling fixes ship in the
> newest release across Chrome, Firefox, and Safari. Enable automatic extension
> updates, or update manually from your browser's extension/add-on page.

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

Security fixes target the **latest published version** on each store. Older
versions are not patched — please update before reporting.

| Version | Supported |
|---|---|
| 1.8.x | ✅ (current) |
| < 1.8 | ❌ (please update) |

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

## How your keys are generated (verify it yourself)

Your private key comes from your browser's cryptographic random number generator
(`crypto.getRandomValues`), by way of the audited [`@noble/hashes`](https://github.com/paulmillr/noble-hashes)
library. There is **no custom RNG, no fallback generator, and no `Math.random`**
anywhere in key generation.

Two properties you can check in this public repo:

1. **The full path is short and traceable.** `generateKeyPair()` →
   `@noble/hashes` `randomBytes(32)` → `crypto.getRandomValues`. Follow it from
   `src/utilities/keys.js` in under a minute.
2. **Generation fails closed.** If the platform's secure RNG is unavailable,
   `@noble/hashes` **throws** rather than producing a weaker key — key generation
   stops instead of silently falling back. This is covered by an automated test.

What we depend on and do not control: the quality of your browser's
`crypto.getRandomValues`, which is the platform's guarantee (Chrome, Firefox,
Safari). What our tests can and cannot show: they verify we call the platform
CSPRNG and fail closed without it; they cannot, and do not claim to, prove the
randomness of any single generated key — that is a property of the process, not
of the bytes.

## If we have a security incident

NostrKey is a small open-source project, not a 24/7 security operation. Here is
what we commit to, so you can hold us to it.

**Response.** We acknowledge reports within **3 business days** and assess within
**7**. For a report indicating **private keys may be predictable, exposed, or
recoverable by someone else**, we treat it as highest priority and aim to
acknowledge within **24 hours**. If you get no reply in 24 hours on a
key-exposure report, escalate publicly rather than waiting.

**If we confirm a defect that affects keys NostrKey generated or stored, we will:**
- Publish an advisory **at or before** the fix ships — not after.
- State plainly, at the top, **whether updating repairs existing keys or not.**
  If your existing key is affected, we will say so in those words.
- Publish the **affected version range and the date range** for key generation or
  storage, so you can determine whether *your* key is affected.
- **Not** attribute the problem to user error before root cause is established.
- Publish a technical write-up within **14 days** of the fix, even if it is
  unflattering or incomplete (marked as such).

**What we cannot promise.** We do not run a bug bounty and cannot compensate for
losses. We cannot directly reach users who installed the extension and never
return — browser stores give us no such channel. We announce on this repo,
`nostrkey.com`, our Nostr account, and via update notes, and ask the community to
amplify.

**What we ask of you.** Give us a reasonable window before public disclosure —
but **if a flaw is being actively exploited, publish immediately.** User safety
beats our coordination.

## Project context
NostrKey is open source (MIT) and part of a multi-build ecosystem (browser extension, Python SDK, agent plugin, mobile app) that shares one crypto core. A vulnerability in shared crypto may affect multiple builds — please note if your finding is in shared code (`nostr-crypto-utils`) versus this extension specifically. Because that core is also published to third parties on npm, a flaw there is a supply-chain matter: we will notify downstream consumers, not only patch this extension.
