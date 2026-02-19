import Alpine from '@alpinejs/csp';
import { api } from '../utilities/browser-polyfill';

const FEATURES = [
    [
        'none',
        'NIP-XX: None',
        'Reserved for the future use.',
    ],
];

Alpine.data('experimental', () => ({
    features: [],

    async init() {
        await this.reloadFeatures();

        console.log(this.features);
    },

    async reloadFeatures() {
        this.features = await Promise.all(
            FEATURES.map(async ([name, shortDesc, longDesc]) => {
                name = `feature:${name}`;
                let active = await api.storage.local.get({
                    [name]: false,
                });
                active = active[name];
                return [name, active, shortDesc, longDesc];
            })
        );
    },

    async change(feature, active) {
        console.log(feature, active);
        await api.storage.local.set({ [feature]: active });
        await this.reloadFeatures();
    },
}));

Alpine.start();

// Close button handler
document.getElementById('close-btn')?.addEventListener('click', () => {
    window.close();
    chrome.tabs?.getCurrent?.(t => chrome.tabs.remove(t.id));
});
