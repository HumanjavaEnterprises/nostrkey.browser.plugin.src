import { describe, it, expect } from 'vitest';
import { resolveRevokeTarget } from '../src/utilities/consent-policy.js';

const A = 'a'.repeat(64);
const B = 'b'.repeat(64);

describe('resolveRevokeTarget: a revoke goes to the identity the list showed', () => {
  it('same identity still at the painted index revokes there', () => {
    expect(resolveRevokeTarget({ pubkey: A, index: 1 }, A, -1)).toEqual({ pubkey: A, index: 1 });
    expect(resolveRevokeTarget({ pubkey: A, index: 1 }, A.toUpperCase(), -1)).toEqual({ pubkey: A, index: 1 });
  });
  it('a reordered list follows the public key, never the index', () => {
    expect(resolveRevokeTarget({ pubkey: A, index: 1 }, B, 0)).toEqual({ pubkey: A, index: 0 });
  });
  it('a deleted identity revokes nothing, even when another sits at its index', () => {
    expect(resolveRevokeTarget({ pubkey: A, index: 1 }, B, -1)).toBeNull();
    expect(resolveRevokeTarget({ pubkey: A, index: 1 }, null, -1)).toBeNull();
  });
  it('a list drawn without a key only revokes by index while that slot still has no key', () => {
    expect(resolveRevokeTarget({ pubkey: null, index: 2 }, null, -1)).toEqual({ pubkey: null, index: 2 });
    expect(resolveRevokeTarget({ pubkey: null, index: 2 }, B, -1)).toBeNull();
  });
});
