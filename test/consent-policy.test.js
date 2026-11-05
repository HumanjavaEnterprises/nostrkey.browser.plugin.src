/**
 * The pure request rules in src/utilities/consent-policy.js: reading a Blossom
 * authorization, turning a request into a grant key, and which keys may be
 * remembered.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { installFakeChrome } from './helpers/fake-chrome.js';
import {
    parseBlossomAuth, checkBlossomAuth, grantKeyFor, parseGrantKey, canRemember,
    REMEMBERABLE_KINDS, REMEMBERABLE_METHODS, GRANT_RATE, MAX_BLOSSOM_TTL_S,
    isNeverGranted, withoutNeverGranted, validateRequest, fitsPrompt, MAX_PROMPT_PAYLOAD,
} from '../src/utilities/consent-policy.js';

installFakeChrome();
const { describeKind } = await import('../src/permission/kind-labels.js');
const { humanPermission } = await import('../src/utilities/utils.js');

const NOW = 1_800_000_000;
const HASH = 'ab'.repeat(32);
const HASH2 = 'cd'.repeat(32);

const auth = (tags, extra = {}) => ({
    kind: 24242,
    created_at: NOW,
    content: '',
    tags,
    ...extra,
});
const exp = (seconds = 3600) => ['expiration', String(NOW + seconds)];
const upload = (...more) => auth([['t', 'upload'], exp(), ['x', HASH], ...more]);

const clients = {
    'Jumble': auth([['t', 'upload'], ['x', HASH], exp()], { content: 'Uploading media file' }),
    'noStrudel, upload': auth([['t', 'upload'], exp(), ['x', HASH], ['server', 'cdn.example.com']]),
    'noStrudel, media': auth([['t', 'media'], exp(), ['x', HASH], ['server', 'cdn.example.com']]),
    'Primal': auth([['t', 'upload'], exp(), ['x', HASH]], { content: 'media upload' }),
    'Flotilla upload': auth([['t', 'upload'], exp(60), ['u', 'https://cdn.example.com/upload'], ['x', HASH]]),
    'Amethyst': auth([['t', 'upload'], ['size', '1234'], exp(), ['x', HASH]]),
    'the SDK with two servers': auth([['t', 'upload'], exp(), ['x', HASH], ['server', 'a.example.com'], ['server', 'b.example.com']]),
};

describe('tokens from real clients', () => {
    for (const [name, event] of Object.entries(clients)) {
        it(`${name} parses`, () => {
            expect(parseBlossomAuth(event, NOW)).not.toBeNull();
        });
    }

    it('reports the verb, expiry, hashes and servers', () => {
        expect(parseBlossomAuth(clients['the SDK with two servers'], NOW)).toEqual({
            verb: 'upload',
            expiresAt: NOW + 3600,
            x: [HASH],
            servers: ['a.example.com', 'b.example.com'],
        });
    });

    it("Flotilla's support probe carries no x, so it always asks", () => {
        const probe = auth([['t', 'upload'], exp(60)]);
        expect(parseBlossomAuth(probe, NOW)).toBeNull();
        expect(grantKeyFor('signEvent', probe, NOW)).toBeNull();
    });
});

describe('every verb', () => {
    it('get works with no hash, or with up to 20', () => {
        expect(parseBlossomAuth(auth([['t', 'get'], exp()]), NOW)?.verb).toBe('get');
        const twenty = Array.from({ length: 20 }, () => ['x', HASH]);
        expect(parseBlossomAuth(auth([['t', 'get'], exp(), ...twenty]), NOW)?.x).toHaveLength(20);
    });

    it('list takes no hash', () => {
        expect(parseBlossomAuth(auth([['t', 'list'], exp()]), NOW)?.verb).toBe('list');
        expect(parseBlossomAuth(auth([['t', 'list'], exp(), ['x', HASH]]), NOW)).toBeNull();
    });

    for (const verb of ['upload', 'media', 'delete']) {
        it(`${verb} needs 1 to 20 hashes`, () => {
            expect(parseBlossomAuth(auth([['t', verb], exp()]), NOW)).toBeNull();
            expect(parseBlossomAuth(auth([['t', verb], exp(), ['x', HASH]]), NOW)?.verb).toBe(verb);
            const twenty = Array.from({ length: 20 }, () => ['x', HASH]);
            expect(parseBlossomAuth(auth([['t', verb], exp(), ...twenty]), NOW)?.x).toHaveLength(20);
            const more = [...twenty, ['x', HASH2]];
            expect(parseBlossomAuth(auth([['t', verb], exp(), ...more]), NOW)).toBeNull();
        });
    }

    it('get refuses 21 hashes', () => {
        const more = Array.from({ length: 21 }, () => ['x', HASH]);
        expect(parseBlossomAuth(auth([['t', 'get'], exp(), ...more]), NOW)).toBeNull();
    });
});

describe('shapes that are refused', () => {
    const rows = {
        'two t tags': upload(['t', 'delete']),
        'two t tags, delete first': auth([['t', 'delete'], ['t', 'upload'], exp(), ['x', HASH]]),
        'an empty second t tag': upload(['t']),
        'a t tag with a second value': auth([['t', 'upload', 'delete'], exp(), ['x', HASH]]),
        'a second t tag with extra values': upload(['t', 'delete', 'x']),
        'a t tag of another case beside the real one': upload(['T', 'delete']),
        'an expiration tag of another case': upload(['Expiration', String(NOW + 10)]),
        'a verb in capitals': auth([['t', 'Upload'], exp(), ['x', HASH]]),
        'a verb in full capitals': auth([['t', 'DELETE'], exp(), ['x', HASH]]),
        'a non-string verb': auth([['t', ['upload']], exp(), ['x', HASH]]),
        'an unknown verb': auth([['t', 'mirror'], exp(), ['x', HASH]]),
        'verb constructor': auth([['t', 'constructor'], exp(), ['x', HASH]]),
        'verb __proto__': auth([['t', '__proto__'], exp(), ['x', HASH]]),
        'verb toString': auth([['t', 'toString'], exp(), ['x', HASH]]),
        'no t tag': auth([exp(), ['x', HASH]]),
        'no expiration': auth([['t', 'upload'], ['x', HASH]]),
        'two expirations': upload(exp(10)),
        'an expiration with a second value': auth([['t', 'upload'], ['expiration', String(NOW + 60), 'x'], ['x', HASH]]),
        'a non-string expiration': auth([['t', 'upload'], ['expiration', NOW + 60], ['x', HASH]]),
        'a non-numeric expiration': auth([['t', 'upload'], ['expiration', '1e10'], ['x', HASH]]),
        'an expiration in exponent form': auth([['t', 'upload'], ['expiration', '1e9'], ['x', HASH]]),
        'an expiration in hex': auth([['t', 'upload'], ['expiration', `0x${(NOW + 60).toString(16)}`], ['x', HASH]]),
        'an expiration with leading whitespace': auth([['t', 'upload'], ['expiration', ` ${NOW + 60}`], ['x', HASH]]),
        'an expiration with trailing whitespace': auth([['t', 'upload'], ['expiration', `${NOW + 60}\n`], ['x', HASH]]),
        'a hash over 64 characters': auth([['t', 'upload'], exp(), ['x', `${HASH}00`]]),
        'a fractional created_at': { ...auth([['t', 'upload'], exp(), ['x', HASH]]), created_at: NOW - 0.5 },
        'a server with a port': upload(['server', 'cdn.example.com:8443']),
        'an expiration beyond a safe integer': auth([['t', 'upload'], ['expiration', '9'.repeat(20)], ['x', HASH]]),
        'a far-future expiration': auth([['t', 'upload'], exp(86400 * 2), ['x', HASH]]),
        'a hash in capitals': auth([['t', 'upload'], exp(), ['x', 'AB'.repeat(32)]]),
        'a short hash': auth([['t', 'upload'], exp(), ['x', 'ab']]),
        'a non-string hash': auth([['t', 'upload'], exp(), ['x', 7]]),
        'a hash tag with a second value': auth([['t', 'upload'], exp(), ['x', HASH, 'y']]),
        'a server with a scheme': upload(['server', 'https://cdn.example.com']),
        'a server in capitals': upload(['server', 'CDN.example.com']),
        'a server with a second value': upload(['server', 'a.example.com', 'b']),
        'a non-string server': upload(['server', 7]),
        'a post-dated token': auth([['t', 'upload'], exp(), ['x', HASH]], { created_at: NOW + 61 }),
        'a missing created_at': auth([['t', 'upload'], exp(), ['x', HASH]], { created_at: undefined }),
        'a string created_at': auth([['t', 'upload'], exp(), ['x', HASH]], { created_at: String(NOW) }),
        'kind as a string': { ...upload(), kind: '24242' },
        'kind in an array': { ...upload(), kind: [24242] },
        'tags that are not a list': { ...upload(), tags: 'x' },
        'an array-like in place of tags': { ...upload(), tags: { length: 1 } },
        'a null tag': upload(null),
        'a tag that is not a list': upload('t'),
        'a tag whose name is not a string': upload([['t'], 'delete']),
    };
    for (const [name, event] of Object.entries(rows)) {
        it(name, () => {
            expect(parseBlossomAuth(event, NOW)).toBeNull();
            expect(grantKeyFor('signEvent', event, NOW)).toBeNull();
        });
    }

    it('another kind is not a Blossom token', () => {
        expect(parseBlossomAuth({ ...upload(), kind: 24243 }, NOW)).toBeNull();
    });

    for (const bad of [undefined, null, 'x', 7, [], {}]) {
        it(`not an event: ${JSON.stringify(bad)}`, () => {
            expect(parseBlossomAuth(bad, NOW)).toBeNull();
        });
    }
});

describe('the time window', () => {
    const at = (seconds) => auth([['t', 'upload'], exp(seconds), ['x', HASH]]);

    it('the cap is an hour and five minutes', () => {
        expect(MAX_BLOSSOM_TTL_S).toBe(3900);
        expect(parseBlossomAuth(at(3900), NOW)).not.toBeNull();
        expect(parseBlossomAuth(at(3901), NOW)).toBeNull();
    });

    it('expired, and exactly at now, are refused; a second ahead is fine', () => {
        expect(parseBlossomAuth(at(-1), NOW)).toBeNull();
        expect(parseBlossomAuth(at(0), NOW)).toBeNull();
        expect(parseBlossomAuth(at(1), NOW)).not.toBeNull();
    });

    it('created_at may run a minute ahead of this clock and no more', () => {
        const dated = (t) => auth([['t', 'upload'], exp(), ['x', HASH]], { created_at: t });
        expect(parseBlossomAuth(dated(NOW + 60), NOW)).not.toBeNull();
        expect(parseBlossomAuth(dated(NOW + 61), NOW)).toBeNull();
    });

    it('a back-dated created_at is fine', () => {
        const old = auth([['t', 'upload'], exp(), ['x', HASH]], { created_at: NOW - 86400 * 30 });
        expect(parseBlossomAuth(old, NOW)).not.toBeNull();
    });
});

describe('what the content says', () => {
    it('changes nothing', () => {
        const event = auth([['t', 'delete'], exp(), ['x', HASH]], { content: 'upload' });
        expect(grantKeyFor('signEvent', event, NOW)).toBe('signEvent:24242:delete');
    });

    it('is never read by the rules', () => {
        const source = readFileSync(new URL('../src/utilities/consent-policy.js', import.meta.url), 'utf8');
        expect(source).not.toMatch(/\.content\b|\['content'\]/);
        expect(source).not.toMatch(/^\s*import\s/m);
    });
});

describe('why a token asks', () => {
    it('names the rule that failed', () => {
        expect(checkBlossomAuth(auth([['t', 'upload'], exp(86400 * 2), ['x', HASH]]), NOW))
            .toEqual({ auth: null, problem: 'expiry_too_far', expiresAt: NOW + 86400 * 2 });
        expect(checkBlossomAuth(auth([['t', 'upload'], exp(60)]), NOW).problem).toBe('bad_hashes');
        expect(checkBlossomAuth(upload(['t', 'delete']), NOW).problem).toBe('bad_verb');
    });

    it('gives no problem for a good token', () => {
        expect(checkBlossomAuth(upload(), NOW).problem).toBeNull();
    });
});

describe('a clock that is not a whole number of seconds', () => {
    const clocks = [undefined, null, NaN, Infinity, 1.5, '1700000000', Number.MAX_SAFE_INTEGER + 1];
    for (const clock of clocks) {
        it(`${String(clock)} refuses`, () => {
            const event = auth([['t', 'upload'], exp(), ['x', HASH]]);
            expect(parseBlossomAuth(event, clock)).toBeNull();
            expect(grantKeyFor('signEvent', event, clock)).toBeNull();
            expect(grantKeyFor('signEvent', { kind: 1 }, clock)).toBeNull();
            expect(grantKeyFor('getPubKey', undefined, clock)).toBeNull();
        });
    }
});

describe('never throws, never returns more than one verb', () => {
    // A small seeded generator, so a failure repeats.
    function generator(seed) {
        let state = seed;
        const random = () => {
            state = (state + 0x6d2b79f5) | 0;
            let t = Math.imul(state ^ (state >>> 15), 1 | state);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const pick = (list) => list[Math.floor(random() * list.length)];
        const WORDS = [
            't', 'T', 'x', 'expiration', 'EXPIRATION', 'server', 'upload', 'delete', 'get', 'list', 'media',
            ' upload', 'upload ', 'upload,delete', 'delete\n', `${HASH}0`, HASH.toUpperCase(), HASH.slice(1),
            '1e9', `0x${(NOW + 60).toString(16)}`, ` ${NOW + 60}`, `${NOW + 60}.5`, '-1',
            'constructor', '__proto__', HASH, String(NOW + 60), '', 7, -1, 1.5, null, true, undefined, [], {},
        ];
        const scalar = () => pick(WORDS);
        const list = (max, item) => Array.from({ length: Math.floor(random() * (max + 1)) }, item);
        const tag = () => (random() < 0.85 ? list(4, scalar) : scalar());
        return { pick, list, scalar, tag, random };
    }
    const verbs = ['get', 'upload', 'list', 'delete', 'media'];

    it('random shapes', () => {
        const g = generator(1);
        for (let i = 0; i < 5000; i++) {
            const e = {
                kind: g.random() < 0.8 ? 24242 : g.scalar(),
                created_at: g.random() < 0.8 ? NOW : g.scalar(),
                tags: g.random() < 0.9 ? g.list(8, g.tag) : g.scalar(),
            };
            const parsed = parseBlossomAuth(e, NOW);
            const key = grantKeyFor('signEvent', e, NOW);
            if (parsed) {
                expect(e.tags.filter(t => Array.isArray(t) && t[0] === 't')).toHaveLength(1);
                expect(verbs).toContain(parsed.verb);
            }
            if (e.kind === 24242 && key !== null) {
                expect(verbs.map(v => `signEvent:24242:${v}`)).toContain(key);
            }
            expect(key).not.toBe('signEvent:24242');
        }
    });

    it('generated tags beside a valid token never yield a second t, and some still parse', () => {
        const g = generator(2);
        let parsedCount = 0;
        let refusedSecondT = 0;
        for (let i = 0; i < 5000; i++) {
            const more = g.list(4, () => [g.scalar(), g.scalar(), g.scalar()].slice(0, 1 + Math.floor(g.random() * 3)));
            const tags = [['t', g.pick(verbs)], exp(), ['x', HASH], ...more];
            const parsed = parseBlossomAuth(auth(tags), NOW);
            if (parsed) parsedCount++;
            if (tags.filter(t => t[0] === 't').length > 1) {
                expect(parsed).toBeNull();
                refusedSecondT++;
            }
        }
        expect(parsedCount).toBeGreaterThan(0);
        expect(refusedSecondT).toBeGreaterThan(0);
    });
});

describe('grantKeyFor', () => {
    it('keeps the key every other request has always had', () => {
        expect(grantKeyFor('signEvent', { kind: 1 }, NOW)).toBe('signEvent:1');
        expect(grantKeyFor('signEvent', { kind: 0 }, NOW)).toBe('signEvent:0');
        expect(grantKeyFor('signEvent', { kind: 987 }, NOW)).toBe('signEvent:987');
        expect(grantKeyFor('getPubKey', undefined, NOW)).toBe('getPubKey');
        expect(grantKeyFor('nip44.decrypt', { pubKey: 'a', cipherText: 'b' }, NOW)).toBe('nip44.decrypt');
    });

    it('splits a Blossom token by verb', () => {
        for (const verb of ['upload', 'media', 'delete']) {
            expect(grantKeyFor('signEvent', auth([['t', verb], exp(), ['x', HASH]]), NOW))
                .toBe(`signEvent:24242:${verb}`);
        }
        expect(grantKeyFor('signEvent', auth([['t', 'get'], exp()]), NOW)).toBe('signEvent:24242:get');
        expect(grantKeyFor('signEvent', auth([['t', 'list'], exp()]), NOW)).toBe('signEvent:24242:list');
    });

    it('has no key for a malformed request or an unknown method', () => {
        expect(grantKeyFor('signEvent', undefined, NOW)).toBeNull();
        expect(grantKeyFor('signEvent', { kind: '1' }, NOW)).toBeNull();
        expect(grantKeyFor('addRelay', {}, NOW)).toBeNull();
        expect(grantKeyFor('somethingElse', {}, NOW)).toBeNull();
    });
});

describe('parseGrantKey', () => {
    it('reads each shape', () => {
        expect(parseGrantKey('signEvent:24242:upload'))
            .toEqual({ method: 'signEvent', kind: 24242, verb: 'upload' });
        expect(parseGrantKey('signEvent:1')).toEqual({ method: 'signEvent', kind: 1, verb: null });
        expect(parseGrantKey('signEvent:24242')).toEqual({ method: 'signEvent', kind: 24242, verb: null });
        expect(parseGrantKey('getRelays')).toEqual({ method: 'getRelays', kind: null, verb: null });
    });

    for (const bad of [
        'signEvent', 'signEvent:', 'signEvent:abc', 'signEvent:1.5', 'signEvent:-1', 'signEvent:65536',
        'signEvent:01', 'signEvent:1:upload', 'signEvent:24242:mirror', 'signEvent:24242:constructor',
        'signEvent:24242:upload:x', 'something', 'constructor', '', null, undefined, 7,
    ]) {
        it(`refuses ${JSON.stringify(bad)}`, () => {
            expect(parseGrantKey(bad)).toBeNull();
        });
    }
});

const TODAY = [
    0, 1, 2, 3, 4, 6, 7, 8, 13, 14, 16, 40, 41, 42, 43, 44, 1059, 1063, 1311, 1984, 1985, 4550, 7000,
    9041, 9734, 9735, 10000, 10001, 10002, 13194, 22242, 23194, 23195, 24133, 27235, 30000, 30001,
    30008, 30009, 30017, 30018, 30023, 30024, 30078, 30311, 30315, 30402, 30403, 31922, 31923, 31924,
    31925, 31989, 31990, 34550,
];
const ADDED = [10063, 1111, 9802, 10003, 30003, 20, 21, 22];

describe('what may be remembered', () => {
    it('the kind list is exactly this literal', () => {
        expect(TODAY).toHaveLength(55);
        expect([...REMEMBERABLE_KINDS].sort((a, b) => a - b))
            .toEqual([...TODAY, ...ADDED].sort((a, b) => a - b));
    });

    it('the method list is the seven non-signing methods', () => {
        expect([...REMEMBERABLE_METHODS].sort()).toEqual([
            'addRelay', 'getPubKey', 'getRelays',
            'nip04.decrypt', 'nip04.encrypt', 'nip44.decrypt', 'nip44.encrypt',
        ]);
    });

    it('allows each listed kind and each method', () => {
        for (const kind of REMEMBERABLE_KINDS) expect(canRemember(`signEvent:${kind}`, 'signEvent')).toBe(true);
        for (const method of REMEMBERABLE_METHODS) expect(canRemember(method, method)).toBe(true);
    });

    it('never allows deletes, kind 62 or an unlisted kind', () => {
        for (const key of ['signEvent:5', 'signEvent:62', 'signEvent:987654', 'signEvent:19999', 'signEvent:7375']) {
            expect(canRemember(key, 'signEvent')).toBe(false);
        }
    });

    it('allows Blossom verbs, but not delete and not the bare kind', () => {
        for (const verb of ['upload', 'media', 'get', 'list']) {
            expect(canRemember(`signEvent:24242:${verb}`, 'signEvent')).toBe(true);
        }
        expect(canRemember('signEvent:24242:delete', 'signEvent')).toBe(false);
        expect(canRemember('signEvent:24242', 'signEvent')).toBe(false);
        expect(REMEMBERABLE_KINDS.has(24242)).toBe(false);
    });

    it('needs a key that matches the method', () => {
        expect(canRemember(null, 'signEvent')).toBe(false);
        expect(canRemember('signEvent:1', 'getPubKey')).toBe(false);
        expect(canRemember('getPubKey', 'signEvent')).toBe(false);
        expect(canRemember('signEvent', 'signEvent')).toBe(false);
        expect(canRemember('someWeirdMethod', 'someWeirdMethod')).toBe(false);
    });
});

describe('grant rate numbers', () => {
    it('60 a minute, 5 for deletes', () => {
        expect(GRANT_RATE).toEqual({ windowMs: 60_000, max: 60, deleteMax: 5 });
    });
});

describe('labels', () => {
    it('remembering matches the literal for all of today', () => {
        for (const kind of TODAY) expect(describeKind(kind).rememberable, kind).toBe(true);
        expect(describeKind(5).rememberable).toBe(false);
    });

    it('being in a label table does not make a kind rememberable', () => {
        for (const kind of [62, 24242]) {
            expect(describeKind(kind).known, kind).toBe(true);
            expect(describeKind(kind).rememberable, kind).toBe(false);
        }
    });

    it('a list-replacing kind warns', () => {
        expect(describeKind(10063)).toMatchObject({ risk: 'warn', label: 'Replace your media server list' });
        expect(describeKind(10063).warning).toBeTruthy();
        expect(describeKind(10003).risk).toBe('warn');
        expect(describeKind(10003).warning).toBeTruthy();
    });

    it('kind 62 is labelled as dangerous', () => {
        expect(describeKind(62).risk).toBe('danger');
    });

    it('the added public kinds are neutral and named', () => {
        for (const kind of [1111, 9802, 30003, 20, 21, 22]) {
            expect(describeKind(kind)).toMatchObject({ known: true, risk: 'neutral', rememberable: true });
            expect(describeKind(kind).label).not.toMatch(/Unknown/);
        }
    });

    it('humanPermission names every kind that used to read as unknown', () => {
        for (const kind of [13, 14, 1059, ...ADDED, 62, 24242]) {
            expect(humanPermission(`signEvent:${kind}`), kind).not.toMatch(/Unknown/);
        }
    });
});

describe('grants that are never acted on', () => {
  it('are kinds 5 and 62 and the Blossom delete verb, and nothing else', () => {
    for (const key of ['signEvent:5', 'signEvent:62', 'signEvent:24242:delete']) {
      expect(isNeverGranted(key)).toBe(true);
    }
    for (const key of ['signEvent:1', 'signEvent:9999', 'signEvent:24242:upload', 'nip44.decrypt', 'signEvent:50']) {
      expect(isNeverGranted(key)).toBe(false);
    }
  });

  it('are removed from a list of profiles, leaving denies and everything else as they were', () => {
    const input = [
      { name: 'a', hosts: { x: { 'signEvent:5': 'allow', 'signEvent:1': 'allow' }, y: { 'signEvent:62': 'deny' } } },
      { name: 'b' },
    ];
    expect(withoutNeverGranted(input)).toEqual([
      { name: 'a', hosts: { x: { 'signEvent:1': 'allow' }, y: { 'signEvent:62': 'deny' } } },
      { name: 'b' },
    ]);
  });

  it('a list that is not an array passes through', () => {
    expect(withoutNeverGranted(undefined)).toBeUndefined();
  });

  it('nothing can be remembered that is then never acted on', () => {
    for (const key of ['signEvent:5', 'signEvent:62', 'signEvent:24242:delete']) {
      expect(canRemember(key, 'signEvent')).toBe(false);
    }
  });
});

describe('how a stored answer reads in the list', () => {
  it('shows what will actually happen for each stored value', async () => {
    const { grantState } = await import('../src/utilities/consent-policy.js');
    expect(grantState('signEvent:1', 'allow')).toBe('allow');
    expect(grantState('signEvent:1', 'deny')).toBe('deny');
    expect(grantState('signEvent:1', 'reject')).toBe('deny');
    expect(grantState('signEvent:1', 'ask')).toBe('ask');
    expect(grantState('signEvent:1', undefined)).toBe('ask');
  });

  it('shows an allow that is never acted on as asking', async () => {
    const { grantState } = await import('../src/utilities/consent-policy.js');
    for (const key of ['signEvent:5', 'signEvent:62', 'signEvent:24242:delete']) {
      expect(grantState(key, 'allow')).toBe('ask');
    }
  });

  it('shows a deny as a deny on those same keys', async () => {
    const { grantState } = await import('../src/utilities/consent-policy.js');
    for (const key of ['signEvent:5', 'signEvent:62', 'signEvent:24242:delete']) {
      expect(grantState(key, 'deny')).toBe('deny');
    }
  });

  it('both lists in the side panel read it from there', () => {
    const source = readFileSync(new URL('../src/sidepanel.js', import.meta.url), 'utf8');
    expect(source.match(/grantState\(g\.action, g\.value\)/g)).toHaveLength(2);
    expect(source).not.toMatch(/g\.value === 'allow'/);
    expect(source).not.toMatch(/g\.value === 'deny'/);
  });
});

describe('how much a media server request needs flagging, valid or not', () => {
    const risk = async (event, now = NOW) => {
        const { blossomRisk } = await import('../src/utilities/consent-policy.js');
        return blossomRisk(event, now);
    };
    const expiry = ['expiration', String(NOW + 600)];
    const X = ['x', HASH];

    it('a valid delete is danger, and a valid upload is neutral', async () => {
        expect(await risk(auth([['t', 'delete'], expiry, X]))).toBe('danger');
        expect(await risk(auth([['t', 'upload'], expiry, X]))).toBe('neutral');
    });

    for (const [name, tags] of [
        ['an expiry two days out', [['t', 'delete'], ['expiration', String(NOW + 2 * 86400)], X]],
        ['no expiry', [['t', 'delete'], X]],
        ['an upload and a delete', [['t', 'upload'], ['t', 'delete'], expiry, X]],
        ['delete listed second among the tags', [expiry, X, ['t', 'upload'], ['t', 'delete']]],
        ['21 hashes', [['t', 'delete'], expiry, ...Array.from({ length: 21 }, (_, i) => ['x', String(i % 10).repeat(64)])]],
        ['a capital tag name', [['T', 'delete'], expiry, X]],
        ['a capital value', [['t', 'DELETE'], expiry, X]],
        ['extra values in the tag', [['t', 'upload', 'delete'], expiry, X]],
        ['an unreadable tag beside it', [null, 7, ['t', 'delete'], expiry, X]],
    ]) {
        it(`a request that names delete with ${name} is danger`, async () => {
            expect(await risk(auth(tags))).toBe('danger');
        });
    }

    for (const [name, event] of [
        ['two actions without delete', auth([['t', 'upload'], ['t', 'get'], expiry, X])],
        ['no action', auth([expiry, X])],
        ['no tags', auth(undefined)],
        ['tags that are not a list', auth('x')],
        ['a past expiry', auth([['t', 'upload'], ['expiration', String(NOW - 1)], X])],
    ]) {
        it(`${name} is at least warn`, async () => {
            expect(await risk(event)).toBe('warn');
        });
    }

    it('says nothing about any other kind', async () => {
        expect(await risk({ kind: 1, tags: [['t', 'delete']] })).toBe('neutral');
        expect(await risk(null)).toBe('neutral');
    });

    it('never throws on a bad clock', async () => {
        expect(await risk(auth([['t', 'upload'], expiry, X]), NaN)).toBe('warn');
    });
});

describe('a creation time the prompt can show', () => {
    const at = (created_at) => validateRequest('signEvent', { kind: 1, created_at });

    for (const value of [0, 1, 1_800_000_000, 8_640_000_000_000]) {
        it(`${value} is accepted`, () => expect(at(value)).toBe(true));
    }
    for (const value of [8_640_000_000_001, 1e20, -1, 1.5, NaN, Infinity, '1800000000', null, {}]) {
        it(`${String(value)} is refused`, () => expect(at(value)).toBe(false));
    }
    it('an event with none is accepted, since it gets one when signed', () => {
        expect(validateRequest('signEvent', { kind: 1 })).toBe(true);
    });
});

describe('what fits in a prompt', () => {
    const measured = (text) => JSON.stringify({ content: text }).length;

    it('the limit is 2 MiB, well above what relays accept', () => {
        expect(MAX_PROMPT_PAYLOAD).toBe(2_097_152);
    });

    it('takes a payload up to the limit and refuses one past it', () => {
        const overhead = measured('');
        expect(fitsPrompt({ content: 'a'.repeat(MAX_PROMPT_PAYLOAD - overhead) })).toBe(true);
        expect(fitsPrompt({ content: 'a'.repeat(MAX_PROMPT_PAYLOAD - overhead + 1) })).toBe(false);
    });

    it('a payload sized for a large relay fits, whatever its characters', () => {
        expect(fitsPrompt({ content: '\u8a9e'.repeat(1_000_000) })).toBe(true);
    });

    it('takes no payload at all', () => expect(fitsPrompt(undefined)).toBe(true));
});

describe('a media server grant with no action', () => {
    it('reads as ask, whatever is stored, since it is never looked up', async () => {
        const { grantState } = await import('../src/utilities/consent-policy.js');
        for (const value of ['allow', 'deny', 'reject', undefined]) {
            expect(grantState('signEvent:24242', value)).toBe('ask');
        }
        expect(grantState('signEvent:24242:upload', 'allow')).toBe('allow');
        expect(grantState('signEvent:24242:upload', 'deny')).toBe('deny');
    });
});
