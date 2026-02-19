import Alpine from 'alpinejs';
import {
    clearData,
    deleteProfile,
    getProfileIndex,
    getProfileNames,
    getProfile,
    getRelays,
    initialize,
    newProfile,
    newBunkerProfile,
    savePrivateKey,
    saveProfileName,
    saveRelays,
    RECOMMENDED_RELAYS,
    getPermissions,
    setPermission,
    KINDS,
    humanPermission,
    validateKey,
    isNcryptsec,
} from './utilities/utils';
import { api } from './utilities/browser-polyfill';
import QRCode from 'qrcode';

const log = console.log;

function go(url) {
    api.tabs.update({ url: api.runtime.getURL(url) });
}

Alpine.data('options', () => ({
    profileNames: ['---'],
    profileIndex: 0,
    profileName: '',
    pristineProfileName: '',
    privKey: '',
    pristinePrivKey: '',
    pubKey: '',
    relays: [],
    newRelay: '',
    urlError: '',
    recommendedRelay: '',
    permissions: {},
    host: '',
    permHosts: [],
    hostPerms: [],
    visible: false,
    copied: false,
    setPermission,
    go,

    // QR state
    npubQrDataUrl: '',
    nsecQrDataUrl: '',
    showNsecQr: false,

    // ncryptsec state
    ncryptsecPassword: '',
    ncryptsecError: '',
    ncryptsecLoading: false,
    ncryptsecExportPassword: '',
    ncryptsecExportConfirm: '',
    ncryptsecExportResult: '',
    ncryptsecExportError: '',
    ncryptsecExportLoading: false,
    ncryptsecExportCopied: false,

    // Bunker state
    profileType: 'local',
    bunkerUrl: '',
    bunkerConnected: false,
    bunkerError: '',
    bunkerConnecting: false,
    bunkerPubkey: '',

    // Protocol handler
    protocolHandler: '',

    // Security state
    hasPassword: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    removePasswordInput: '',
    securityError: '',
    securitySuccess: '',
    removeError: '',

    async init(watch = true) {
        log('Initialize backend.');
        await initialize();

        // Check encryption state
        this.hasPassword = await api.runtime.sendMessage({ kind: 'isEncrypted' });

        // Load protocol handler
        const { protocol_handler } = await api.storage.local.get(['protocol_handler']);
        this.protocolHandler = protocol_handler || '';

        if (watch) {
            this.$watch('profileIndex', async () => {
                await this.refreshProfile();
                this.host = '';
            });

            this.$watch('host', () => {
                this.calcHostPerms();
            });

            this.$watch('recommendedRelay', async () => {
                if (this.recommendedRelay.length == 0) return;
                await this.addRelay(this.recommendedRelay);
                this.recommendedRelay = '';
            });
        }

        // We need to refresh the names BEFORE setting the profile index, or it won't work
        // on init to set the correct profile.
        await this.getProfileNames();
        await this.getProfileIndex();
        this.setProfileIndexFromSearch();
        await this.refreshProfile();
    },

    async refreshProfile() {
        await this.getProfileNames();
        await this.getProfileName();
        await this.loadProfileType();

        // Reset QR and ncryptsec state on profile switch
        this.npubQrDataUrl = '';
        this.nsecQrDataUrl = '';
        this.showNsecQr = false;
        this.ncryptsecExportResult = '';
        this.ncryptsecExportError = '';
        this.ncryptsecExportPassword = '';
        this.ncryptsecExportConfirm = '';

        if (this.isLocalProfile) {
            await this.getNsec();
            await this.getNpub();
            await this.generateNpubQr();
        } else {
            this.privKey = '';
            this.pristinePrivKey = '';
            await this.loadBunkerState();
        }

        await this.getRelays();
        await this.getPermissions();
    },

    // Profile functions

    setProfileIndexFromSearch() {
        let p = new URLSearchParams(window.location.search);
        let index = p.get('index');
        if (!index) {
            return;
        }
        this.profileIndex = parseInt(index);
    },

    async getProfileNames() {
        this.profileNames = await getProfileNames();
    },

    async getProfileName() {
        let names = await getProfileNames();
        let name = names[this.profileIndex];
        this.profileName = name;
        this.pristineProfileName = name;
    },

    async getProfileIndex() {
        this.profileIndex = await getProfileIndex();
    },

    async newProfile() {
        let newIndex = await newProfile();
        await this.getProfileNames();
        this.profileIndex = newIndex;
    },

    async newBunkerProfile() {
        let newIndex = await newBunkerProfile();
        await this.getProfileNames();
        this.profileIndex = newIndex;
    },

    async deleteProfile() {
        if (
            confirm(
                'This will delete this profile and all associated data. Are you sure you wish to continue?'
            )
        ) {
            // Disconnect bunker session if this is a bunker profile
            if (this.isBunkerProfile) {
                await api.runtime.sendMessage({
                    kind: 'bunker.disconnect',
                    payload: this.profileIndex,
                });
            }
            await deleteProfile(this.profileIndex);
            await this.init(false);
        }
    },

    async copyPubKey() {
        await navigator.clipboard.writeText(this.pubKey);
        this.copied = true;
        setTimeout(() => {
            this.copied = false;
        }, 1500);
    },

    // Key functions

    async saveProfile() {
        if (!this.needsSave) return;

        if (this.isLocalProfile) {
            console.log('saving private key');
            await savePrivateKey(this.profileIndex, this.privKey);
        }
        console.log('saving profile name');
        await saveProfileName(this.profileIndex, this.profileName);
        console.log('getting profile name');
        await this.getProfileNames();
        console.log('refreshing profile');
        await this.refreshProfile();
    },

    async getNpub() {
        this.pubKey = await api.runtime.sendMessage({
            kind: 'getNpub',
            payload: this.profileIndex,
        });
    },

    async getNsec() {
        this.privKey = await api.runtime.sendMessage({
            kind: 'getNsec',
            payload: this.profileIndex,
        });
        this.pristinePrivKey = this.privKey;
    },

    // Relay functions

    async getRelays() {
        this.relays = await getRelays(this.profileIndex);
    },

    async saveRelays() {
        await saveRelays(this.profileIndex, this.relays);
        await this.getRelays();
    },

    async addRelay(relayToAdd = null) {
        let newRelay = relayToAdd || this.newRelay;
        try {
            let url = new URL(newRelay);
            if (url.protocol !== 'wss:') {
                this.setUrlError('Must be a websocket url');
                return;
            }
            let urls = this.relays.map(v => v.url);
            if (urls.includes(url.href)) {
                this.setUrlError('URL already exists');
                return;
            }
            this.relays.push({ url: url.href, read: true, write: true });
            await this.saveRelays();
            this.newRelay = '';
        } catch (error) {
            this.setUrlError('Invalid websocket URL');
        }
    },

    async deleteRelay(index) {
        this.relays.splice(index, 1);
        await this.saveRelays();
    },

    setUrlError(message) {
        this.urlError = message;
        setTimeout(() => {
            this.urlError = '';
        }, 3000);
    },

    // Permissions

    async getPermissions() {
        this.permissions = await getPermissions(this.profileIndex);

        // Set the convenience variables
        this.calcPermHosts();
        this.calcHostPerms();
    },

    calcPermHosts() {
        let hosts = Object.keys(this.permissions);
        hosts.sort();
        this.permHosts = hosts;
    },

    calcHostPerms() {
        let hp = this.permissions[this.host] || {};
        let keys = Object.keys(hp);
        keys.sort();
        this.hostPerms = keys.map(k => [k, humanPermission(k), hp[k]]);
        console.log(this.hostPerms);
    },

    permTypes(hostPerms) {
        let k = Object.keys(hostPerms);
        k = Object.keys.sort();
        k = k.map(p => {
            let e = [p, hostPerms[p]];
            if (p.startsWith('signEvent')) {
                let n = parseInt(p.split(':')[1]);
                let name =
                    KINDS.find(kind => kind[0] === n) || `Unknown (Kind ${n})`;
                e = [name, hostPerms[p]];
            }
            return e;
        });
        return k;
    },

    // Security functions

    async setMasterPassword() {
        this.securityError = '';
        this.securitySuccess = '';

        if (this.newPassword.length < 8) {
            this.securityError = 'Password must be at least 8 characters.';
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.securityError = 'Passwords do not match.';
            return;
        }

        const result = await api.runtime.sendMessage({
            kind: 'setPassword',
            payload: this.newPassword,
        });
        if (result.success) {
            this.hasPassword = true;
            this.newPassword = '';
            this.confirmPassword = '';
            this.securitySuccess = 'Master password set. Your keys are now encrypted at rest.';
            setTimeout(() => { this.securitySuccess = ''; }, 5000);
        } else {
            this.securityError = result.error || 'Failed to set password.';
        }
    },

    async changeMasterPassword() {
        this.securityError = '';
        this.securitySuccess = '';

        if (!this.currentPassword) {
            this.securityError = 'Please enter your current password.';
            return;
        }
        if (this.newPassword.length < 8) {
            this.securityError = 'New password must be at least 8 characters.';
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.securityError = 'New passwords do not match.';
            return;
        }

        const result = await api.runtime.sendMessage({
            kind: 'changePassword',
            payload: {
                oldPassword: this.currentPassword,
                newPassword: this.newPassword,
            },
        });
        if (result.success) {
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.securitySuccess = 'Master password changed successfully.';
            setTimeout(() => { this.securitySuccess = ''; }, 5000);
        } else {
            this.securityError = result.error || 'Failed to change password.';
        }
    },

    async removeMasterPassword() {
        this.removeError = '';

        if (!this.removePasswordInput) {
            this.removeError = 'Please enter your current password.';
            return;
        }
        if (
            !confirm(
                'This will remove encryption from your private keys. They will be stored as plaintext. Are you sure?'
            )
        ) {
            return;
        }

        const result = await api.runtime.sendMessage({
            kind: 'removePassword',
            payload: this.removePasswordInput,
        });
        if (result.success) {
            this.hasPassword = false;
            this.removePasswordInput = '';
            this.securitySuccess = 'Master password removed. Keys are now stored unencrypted.';
            setTimeout(() => { this.securitySuccess = ''; }, 5000);
        } else {
            this.removeError = result.error || 'Failed to remove password.';
        }
    },

    // Protocol handler

    async saveProtocolHandler() {
        if (this.protocolHandler) {
            await api.storage.local.set({ protocol_handler: this.protocolHandler });
        } else {
            await api.storage.local.remove('protocol_handler');
        }
    },

    // Bunker functions

    async loadProfileType() {
        this.profileType = await api.runtime.sendMessage({
            kind: 'getProfileType',
            payload: this.profileIndex,
        });
    },

    async loadBunkerState() {
        const profile = await getProfile(this.profileIndex);
        this.bunkerUrl = profile?.bunkerUrl || '';
        this.bunkerPubkey = profile?.remotePubkey || '';
        this.bunkerError = '';

        if (this.bunkerPubkey) {
            this.pubKey = await api.runtime.sendMessage({
                kind: 'npubEncode',
                payload: this.bunkerPubkey,
            });
        } else {
            this.pubKey = '';
        }

        const status = await api.runtime.sendMessage({
            kind: 'bunker.status',
            payload: this.profileIndex,
        });
        this.bunkerConnected = status?.connected || false;
    },

    async connectBunker() {
        this.bunkerError = '';
        this.bunkerConnecting = true;

        try {
            // Validate first
            const validation = await api.runtime.sendMessage({
                kind: 'bunker.validateUrl',
                payload: this.bunkerUrl,
            });
            if (!validation.valid) {
                this.bunkerError = validation.error;
                this.bunkerConnecting = false;
                return;
            }

            const result = await api.runtime.sendMessage({
                kind: 'bunker.connect',
                payload: {
                    profileIndex: this.profileIndex,
                    bunkerUrl: this.bunkerUrl,
                },
            });

            if (result.success) {
                this.bunkerConnected = true;
                this.bunkerPubkey = result.remotePubkey;
                this.pubKey = await api.runtime.sendMessage({
                    kind: 'npubEncode',
                    payload: result.remotePubkey,
                });
            } else {
                this.bunkerError = result.error || 'Failed to connect';
            }
        } catch (e) {
            this.bunkerError = e.message || 'Connection failed';
        }

        this.bunkerConnecting = false;
    },

    async disconnectBunker() {
        this.bunkerError = '';
        const result = await api.runtime.sendMessage({
            kind: 'bunker.disconnect',
            payload: this.profileIndex,
        });
        if (result.success) {
            this.bunkerConnected = false;
        } else {
            this.bunkerError = result.error || 'Failed to disconnect';
        }
    },

    async pingBunker() {
        this.bunkerError = '';
        const result = await api.runtime.sendMessage({
            kind: 'bunker.ping',
            payload: this.profileIndex,
        });
        if (!result.success) {
            this.bunkerError = result.error || 'Ping failed';
            this.bunkerConnected = false;
        }
    },

    // QR code generation

    async generateNpubQr() {
        try {
            if (!this.pubKey) {
                this.npubQrDataUrl = '';
                return;
            }
            this.npubQrDataUrl = await QRCode.toDataURL(this.pubKey.toUpperCase(), {
                width: 200,
                margin: 2,
                color: { dark: '#701a75', light: '#fdf4ff' },
            });
        } catch {
            this.npubQrDataUrl = '';
        }
    },

    async generateNsecQr() {
        try {
            if (!this.visible || !this.privKey) {
                this.nsecQrDataUrl = '';
                return;
            }
            // Get the nsec (may be different from what's in privKey if hex is displayed)
            const nsec = await api.runtime.sendMessage({
                kind: 'getNsec',
                payload: this.profileIndex,
            });
            if (!nsec) {
                this.nsecQrDataUrl = '';
                return;
            }
            this.nsecQrDataUrl = await QRCode.toDataURL(nsec.toUpperCase(), {
                width: 200,
                margin: 2,
                color: { dark: '#991b1b', light: '#fef2f2' },
            });
        } catch {
            this.nsecQrDataUrl = '';
        }
    },

    hideNsecQr() {
        this.showNsecQr = false;
        this.nsecQrDataUrl = '';
    },

    async revealNsecQr() {
        await this.generateNsecQr();
        this.showNsecQr = true;
    },

    // ncryptsec import/export

    get isNcryptsecInput() {
        return isNcryptsec(this.privKey);
    },

    async decryptNcryptsec() {
        this.ncryptsecError = '';
        this.ncryptsecLoading = true;

        try {
            const result = await api.runtime.sendMessage({
                kind: 'ncryptsec.decrypt',
                payload: {
                    ncryptsec: this.privKey,
                    password: this.ncryptsecPassword,
                },
            });

            if (result.success) {
                // Save the decrypted hex key via the normal flow
                await savePrivateKey(this.profileIndex, result.hexKey);
                this.ncryptsecPassword = '';
                await this.refreshProfile();
            } else {
                this.ncryptsecError = result.error || 'Decryption failed. Wrong password?';
            }
        } catch (e) {
            this.ncryptsecError = e.message || 'Decryption failed';
        }

        this.ncryptsecLoading = false;
    },

    async exportNcryptsec() {
        this.ncryptsecExportError = '';
        this.ncryptsecExportResult = '';
        this.ncryptsecExportLoading = true;

        try {
            const result = await api.runtime.sendMessage({
                kind: 'ncryptsec.encrypt',
                payload: {
                    profileIndex: this.profileIndex,
                    password: this.ncryptsecExportPassword,
                },
            });

            if (result.success) {
                this.ncryptsecExportResult = result.ncryptsec;
                this.ncryptsecExportPassword = '';
                this.ncryptsecExportConfirm = '';
            } else {
                this.ncryptsecExportError = result.error || 'Encryption failed';
            }
        } catch (e) {
            this.ncryptsecExportError = e.message || 'Encryption failed';
        }

        this.ncryptsecExportLoading = false;
    },

    async copyNcryptsecExport() {
        await navigator.clipboard.writeText(this.ncryptsecExportResult);
        this.ncryptsecExportCopied = true;
        setTimeout(() => { this.ncryptsecExportCopied = false; }, 1500);
    },

    get canExportNcryptsec() {
        return (
            this.ncryptsecExportPassword.length >= 8 &&
            this.ncryptsecExportPassword === this.ncryptsecExportConfirm
        );
    },

    // General

    async clearData() {
        if (
            confirm(
                'This will remove your private keys and all associated data. Are you sure you wish to continue?'
            )
        ) {
            await clearData();
            await this.init(false);
        }
    },

    async closeOptions() {
        const tab = await api.tabs.getCurrent();
        await api.tabs.remove(tab.id);
    },

    // Properties

    get recommendedRelays() {
        let relays = this.relays.map(r => new URL(r.url)).map(r => r.href);
        return RECOMMENDED_RELAYS.filter(r => !relays.includes(r.href)).map(
            r => r.href
        );
    },

    get hasRelays() {
        return this.relays.length > 0;
    },

    get hasRecommendedRelays() {
        return this.recommendedRelays.length > 0;
    },

    get isBunkerProfile() {
        return this.profileType === 'bunker';
    },

    get isLocalProfile() {
        return this.profileType === 'local';
    },

    get needsSave() {
        if (this.isBunkerProfile) {
            return this.profileName !== this.pristineProfileName;
        }
        return (
            this.privKey !== this.pristinePrivKey ||
            this.profileName !== this.pristineProfileName
        );
    },

    get validKey() {
        if (this.isBunkerProfile) return true;
        return validateKey(this.privKey);
    },

    get validKeyClass() {
        return this.validKey
            ? ''
            : 'ring-2 ring-rose-500 focus:ring-2 focus:ring-rose-500 border-transparent focus:border-transparent';
    },

    get visibilityClass() {
        return this.visible ? 'text' : 'password';
    },

    // Security computed properties

    get securityStatusText() {
        if (!this.hasPassword) {
            return 'No master password set — keys are stored unencrypted.';
        }
        return 'Master password is active — keys are encrypted at rest.';
    },

    get passwordStrength() {
        const pw = this.newPassword;
        if (pw.length === 0) return 0;
        if (pw.length < 8) return 1;
        let score = 2; // meets minimum
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return Math.min(score, 5);
    },

    get newPasswordStrengthText() {
        const labels = ['', 'Too short', 'Weak', 'Fair', 'Strong', 'Very strong'];
        return labels[this.passwordStrength] || '';
    },

    get newPasswordStrengthColor() {
        const colors = [
            '',
            'text-red-500',
            'text-orange-500',
            'text-yellow-600',
            'text-green-600',
            'text-green-700 font-bold',
        ];
        return colors[this.passwordStrength] || '';
    },

    get newPasswordStrengthClass() {
        if (this.newPassword.length === 0) return '';
        if (this.newPassword.length < 8) {
            return 'ring-2 ring-red-500';
        }
        return '';
    },

    get canSetPassword() {
        return (
            this.newPassword.length >= 8 &&
            this.newPassword === this.confirmPassword
        );
    },

    get canChangePassword() {
        return (
            this.currentPassword.length > 0 &&
            this.newPassword.length >= 8 &&
            this.newPassword === this.confirmPassword
        );
    },
}));

Alpine.start();
