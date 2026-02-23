import Foundation

/// Wrapper around the App Group shared UserDefaults container.
/// Stores profile metadata (name, pubKey/npub, active, relays) — never private keys.
final class SharedStorage {
    static let shared = SharedStorage()

    private let suiteName = "group.com.nostrkey"
    private let profilesKey = "nostrkey_shared_profiles"

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
}
