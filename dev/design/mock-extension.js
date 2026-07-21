/**
 * mock-extension.js — a fake WebExtension environment for DESIGN & STORE-SHOT capture.
 *
 * The NostrKey UI surfaces (sidepanel, security, profiles, vault, …) draw their
 * content from the live extension: chrome.storage + the background service worker.
 * Served as plain pages they render EMPTY. This shim stands in for that world so the
 * pages render fully populated with a representative identity — for:
 *   1. Figma capture (design source of truth), and
 *   2. App-store screenshots at exact device sizes.
 *
 * How it works: it defines `window.browser` (and `window.chrome`) BEFORE the page's
 * bundle loads. The extension's browser-polyfill prefers `browser`, so every page
 * transparently talks to this in-memory mock instead of a real extension.
 *
 * Load it as a NON-deferred script in <head>, ahead of the page bundle:
 *   <script src="/mock-extension.js"></script>
 *
 * Demo keys are the canonical secp256k1 generator multiples (priv = 1, 2) — public
 * test values, not anyone's real identity. No real secrets here.
 */
(function () {
  var now = Date.now();
  var day = 86400000;

  // Demo identities (priv=1, priv=2 → their real x-only pubkeys). Client code
  // bech32-encodes pubKey → npub, so the npub + QR render correctly.
  var PROFILES = [
    {
      name: 'Alice',
      type: 'local',
      privKey: '0000000000000000000000000000000000000000000000000000000000000001',
      pubKey:  '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      hosts: {
        'https://snort.social': { getPublicKey: 'allow', 'signEvent:1': 'allow', 'nip44.decrypt': 'ask' },
        'https://primal.net':   { getPublicKey: 'allow', 'signEvent:1': 'allow' },
        'https://coracle.social': { getPublicKey: 'ask' }
      },
      relays: [
        { url: 'wss://relay.nostrkeep.app', read: true, write: true },
        { url: 'wss://relay.damus.io', read: true, write: true },
        { url: 'wss://nos.lol', read: true, write: false }
      ],
      relayReminder: false
    },
    {
      name: 'Work',
      type: 'local',
      privKey: '0000000000000000000000000000000000000000000000000000000000000002',
      pubKey:  'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
      hosts: {},
      relays: [
        { url: 'wss://relay.nostrkeep.app', read: true, write: true },
        { url: 'wss://relay.primal.net', read: true, write: true }
      ],
      relayReminder: false
    }
  ];

  var STORE = {
    local: {
      profiles: PROFILES,
      profileIndex: 0,
      isEncrypted: false,
      autoLockMinutes: 15,
      version: '1.7.0',
      platformSyncEnabled: true,
      protocol_handler: 'https://njump.me/{raw}',
      nostrAccessWhileLocked: true,
      blockCrossOriginFrames: true,
      lastBackupAt: now - 3 * day,
      'cloudBackup:enabled': true,
      'cloudBackup:mode': 'folder',
      'cloudBackup:folderName': 'NostrKey',
      'cloudBackup:lastWriteAt': now - 2 * 3600000,
      vaultDocs: {
        'notes/recovery-plan.md': { path: 'notes/recovery-plan.md', title: 'Recovery plan', content: '# Recovery\n\nSeed split across two safes.', updatedAt: now - day },
        'keys/api-notes.md':      { path: 'keys/api-notes.md', title: 'API notes', content: '- rotate quarterly', updatedAt: now - 5 * day }
      },
      apiKeyVault: {
        keys: {
          k1: { id: 'k1', name: 'OpenAI', service: 'openai', secret: '{"salt":"x","iv":"y","ciphertext":"z"}', updatedAt: now - day },
          k2: { id: 'k2', name: 'Anthropic', service: 'anthropic', secret: '{"salt":"x","iv":"y","ciphertext":"z"}', updatedAt: now - 7 * day }
        }
      }
    },
    sync: {}
  };

  function area(ns) {
    return {
      get: function (q) {
        var s = STORE[ns], o = {};
        if (q == null) o = Object.assign({}, s);
        else if (typeof q === 'string') { if (q in s) o[q] = s[q]; }
        else if (Array.isArray(q)) { q.forEach(function (k) { if (k in s) o[k] = s[k]; }); }
        else { Object.keys(q).forEach(function (k) { o[k] = (k in s) ? s[k] : q[k]; }); }
        return Promise.resolve(o);
      },
      set: function (obj) { Object.assign(STORE[ns], obj); return Promise.resolve(); },
      remove: function (k) { (Array.isArray(k) ? k : [k]).forEach(function (x) { delete STORE[ns][x]; }); return Promise.resolve(); },
      clear: function () { STORE[ns] = {}; return Promise.resolve(); }
    };
  }

  // Background service-worker stand-in.
  function router(msg) {
    var k = msg && msg.kind;
    var pl = msg && msg.payload;
    switch (k) {
      case 'isEncrypted': return false;
      case 'isLocked': return false;
      case 'hasEncryptedData': return { found: false, hasPasswordHash: false, encryptedProfiles: 0 };
      case 'resetAutoLock': return true;
      case 'getAutoLockTimeout': return 15;
      case 'getBlockCrossOriginFrames': return true;
      case 'getNostrAccessWhileLocked': return true;
      case 'getProfileType': return PROFILES[pl || 0] ? PROFILES[pl || 0].type : 'local';
      case 'getActiveProfileInfo': return { name: PROFILES[0].name, npub: '', hasKeys: true };
      case 'getNsec': return (PROFILES[pl] && PROFILES[pl].privKey) || PROFILES[0].privKey;
      case 'getNpub': return '';
      case 'npubEncode': return typeof pl === 'string' ? pl : '';
      case 'generatePrivateKey': return '0000000000000000000000000000000000000000000000000000000000000003';
      case 'savePrivateKey': return { success: true };
      case 'backup.export': return { success: true, envelope: { format: 'nostrkey-backup', version: 1, createdAt: new Date(now).toISOString(), extensionVersion: '1.7.0', profileCount: 2, payload: { salt: 'x', iv: 'y', ciphertext: 'z' } } };
      case 'bunker.status': case 'bunkerServer.status': return { active: false, connected: false, running: false };
      case 'vault.getRelays': return [{ url: 'wss://relay.nostrkeep.app' }];
      case 'vault.fetch': return { success: true, docs: STORE.local.vaultDocs };
      case 'apikeys.fetch': return { success: true, keys: STORE.local.apiKeyVault.keys };
      case 'seedPhrase.fromKey': return 'legal winner thank year wave sausage worth useful legal winner thank yellow';
      default: return undefined;
    }
  }

  var noopEvt = { addListener: function () {}, removeListener: function () {}, hasListener: function () { return false; } };
  var mock = {
    storage: { local: area('local'), sync: area('sync'), onChanged: noopEvt },
    runtime: {
      sendMessage: function (msg) { return Promise.resolve(router(msg)); },
      getURL: function (p) { return p; },
      getManifest: function () { return { version: '1.7.0', name: 'NostrKey' }; },
      id: 'nostrkeymockextensionid000000000000',
      onMessage: noopEvt,
      onInstalled: noopEvt,
      connect: function () { return { name: 'mock', postMessage: function () {}, onMessage: noopEvt, onDisconnect: noopEvt }; },
      lastError: null
    },
    tabs: {
      create: function () { return Promise.resolve({ id: 1, windowId: 1 }); },
      get: function () { return Promise.resolve({ id: 1, windowId: 1 }); },
      update: function () { return Promise.resolve({ id: 1 }); },
      query: function () { return Promise.resolve([]); },
      onRemoved: noopEvt
    },
    windows: { update: function () { return Promise.resolve(); } },
    i18n: { getMessage: function (k) { return k; } },
    alarms: { create: function () {}, clear: function () { return Promise.resolve(true); }, onAlarm: noopEvt },
    sidePanel: { open: function () { return Promise.resolve(); }, setOptions: function () { return Promise.resolve(); } }
  };

  window.browser = mock;
  try { Object.defineProperty(window, 'chrome', { value: mock, configurable: true, writable: true }); }
  catch (e) { try { window.chrome = mock; } catch (e2) {} }
})();
