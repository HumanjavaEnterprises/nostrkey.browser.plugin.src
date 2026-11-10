import { openDB } from 'idb';

async function openEventsDb() {
    return await openDB('events', 1, {
        upgrade(db) {
            const events = db.createObjectStore('events', {
                keyPath: 'event.id',
            });
            events.createIndex('pubkey', 'event.pubkey');
            events.createIndex('created_at', 'event.created_at');
            events.createIndex('kind', 'event.kind');
            events.createIndex('host', 'metadata.host');
        },
    });
}

export async function saveEvent(event) {
    let db = await openEventsDb();
    return db.put('events', event);
}

export async function sortByIndex(index, query, asc, max) {
    let db = await openEventsDb();
    let events = [];
    let cursor = await db
        .transaction('events')
        .store.index(index)
        .openCursor(query, asc ? 'next' : 'prev');
    while (cursor) {
        events.push(cursor.value);
        if (events.length >= max) {
            break;
        }
        cursor = await cursor.continue();
    }
    return events;
}

export async function getHosts() {
    let db = await openEventsDb();
    let hosts = new Set();
    let cursor = await db.transaction('events').store.openCursor();
    while (cursor) {
        hosts.add(cursor.value.metadata.host);
        cursor = await cursor.continue();
    }
    return [...hosts];
}

export async function downloadAllContents() {
    let db = await openEventsDb();
    let events = [];
    let cursor = await db.transaction('events').store.openCursor();
    while (cursor) {
        // A refused request was never signed, so it is not an event to export.
        if (!cursor.value.metadata?.refused) events.push(cursor.value.event);
        cursor = await cursor.continue();
    }
    events = events.map(e => JSON.stringify(e));
    events = events.join('\n');

    const file = new File([events], 'events.jsonl', {
        type: 'application/octet-stream',
    });

    const blob = new Blob([events], { type: 'plain/text' });

    return blob;
}

/** The newest signed event of `kind` by `pubkey` in history, or null. Never throws. */
export async function newestEventOf(pubkey, kind) {
    try {
        const db = await openEventsDb();
        let best = null;
        let cursor = await db.transaction('events').store.index('pubkey').openCursor(String(pubkey).toLowerCase());
        while (cursor) {
            const e = cursor.value.event;
            if (e?.kind === kind && !cursor.value.metadata?.refused && (!best || e.created_at > best.created_at)) best = e;
            cursor = await cursor.continue();
        }
        return best;
    } catch (_) {
        return null;
    }
}

/** id -> kind for the ids found in history (at most 200 looked up). Never throws. */
export async function eventKindsById(ids) {
    const out = new Map();
    try {
        const db = await openEventsDb();
        for (const id of ids.slice(0, 200)) {
            const entry = await db.get('events', id);
            if (entry && !entry.metadata?.refused && Number.isInteger(entry.event?.kind)) out.set(id, entry.event.kind);
        }
    } catch (_) { /* no history to name kinds from */ }
    return out;
}
