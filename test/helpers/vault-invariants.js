/**
 * Whole-vault storage invariants — the properties that, had they been asserted
 * anywhere, would have caught the v1.8.0 vault bugs before a device did.
 *
 * Call `assertVaultInvariants(local)` with a fake-chrome storage.local area
 * (or any object exposing `_dump()`) after ANY vault mutation. Every rule is a
 * structural property of the data at rest, independent of in-memory state, so
 * it holds across worker deaths by construction:
 *
 *   I1  isEncrypted === true  ⇒ every non-bunker privKey is a PASSWORD blob.
 *       (v1.8.0 broke this: generateProfile device-wrapped into a password
 *       vault — a blob the password can never open.)
 *   I2  isEncrypted !== true  ⇒ every non-bunker privKey is a DEVICE blob,
 *       and the wrapping key is recoverable from storage: either the
 *       'deviceKeySeed' is persisted or the sticky strategy says 'idb'.
 *       (v1.8.0 broke the recoverability half on iOS Safari: the device key
 *       lived only in a context that had died.)
 *   I3  No privKey is ever plaintext hex (T0-4), in either mode.
 *   I4  isEncrypted === true ⇒ passwordHash AND passwordSalt exist; and the
 *       converse — a hash with isEncrypted false is a half-written state.
 */

const HEX64 = /^[0-9a-f]{64}$/i;

function parse(value) {
    if (typeof value !== 'string') return null;
    try { return JSON.parse(value); } catch { return null; }
}
const isPasswordBlob = v => { const p = parse(v); return !!(p && p.salt && p.iv && p.ciphertext && p.k !== 'device'); };
const isDeviceBlob = v => { const p = parse(v); return !!(p && p.k === 'device' && p.iv && p.ciphertext); };

/**
 * @param {object} localArea fake-chrome storage.local area (has _dump()), or a raw dump object
 * @returns {string[]} violations — empty means all invariants hold
 */
export function vaultInvariantViolations(localArea) {
    const data = typeof localArea._dump === 'function' ? localArea._dump() : localArea;
    const out = [];
    const encrypted = data.isEncrypted === true;
    const profiles = Array.isArray(data.profiles) ? data.profiles : [];

    for (const [i, p] of profiles.entries()) {
        if (!p || p.type === 'bunker' || !p.privKey) continue;
        if (HEX64.test(p.privKey)) {
            out.push(`I3: profile[${i}] "${p.name}" privKey is PLAINTEXT hex`);
            continue;
        }
        if (encrypted && !isPasswordBlob(p.privKey)) {
            out.push(`I1: encrypted vault but profile[${i}] "${p.name}" is not a password blob (${isDeviceBlob(p.privKey) ? 'device blob' : 'unknown format'})`);
        }
        if (!encrypted && !isDeviceBlob(p.privKey)) {
            out.push(`I2: passwordless vault but profile[${i}] "${p.name}" is not a device blob`);
        }
    }

    if (!encrypted && profiles.some(p => p && p.type !== 'bunker' && isDeviceBlob(p.privKey))) {
        const recoverable = !!data.deviceKeySeed || data.deviceKeyStrategy === 'idb';
        if (!recoverable) {
            out.push('I2: device blobs exist but no deviceKeySeed persisted and strategy is not idb — the wrapping key is not recoverable across contexts');
        }
    }

    if (encrypted && (!data.passwordHash || !data.passwordSalt)) {
        out.push('I4: isEncrypted without passwordHash+passwordSalt');
    }
    if (!encrypted && data.passwordHash) {
        out.push('I4: passwordHash present while isEncrypted is false (half-written password state)');
    }

    return out;
}

/** Throw (with every violation listed) unless the vault at rest is coherent. */
export function assertVaultInvariants(localArea, label = '') {
    const violations = vaultInvariantViolations(localArea);
    if (violations.length) {
        throw new Error(`Vault invariants violated${label ? ` [${label}]` : ''}:\n  ${violations.join('\n  ')}`);
    }
}
