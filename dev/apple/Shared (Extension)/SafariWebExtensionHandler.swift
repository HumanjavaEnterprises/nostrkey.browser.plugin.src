//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//  Created by Ryan Breen on 1/11/23.
//

import SafariServices
import os.log

let SFExtensionMessageKey = "message"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        guard let item = context.inputItems.first as? NSExtensionItem else {
            context.completeRequest(returningItems: nil, completionHandler: nil)
            return
        }
        let message = item.userInfo?[SFExtensionMessageKey]
        // Log only the action name. The previous form force-cast the whole message
        // to CVarArg — a crash on a nil/!CVarArg payload — and wrote the entire
        // message body to the system log, which is the wrong place for anything a
        // key manager passes around.
        let actionName = (message as? [String: Any])?["action"] as? String ?? "unknown"
        os_log(.default, "sendNativeMessage action: %{public}@", actionName)

        // Check if the message contains a recognized action
        if let dict = message as? [String: Any],
           let action = dict["action"] as? String {
            switch action {
            case "getSharedProfiles":
                handleGetSharedProfiles(context: context)
                return
            case "setAppearance":
                handleSetAppearance(dict["appearance"] as? [String: Any] ?? [:], context: context)
                return
            default:
                break
            }
        }

        // Legacy echo behavior
        let response = NSExtensionItem()
        response.userInfo = [ SFExtensionMessageKey: [ "Response to": message ] ]

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

    /// Persist the user's chosen look so the container app renders in the same
    /// theme as the panel. Presentation preferences only — see SharedStorage.
    private func handleSetAppearance(_ appearance: [String: Any], context: NSExtensionContext) {
        SharedStorage.shared.saveAppearance(appearance)
        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["ok": true]]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

    /// Read profiles from the App Group shared container and attach private keys
    /// from the shared Keychain.
    private func handleGetSharedProfiles(context: NSExtensionContext) {
        let profiles = SharedStorage.shared.loadProfiles()

        // Attach private keys from shared Keychain
        var fullProfiles: [[String: Any]] = []
        for var profile in profiles {
            if let id = profile["id"] as? String {
                if let privKey = SharedKeychain.shared.loadPrivateKey(profileId: id) {
                    profile["privKey"] = privKey
                }
            }
            fullProfiles.append(profile)
        }

        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["profiles": fullProfiles]]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }

}
