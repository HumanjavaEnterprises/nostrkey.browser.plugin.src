/**
 * NostrKey — Manage Profiles (full-page)
 * Multi-select, bulk delete, duplicate detection.
 */

import { getProfiles, getProfileNames, getProfileIndex, deleteProfile, getNpub } from '../utilities/utils';
import { api } from '../utilities/browser-polyfill';

const state = {
    profiles: [],       // { index, name, npub, isActive, selected }
    activeIndex: null,
};

function $(id) { return document.getElementById(id); }

async function loadProfiles() {
    const profiles = await getProfiles();
    const names = await getProfileNames();
    const activeIndex = await getProfileIndex();
    state.activeIndex = activeIndex;
    state.profiles = [];

    for (let i = 0; i < profiles.length; i++) {
        let npub = '';
        try {
            npub = await getNpub(i);
        } catch (e) {
            npub = '(unable to read)';
        }
        state.profiles.push({
            index: i,
            name: names[i] || 'Unnamed',
            npub: npub || '',
            isActive: i === activeIndex,
            selected: false,
        });
    }

    render();
}

function render() {
    const list = $('profile-list');
    const countText = $('count-text');
    const warningText = $('warning-text');
    const deleteBtn = $('delete-selected-btn');
    const selectAllBtn = $('select-all-btn');

    if (state.profiles.length === 0) {
        list.innerHTML = '<li style="color:#b0b0a8;padding:20px;text-align:center;">No profiles found.</li>';
        return;
    }

    // Detect duplicates
    const npubCount = {};
    state.profiles.forEach(p => {
        if (p.npub) {
            npubCount[p.npub] = (npubCount[p.npub] || 0) + 1;
        }
    });

    list.innerHTML = state.profiles.map(p => {
        const isDupe = npubCount[p.npub] > 1;
        const truncNpub = p.npub && p.npub.length > 20
            ? p.npub.slice(0, 12) + '...' + p.npub.slice(-8)
            : p.npub;

        return `
            <li class="profile-item ${p.selected ? 'selected' : ''} ${p.isActive ? 'active-profile' : ''}"
                data-index="${p.index}" role="option" aria-selected="${p.selected}">
                <input type="checkbox" class="profile-checkbox" data-index="${p.index}"
                    ${p.selected ? 'checked' : ''} ${p.isActive && state.profiles.length > 1 ? '' : ''}
                    aria-label="Select ${p.name}" />
                <div class="profile-info">
                    <div class="profile-name">
                        ${escapeHtml(p.name)}
                        ${isDupe ? ' <span style="color:#f92672;font-size:0.75rem;">(duplicate)</span>' : ''}
                    </div>
                    <div class="profile-npub">${escapeHtml(truncNpub)}</div>
                </div>
                ${p.isActive ? '<span class="profile-active-badge">Active</span>' : ''}
            </li>
        `;
    }).join('');

    // Bind checkbox events
    list.querySelectorAll('.profile-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            const profile = state.profiles.find(p => p.index === idx);
            if (profile) {
                profile.selected = e.target.checked;
                render();
            }
        });
    });

    // Bind row click to toggle checkbox
    list.querySelectorAll('.profile-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') return; // let checkbox handle itself
            const idx = parseInt(item.dataset.index, 10);
            const profile = state.profiles.find(p => p.index === idx);
            if (profile) {
                profile.selected = !profile.selected;
                render();
            }
        });
    });

    // Update counts
    const selectedCount = state.profiles.filter(p => p.selected).length;
    const totalCount = state.profiles.length;
    countText.textContent = `${totalCount} profile${totalCount !== 1 ? 's' : ''} total`;

    // Warning if trying to delete all or active
    const selectedActive = state.profiles.some(p => p.selected && p.isActive);
    const selectedAll = selectedCount === totalCount;

    warningText.classList.add('hidden');
    if (selectedAll) {
        warningText.textContent = 'You must keep at least one profile. The active profile will be kept.';
        warningText.classList.remove('hidden');
    } else if (selectedActive && selectedCount < totalCount) {
        warningText.textContent = 'Your active profile is selected. A different profile will become active after deletion.';
        warningText.classList.remove('hidden');
    }

    // Update buttons
    deleteBtn.disabled = selectedCount === 0;
    deleteBtn.textContent = `Delete Selected (${selectedCount})`;

    const allSelected = selectedCount === totalCount;
    selectAllBtn.textContent = allSelected ? 'Deselect All' : 'Select All';
}

async function deleteSelected() {
    let toDelete = state.profiles.filter(p => p.selected);

    // Can't delete all — keep the active one
    if (toDelete.length === state.profiles.length) {
        toDelete = toDelete.filter(p => !p.isActive);
    }

    if (toDelete.length === 0) return;

    const count = toDelete.length;
    if (!confirm(`Delete ${count} profile${count !== 1 ? 's' : ''}? This cannot be undone.`)) return;

    // Delete from highest index first so indices don't shift
    const indices = toDelete.map(p => p.index).sort((a, b) => b - a);

    for (const idx of indices) {
        try {
            await deleteProfile(idx);
        } catch (e) {
            console.error(`Failed to delete profile ${idx}:`, e);
        }
    }

    const successText = $('success-text');
    successText.textContent = `Deleted ${count} profile${count !== 1 ? 's' : ''}.`;
    successText.classList.remove('hidden');
    setTimeout(() => successText.classList.add('hidden'), 3000);

    await loadProfiles();
}

function toggleSelectAll() {
    const allSelected = state.profiles.every(p => p.selected);
    state.profiles.forEach(p => { p.selected = !allSelected; });
    render();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfiles();

    $('delete-selected-btn').addEventListener('click', deleteSelected);
    $('select-all-btn').addEventListener('click', toggleSelectAll);
});
