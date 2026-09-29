import Foundation

struct DODraft: Codable, Identifiable, Equatable {
    let id: UUID
    var text: String
    let createdAt: Date
    var reviewedAt: Date?
    var title: String { String(text.split(separator: "\n").first.map(String.init)?.prefix(70) ?? "Draft") }
}

enum DOStoreError: LocalizedError {
    case unavailable, empty, tooLong, full, notReviewed
    var errorDescription: String? {
        switch self {
        case .unavailable: return "Shared storage is unavailable. Check App Group signing in Xcode."
        case .empty: return "Add some text first."
        case .tooLong: return "Use an excerpt of up to 12,000 characters."
        case .full: return "You have 20 saved drafts. Delete one before saving another."
        case .notReviewed: return "Review this exact draft before making it available to the keyboard."
        }
    }
}

/// Local files only. The keyboard reads the single explicitly released draft; it never writes.
struct DOStore {
    static let group = "group.co.assembl.do"
    static let keyboardLifetime: TimeInterval = 60 * 60
    let root: URL?
    init(root: URL? = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: DOStore.group)) { self.root = root }

    private func directory() throws -> URL {
        guard let root else { throw DOStoreError.unavailable }
        let directory = root.appendingPathComponent("DODrafts", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }
    func validate(_ text: String) throws -> String {
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { throw DOStoreError.empty }
        guard value.count <= 12000 else { throw DOStoreError.tooLong }
        return value
    }
    func drafts() throws -> [DODraft] {
        let directory = try directory()
        return try FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil)
            .filter { $0.pathExtension == "json" }
            .compactMap { try? JSONDecoder().decode(DODraft.self, from: Data(contentsOf: $0)) }
            .sorted { $0.createdAt > $1.createdAt }
    }
    @discardableResult func save(_ text: String, now: Date = Date()) throws -> DODraft {
        let value = try validate(text)
        guard try drafts().count < 20 else { throw DOStoreError.full }
        let draft = DODraft(id: UUID(), text: value, createdAt: now, reviewedAt: nil)
        try write(draft, to: directory().appendingPathComponent(draft.id.uuidString + ".json"))
        return draft
    }
    func remove(_ draft: DODraft) throws {
        try FileManager.default.removeItem(at: directory().appendingPathComponent(draft.id.uuidString + ".json"))
        if keyboardDraft()?.text == draft.text { try clearKeyboard() }
    }
    func releaseToKeyboard(_ text: String, reviewed: Bool, now: Date = Date()) throws {
        guard reviewed else { throw DOStoreError.notReviewed }
        guard let root else { throw DOStoreError.unavailable }
        let value = try validate(text)
        let draft = DODraft(id: UUID(), text: value, createdAt: now, reviewedAt: now)
        try write(draft, to: root.appendingPathComponent("keyboard-draft.json"))
    }
    /// No directory creation or deletion: works as a read-only keyboard operation.
    func keyboardDraft(now: Date = Date()) -> DODraft? {
        guard let root,
              let data = try? Data(contentsOf: root.appendingPathComponent("keyboard-draft.json")), data.count <= 100000,
              let draft = try? JSONDecoder().decode(DODraft.self, from: data),
              let reviewed = draft.reviewedAt, reviewed <= now,
              now.timeIntervalSince(reviewed) < Self.keyboardLifetime,
              (try? validate(draft.text)) == draft.text else { return nil }
        return draft
    }
    func clearKeyboard() throws {
        guard let root else { throw DOStoreError.unavailable }
        let url = root.appendingPathComponent("keyboard-draft.json")
        if FileManager.default.fileExists(atPath: url.path) { try FileManager.default.removeItem(at: url) }
    }
    private func write(_ draft: DODraft, to url: URL) throws {
        let data = try JSONEncoder().encode(draft)
        try data.write(to: url, options: [.atomic, .completeFileProtection])
        var values = URLResourceValues(); values.isExcludedFromBackup = true
        var file = url; try file.setResourceValues(values)
    }
}
