/* hero-signing.js — concept wiring for the signing-approval readout.
   MV3-CSP style: external file, addEventListener only, no inline handlers. */
(function () {
    'use strict';

    /* Raw-JSON disclosure toggles */
    document.querySelectorAll('.json-toggle').forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            var body = document.getElementById(toggle.getAttribute('aria-controls'));
            toggle.setAttribute('aria-expanded', String(!expanded));
            if (body) body.hidden = expanded;
        });
    });

    /* Patch points: default-deny toggles (aria-pressed) */
    document.querySelectorAll('[data-patch]').forEach(function (patch) {
        patch.addEventListener('click', function () {
            var pressed = patch.getAttribute('aria-pressed') === 'true';
            patch.setAttribute('aria-pressed', String(!pressed));
        });
    });

    /* Approve / Deny — concept no-ops that show the live state moving */
    document.querySelectorAll('[data-approve]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var rack = btn.closest('.rack');
            if (rack) rack.classList.add('is-live', 'is-live--pulse');
        });
    });

    document.querySelectorAll('[data-deny]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var rack = btn.closest('.rack');
            if (rack) rack.classList.remove('is-live', 'is-live--pulse');
        });
    });
})();
