import { api } from '../utilities/browser-polyfill';

const FEATURES = [
    [
        'none',
        'NIP-XX: None',
        'Reserved for the future use.',
    ],
];

let features = [];

function renderFeatures() {
    const container = document.getElementById('features-container');
    if (!container) return;

    container.innerHTML = features.map(([name, active, shortDesc, longDesc]) => `
        <div class="mt-4">
            <input
                class="checkbox"
                type="checkbox"
                id="${name}"
                ${active ? 'checked' : ''}
                data-feature="${name}"
            />
            <label for="${name}" class="font-bold">${shortDesc}</label>
            <p class="italic">${longDesc}</p>
        </div>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const feature = e.target.dataset.feature;
            const active = e.target.checked;
            console.log(feature, active);
            await api.storage.local.set({ [feature]: active });
            await reloadFeatures();
        });
    });
}

async function reloadFeatures() {
    features = await Promise.all(
        FEATURES.map(async ([name, shortDesc, longDesc]) => {
            const key = `feature:${name}`;
            let active = await api.storage.local.get({ [key]: false });
            active = active[key];
            return [key, active, shortDesc, longDesc];
        })
    );
    renderFeatures();
}

async function init() {
    await reloadFeatures();
    console.log(features);
}

document.addEventListener('DOMContentLoaded', init);

document.getElementById('close-btn')?.addEventListener('click', () => {
    window.close();
});
