import {
    getProfileNames,
    setProfileIndex,
    getProfileIndex,
    getRelays,
    RECOMMENDED_RELAYS,
    saveRelays,
    initialize,
    relayReminder,
    toggleRelayReminder,
    getNpub,
} from './utilities/utils';
import { api } from './utilities/browser-polyfill';
import Alpine from 'alpinejs';
import QRCode from 'qrcode';
window.Alpine = Alpine;

const log = console.log;

Alpine.data('popup', () => ({
    profileNames: ['Default'],
    profileIndex: 0,
    relayCount: 0,
    showRelayReminder: true,

    // Lock/unlock state
    isLocked: false,
    hasPassword: false,
    unlockPassword: '',
    unlockError: '',

    // QR state
    npubQrDataUrl: '',

    // Bunker state
    profileType: 'local',
    bunkerConnected: false,

    async init() {
        log('Initializing backend.');
        await initialize();

        // Check lock state before loading anything else
        this.hasPassword = await api.runtime.sendMessage({ kind: 'isEncrypted' });
        this.isLocked = await api.runtime.sendMessage({ kind: 'isLocked' });

        if (!this.isLocked) {
            await this.loadUnlockedState();
        }

        this.$watch('profileIndex', async () => {
            if (this.isLocked) return;
            await this.loadNames();
            await this.setProfileIndex();
            await this.loadProfileType();
            await this.countRelays();
            await this.checkRelayReminder();
            await this.generateQr();
        });
    },

    async loadUnlockedState() {
        // Reset auto-lock timer on popup open
        await api.runtime.sendMessage({ kind: 'resetAutoLock' });

        await this.loadNames();
        await this.loadProfileIndex();
        await this.loadProfileType();
        await this.countRelays();
        await this.checkRelayReminder();
        await this.generateQr();
    },

    async doUnlock() {
        this.unlockError = '';
        if (!this.unlockPassword) {
            this.unlockError = 'Please enter your master password.';
            return;
        }
        const result = await api.runtime.sendMessage({
            kind: 'unlock',
            payload: this.unlockPassword,
        });
        if (result.success) {
            this.isLocked = false;
            this.unlockPassword = '';
            await this.loadUnlockedState();
        } else {
            this.unlockError = result.error || 'Invalid password.';
        }
    },

    async doLock() {
        await api.runtime.sendMessage({ kind: 'lock' });
        this.isLocked = true;
    },

    async setProfileIndex() {
        // Because the popup state resets every time it opens, we use null as a guard.
        if (this.profileIndex !== null) {
            await setProfileIndex(this.profileIndex);
        }
    },

    async loadNames() {
        this.profileNames = await getProfileNames();
    },

    async loadProfileIndex() {
        this.profileIndex = await getProfileIndex();
    },

    async loadProfileType() {
        this.profileType = await api.runtime.sendMessage({
            kind: 'getProfileType',
        });
        if (this.profileType === 'bunker') {
            const status = await api.runtime.sendMessage({
                kind: 'bunker.status',
            });
            this.bunkerConnected = status?.connected || false;
        } else {
            this.bunkerConnected = false;
        }
    },

    async openOptions() {
        await api.runtime.openOptionsPage();
        window.close();
    },

    async countRelays() {
        let relays = await getRelays(this.profileIndex);
        this.relayCount = relays.length;
    },

    async checkRelayReminder() {
        this.showRelayReminder = await relayReminder();
    },

    async addRelays() {
        let relays = RECOMMENDED_RELAYS.map(r => ({
            url: r.href,
            read: true,
            write: true,
        }));
        await saveRelays(this.profileIndex, relays);
        await this.countRelays();
    },

    async noThanks() {
        await toggleRelayReminder();
        this.showRelayReminder = false;
    },

    async copyNpub() {
        let npub = await getNpub();
        // Use clipboard directly when available (popup has document context).
        // Falls back to background message for Safari background pages.
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(npub);
        } else {
            await api.runtime.sendMessage({ kind: 'copy', payload: npub });
        }
    },

    async generateQr() {
        try {
            const npub = await getNpub();
            if (!npub) {
                this.npubQrDataUrl = '';
                return;
            }
            this.npubQrDataUrl = await QRCode.toDataURL(npub.toUpperCase(), {
                width: 200,
                margin: 2,
                color: { dark: '#701a75', light: '#fdf4ff' },
            });
        } catch {
            this.npubQrDataUrl = '';
        }
    },
}));

Alpine.start();
