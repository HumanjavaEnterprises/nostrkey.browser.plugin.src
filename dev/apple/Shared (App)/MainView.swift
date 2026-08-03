//
//  MainView.swift
//  NostrKey
//
//  Created by Ryan Breen on 2/17/23.
//

import SwiftUI
#if os(macOS)
import SafariServices
#endif

// MARK: - Instrument Theme (v1.8.0)
//
// The container app renders in the SAME look the user chose in the extension.
// The extension mirrors its appearance prefs (theme × mode — presentation only,
// never keys or profile data) into the App Group container via the
// `setAppearance` native message; this file reads them back and resolves the
// matching skin. Token values are copied verbatim from src/instrument.css —
// keep the two in sync when a skin changes.
//
// Until the user opens the extension once, there is nothing in the container
// and we fall back to console-dark — the extension's own default look.

private extension Color {
    /// sRGB hex initializer, e.g. Color(nkHex: 0x2DD4BF).
    init(nkHex hex: UInt32) {
        self.init(
            red:   Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >>  8) & 0xFF) / 255.0,
            blue:  Double( hex        & 0xFF) / 255.0
        )
    }
}

struct NKTheme {
    let base: Color      // --ins-base    page background
    let panel: Color     // --ins-panel   card surface
    let raised: Color    // --ins-raised  raised surface
    let hair: Color      // --ins-hair    hairline borders
    let text: Color      // --ins-text
    let muted: Color     // --ins-muted
    let signal: Color    // --ins-signal  the accent / LED
    let warn: Color      // --ins-amber
    let isDark: Bool
    /// Analog renders its UI in mono (--ins-font-ui); mirror that here.
    let monoUI: Bool

    // ---- The six skins, tokens verbatim from src/instrument.css ----

    static let instrumentDark = NKTheme(
        base: Color(nkHex: 0x0E0F13), panel: Color(nkHex: 0x16181D),
        raised: Color(nkHex: 0x1E2128), hair: Color(nkHex: 0x2A2E37),
        text: Color(nkHex: 0xE7E9EE), muted: Color(nkHex: 0x8A90A0),
        signal: Color(nkHex: 0xC084FC), warn: Color(nkHex: 0xF59E0B),
        isDark: true, monoUI: false)

    static let instrumentLight = NKTheme(
        base: Color(nkHex: 0xF4F5F7), panel: Color(nkHex: 0xFFFFFF),
        raised: Color(nkHex: 0xECEEF1), hair: Color(nkHex: 0xDCDFE6),
        text: Color(nkHex: 0x191B22), muted: Color(nkHex: 0x626878),
        signal: Color(nkHex: 0x7C3AED), warn: Color(nkHex: 0xAC4F08),
        isDark: false, monoUI: false)

    static let analogDark = NKTheme(
        base: Color(nkHex: 0x141210), panel: Color(nkHex: 0x1C1815),
        raised: Color(nkHex: 0x26201A), hair: Color(nkHex: 0x352E25),
        text: Color(nkHex: 0xEDE6DA), muted: Color(nkHex: 0xA2937C),
        signal: Color(nkHex: 0xFBBF24), warn: Color(nkHex: 0xF59E0B),
        isDark: true, monoUI: true)

    static let analogLight = NKTheme(
        base: Color(nkHex: 0xF4EAD6), panel: Color(nkHex: 0xFCF6E8),
        raised: Color(nkHex: 0xECE0C7), hair: Color(nkHex: 0xDBCAA4),
        text: Color(nkHex: 0x33260F), muted: Color(nkHex: 0x72613A),
        signal: Color(nkHex: 0x984E09), warn: Color(nkHex: 0x984E09),
        isDark: false, monoUI: true)

    static let consoleDark = NKTheme(
        base: Color(nkHex: 0x0B1220), panel: Color(nkHex: 0x111A2B),
        raised: Color(nkHex: 0x172236), hair: Color(nkHex: 0x24314A),
        text: Color(nkHex: 0xE6EDF6), muted: Color(nkHex: 0x8391A8),
        signal: Color(nkHex: 0x2DD4BF), warn: Color(nkHex: 0xF59E0B),
        isDark: true, monoUI: false)

    static let consoleLight = NKTheme(
        base: Color(nkHex: 0xF1F5F9), panel: Color(nkHex: 0xFFFFFF),
        raised: Color(nkHex: 0xE7EDF4), hair: Color(nkHex: 0xD2DBE6),
        text: Color(nkHex: 0x0F172A), muted: Color(nkHex: 0x5B6879),
        signal: Color(nkHex: 0x0A766C), warn: Color(nkHex: 0xAB4E08),
        isDark: false, monoUI: false)

