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

// MARK: - Monokai Color Palette

extension Color {
    static let monokaiBg      = Color(red: 0.153, green: 0.157, blue: 0.133) // #272822
    static let monokaiSurface = Color(red: 0.243, green: 0.239, blue: 0.196) // #3e3d32
    static let monokaiAccent  = Color(red: 0.651, green: 0.886, blue: 0.180) // #a6e22e
    static let monokaiText    = Color(red: 0.973, green: 0.973, blue: 0.949) // #f8f8f2
    static let monokaiMuted   = Color(red: 0.690, green: 0.690, blue: 0.659) // #b0b0a8
    static let monokaiBorder  = Color(red: 0.286, green: 0.282, blue: 0.243) // #49483e
}

// MARK: - Main View

struct MainView: View {
    @Environment(\.openURL) private var openURL

    private let extensionBundleIdentifier = "com.nostrkey.plugin.Extension"

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

                // Title
                Text("NostrKey")
                    .font(.largeTitle.bold())
                    .foregroundColor(.monokaiText)

                // Subtitle
                Text("Nostr Key Management")
                    .font(.headline)
                    .foregroundColor(.monokaiMuted)

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
                    .tint(.monokaiAccent)
                    .foregroundColor(.monokaiBg)
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
                    .tint(.monokaiAccent)
                    .foregroundColor(.monokaiBg)
                    .padding(.horizontal, 24)
                    .padding(.top, 8)

                case .other:
                    VStack(spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(Color(red: 0.976, green: 0.149, blue: 0.447)) // #f92672
                            Text("NostrKey requires Safari or Chrome")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(.monokaiText)
                        }
                        Text("Set Safari or Chrome as your default browser to use this extension")
                            .font(.caption)
                            .foregroundColor(.monokaiMuted)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .frame(maxWidth: .infinity)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.monokaiSurface)
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
                .tint(.monokaiAccent)
                .foregroundColor(.monokaiBg)
                .padding(.horizontal, 24)
                .padding(.top, 8)

                Text("Settings → Safari → Extensions → NostrKey")
                    .font(.caption)
                    .foregroundColor(.monokaiMuted)
                #endif

                // Divider
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.monokaiBorder)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 4)

                // Browser notice
                Text("Links open in your default browser")
                    .font(.caption)
                    .foregroundColor(.monokaiMuted)

                // Link cards
                VStack(spacing: 8) {
                    // Support — full width
                    LinkCard(title: "Support", subtitle: "Installation guides & troubleshooting", icon: "questionmark.circle", url: "https://nostrkey.com/support.html")

                    // Source Code — full width
                    LinkCard(title: "Source Code", subtitle: "View on GitHub — fully auditable", icon: "chevron.left.forwardslash.chevron.right", url: "https://github.com/HumanjavaEnterprises/nostrkey.browser.plugin.src")

                    // Privacy / Terms / License — three-column squares
                    HStack(spacing: 8) {
                        SquareLinkCard(title: "Privacy", icon: "hand.raised", url: "https://nostrkey.com/privacy.html")
                        SquareLinkCard(title: "Terms", icon: "doc.text", url: "https://nostrkey.com/terms.html")
                        SquareLinkCard(title: "License", icon: "doc.plaintext", url: "https://nostrkey.com/license.html")
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
                        .foregroundColor(.monokaiMuted)
                        .underline(color: .monokaiMuted.opacity(0.5))
                }
                .buttonStyle(.plain)
                .padding(.top, 8)
                .padding(.bottom, 16)
            }
        }
        .frame(width: 340)
        .fixedSize(horizontal: true, vertical: true)
        .background(Color.monokaiBg.ignoresSafeArea())
    }

    #if os(macOS)
    private func openSafariPreferences() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else { return }
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
                    .foregroundColor(.monokaiAccent)
                    .font(.title3)
                    .frame(width: 28)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(.monokaiAccent)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.monokaiMuted)
                }
                Spacer()
                Image(systemName: "arrow.up.right")
                    .font(.caption)
                    .foregroundColor(.monokaiMuted)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.monokaiSurface)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Square Link Card

struct SquareLinkCard: View {
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
                    .foregroundColor(.monokaiAccent)
                    .font(.title2)
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundColor(.monokaiAccent)
            }
            .frame(maxWidth: .infinity, minHeight: 72)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.monokaiSurface)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Header Bar (kept for sub-view compatibility)

struct NostrKeyHeaderBar: View {
    let title: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        HStack {
            Button(action: { dismiss() }) {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                    Text("Back")
                }
                .foregroundColor(.monokaiAccent)
                .font(.system(size: 14, weight: .medium))
            }
            .buttonStyle(.plain)
            Spacer()
            Text(title)
                .font(.headline)
                .foregroundColor(.monokaiAccent)
            Spacer()
            HStack(spacing: 4) {
                Image(systemName: "chevron.left")
                Text("Back")
            }
            .hidden()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.monokaiBg)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(.monokaiBorder),
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
