//
//  File.swift
//  NostrKey
//
//  Created by Ryan Breen on 2/17/23.
//

import SwiftUI

@main
struct NostrKeyApp: App {
    var body: some Scene {
        WindowGroup("NostrKey") {
            MainView()
        }
        #if macOS
        .defaultSize(width: 400, height: 500)
        #endif
    }
}
