import Foundation

/// DO Keyboard configuration — change apiBaseURL per environment.
enum DoKeyboardConfig {
    /// Debug default points at local Next.js. Ship builds must use your HTTPS origin.
    static var apiBaseURL: URL {
        #if DEBUG
        return URL(string: "http://localhost:3000")!
        #else
        return URL(string: "https://assembl.co.nz")!
        #endif
    }

    static let templates: [(title: String, templateId: String, brief: String)] = [
        ("Watch", "price-watcher", "tell me if this changes"),
        ("Brief", "prepare-bid-brief", "prepare a bid brief from this text"),
        ("Slop-check", "clear-writing-watch", "keep my writing clear — flag AI-slop and basic grammar"),
        ("Mitre brief", "mitre10-sap-rfp-brief", "prepare a pursuit brief from this RFP"),
    ]
}
