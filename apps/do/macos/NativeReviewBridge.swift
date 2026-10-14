import Foundation
import WebKit

// Local review transport only. Cookies/authentication stay inside WebKit.
final class NativeReviewClient {
    typealias Transport = ([String: Any], @escaping (Result<[String: Any], Error>) -> Void) -> Void
    private let web: WKWebView
    private let status: (String) -> Void
    private let changed: () -> Void
    var transport: Transport?
    var destination: (() -> URL?)?
    private(set) var recipient: [String: Any]?
    private(set) var busy = false
    private(set) var accepted = false
    private var navigationGeneration = 0
    private var reviewRevision = 0
    private var operation = 0
    private var offerId = UUID().uuidString.lowercased()
    private var text = ""
    private var pending: [String: Any]?
    private var unknown = false
    private var sentRevision: Int?

    init(web: WKWebView, status: @escaping (String) -> Void, changed: @escaping () -> Void) {
        self.web = web; self.status = status; self.changed = changed
    }
    var recipientLabel: String { recipient?["label"] as? String ?? "Recipient not checked" }
    var addLabel: String { accepted ? "Added to this editor" : unknown ? "Check editor receipt" : "Add to DO" }
    var blocked: Bool { !unknown && sentRevision == reviewRevision }
    static func allowed(_ url: URL?) -> Bool {
        guard let url, url.user == nil, url.password == nil, url.scheme == "https", url.host == "www.assembl.co.nz", url.port == nil || url.port == 443,
              url.path == "/do/widget", URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?.contains(where: { $0.name == "nativeReview" && $0.value == "1" }) == true else { return false }
        return true
    }
    private var allowed: Bool { Self.allowed(destination?() ?? web.url) }
    func edit(_ value: String) {
        let hadPending = pending != nil
        cancelPending()
        operation += 1; reviewRevision += 1; text = value
        offerId = UUID().uuidString.lowercased(); sentRevision = nil; recipient = nil; busy = false; accepted = false; pending = nil; unknown = false
        if hadPending { status("Review changed. Any text already added to the editor is not retracted.") }
        changed()
    }
    func navigate() {
        cancelPending()
        if pending != nil { status("This offer belongs to the previous editor. Clear or change your review before adding again.") }
        operation += 1; navigationGeneration += 1; recipient = nil; busy = false; pending = nil; accepted = false; unknown = false
        changed()
    }
    private func cancelPending() {
        guard var request = pending, allowed else { return }
        request.removeValue(forKey: "reservation"); request.removeValue(forKey: "text"); request["action"] = "cancel"
        send(request) { _ in } // A cancel never claims a committed offer was retracted.
    }
    private func send(_ request: [String: Any], completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard allowed else { completion(.failure(NSError(domain: "DOReview", code: 1))); return }
        var finished = false
        let finish: (Result<[String: Any], Error>) -> Void = { value in
            guard !finished else { return }; finished = true; completion(value)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) { finish(.failure(NSError(domain: "DOReviewTimeout", code: 2))) }
        if let transport { transport(request, finish); return }
        web.callAsyncJavaScript("if (window !== window.top) return {version:1,status:'rejected',code:'wrong_document'}; if (typeof window.assemblDoNativeReview !== 'function') return {version:1,status:'rejected',code:'workspace_version_required'}; return await window.assemblDoNativeReview(request);", arguments: ["request": request], in: nil, in: .page) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let value):
                    if let response = value as? [String: Any] { finish(.success(response)) }
                    else { finish(.failure(NSError(domain: "DOReviewReceipt", code: 3))) }
                case .failure(let error): finish(.failure(error))
                }
            }
        }
    }
    private func validMetadata(_ value: [String: Any]) -> Bool {
        guard value["version"] as? Int == 1, value["status"] as? String == "recipient", value["scope"] as? String == "Personal",
              let owner = value["owner"] as? String, UUID(uuidString: owner) != nil,
              let document = value["documentId"] as? String, UUID(uuidString: document) != nil,
              let label = value["label"] as? String, !label.isEmpty, label.utf16.count <= 100,
              label.unicodeScalars.allSatisfy({ $0.value >= 32 && $0.value <= 126 }),
              let generation = value["generation"] as? Int, generation >= 0,
              let editor = value["editorRevision"] as? Int, editor >= 0,
              value["occupied"] as? Bool != nil else { return false }
        return true
    }
    private func sameRecipient(_ a: [String: Any], _ b: [String: Any]) -> Bool {
        for key in ["documentId", "owner", "scope", "generation", "editorRevision", "label"] {
            if String(describing: a[key]!) != String(describing: b[key]!) { return false }
        }
        return true
    }
    func checkRecipient() {
        guard allowed, !busy, !unknown else { status("Open Writing & capture in this app and check its signed-in account."); return }
        let current = operation
        busy = true; changed()
        send(["version": 1, "action": "lookup"]) { result in
            guard current == self.operation, self.allowed else { return }
            self.busy = false
            if case .success(let value) = result, self.validMetadata(value) {
                self.recipient = value
                self.status(value["occupied"] as? Bool == true ? "This editor already contains work. Clear it yourself before adding text." : "Check \(self.recipientLabel) · Personal, then choose Add. This app's sign-in is separate from Chrome.")
            } else { self.recipient = nil; self.status(self.recipientFailure(result)) }
            self.changed()
        }
    }
    private func recipientFailure(_ result: Result<[String: Any], Error>) -> String {
        if case .success(let value) = result, value["code"] as? String == "workspace_version_required" {
            return "This development app needs the matching workspace version. No context was added."
        }
        if case .success(let value) = result, value["code"] as? String == "sign_in_required" {
            return "Sign in inside this app, then check again. Chrome sign-in is separate. No context was added."
        }
        return "Recipient could not be checked. Try again when connected. No context was added."
    }

    func showScreenshotInput() {
        guard allowed, !busy else { status("Open this app's workspace first."); return }
        let current = operation
        busy = true; changed()
        // A fixed UI-only action. No cookie/token/text/image argument, file read or provider call.
        web.callAsyncJavaScript("if (window !== window.top || typeof window.assemblDoNativeReview !== 'function') return 'version_required'; window.dispatchEvent(new Event('assembl:do-focus-image')); return 'review_local';", arguments: [:], in: nil, in: .page) { result in
            DispatchQueue.main.async {
                guard current == self.operation, self.allowed else { return }
                self.busy = false
                if case .success(let value) = result, value as? String == "review_local" {
                    self.status("Choose Add screenshot or photo in Look. Review locally before confirming use. A native screen picker is not enabled.")
                } else if case .success(let value) = result, value as? String == "version_required" {
                    self.status("This development app needs the matching workspace version. No file was read.")
                } else { self.status("Screenshot review could not open. No file was read.") }
                self.changed()
            }
        }
    }

    private func binding(_ metadata: [String: Any]) -> [String: Any] {
        var value: [String: Any] = ["version": 1, "offerId": offerId, "navigationGeneration": navigationGeneration, "reviewRevision": reviewRevision]
        for key in ["documentId", "owner", "scope", "generation", "editorRevision"] { value[key] = metadata[key] }
        return value
    }
    private func validReceipt(_ value: [String: Any], _ expected: [String: Any]) -> Bool {
        guard value["status"] as? String == "accepted", value["version"] as? Int == 1,
              let previous = expected["editorRevision"] as? Int, value["committedEditorRevision"] as? Int == previous + 1 else { return false }
        for key in ["offerId", "documentId", "owner", "scope", "generation", "navigationGeneration", "reviewRevision", "editorRevision"] {
            guard let a = value[key], let b = expected[key], String(describing: a) == String(describing: b) else { return false }
        }
        return true
    }
    func add() {
        guard allowed, !busy, !accepted, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text.utf16.count <= 12000 else {
            status("Review a nonblank excerpt of up to 12,000 characters in Writing & capture. Nothing was added."); return
        }
        if unknown { recoverReceipt(); return }
        guard sentRevision != reviewRevision else { status("This review was already offered. Clear or change it before a new offer; no text was replayed."); return }
        guard let displayed = recipient else { checkRecipient(); return }
        let current = operation, exactText = text
        busy = true; changed()
        send(["version": 1, "action": "lookup"]) { result in
            guard current == self.operation, self.allowed else { return }
            guard case .success(let metadata) = result, self.validMetadata(metadata) else { self.fail("Recipient check failed. No text was added."); return }
            guard self.sameRecipient(displayed, metadata) else {
                self.recipient = metadata; self.busy = false
                self.status("Recipient or editor changed. Check \(self.recipientLabel) · Personal and choose Add again."); self.changed(); return
            }
            guard metadata["occupied"] as? Bool == false else { self.fail("This editor already contains work. Nothing was overwritten."); return }
            var reserve = self.binding(metadata); reserve["action"] = "reserve"
            self.send(reserve) { result in
                guard current == self.operation, self.allowed else { return }
                guard case .success(let lease) = result, lease["status"] as? String == "reserved",
                      let token = lease["reservation"] as? String, UUID(uuidString: token) != nil,
                      let expiresAt = lease["expiresAt"] as? Double, expiresAt > Date().timeIntervalSince1970 * 1000, expiresAt <= Date().timeIntervalSince1970 * 1000 + 16000 else { self.fail("Reservation failed. Check the account and editor again."); return }
                // Check every reservation binding before any reviewed text can enter JavaScript.
                for key in ["version", "offerId", "documentId", "owner", "scope", "generation", "navigationGeneration", "reviewRevision", "editorRevision"] {
                    guard let a = lease[key], let b = reserve[key], String(describing: a) == String(describing: b) else { self.fail("Reservation did not match this review. Nothing was added."); return }
                }
                var commit = self.binding(metadata); commit["action"] = "commit"; commit["reservation"] = token; commit["text"] = exactText
                self.pending = commit; self.sentRevision = self.reviewRevision
                self.send(commit) { result in
                    guard current == self.operation, self.allowed else { return }
                    if case .success(let receipt) = result, self.validReceipt(receipt, commit) { self.accept() }
                    else if case .success(let response) = result, response["status"] as? String == "rejected" || response["status"] as? String == "cancelled" { self.fail("The editor rejected this offer. Nothing was confirmed added.") }
                    else { self.unknown = true; self.busy = false; self.status("Editor receipt unavailable. Check receipt here; do not repeat this offer in another page."); self.changed() }
                }
            }
        }
    }
    func recoverReceipt() {
        guard unknown, !busy, let pending, allowed else { return }
        let current = operation
        var request = pending; request.removeValue(forKey: "text"); request.removeValue(forKey: "reservation"); request["action"] = "receipt"
        busy = true; changed()
        send(request) { result in
            guard current == self.operation, self.allowed else { return }
            if case .success(let receipt) = result, self.validReceipt(receipt, pending) { self.accept(); return }
            self.busy = false; self.status("Acceptance is still unconfirmed. No text was replayed. Check this editor or clear this review."); self.changed()
        }
    }
    private func fail(_ message: String) { busy = false; recipient = nil; status(message); changed() }
    private func accept() { pending = nil; busy = false; accepted = true; unknown = false; status("Added to this editor for review. Not saved or synced. Preparation still needs your confirmation."); changed() }
}
