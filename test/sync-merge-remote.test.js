/**
 * The shared merge used by storage.sync and both relay pulls, and the deletion
 * event shape.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { mergeRemote, isTombstoned, deletionTombstones } from '../src/utilities/sync-merge.js';
import { buildVaultDeletion } from '../src/utilities/nip78.js';

const PK = 'a'.repeat(64);
const item = (updatedAt, v = 'x') => ({ updatedAt, v });

describe('mergeRemote', () => {
    it.each([
        ['tombstone newer than remote', 200, false],
        ['tombstone older than remote (re-created after delete)', 50, true],
        ['tombstone equal to remote (deletion wins ties)', 100, false],
        ['no tombstone', undefined, true],
    ])('%s', (_, ts, kept) => {
        const tomb = ts == null ? {} : { k: ts };
        const { merged } = mergeRemote({}, { k: item(100) }, tomb);
        expect('k' in merged).toBe(kept);
    });

    it('newer remote replaces local, older does not', () => {
        expect(mergeRemote({ k: item(1, 'l') }, { k: item(2, 'r') }, {}).merged.k.v).toBe('r');
        const r = mergeRemote({ k: item(3, 'l') }, { k: item(2, 'r') }, {});
        expect(r.merged.k.v).toBe('l');
        expect(r.changed).toBe(false);
    });

    it('removes a local copy the tombstone covers', () => {
        const r = mergeRemote({ k: item(5) }, {}, { k: 5 });
        expect(r.merged).toEqual({});
        expect(r.changed).toBe(true);
    });

    it('uses a custom timestamp', () => {
        const r = mergeRemote({}, { k: { createdAt: 10 } }, { k: 9 }, { timeOf: d => d.createdAt });
        expect(r.merged.k).toBeTruthy();
    });

    it('isTombstoned tolerates a missing map', () => {
        expect(isTombstoned(null, 'k', 1)).toBe(false);
    });
});

describe('deletionTombstones', () => {
    it('reads full and earlier a-tags and e-tags from the author only', () => {
        const out = deletionTombstones([
            { kind: 5, pubkey: PK, created_at: 10, tags: [['a', `30078:${PK}:nostrkey:a`]] },
            { kind: 5, pubkey: PK, created_at: 20, tags: [['a', '30078::nostrkey:b'], ['e', 'id1']] },
            { kind: 5, pubkey: 'b'.repeat(64), created_at: 99, tags: [['a', `30078:${PK}:nostrkey:a`]] },
        ], PK, { id1: 'nostrkey:c' });
        expect(out).toEqual({ 'nostrkey:a': 10, 'nostrkey:b': 20, 'nostrkey:c': 20 });
    });
});

describe('buildVaultDeletion', () => {
    it('carries a full NIP-09 address kind:pubkey:d', () => {
        const ev = buildVaultDeletion('e'.repeat(64), 'notes/a.md', PK);
        expect(ev.kind).toBe(5);
        expect(ev.tags).toEqual([['e', 'e'.repeat(64)], ['a', `30078:${PK}:nostrkey:notes/a.md`]]);
    });

    it('throws without a pubkey', () => {
        expect(() => buildVaultDeletion('e'.repeat(64), 'a.md')).toThrow();
        expect(() => buildVaultDeletion('e'.repeat(64), 'a.md', '')).toThrow();
    });

    it('both worker callers pass (eventId, path, pubkey)', () => {
        const src = readFileSync('src/background.js', 'utf8');
        const calls = src.match(/buildVaultDeletion\([^)]*\)[^;]*;/g);
        expect(calls).toHaveLength(2);
        for (const c of calls) expect(c).toMatch(/buildVaultDeletion\(eventId, (path|API_KEYS_PATH), await getPubKey\(\)\)/);
    });
});