    /// Resolve the stored appearance (theme + mode) against the OS color scheme.
    /// mode == "system" follows the OS; unknown values fall back to the
    /// extension's defaults (console / dark) — mirrors a11y.js sanitize().
    static func resolve(theme: String?, mode: String?, systemIsDark: Bool) -> NKTheme {
        let dark: Bool
        switch mode {
        case "light":  dark = false
        case "dark":   dark = true
        default:       dark = systemIsDark   // "system" or unset
        }
        switch theme {
        case "instrument": return dark ? .instrumentDark : .instrumentLight
        case "analog":     return dark ? .analogDark : .analogLight
        default:           return dark ? .consoleDark : .consoleLight
        }
    }
}

/// Reads the appearance the extension last pushed into the App Group container.
/// Same suite + key as SharedStorage.swift (the App target reads directly;
/// duplication is deliberate and kept tiny). Returns nil until the extension
/// has run once since install.
private func loadSharedAppearance() -> (theme: String, mode: String)? {
    guard let defaults = UserDefaults(suiteName: "group.com.nostrkey"),
          let json = defaults.string(forKey: "nostrkey_appearance"),
          let data = json.data(using: .utf8),
          let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        return nil
    }
    return (dict["theme"] as? String ?? "console",
            dict["mode"] as? String ?? "dark")
}

// MARK: - Main View

struct MainView: View {
    @Environment(\.openURL) private var openURL
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.scenePhase) private var scenePhase

    /// Loaded from the App Group on appear and re-checked when the app
    /// foregrounds — the user may have changed the look in Safari in between.
    @State private var appearance: (theme: String, mode: String)? = loadSharedAppearance()

    private var theme: NKTheme {
        NKTheme.resolve(theme: appearance?.theme, mode: appearance?.mode,
                        systemIsDark: colorScheme == .dark)
    }

    private let extensionBundleIdentifier = "com.nostrkey.Extension"

    #if os(macOS)
    private enum DefaultBrowser {
        case safari, chrome, other
    }

    private var defaultBrowser: DefaultBrowser {
        guard let id = NSWorkspace.shared.urlForApplication(toOpen: URL(string: "https://example.com")!)
            .flatMap({ Bundle(url: $0)?.bundleIdentifier }) else { return .other }
        if id == "com.apple.Safari" { return .safari }
        if id.contains("com.google.Chrome") { return .chrome }
        return .other
    }
    #endif

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Spacer().frame(height: 8)

                // Logo
                Image("bigicon")
                    .resizable()
                    .frame(width: 120, height: 120)
                    .clipShape(RoundedRectangle(cornerRadius: 26.8, style: .continuous))

                // Title
                Text("NostrKey")
                    .font(theme.monoUI ? .system(.largeTitle, design: .monospaced).bold()
                                       : .largeTitle.bold())
                    .foregroundColor(theme.text)

                // Subtitle
                Text("Nostr Key Management")
                    .font(.headline)
                    .foregroundColor(theme.muted)

                // Instrument signature — the lit LED + mono eyebrow used across
                // the panel and the store canvas.
                HStack(spacing: 9) {
                    Circle()
                        .fill(theme.signal)
                        .frame(width: 7, height: 7)
                        .shadow(color: theme.signal.opacity(0.75), radius: 5)
                    Text("KEYS NEVER LEAVE YOUR DEVICE")
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .kerning(1.6)
                        .foregroundColor(theme.signal)
                }
                .padding(.top, 2)

                // Browser-specific action
                #if os(macOS)
                switch defaultBrowser {
                case .safari:
                    Button(action: openSafariPreferences) {
                        Label("Open Safari Extension Preferences", systemImage: "safari")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(theme.signal)
                    .foregroundColor(theme.isDark ? theme.base : .white)
                    .padding(.horizontal, 24)
                    .padding(.top, 8)

                case .chrome:
                    Button(action: openChromeExtensions) {
                        Label("Open Chrome Extensions", systemImage: "puzzlepiece.extension")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(theme.signal)
                    .foregroundColor(theme.isDark ? theme.base : .white)
                    .padding(.horizontal, 24)
                    .padding(.top, 8)

                case .other:
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(theme.warn)
                            Text("NostrKey requires Safari or Chrome")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(theme.text)
                        }
                        Text("Set Safari or Chrome as your default browser to use this extension")
                            .font(.caption)
                            .foregroundColor(theme.muted)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(theme.panel)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.hair, lineWidth: 1))
                    )
                    .padding(.horizontal, 24)
                    .padding(.top, 8)
                }
                #else
                Button(action: openIOSSettings) {
                    Label("Open Settings", systemImage: "gear")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.borderedProminent)
                .tint(theme.signal)
                .foregroundColor(theme.isDark ? theme.base : .white)
                .padding(.horizontal, 24)
                .padding(.top, 8)

                Text("Settings → Safari → Extensions → NostrKey")
                    .font(.caption)
                    .foregroundColor(theme.muted)
                #endif

                // Divider
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(theme.hair)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 4)

                // Browser notice
                Text("Links open in your default browser")
                    .font(.caption)
                    .foregroundColor(theme.muted)

                // Link cards
                VStack(spacing: 8) {
                    // Support — full width
                    LinkCard(theme: theme, title: "Support", subtitle: "Installation guides & troubleshooting", icon: "questionmark.circle", url: "https://nostrkey.com/support.html#safari")

                    // Source Code — full width
                    LinkCard(theme: theme, title: "Source Code", subtitle: "View on GitHub — fully auditable", icon: "chevron.left.forwardslash.chevron.right", url: "https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src")

                    // Privacy / Terms / License — three-column squares
                    HStack(spacing: 8) {
                        SquareLinkCard(theme: theme, title: "Privacy", icon: "hand.raised", url: "https://nostrkey.com/privacy.html")
                        SquareLinkCard(theme: theme, title: "Terms", icon: "doc.text", url: "https://nostrkey.com/terms.html")
                        SquareLinkCard(theme: theme, title: "License", icon: "doc.plaintext", url: "https://nostrkey.com/license.html")
                    }
                }
                .padding(.horizontal, 24)

                // Footer
                Button(action: {
                    if let url = URL(string: "https://humanjava.com") {
                        openURL(url)
                    }
                }) {
                    Text("A product by Humanjava Enterprises")
                        .font(.caption)
                        .foregroundColor(theme.muted)
                        .underline(color: theme.muted.opacity(0.5))
                }
                .buttonStyle(.plain)
                .padding(.top, 8)
                .padding(.bottom, 16)
            }
        }
        .frame(width: 340)
        .fixedSize(horizontal: true, vertical: true)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(theme.base.ignoresSafeArea())
        .onChange(of: scenePhase) { phase in
            // Re-read on foreground: the user may have restyled the extension
            // in Safari since this screen was last visible.
            if phase == .active { appearance = loadSharedAppearance() }
        }
    }

    #if os(macOS)
    private func openSafariPreferences() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            if let error = error {
                print("[NostrKey] showPreferencesForExtension failed: \(error.localizedDescription)")
                // Fallback: open Safari Extensions preferences directly
                DispatchQueue.main.async {
                    // macOS Ventura+ uses Safari Settings → Extensions
                    if let url = URL(string: "x-apple.systempreferences:com.apple.Safari.SFSafariExtensions") {
                        NSWorkspace.shared.open(url)
                    } else if let safariURL = NSWorkspace.shared.urlForApplication(withBundleIdentifier: "com.apple.Safari") {
                        NSWorkspace.shared.openApplication(at: safariURL, configuration: NSWorkspace.OpenConfiguration())
                    }
                }
                return
            }
            DispatchQueue.main.async {
                NSApp.hide(nil)
            }
        }
    }

    private func openChromeExtensions() {
        guard let chromeURL = NSWorkspace.shared.urlForApplication(withBundleIdentifier: "com.google.Chrome"),
              let extensionsURL = URL(string: "chrome://extensions/") else { return }
        let config = NSWorkspace.OpenConfiguration()
        NSWorkspace.shared.open([extensionsURL], withApplicationAt: chromeURL, configuration: config)
    }
    #else
    private func openIOSSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            openURL(url)
        }
    }
    #endif
}

