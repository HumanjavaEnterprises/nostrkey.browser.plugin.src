import Foundation
import Security

/// Keychain wrapper using a shared access group for App Groups.
/// Stores private keys (nsec/hex) per profile ID, accessible by both the iOS app
/// and the Safari extension.
final class SharedKeychain {
    static let shared = SharedKeychain()

    /// Shared keychain access group.
    /// Uses the team-prefixed App Group so both the Safari extension
    /// and the standalone NostrKey authenticator app can share keys.
    /// The team prefix (H48PW6TC25) is required at runtime — Keychain
    /// access groups don't resolve $(AppIdentifierPrefix) like entitlements do.
    /// If the Apple Developer Team ID ever changes, update this value.
    private let accessGroup = "H48PW6TC25.group.com.nostrkey"
    private let servicePrefix = "nostrkey.nsec."

    private init() {}

    /// Store a private key for a given profile ID.
    func savePrivateKey(profileId: String, privKey: String) {
        let service = servicePrefix + profileId
        guard let data = privKey.data(using: .utf8) else { return }

        // Delete existing item first (update = delete + add)
        deletePrivateKey(profileId: profileId)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccessGroup as String: accessGroup,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            kSecValueData as String: data
        ]

        SecItemAdd(query as CFDictionary, nil)
    }

    /// Retrieve the private key for a given profile ID.
    func loadPrivateKey(profileId: String) -> String? {
        let service = servicePrefix + profileId

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccessGroup as String: accessGroup,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let key = String(data: data, encoding: .utf8) else {
            return nil
        }
        return key
    }

    /// Delete the private key for a given profile ID.
    func deletePrivateKey(profileId: String) {
        let service = servicePrefix + profileId

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccessGroup as String: accessGroup
        ]

        SecItemDelete(query as CFDictionary)
    }

    /// List all profile IDs that have stored private keys.
    func listProfileIds() -> [String] {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccessGroup as String: accessGroup,
            kSecReturnAttributes as String: true,
            kSecMatchLimit as String: kSecMatchLimitAll
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let items = result as? [[String: Any]] else {
            return []
        }

        return items.compactMap { item in
            guard let service = item[kSecAttrService as String] as? String,
                  service.hasPrefix(servicePrefix) else {
                return nil
            }
            return String(service.dropFirst(servicePrefix.count))
        }
    }
}
