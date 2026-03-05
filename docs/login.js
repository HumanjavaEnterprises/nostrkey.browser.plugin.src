/**
 * LoginWithNostr — Drop-in "Login with Nostr" button for any website.
 *
 * Usage:
 *   <script src="https://nostrkey.com/login.js"></script>
 *   <div id="nostr-login"></div>
 *
 * Or with custom options:
 *   <div id="nostr-login"
 *        data-relay="wss://relay.example.com"
 *        data-theme="dark"
 *        data-size="large">
 *   </div>
 *
 * Events:
 *   document.addEventListener('nostr:login', function(e) {
 *       console.log('Logged in:', e.detail.pubkey);
 *   });
 *
 *   document.addEventListener('nostr:logout', function(e) {
 *       console.log('Logged out');
 *   });
 */
(function () {
    'use strict';

    var INSTALL_URL = 'https://nostrkey.com/onboard';
    var CHECK_INTERVAL = 2000;
    var CHECK_TIMEOUT = 120000;

    // --- Styles ---
    var STYLES = {
        dark: {
            bg: '#3e3d32',
            bgHover: '#4a4940',
            text: '#f8f8f2',
            accent: '#a6e22e',
            border: 'none',
        },
        light: {
            bg: '#ffffff',
            bgHover: '#f5f5f5',
            text: '#1a1a1a',
            accent: '#5a8a10',
            border: '1px solid #e0e0e0',
        },
    };

    function injectStyles() {
        if (document.getElementById('nostr-login-styles')) return;
        var style = document.createElement('style');
        style.id = 'nostr-login-styles';
        style.textContent = [
            '.nostr-login-btn {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 10px;',
            '  padding: 12px 24px;',
            '  border-radius: 10px;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
            '  font-size: 15px;',
            '  font-weight: 600;',
            '  cursor: pointer;',
            '  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;',
            '  text-decoration: none;',
            '  line-height: 1;',
            '}',
            '.nostr-login-btn:hover {',
            '  transform: translateY(-1px);',
            '  box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
            '}',
            '.nostr-login-btn:active {',
            '  transform: translateY(0);',
            '}',
            '.nostr-login-btn.large {',
            '  padding: 16px 32px;',
            '  font-size: 17px;',
            '}',
            '.nostr-login-btn.small {',
            '  padding: 8px 16px;',
            '  font-size: 13px;',
            '}',
            '.nostr-login-icon {',
            '  width: 20px;',
            '  height: 20px;',
            '  flex-shrink: 0;',
            '}',
            '.nostr-login-btn.large .nostr-login-icon {',
            '  width: 24px;',
            '  height: 24px;',
            '}',
            '.nostr-login-status {',
            '  font-size: 13px;',
            '  margin-top: 8px;',
            '  opacity: 0.7;',
            '}',
        ].join('\n');
        document.head.appendChild(style);
    }

    var NOSTR_ICON = '<svg class="nostr-login-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>' +
        '<path d="M35 50L45 60L65 40" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '</svg>';

    // --- Core ---
    function hasNostr() {
        return typeof window.nostr !== 'undefined' && typeof window.nostr.getPublicKey === 'function';
    }

    function createButton(container) {
        var theme = container.getAttribute('data-theme') || 'dark';
        var size = container.getAttribute('data-size') || '';
        var relay = container.getAttribute('data-relay') || '';
        var colors = STYLES[theme] || STYLES.dark;

        var btn = document.createElement('button');
        btn.className = 'nostr-login-btn' + (size ? ' ' + size : '');
        btn.style.background = colors.bg;
        btn.style.color = colors.text;
        btn.style.border = colors.border;
        btn.innerHTML = NOSTR_ICON + '<span>Login with Nostr</span>';

        btn.addEventListener('mouseover', function () { btn.style.background = colors.bgHover; });
        btn.addEventListener('mouseout', function () { btn.style.background = colors.bg; });

        btn.addEventListener('click', function () {
            if (!hasNostr()) {
                // Extension not installed — redirect to onboarding
                var onboardUrl = INSTALL_URL;
                if (relay) {
                    onboardUrl += '?relay=' + encodeURIComponent(relay) +
                        '&ref=' + encodeURIComponent(window.location.hostname);
                }
                window.open(onboardUrl, '_blank');

                // Start polling for extension install
                var status = container.querySelector('.nostr-login-status');
                if (!status) {
                    status = document.createElement('div');
                    status.className = 'nostr-login-status';
                    status.style.color = colors.text;
                    container.appendChild(status);
                }
                status.textContent = 'Install NostrKey, then come back here...';

                var start = Date.now();
                var poll = setInterval(function () {
                    if (hasNostr()) {
                        clearInterval(poll);
                        status.textContent = '';
                        doLogin(container, relay);
                    } else if (Date.now() - start > CHECK_TIMEOUT) {
                        clearInterval(poll);
                        status.textContent = 'Timed out. Refresh and try again.';
                    }
                }, CHECK_INTERVAL);
                return;
            }
            doLogin(container, relay);
        });

        container.appendChild(btn);
    }

    function doLogin(container, relay) {
        window.nostr.getPublicKey().then(function (pubkey) {
            // Add relay if specified
            if (relay && window.nostr.addRelay) {
                window.nostr.addRelay(relay).catch(function () {});
            }

            // Dispatch login event
            var event = new CustomEvent('nostr:login', {
                detail: { pubkey: pubkey },
                bubbles: true,
            });
            document.dispatchEvent(event);
            container.dispatchEvent(event);

            // Update button to show logged-in state
            var btn = container.querySelector('.nostr-login-btn');
            if (btn) {
                btn.innerHTML = NOSTR_ICON +
                    '<span>' + pubkey.slice(0, 8) + '...' + pubkey.slice(-4) + '</span>';
                btn.style.opacity = '0.8';
                btn.style.cursor = 'default';
            }
        }).catch(function (err) {
            var status = container.querySelector('.nostr-login-status');
            if (!status) {
                status = document.createElement('div');
                status.className = 'nostr-login-status';
                container.appendChild(status);
            }
            status.textContent = 'Login cancelled or denied.';
            setTimeout(function () { status.textContent = ''; }, 3000);
        });
    }

    // --- Init ---
    function init() {
        injectStyles();
        var containers = document.querySelectorAll('[id="nostr-login"], [data-nostr-login]');
        for (var i = 0; i < containers.length; i++) {
            createButton(containers[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
