import Foundation

/// Wrapper around the App Group shared UserDefaults container.
/// Stores profile metadata (name, pubKey/npub, active, relays) — never private keys.
final class SharedStorage {
    static let shared = SharedStorage()

    private let suiteName = "group.com.nostrkey"
    private let profilesKey = "nostrkey_shared_profiles"
    private let appearanceKey = "nostrkey_appearance"

    private var defaults: UserDefaults? {
        UserDefaults(suiteName: suiteName)
    }

    private init() {}

    /// Save profile metadata to the shared container.
    /// Private keys must NOT be included — use SharedKeychain instead.
    func saveProfiles(_ profiles: [[String: Any]]) {
        guard let defaults = defaults else { return }
        if let data = try? JSONSerialization.data(withJSONObject: profiles),
           let json = String(data: data, encoding: .utf8) {
            defaults.set(json, forKey: profilesKey)
        }
    }

    /// Load profile metadata from the shared container.
    func loadProfiles() -> [[String: Any]] {
        guard let defaults = defaults,
              let json = defaults.string(forKey: profilesKey),
              let data = json.data(using: .utf8),
              let array = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
            return []
        }
        return array
    }

    /// Save the user's chosen appearance so the container app can match the panel.
    ///
    /// Only presentation preferences cross this boundary — `theme`
    /// (instrument|analog|console), `mode` (dark|light|system), and the
    /// accessibility flags. Never keys, npubs, or profile data: the container app
    /// has no need for them, and the smaller the shared surface the better.
    func saveAppearance(_ appearance: [String: Any]) {
        guard let defaults = defaults else { return }
        let allowed = ["theme", "mode", "textSize", "highContrast", "reduceMotion", "density"]
        let filtered = appearance.filter { allowed.contains($0.key) }
        if let data = try? JSONSerialization.data(withJSONObject: filtered),
           let json = String(data: data, encoding: .utf8) {
            defaults.set(json, forKey: appearanceKey)
        }
    }

    /// Read the last appearance the extension pushed. Empty until the user has
    /// opened the extension at least once since installing.
    func loadAppearance() -> [String: Any] {
        guard let defaults = defaults,
              let json = defaults.string(forKey: appearanceKey),
              let data = json.data(using: .utf8),
              let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return [:]
        }
        return dict
    }
}
