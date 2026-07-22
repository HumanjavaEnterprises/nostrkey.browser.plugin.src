//
//  SettingsPersistenceWebKitTests.swift
//  NostrKey — iOS / macOS settings-persistence test (real WKWebView)
//
//  Loads the REAL src/a11y.js into a WKWebView (the exact WebKit engine iOS Safari
//  and the NostrKey app extension run) with an in-memory chrome.storage mock, and
//  asserts save → load → apply for appearance + accessibility settings.
//
//  HOW TO RUN
//  1. In Xcode: File ▸ New ▸ Target ▸ "Unit Testing Bundle" (host = NostrKey (iOS)
//     for iOS, or NostrKey (macOS) for mac). Name it e.g. NostrKeyTests.
//  2. Add this file to that target, and add these two files as target RESOURCES:
//        ../../src/a11y.js
//        ../../test/e2e/safari-harness.html   (the in-memory mock harness)
//  3. Run:
//        xcodebuild test -project dev/apple/NostrKey.xcodeproj \
//          -scheme "NostrKey (iOS)" \
//          -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
//          -only-testing:NostrKeyTests/SettingsPersistenceWebKitTests
//     (swap the scheme/destination for macOS to cover that engine too.)
//
//  NOTE: iOS Safari == macOS Safari == this WebKit. The Node safaridriver test
//  (test/e2e/safari-settings.mjs) already validates the same logic on macOS WebKit;
//  this target extends that to the iOS Simulator's WebKit for full-stack confidence.
//

import XCTest
import WebKit

final class SettingsPersistenceWebKitTests: XCTestCase {

    private var webView: WKWebView!

    /// Load the bundled harness (in-memory chrome.storage mock + the real a11y.js).
    override func setUpWithError() throws {
        webView = WKWebView(frame: .init(x: 0, y: 0, width: 400, height: 800))
        let bundle = Bundle(for: type(of: self))
        guard let harness = bundle.url(forResource: "safari-harness", withExtension: "html") else {
            throw XCTSkip("Add test/e2e/safari-harness.html + src/a11y.js as test-target resources.")
        }
        webView.loadFileURL(harness, allowingReadAccessTo: harness.deletingLastPathComponent())
        try waitForJS("!!window.insA11y")
    }

    func testSettingsSaveAndRecoverInWebKit() throws {
        // save
        _ = try evalAsync("window.insA11y.set({theme:'analog',mode:'light',density:'compact',textSize:'xl'})")
        XCTAssertEqual(try attr("data-ins-skin"), "analog-light")

        // fresh a11y init (reads the persisted in-memory store) → recover
        try reinit()
        XCTAssertEqual(try attr("data-ins-skin"), "analog-light")
        XCTAssertEqual(try attr("data-ins-text"), "xl")
        XCTAssertNil(try attr("data-ins-density"))          // compact

        // change + re-init → still recovers
        _ = try evalAsync("window.insA11y.set({theme:'console',mode:'dark'})")
        try reinit()
        XCTAssertEqual(try attr("data-ins-skin"), "console-dark")
    }

    func testCorruptPrefsFallBackToDefaults() throws {
        _ = try eval("window.__nkStore.sync['a11y_prefs'] = {theme:'bogus',textSize:'xxl'}")
        try reinit()
        XCTAssertEqual(try attr("data-ins-skin"), "instrument-dark")
        XCTAssertEqual(try attr("data-ins-text"), "m")
    }

    // MARK: - helpers

    private func attr(_ name: String) throws -> String? {
        try eval("document.documentElement.getAttribute('\(name)')") as? String
    }

    /// Re-run a11y.js in the same page after wiping the DOM attrs → true load→apply.
    private func reinit() throws {
        let bundle = Bundle(for: type(of: self))
        let src = try String(contentsOf: bundle.url(forResource: "a11y", withExtension: "js")!, encoding: .utf8)
        _ = try evalAsync("""
            ['data-ins-skin','data-ins-text','data-ins-density','data-ins-contrast','data-ins-motion']
              .forEach(a=>document.documentElement.removeAttribute(a));
            (0,eval)(\(jsString(src)));
            (window.insA11y && window.insA11y.ready) || Promise.resolve();
        """)
    }

    private func eval(_ js: String) throws -> Any? {
        var out: Any?; var err: Error?
        let exp = expectation(description: "eval")
        webView.evaluateJavaScript(js) { r, e in out = r; err = e; exp.fulfill() }
        wait(for: [exp], timeout: 5)
        if let err { throw err }
        return out
    }

    /// Evaluate a JS Promise and wait for it to resolve.
    private func evalAsync(_ jsPromise: String) throws -> Any? {
        try eval("(async () => { await (\(jsPromise)); return true; })()")
    }

    private func waitForJS(_ cond: String) throws {
        let deadline = Date().addingTimeInterval(5)
        while Date() < deadline {
            if let ok = try? eval("!!(\(cond))") as? Bool, ok { return }
            RunLoop.current.run(until: Date().addingTimeInterval(0.05))
        }
        XCTFail("timed out waiting for \(cond)")
    }

    private func jsString(_ s: String) -> String {
        let data = try! JSONSerialization.data(withJSONObject: [s])
        let arr = String(data: data, encoding: .utf8)!
        return String(arr.dropFirst().dropLast()) // JSON-encoded string literal
    }
}
