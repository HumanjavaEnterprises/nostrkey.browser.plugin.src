/**
 * kind-labels.js — human-readable event-kind + method vocabulary for the
 * signing-approval readout (SHOW-THE-EVENT differentiator).
 *
 * Every kind gets: a HUMAN label, a risk tier, and whether a durable
 * per-(site × kind) grant may be offered:
 *   risk: 'neutral' | 'warn' (amber) | 'danger' (red)
 *   rememberable: false = Tier-B, the patch-point is disabled (always asks)
 *
 * Unknown kinds are said LOUDLY: "Unknown kind N — cannot decode, sign with
 * caution" and can never be remembered.
 */
import { KINDS } from '../utilities/utils';

const NIP_INDEX = 'https://github.com/nostr-protocol/nips';

// Curated overrides: consequence-first labels + risk tiers.
const KIND_LABELS = {
    0:     { label: 'Update your profile', risk: 'neutral' },
    1:     { label: 'Publish a public note', risk: 'neutral' },
    3:     { label: 'Replace your contact/follow list', risk: 'warn' },
    4:     { label: 'Send a DM (NIP-04)', risk: 'warn' },
    5:     { label: 'Delete events', risk: 'danger', rememberable: false },
    6:     { label: 'Repost a note', risk: 'neutral' },
    7:     { label: 'React to a note', risk: 'neutral' },
    13:    { label: 'Seal a private message', risk: 'warn' },
    14:    { label: 'Send a private DM (NIP-17)', risk: 'warn' },
    16:    { label: 'Repost (generic)', risk: 'neutral' },
    1059:  { label: 'Send a gift-wrapped message', risk: 'warn' },
    1984:  { label: 'File a report', risk: 'warn' },
    9734:  { label: 'Request a zap (payment)', risk: 'neutral' },
    9735:  { label: 'Zap receipt', risk: 'neutral' },
    10000: { label: 'Replace your mute list', risk: 'warn' },
    10002: { label: 'Replace your relay list', risk: 'warn' },
    22242: { label: 'Authenticate to a relay', risk: 'neutral' },
    23194: { label: 'Wallet request (NWC)', risk: 'warn' },
    24133: { label: 'Bunker RPC (Nostr Connect)', risk: 'warn' },
    27235: { label: 'Authenticate to a server (HTTP)', risk: 'neutral' },
    30023: { label: 'Publish a long-form article', risk: 'neutral' },
    30078: { label: 'Save app data', risk: 'neutral' },
};

// Kind-specific warning copy for the warn-strip (falls back to generic).
const KIND_WARNINGS = {
    3: 'This REPLACES your entire follow list. A malicious app can wipe who you follow.',
    4: 'This creates a private message. NIP-04 is a legacy format with weaker privacy.',
    5: 'This asks to DELETE events. Deletion requests propagate to relays and cannot be undone.',
    10000: 'This replaces your entire mute list.',
    10002: 'This replaces your relay list — it controls where your events are published.',
    23194: 'This is a wallet request. It may move funds via your connected wallet.',
    24133: 'This is remote-signer (bunker) control traffic.',
};

/**
 * Describe an event kind for the readout.
 * @param {*} kind — the event's kind field (any type; validated here)
 * @returns {{ kind, label, risk, rememberable, known, nip, warning }}
 */
export function describeKind(kind) {
    const n = typeof kind === 'number' && Number.isInteger(kind) ? kind : NaN;
    const spec = Array.isArray(KINDS) ? KINDS.find(([k]) => k === n) : null;
    const nip = spec ? spec[2] : NIP_INDEX;

    const curated = KIND_LABELS[n];
    if (curated) {
        return {
            kind: n,
            label: curated.label,
            risk: curated.risk,
            rememberable: curated.rememberable !== false,
            known: true,
            nip,
            warning: KIND_WARNINGS[n] || null,
        };
    }

    if (spec) {
        // Known to the NIP table but not curated — neutral, rememberable.
        return { kind: n, label: spec[1], risk: 'neutral', rememberable: true, known: true, nip, warning: null };
    }

    const shown = Number.isNaN(n) ? String(kind) : String(n);
    return {
        kind: n,
        label: `Unknown kind ${shown} — cannot decode, sign with caution`,
        risk: 'warn',
        rememberable: false,
        known: false,
        nip: NIP_INDEX,
        warning: `NostrKey does not recognize kind ${shown}. It cannot tell you what signing this does.`,
    };
}

/**
 * Describe a window.nostr / NIP-46 method (the non-signEvent permissions).
 * @returns {{ label, risk, warning }}
 */
export function describeMethod(perm) {
    switch (perm) {
        case 'getPubKey':
            return { label: 'Read your public key', risk: 'neutral', warning: null };
        case 'signEvent':
            return { label: 'Sign an event', risk: 'neutral', warning: null };
        case 'getRelays':
            return { label: 'Read your relay list', risk: 'neutral', warning: null };
        case 'addRelay':
            return { label: 'Add a relay to your list', risk: 'warn', warning: 'This changes where your events are published.' };
        case 'nip04.encrypt':
            return { label: 'Encrypt a message (NIP-04 — legacy)', risk: 'neutral', warning: null };
        case 'nip04.decrypt':
            return { label: 'Decrypt a private message (NIP-04)', risk: 'warn', warning: 'Grants this site access to private message content.' };
        case 'nip44.encrypt':
            return { label: 'Encrypt a message (NIP-44)', risk: 'neutral', warning: null };
        case 'nip44.decrypt':
            return { label: 'Decrypt a private message (NIP-44)', risk: 'warn', warning: 'Grants this site access to private message content.' };
        default:
            return { label: String(perm), risk: 'warn', warning: 'Unrecognized request type — proceed with caution.' };
    }
}
