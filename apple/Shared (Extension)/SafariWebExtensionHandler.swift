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
        let item = context.inputItems[0] as! NSExtensionItem
        let message = item.userInfo?[SFExtensionMessageKey]
        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", message as! CVarArg)

        // Check if the message contains a recognized action
        if let dict = message as? [String: Any],
           let action = dict["action"] as? String {
            switch action {
            case "getSharedProfiles":
                handleGetSharedProfiles(context: context)
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
