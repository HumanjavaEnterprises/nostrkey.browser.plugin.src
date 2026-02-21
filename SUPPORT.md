# NostrKey Browser Support

NostrKey is available for multiple browsers. Choose your browser below for installation and usage instructions.

---

## 🌐 Chrome / Chromium-based Browsers

**Supported Browsers:** Chrome, Edge, Brave, Opera, Vivaldi, Arc

### Installation from Chrome Web Store
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (link coming soon)
2. Click **Add to Chrome**
3. Click **Add extension** in the confirmation dialog
4. The NostrKey icon will appear in your browser toolbar

### Manual Installation (Developer Mode)
1. Download the latest release from [Releases](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/releases)
2. Extract the ZIP file
3. Open your browser and navigate to:
   - **Chrome:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
   - **Brave:** `brave://extensions/`
   - **Opera:** `opera://extensions/`
4. Enable **Developer mode** (toggle in top-right corner)
5. Click **Load unpacked**
6. Select the extracted `chrome` folder
7. The extension is now installed

### Usage
- Click the NostrKey icon in your toolbar to open the popup
- Visit any Nostr web app (e.g., Snort, Primal, Coracle)
- The app will request permission to use your key
- Grant or deny permissions as needed

### Troubleshooting
**Extension not appearing:**
- Ensure Developer mode is enabled
- Check that you selected the correct folder (should contain `manifest.json`)
- Try restarting your browser

**Permission requests not showing:**
- Check that the extension is enabled in `chrome://extensions/`
- Verify the website supports NIP-07
- Check browser console for errors

---

## 🧭 Safari (macOS & iOS)

**Supported Platforms:** macOS 11+, iOS 15+

### Installation from App Store
*Coming soon to the Mac App Store*

### Manual Installation (macOS)
1. Download the latest release from [Releases](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/releases)
2. Open the `.dmg` file
3. Drag NostrKey to your Applications folder
4. Open NostrKey from Applications
5. In Safari, go to **Safari → Settings → Extensions**
6. Enable **NostrKey**
7. Grant necessary permissions

### Manual Installation (iOS)
1. Install via TestFlight (link coming soon)
2. Open **Settings → Safari → Extensions**
3. Enable **NostrKey**
4. Grant necessary permissions

### Usage
- **macOS:** Click the NostrKey icon in Safari's toolbar
- **iOS:** Tap the share button, then tap NostrKey
- Visit any Nostr web app
- Approve permission requests as they appear

### Troubleshooting
**Extension not showing in Safari:**
- Check Safari → Settings → Extensions
- Ensure NostrKey is checked/enabled
- Try quitting and reopening Safari

**iOS extension not appearing:**
- Go to Settings → Safari → Extensions
- Make sure NostrKey is toggled on
- Restart Safari

---

## 🦊 Firefox

**Status:** Planned for future release

Firefox support is on our roadmap. Follow our [GitHub repository](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src) for updates.

---

## ⚙️ Getting Started

### First-Time Setup
1. **Create a Profile:**
   - Click the NostrKey icon
   - Click **Settings** or **Full Settings**
   - Click **New Local** to create a local profile, or **New Bunker** for remote signing

2. **Add Your Key:**
   - **Local Profile:** Paste your `nsec` or hex private key
   - **Bunker Profile:** Paste your `bunker://` connection URL
   - Click **Save**

3. **Configure Relays:**
   - Scroll to the **Relays** section
   - Add your preferred relays (or use recommended ones)
   - Set read/write permissions for each

4. **Set Permissions:**
   - Visit a Nostr web app
   - When prompted, choose **Allow**, **Deny**, or **Ask** for each permission
   - Permissions are saved per-app and can be changed in Settings

### Security Best Practices
- ✅ **Enable Master Password:** Encrypt your keys at rest
- ✅ **Backup Your Keys:** Export and securely store your `nsec`
- ✅ **Use Bunker for High Security:** Keep keys off your device entirely
- ✅ **Review Permissions Regularly:** Check which apps have access
- ⚠️ **Never Share Your Private Key:** NostrKey will never ask for it outside the extension

---

## 🆘 Common Issues

### "Extension cannot access this page"
Some browsers restrict extensions on certain pages (like `chrome://` or `about:` pages). This is normal browser security.

### "Failed to connect to relay"
- Check your internet connection
- Verify the relay URL is correct (must start with `wss://`)
- Try a different relay from the recommended list

### "Invalid key format"
- Ensure you're pasting a valid `nsec` (starts with `nsec1`) or hex key
- Remove any extra spaces or line breaks
- For encrypted keys, use the ncryptsec import feature

### Keys not syncing between devices
- NostrKey stores keys locally in each browser
- To use the same key on multiple devices, manually import it on each
- Or use nsecBunker for centralized key management

---

## 📞 Support & Community

- **Issues & Bug Reports:** [GitHub Issues](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/discussions)
- **Documentation:** [docs/](https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src/tree/main/docs)
- **Website:** [humanjava.com](https://humanjava.com)

---

## 🔒 Privacy & Security

NostrKey is committed to your privacy:
- ✅ All keys stored locally in your browser
- ✅ No data sent to external servers (except relays you configure)
- ✅ Open source and auditable
- ✅ Optional master password encryption
- ✅ No tracking or analytics

For full details, see our [Privacy Policy](PRIVACY.md).

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

**A product by [Humanjava Enterprises Inc](https://humanjava.com)**