// MARK: - Link Card

struct LinkCard: View {
    let theme: NKTheme
    let title: String
    let subtitle: String
    let icon: String
    let url: String

    @Environment(\.openURL) private var openURL

    var body: some View {
        Button(action: {
            if let link = URL(string: url) {
                openURL(link)
            }
        }) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(theme.signal)
                    .font(.title3)
                    .frame(width: 28)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(theme.signal)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(theme.muted)
                }
                Spacer()
                Image(systemName: "arrow.up.right")
                    .font(.caption)
                    .foregroundColor(theme.muted)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(theme.panel)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.hair, lineWidth: 1))
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Square Link Card

struct SquareLinkCard: View {
    let theme: NKTheme
    let title: String
    let icon: String
    let url: String

    @Environment(\.openURL) private var openURL

    var body: some View {
        Button(action: {
            if let link = URL(string: url) {
                openURL(link)
            }
        }) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundColor(theme.signal)
                    .font(.title2)
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundColor(theme.signal)
            }
            .frame(maxWidth: .infinity, minHeight: 72)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(theme.panel)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(theme.hair, lineWidth: 1))
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Header Bar (kept for sub-view compatibility)

struct NostrKeyHeaderBar: View {
    let title: String
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme

    private var theme: NKTheme {
        let a = loadSharedAppearance()
        return NKTheme.resolve(theme: a?.theme, mode: a?.mode,
                               systemIsDark: colorScheme == .dark)
    }

    var body: some View {
        HStack {
            Button(action: { dismiss() }) {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                    Text("Back")
                }
                .foregroundColor(theme.signal)
                .font(.system(size: 14, weight: .medium))
            }
            .buttonStyle(.plain)
            Spacer()
            Text(title)
                .font(.headline)
                .foregroundColor(theme.signal)
            Spacer()
            HStack(spacing: 4) {
                Image(systemName: "chevron.left")
                Text("Back")
            }
            .hidden()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(theme.base)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(theme.hair),
            alignment: .bottom
        )
    }
}

// MARK: - Preview

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
