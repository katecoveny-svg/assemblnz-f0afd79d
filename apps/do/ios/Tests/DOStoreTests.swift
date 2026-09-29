import XCTest
import Foundation

final class DOStoreTests: XCTestCase {
    private var root: URL!
    private var store: DOStore!
    override func setUpWithError() throws {
        root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        store = DOStore(root: root)
    }
    override func tearDownWithError() throws { try FileManager.default.removeItem(at: root) }
    func testSavingNeverReleasesToKeyboard() throws {
        let draft = try store.save(" Prepare the proposal. ")
        XCTAssertEqual(draft.text, "Prepare the proposal.")
        XCTAssertEqual(try store.drafts().count, 1)
        XCTAssertNil(store.keyboardDraft())
        XCTAssertThrowsError(try store.releaseToKeyboard(draft.text, reviewed: false))
    }
    func testKeyboardExpiryAndRevocation() throws {
        let now = Date()
        try store.releaseToKeyboard("Checked draft", reviewed: true, now: now)
        XCTAssertEqual(store.keyboardDraft(now: now)?.text, "Checked draft")
        XCTAssertNil(store.keyboardDraft(now: now.addingTimeInterval(-1)))
        XCTAssertNil(store.keyboardDraft(now: now.addingTimeInterval(3600)))
        try store.clearKeyboard()
        XCTAssertNil(store.keyboardDraft(now: now))
    }
    func testEditingAndDeletingSourceDoesNotSilentlyReleaseNewContent() throws {
        let draft = try store.save("Original")
        try store.releaseToKeyboard(draft.text, reviewed: true)
        try store.save("Edited but not reviewed")
        XCTAssertEqual(store.keyboardDraft()?.text, "Original")
        try store.remove(draft)
        XCTAssertNil(store.keyboardDraft())
    }
    func testInvalidAndOverlongInputFailsWithoutTruncation() throws {
        XCTAssertThrowsError(try store.save("   "))
        XCTAssertThrowsError(try store.save(String(repeating: "a", count: 12001)))
        XCTAssertEqual(try store.drafts().count, 0)
        XCTAssertThrowsError(try DOStore(root: nil).save("No shared container"))
    }
    func testCorruptKeyboardFileIsUnavailable() throws {
        try Data("not-json".utf8).write(to: root.appendingPathComponent("keyboard-draft.json"))
        XCTAssertNil(store.keyboardDraft())
    }
}
