import Alpine from 'alpinejs';
import { KINDS } from '../utilities/utils';
import { api } from '../utilities/browser-polyfill';

const storage = api.storage.local;

window.addEventListener('beforeunload', () => {
    api.runtime.sendMessage({ kind: 'closePrompt' });
    return true;
});

Alpine.data('permission', () => ({
    host: '',
    permission: '',
    key: '',
    event: '',
    remember: false,

    async init() {
        let qs = new URLSearchParams(location.search);
        console.log(location.search);
        this.host = qs.get('host');
        this.permission = qs.get('kind');
        this.key = qs.get('uuid');
        this.event = JSON.parse(qs.get('payload'));
    },

    async allow() {
        console.log('allowing');
        await api.runtime.sendMessage({
            kind: 'allowed',
            payload: this.key,
            origKind: this.permission,
            event: this.event,
            remember: this.remember,
            host: this.host,
        });
        console.log('closing');
        await this.close();
    },

    async deny() {
        await api.runtime.sendMessage({
            kind: 'denied',
            payload: this.key,
            origKind: this.permission,
            event: this.event,
            remember: this.remember,
            host: this.host,
        });
        await this.close();
    },

    async close() {
        let tab = await api.tabs.getCurrent();
        console.log('closing current tab: ', tab.id);
        await api.tabs.update(tab.openerTabId, { active: true });
        window.close();
    },

    async openNip() {
        await api.tabs.create({ url: this.eventInfo.nip, active: true });
    },

    get humanPermission() {
        switch (this.permission) {
            case 'getPubKey':
                return 'Read public key';
            case 'signEvent':
                return 'Sign event';
            case 'getRelays':
                return 'Read relay list';
            case 'nip04.encrypt':
                return 'Encrypt private message (NIP-04)';
            case 'nip04.decrypt':
                return 'Decrypt private message (NIP-04)';
            case 'nip44.encrypt':
                return 'Encrypt private message (NIP-44)';
            case 'nip44.decrypt':
                return 'Decrypt private message (NIP-44)';
            default:
                break;
        }
    },

    get humanEvent() {
        return JSON.stringify(this.event, null, 2);
    },

    get isSigningEvent() {
        return this.permission === 'signEvent';
    },

    get eventInfo() {
        if (!this.isSigningEvent) {
            return {};
        }

        let [kind, desc, nip] = KINDS.find(([kind, desc, nip]) => {
            return kind === this.event.kind;
        }) || ['Unknown', 'Unknown', 'https://github.com/nostr-protocol/nips'];

        return { kind, desc, nip };
    },
}));

Alpine.start();
