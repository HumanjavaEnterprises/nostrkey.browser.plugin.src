/** The profile tab History section, as rows. */
import { describe, it, expect } from 'vitest';
import { buildHistory, KIND_TITLES } from '../src/profiles/history-view.js';

const res = { kinds: [
  { kind: 0, versions: [] },
  { kind: 3, versions: [
    { id: 'b', created_at: 1700000050, summary: '2 follows', current: true },
    { id: 'a', created_at: 1700000000, summary: '450 follows', current: false },
  ] },
] };

describe('buildHistory', () => {
  it('one group per kind with versions; only older versions can be restored', () => {
    const v = buildHistory(res);
    expect(v.groups.map(g => g.title)).toEqual([KIND_TITLES[3]]);
    expect(v.groups[0].rows.map(r => [r.id, r.summary, r.current, r.canRestore])).toEqual([
      ['b', '2 follows', true, false], ['a', '450 follows', false, true],
    ]);
    expect(v.empty).toBe(false);
  });

  it('locked: nothing can be restored and it says why', () => {
    const v = buildHistory(res, { locked: true });
    expect(v.groups[0].rows.every(r => !r.canRestore)).toBe(true);
    expect(v.reason).toBe('Unlock NostrKey to restore.');
  });

  it('no answer reads as empty', () => {
    expect(buildHistory(null)).toMatchObject({ groups: [], empty: true });
  });
});
