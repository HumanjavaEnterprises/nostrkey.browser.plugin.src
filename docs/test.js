// State
let userPubkey = null;
let nip44Ciphertext = null;
let nip04Ciphertext = null;

// Detect extension
function checkExtension() {
    const el = document.getElementById('status');
    if (window.nostr) {
        el.className = 'status detected';
        el.innerHTML = '<span class="status-dot"></span><span>Extension detected</span>';
    } else {
        el.className = 'status not-detected';
        el.innerHTML = '<span class="status-dot"></span><span>Not detected — <a href="index.html" style="color:inherit;text-decoration:underline">install NostrKey</a></span>';
    }
}

checkExtension();
setTimeout(checkExtension, 500);

// Hex to bech32 npub (minimal implementation)
function hexToNpub(hex) {
    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    function bech32Polymod(values) {
        const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
        let chk = 1;
        for (const v of values) {
            const b = chk >> 25;
            chk = ((chk & 0x1ffffff) << 5) ^ v;
            for (let i = 0; i < 5; i++) {
                if ((b >> i) & 1) chk ^= GEN[i];
            }
        }
        return chk;
    }
    function hrpExpand(hrp) {
        const ret = [];
        for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
        ret.push(0);
        for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
        return ret;
    }
    function createChecksum(hrp, data) {
        const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
        const polymod = bech32Polymod(values) ^ 1;
        const ret = [];
        for (let i = 0; i < 6; i++) ret.push((polymod >> (5 * (5 - i))) & 31);
        return ret;
    }
    function convertBits(data, fromBits, toBits) {
        let acc = 0, bits = 0;
        const ret = [];
        const maxv = (1 << toBits) - 1;
        for (const value of data) {
            acc = (acc << fromBits) | value;
            bits += fromBits;
            while (bits >= toBits) {
                bits -= toBits;
                ret.push((acc >> bits) & maxv);
            }
        }
        if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
        return ret;
    }
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
    const words = convertBits(bytes, 8, 5);
    const checksum = createChecksum('npub', words);
    return 'npub1' + words.concat(checksum).map(function(d) { return CHARSET[d]; }).join('');
}

// Test runners
const tests = {
    getPublicKey: async function() {
        const pk = await window.nostr.getPublicKey();
        userPubkey = pk;
        return { pubkey: pk, npub: hexToNpub(pk) };
    },

    getRelays: async function() {
        const relays = await window.nostr.getRelays();
        return relays;
    },

    signEvent: async function() {
        const event = {
            kind: 1,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: 'NostrKey test event \u2014 ' + new Date().toISOString()
        };
        const signed = await window.nostr.signEvent(event);
        return signed;
    },

    nip44Encrypt: async function() {
        if (!userPubkey) userPubkey = await window.nostr.getPublicKey();
        const plaintext = 'Hello from NostrKey NIP-44 test!';
        const ct = await window.nostr.nip44.encrypt(userPubkey, plaintext);
        nip44Ciphertext = ct;
        return { plaintext: plaintext, ciphertext: ct };
    },

    nip44Decrypt: async function() {
        if (!userPubkey) userPubkey = await window.nostr.getPublicKey();
        if (!nip44Ciphertext) {
            return { error: 'Run NIP-44 Encrypt first to generate ciphertext' };
        }
        const pt = await window.nostr.nip44.decrypt(userPubkey, nip44Ciphertext);
        return { decrypted: pt, matches: pt === 'Hello from NostrKey NIP-44 test!' };
    },

    nip04Encrypt: async function() {
        if (!userPubkey) userPubkey = await window.nostr.getPublicKey();
        const plaintext = 'Hello from NostrKey NIP-04 test!';
        const ct = await window.nostr.nip04.encrypt(userPubkey, plaintext);
        nip04Ciphertext = ct;
        return { plaintext: plaintext, ciphertext: ct };
    },

    nip04Decrypt: async function() {
        if (!userPubkey) userPubkey = await window.nostr.getPublicKey();
        if (!nip04Ciphertext) {
            return { error: 'Run NIP-04 Encrypt first to generate ciphertext' };
        }
        const pt = await window.nostr.nip04.decrypt(userPubkey, nip04Ciphertext);
        return { decrypted: pt, matches: pt === 'Hello from NostrKey NIP-04 test!' };
    }
};

