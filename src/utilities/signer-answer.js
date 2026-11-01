/**
 * What a remote signer may change in an event it was asked to sign. Signers tidy
 * events on their own, and because that changes the id a site must get the event
 * as signed. No imports and no side effects: one reviewable set of rules.
 */

/**
 * Kinds a remote signer must return exactly as asked, as [first, last] ranges.
 * Their tags are the permission, the proof or the payment, so an added tag or a
 * new time changes what was agreed to.
 */
export const SIGNER_TAG_KINDS_EXACT = [
    [4, 4],             // direct message: the tags say who can read it
    [5, 5],             // delete: the tags say what goes
    [13, 13],           // sealed message: the time is chosen to protect it
    [14, 14],           // private message: the tags say who it is for
    [62, 62],           // request to vanish: the tags say from where
    [1059, 1059],       // gift wrap: the tags say who receives it
    [9000, 9030],       // group control: the tags say who gains or loses a role
    [9321, 9321],       // nutzap: the tags carry money and its recipient
    [9734, 9734],       // zap request: must keep exactly one recipient
    [22242, 22242],     // relay login: the tags are the proof
    [23194, 23194],     // wallet request: the tags say which wallet acts
    [24133, 24133],     // remote signer traffic: the tags say who receives it
    [24242, 24242],     // media server: the tags are the permission
    [27235, 27235],     // HTTP login: the tags are the proof
    [28934, 28936],     // relay join, invite and leave: the tags are the claim
];

const inRange = (kind, first, last) => kind >= first && kind <= last;
const addressable = (kind) => inRange(kind, 30000, 39999);
const replaceable = (kind) => kind === 0 || kind === 3 || inRange(kind, 10000, 19999) || addressable(kind);
const isString = (value) => typeof value === 'string';
const allText = (tag) => Array.isArray(tag) && tag.every(isString);

/**
 * @param {number} kind
 * @returns {boolean} true if a signer may change nothing on this kind
 */
export function mustMatchExactly(kind) {
    return SIGNER_TAG_KINDS_EXACT.some(([first, last]) => inRange(kind, first, last));
}

const MENTION = /(@|nostr:)((?:npub|nprofile|note|nevent|naddr)[a-zA-Z0-9]+)/g;
// Older signers take any run of word characters after a #. Newer ones need a space
// or the start of the text before it, and allow more letters.
const HASHTAG_ANYWHERE = /#(\w+)/g;
const HASHTAG_AFTER_SPACE = /(?:^|\s)#([^\s!@#$%^&*()=+./,[{\]};:'"?><]+)/g;

const decodes = (decode, entity) => {
    try {
        return decode(entity);
    } catch {
        return null;
    }
};

/** The people, events and hashtags this text names. */
function namedIn(content, decode) {
    const people = new Set();
    const events = new Map();
    const event = (id, relays = []) => events.set(id, new Set([...(events.get(id) ?? ['']), ...relays]));

    for (const [, , entity] of content.matchAll(MENTION)) {
        const found = decodes(decode, entity);
        switch (found?.type) {
            case 'npub':
            case 'nprofile':
                people.add(found.data);
                break;
            case 'note':
                event(found.data);
                break;
            case 'nevent':
                event(found.data, found.relays);
                if (found.author) people.add(found.author);
                break;
            case 'naddr':
                event(`${found.kind}:${found.author}:${found.identifier ?? ''}`, found.relays);
                people.add(found.author);
                break;
        }
    }

    const hashtags = new Set();
    for (const pattern of [HASHTAG_ANYWHERE, HASHTAG_AFTER_SPACE]) {
        for (const [, word] of content.matchAll(pattern)) hashtags.add(word);
    }
    return { people, events, hashtags };
}

/** The tags a signer may add, by name, and what each must satisfy. */
const SIGNER_ADDED_TAGS = new Map([
    ['p', (tag, { named }) => tag.length === 2 && named.people.has(tag[1])],
    ['q', (tag, { named }) => (tag.length === 2 || tag.length === 3)
        && named.events.has(tag[1]) && (tag.length === 2 || named.events.get(tag[1]).has(tag[2]))],
    ['t', (tag, { named }) => tag.length === 2 && named.hashtags.has(tag[1])],
    ['d', (tag, { kind, hasD, added }) => tag.length === 2 && tag[1] !== ''
        && addressable(kind) && !hasD && !added.has('d')],
    ['client', (tag, { hasClient, added }) => (tag.length === 2 || tag.length === 3)
        && !hasClient && !added.has('client')],
]);

function tagsAllowed(signed, asked, decode) {
    if (!Array.isArray(signed.tags) || !Array.isArray(asked) || !asked.every(allText)) return false;
    const has = (name) => asked.some((tag) => tag[0] === name);
    const context = {
        kind: signed.kind,
        named: namedIn(signed.content, decode),
        hasD: has('d'),
        hasClient: has('client'),
        added: new Set(),
    };
    let next = 0;
    for (const tag of signed.tags) {
        if (!allText(tag) || tag.length === 0) return false;
        if (next < asked.length && JSON.stringify(tag) === JSON.stringify(asked[next])) {
            next += 1;
            continue;
        }
        if (!SIGNER_ADDED_TAGS.get(tag[0])?.(tag, context)) return false;
        context.added.add(tag[0]);
    }
    return next === asked.length;
}

const withMentionsRewritten = (content, decode) => content.replace(MENTION, (mention, lead, entity) => (
    lead === '@' && decodes(decode, entity) ? `nostr:${entity}` : mention
));

const timeWithin = (value, now, secs) => Number.isInteger(value) && Math.abs(now - value) <= secs;

/**
 * Is what a signer returned the request, allowing only the tidying signers do on
 * their own? Kind, identity and signature are for the caller to check. Runs on
 * untrusted data and never throws.
 *
 * @param {object}   signed  what the signer returned
 * @param {object}   request what was authorised
 * @param {object}   rules
 * @param {number}   rules.now       our clock, in seconds
 * @param {number}   rules.clockSecs how far a signer's time may be from `now`
 * @param {function} rules.decode    NIP-19 decode; throws on anything else
 * @returns {boolean}
 */
export function matchesRequest(signed, request, { now, clockSecs, decode }) {
    const content = request.content ?? '';
    const tags = request.tags ?? [];
    const exact = mustMatchExactly(request.kind);

    const sameTags = JSON.stringify(signed.tags) === JSON.stringify(tags);
    const sameContent = signed.content === content;
    if (exact && (!sameTags || !sameContent)) return false;
    if (!isString(content) || !isString(signed.content)) return false;
    if (!sameContent && signed.content !== withMentionsRewritten(content, decode)) return false;
    if (!sameTags && !tagsAllowed(signed, tags, decode)) return false;

    if (request.created_at == null) return timeWithin(signed.created_at, now, clockSecs);
    if (signed.created_at === request.created_at) return true;
    return !exact && replaceable(request.kind) && timeWithin(signed.created_at, now, clockSecs);
}
