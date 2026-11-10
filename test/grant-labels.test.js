/**
 * How a stored grant reads in the app list. Shared by both lists and the prompt.
 */

import { describe, it, expect } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

installFakeChrome();
const { grantLabel, grantKindNum, isRiskyGrant } = await import('../src/permission/kind-labels.js');
const { humanPermission } = await import('../src/utilities/utils.js');
const { BLOSSOM_ACTIONS } = await import('../src/utilities/blossom-labels.js');

describe('grantLabel', () => {
  it('names a sign-in grant for another site by its target', () => {
    expect(grantLabel('signEvent:27235@https://api.example.com')).toBe('Sign in to api.example.com');
    expect(humanPermission('signEvent:27235@https://api.example.com')).toBe('Sign in to api.example.com');
  });

  for (const verb of ['upload', 'media', 'get', 'list', 'delete']) {
    it(`names the ${verb} action`, () => {
      const label = grantLabel(`signEvent:24242:${verb}`);
      expect(label).toBe(BLOSSOM_ACTIONS[verb].label);
      expect(label).not.toMatch(/unknown/i);
      expect(label).not.toMatch(/image/i);
    });
  }

  for (const [key, label] of [
    ['signEvent:13', 'Seal a private message'],
    ['signEvent:14', 'Send a private DM (NIP-17)'],
    ['signEvent:1059', 'Send a gift-wrapped message'],
    ['signEvent:1', 'Publish a public note'],
    ['signEvent:10063', 'Replace your media server list'],
  ]) {
    it(`reads ${key} the way the prompt does`, () => {
      expect(grantLabel(key)).toBe(label);
    });
  }

  it('reads a NIP-37 draft wrap (31234) as a warn kind that always asks', async () => {
    const { describeKind } = await import('../src/permission/kind-labels.js');
    expect(grantLabel('signEvent:31234')).toBe('Save a draft');
    const d = describeKind(31234);
    expect(d.risk).toBe('warn');
    expect(d.rememberable).toBe(false);
  });

  it('reads an older grant on the bare kind as the kind', () => {
    expect(grantLabel('signEvent:24242')).toBe('Authorize a media server request');
  });

  it('says so for a kind it does not know', () => {
    expect(grantLabel('signEvent:12345')).toBe('Unknown kind');
  });

  it('reads methods', () => {
    expect(grantLabel('getPubKey')).toBe('Read public key');
    expect(grantLabel('addRelay')).toBe('Add a relay');
  });
});

describe('grantKindNum', () => {
  it('reads the kind of a verb key and a plain key', () => {
    expect(grantKindNum('signEvent:24242:upload')).toBe(24242);
    expect(grantKindNum('signEvent:1')).toBe(1);
  });

  it('has none for a method', () => {
    expect(grantKindNum('getPubKey')).toBeNull();
  });
});

describe('isRiskyGrant', () => {
  it('a media server delete is', () => {
    expect(isRiskyGrant('signEvent:24242:delete')).toBe(true);
  });

  for (const verb of ['upload', 'media', 'get', 'list']) {
    it(`a media server ${verb} is not`, () => {
      expect(isRiskyGrant(`signEvent:24242:${verb}`)).toBe(false);
    });
  }

  for (const key of ['signEvent:3', 'signEvent:4', 'signEvent:5', 'signEvent:13', 'signEvent:14', 'signEvent:62', 'signEvent:1059', 'nip04.decrypt', 'nip44.decrypt']) {
    it(`${key} is`, () => {
      expect(isRiskyGrant(key)).toBe(true);
    });
  }

  for (const key of ['signEvent:1', 'getPubKey', 'nip44.encrypt']) {
    it(`${key} is not`, () => {
      expect(isRiskyGrant(key)).toBe(false);
    });
  }
});

describe('humanPermission', () => {
  for (const verb of ['upload', 'media', 'get', 'list', 'delete']) {
    it(`names the ${verb} action`, () => {
      expect(humanPermission(`signEvent:24242:${verb}`)).toBe(`Sign event: ${BLOSSOM_ACTIONS[verb].label}`);
    });
  }

  for (const [kind, words] of [[13, /seal/i], [14, /direct message/i], [1059, /gift/i]]) {
    it(`names kind ${kind}`, () => {
      const label = humanPermission(`signEvent:${kind}`);
      expect(label).toMatch(words);
      expect(label).not.toMatch(/unknown/i);
    });
  }

  it('names addRelay', () => {
    expect(humanPermission('addRelay')).toBe('Add a relay');
  });
});