var methodLabels = {
    getPublicKey: 'getPublicKey()',
    getRelays: 'getRelays()',
    signEvent: 'signEvent()',
    nip44Encrypt: 'nip44.encrypt()',
    nip44Decrypt: 'nip44.decrypt()',
    nip04Encrypt: 'nip04.encrypt()',
    nip04Decrypt: 'nip04.decrypt()'
};

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addResult(method, status, data) {
    var container = document.getElementById('results');
    var empty = container.querySelector('.empty-state');
    if (empty) empty.remove();

    var card = document.createElement('div');
    card.className = 'result-card';
    card.id = 'result-' + method;

    var badgeClass = status === 'success' ? 'success' : status === 'error' ? 'error' : 'pending';
    var badgeText = status === 'success' ? 'OK' : status === 'error' ? 'Error' : 'Pending';

    var body;
    if (typeof data === 'string') {
        body = data;
    } else {
        body = JSON.stringify(data, null, 2);
    }

    card.innerHTML =
        '<div class="result-card-header">' +
            '<span class="result-method">' + methodLabels[method] + '</span>' +
            '<span class="result-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '</div>' +
        '<div class="result-body">' + escapeHtml(body) + '</div>' +
        '<div class="result-footer">' + new Date().toLocaleTimeString() + '</div>';

    var existing = container.querySelector('#result-' + method);
    if (existing) {
        existing.replaceWith(card);
    } else {
        container.prepend(card);
    }
}

async function runTest(name) {
    if (!window.nostr) {
        addResult(name, 'error', 'window.nostr not available \u2014 is the extension installed?');
        return;
    }

    addResult(name, 'pending', 'Waiting for extension\u2026');

    try {
        var result = await tests[name]();
        addResult(name, 'success', result);
    } catch (err) {
        addResult(name, 'error', err.message || String(err));
    }
}

async function fireAll() {
    if (!window.nostr) {
        addResult('getPublicKey', 'error', 'window.nostr not available \u2014 is the extension installed?');
        return;
    }

    var btn = document.getElementById('btn-fire-all');
    btn.disabled = true;
    btn.textContent = 'Running\u2026';

    // Step 1: get pubkey (needed by encrypt/decrypt calls)
    await runTest('getPublicKey');

    // Step 2: fire relays + sign + both encrypts in parallel → triggers queue counter
    await Promise.all([
        runTest('getRelays'),
        runTest('signEvent'),
        runTest('nip44Encrypt'),
        runTest('nip04Encrypt')
    ]);

    // Step 3: both decrypts in parallel (need ciphertext from step 2)
    await Promise.all([
        runTest('nip44Decrypt'),
        runTest('nip04Decrypt')
    ]);

    btn.disabled = false;
    btn.innerHTML = '\u26A1 Fire All \u2014 Test Every Method';
}

function clearResults() {
    var container = document.getElementById('results');
    container.innerHTML = '<div class="empty-state">Click a button above to test a window.nostr method</div>';
    nip44Ciphertext = null;
    nip04Ciphertext = null;
}

// Wire up buttons via addEventListener (no inline onclick)
document.getElementById('btn-getPublicKey').addEventListener('click', function() { runTest('getPublicKey'); });
document.getElementById('btn-getRelays').addEventListener('click', function() { runTest('getRelays'); });
document.getElementById('btn-signEvent').addEventListener('click', function() { runTest('signEvent'); });
document.getElementById('btn-nip44Encrypt').addEventListener('click', function() { runTest('nip44Encrypt'); });
document.getElementById('btn-nip44Decrypt').addEventListener('click', function() { runTest('nip44Decrypt'); });
document.getElementById('btn-nip04Encrypt').addEventListener('click', function() { runTest('nip04Encrypt'); });
document.getElementById('btn-nip04Decrypt').addEventListener('click', function() { runTest('nip04Decrypt'); });
document.getElementById('btn-fire-all').addEventListener('click', fireAll);
document.getElementById('btn-clear').addEventListener('click', clearResults);
