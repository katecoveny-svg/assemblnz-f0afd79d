import Cocoa
import SwiftUI
import WebKit
import ApplicationServices
import ServiceManagement
import UniformTypeIdentifiers

private enum CompanionPreference {
    static let orbX = "do.companion.orb.x"
    static let orbY = "do.companion.orb.y"
    static let orbVisible = "do.companion.orb.visible"
}

#if DO_WIDGET_FIXTURE
// Compiled only into the isolated test executable, never the shipped build.
enum FictionalSelection { case text(String), denied, unavailable, secure, unknownSecurity }
struct FictionalCapture {
    var selection: FictionalSelection = .unavailable
    var clipboard: String? = nil
    var destination = URL(string: "https://www.assembl.co.nz/do/widget")!
    var account = "10000000-0000-4000-8000-000000000001"
    var offers: [String] = []
    var selectionReads = 0
    var clipboardReads = 0
}
#endif

final class CompanionModel: NSObject, ObservableObject, WKNavigationDelegate, WKUIDelegate {
    @Published var status = "Click the D to open DO. Use selected text only when you want to bring something from another app."
    @Published var review = "" { didSet { destinationChecked = false; nativeReview.edit(review) } }
    @Published var reviewVisible = false
    @Published var workspaceNotice = ""
    @Published var targetName = "your app"
    @Published var destinationChecked = false
    var target: NSRunningApplication?
    let web = WKWebView(frame: .zero)
    lazy var nativeReview = NativeReviewClient(web: web, status: { [weak self] text in self?.status = text; if self?.reviewVisible != true { self?.workspaceNotice = text } }, changed: { [weak self] in self?.objectWillChange.send() })
#if DO_WIDGET_FIXTURE
    var fictional = FictionalCapture()
#endif

    override init() {
        super.init()
        web.navigationDelegate = self
        web.uiDelegate = self
#if DO_WIDGET_FIXTURE
        // No hosted page, observers, private clipboard or application reads.
        web.loadHTMLString("<p>Fictional widget test only.</p>", baseURL: nil)
        nativeReview.destination = { [weak self] in self?.fictional.destination }
        nativeReview.transport = { [weak self] request, completion in
            guard let self else { return }
            let action = request["action"] as? String
            if action == "lookup" {
                completion(.success(["version":1,"status":"recipient","owner":self.fictional.account,"label":self.fictional.account.hasSuffix("1") ? "alex@example.invalid" : "taylor@example.invalid","scope":"Personal","documentId":"30000000-0000-4000-8000-000000000001","generation":0,"editorRevision":self.fictional.offers.isEmpty ? 0 : 1,"occupied":!self.fictional.offers.isEmpty])); return
            }
            var response = request
            response.removeValue(forKey:"action"); response.removeValue(forKey:"text"); response.removeValue(forKey:"reservation")
            if action == "reserve" {
                response["status"] = "reserved"; response["reservation"] = "40000000-0000-4000-8000-000000000001"; response["expiresAt"] = Date().timeIntervalSince1970 * 1000 + 15000
            } else if action == "commit", request["owner"] as? String == self.fictional.account, let text = request["text"] as? String {
                self.fictional.offers.append(text); response["status"] = "accepted"; response["committedEditorRevision"] = (request["editorRevision"] as? Int ?? 0) + 1
            } else { response = ["version":1,"status":"rejected","code":"fictional_recipient_changed"] }
            completion(.success(response))
        }
#else
        web.load(URLRequest(url: URL(string: "https://www.assembl.co.nz/do/widget?nativeReview=1")!))
        if let active = NSWorkspace.shared.frontmostApplication,
           active.processIdentifier != ProcessInfo.processInfo.processIdentifier,
           active.activationPolicy == .regular {
            target = active
            targetName = active.localizedName ?? "your app"
        }
        NSWorkspace.shared.notificationCenter.addObserver(
            self,
            selector: #selector(activated(_:)),
            name: NSWorkspace.didActivateApplicationNotification,
            object: nil
        )
#endif
    }

    @objc func activated(_ notification: Notification) {
        guard let app = notification.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication,
              app.processIdentifier != ProcessInfo.processInfo.processIdentifier,
              app.activationPolicy == .regular else { return }
        target = app
        targetName = app.localizedName ?? "your app"
        destinationChecked = false
    }

    func enableInteraction() {
#if DO_WIDGET_FIXTURE
        status = "Fictional permission denied. No grant requested."
#else
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        status = AXIsProcessTrustedWithOptions(options)
            ? "App interaction is available. Each capture or paste still needs your click."
            : "Allow DO in System Settings → Privacy & Security → Accessibility, then return here."
#endif
    }

    func focusedElement() -> AXUIElement? {
#if DO_WIDGET_FIXTURE
        status = "Fictional permission denied. No app read."
        return nil
#else
        guard permitsSelectionRead(AXIsProcessTrusted()) else { return nil }
        guard let app = target, !app.isTerminated else {
            status = "Choose the app you want to work in first."
            return nil
        }
        let application = AXUIElementCreateApplication(app.processIdentifier)
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(application, kAXFocusedUIElementAttribute as CFString, &value) == .success,
              let raw = value,
              CFGetTypeID(raw) == AXUIElementGetTypeID() else {
            status = "This app does not expose a focused text field. Use copy and paste yourself."
            return nil
        }
        let element = raw as! AXUIElement
        var subrole: CFTypeRef?
        let checked = AXUIElementCopyAttributeValue(element, kAXSubroleAttribute as CFString, &subrole) == .success
        guard safeSelectionField(checked ? subrole as? String : nil) else { return nil }
        return element
#endif
    }

    private func permitsSelectionRead(_ trusted: Bool) -> Bool {
        guard trusted else {
            status = "Use Enable app interaction first. Nothing was read or changed."
            return false
        }
        return true
    }

    private func safeSelectionField(_ fieldSubrole: String?) -> Bool {
        guard let fieldSubrole else {
            status = "The field's security could not be checked. Nothing was read or changed."
            return false
        }
        if fieldSubrole == "AXSecureTextField" {
            status = "DO does not read or write password fields."
            return false
        }
        return true
    }

    func clearCapture() {
        review = ""
        destinationChecked = false
    }

    private func acceptCapture(_ text: String?) -> Bool {
        guard let text, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return false }
        guard text.utf16.count <= 12000 else {
            status = "This text is too long. Choose an excerpt of up to 12,000 characters. Nothing was added."
            return false
        }
        review = text
        return true
    }

    func captureSelection() {
        clearCapture()
#if DO_WIDGET_FIXTURE
        switch fictional.selection {
        case .denied: _ = permitsSelectionRead(false); return
        case .unavailable: status = "No selected text is available."; return
        case .secure: _ = safeSelectionField("AXSecureTextField"); return
        case .unknownSecurity: _ = safeSelectionField(nil); return
        case .text(let text):
            guard permitsSelectionRead(true), safeSelectionField("AXTextField") else { return }
            fictional.selectionReads += 1
            guard acceptCapture(text) else { if text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { status = "No selected text is available." }; return }
        }
#else
        guard let element = focusedElement() else { return }
        var selected: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, kAXSelectedTextAttribute as CFString, &selected) == .success,
              let text = selected as? String,
              !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            status = "No selected text is available from \(targetName). Select the relevant text there, or copy it and use Review clipboard."
            return
        }
        guard acceptCapture(text) else { return }
#endif
        destinationChecked = false
        status = "Selected text from \(targetName) is here for review. It has not been sent to DO."
    }

    func reviewClipboard() {
        clearCapture()
#if DO_WIDGET_FIXTURE
        fictional.clipboardReads += 1
        let text = fictional.clipboard
#else
        let text = NSPasteboard.general.string(forType: .string)
#endif
        guard acceptCapture(text) else {
            if let text, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return }
            status = "The clipboard has no text."
            return
        }
        destinationChecked = false
        status = "Clipboard text is here for review. Nothing has been pasted or sent."
    }

    func addToDO() {
#if DO_WIDGET_FIXTURE
        nativeReview.destination = { [weak self] in self?.fictional.destination }
#endif
        nativeReview.add()
    }

    func pasteReviewed() {
        guard destinationChecked, !review.isEmpty, let element = focusedElement() else { return }
        var settable: DarwinBoolean = false
        guard AXUIElementIsAttributeSettable(element, kAXSelectedTextAttribute as CFString, &settable) == .success,
              settable.boolValue else {
            status = "This field does not support safe text insertion. Copy and paste manually."
            return
        }
        let result = AXUIElementSetAttributeValue(element, kAXSelectedTextAttribute as CFString, review as CFString)
        status = result == .success
            ? "Inserted reviewed text in \(targetName). Nothing was sent or submitted."
            : "The app refused insertion. Nothing was sent; use manual paste."
        destinationChecked = false
    }

    func open(_ path: String) {
        let path = path == "/do/widget" ? "/do/widget?nativeReview=1" : path
#if DO_WIDGET_FIXTURE
        fictional.destination = URL(string: "https://www.assembl.co.nz" + path)!
#else
        web.load(URLRequest(url: URL(string: "https://www.assembl.co.nz" + path)!))
#endif
    }

    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
#if DO_WIDGET_FIXTURE
        completionHandler(nil) // Fixtures never open a dialog or read a user file.
#else
        guard frame.isMainFrame, NativeReviewClient.allowed(webView.url), let window = webView.window else { completionHandler(nil); return }
        let picker = NSOpenPanel()
        picker.title = "Choose a screenshot or photo"
        picker.allowedContentTypes = [.png, .jpeg, .webP]
        picker.canChooseFiles = true; picker.canChooseDirectories = false; picker.allowsMultipleSelection = false
        picker.beginSheetModal(for: window) { response in completionHandler(response == .OK ? picker.urls : nil) }
#endif
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) { nativeReview.navigate() }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { nativeReview.navigate() }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        if url.scheme == "https", url.host == "www.assembl.co.nz", url.port == nil || url.port == 443 {
            if navigationAction.targetFrame?.isMainFrame == true { nativeReview.navigate() }
            decisionHandler(.allow)
            return
        }
        if navigationAction.navigationType == .linkActivated,
           ["https", "mailto"].contains(url.scheme ?? "") {
            NSWorkspace.shared.open(url)
        }
        decisionHandler(.cancel)
    }

    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url,
           ["https", "mailto"].contains(url.scheme ?? "") {
            NSWorkspace.shared.open(url)
        }
        return nil
    }
}

struct WebWorkspace: NSViewRepresentable {
    let model: CompanionModel
    func makeNSView(context: Context) -> WKWebView { model.web }
    func updateNSView(_ nsView: WKWebView, context: Context) {}
}

struct Workspace: View {
    @ObservedObject var model: CompanionModel
    private let rose = Color(red: 0.40, green: 0.29, blue: 0.31)
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Spacer()
                Menu("Bring context") {
                    Button("Selected text") { model.captureSelection(); model.reviewVisible = true }
                    Button("Copied text") { model.reviewClipboard(); model.reviewVisible = true }
                    Button("Screenshot or photo") { model.nativeReview.showScreenshotInput() }
                }
                .menuStyle(.borderlessButton)
                .fixedSize()
                .padding(.horizontal, 16).padding(.vertical, 9)
                .background(Color(red: 0.92, green: 0.78, blue: 0.87), in: Capsule())
                .foregroundColor(Color(red: 0.14, green: 0.04, blue: 0.13))
            }.padding(10)
            if !model.workspaceNotice.isEmpty { Text(model.workspaceNotice).font(.system(size: 12)).frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.bottom, 8) }
            WebWorkspace(model: model)
        }
        .background(Color(red: 0.97, green: 0.95, blue: 0.97))
        .frame(minWidth: 680, minHeight: 720)
        .sheet(isPresented: $model.reviewVisible, onDismiss: { model.clearCapture() }) { ContextReview(model: model) }
    }
}

struct ContextReview: View {
    @ObservedObject var model: CompanionModel
    private let plum = Color(red: 0.14, green: 0.04, blue: 0.13)
    private let rose = Color(red: 0.40, green: 0.29, blue: 0.31)
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Review this context").font(.title2.weight(.semibold))
                Spacer()
                Button("Close") { model.reviewVisible = false }.keyboardShortcut(.cancelAction)
            }
            Text("Nothing is added until you choose Add. Preparation is a separate choice.")
                .font(.subheadline).foregroundColor(plum.opacity(0.75))
            TextEditor(text: $model.review)
                .font(.system(size: 14)).frame(height: 190)
                .padding(8).background(Color.white, in: RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(rose.opacity(0.18)))
                .accessibilityLabel("Text for your review")
            HStack {
                Text("\(model.nativeReview.recipientLabel) · Personal").font(.system(size: 11)).textSelection(.enabled)
                Spacer()
                Button("Check recipient") { model.nativeReview.checkRecipient() }.disabled(model.nativeReview.busy)
            }
            Text(model.status).font(.system(size: 12)).fixedSize(horizontal: false, vertical: true)
            DisclosureGroup("App interaction") {
                VStack(alignment: .leading, spacing: 10) {
                    Button("Enable selected-text access…") { model.enableInteraction() }
                    Text("Accessibility is optional. Copied text works without it.").font(.caption)
                    Toggle("I checked the destination in \(model.targetName)", isOn: $model.destinationChecked)
                    Button("Insert reviewed text in \(model.targetName)") { model.pasteReviewed() }.disabled(!model.destinationChecked || model.review.isEmpty)
                }.padding(.top, 8)
            }.font(.caption)
            HStack {
                Button("Clear") { model.clearCapture() }
                Spacer()
                Button(model.nativeReview.addLabel) { model.addToDO() }
                    .buttonStyle(.borderedProminent).tint(rose)
                    .disabled(model.review.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || model.review.utf16.count > 12000 || model.nativeReview.busy || model.nativeReview.accepted || model.nativeReview.blocked)
            }
        }.padding(24).frame(width: 560).foregroundColor(plum)
            .background(Color(red: 0.97, green: 0.95, blue: 0.97))
    }
}

struct Orb: View {
    var body: some View {
        Group {
            if let iconURL = Bundle.main.url(forResource: "DO-floating", withExtension: "png"),
               let icon = NSImage(contentsOf: iconURL) {
                Image(nsImage: icon).resizable().scaledToFit()
                    .frame(width: 76, height: 76)
                    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                    .shadow(color: Color(red: 0.57, green: 0.42, blue: 0.44).opacity(0.6), radius: 9)
            } else {
                Text("DO").font(.system(size: 24, weight: .regular))
            }
        }.frame(width: 96, height: 96)
            .help("Click for DO actions. Drag to move. Moving shares nothing.")
            .accessibilityLabel("Choose a DO action")
    }
}
final class OrbPanel: NSPanel {
    override var canBecomeKey: Bool { true }
}

final class DraggableOrbView: NSHostingView<Orb> {
    var openDO: (() -> Void)?
    var didMove: ((NSPoint) -> Void)?
    var startMouse = NSPoint.zero
    var startOrigin = NSPoint.zero
    var moved = false

    override func isAccessibilityElement() -> Bool { true }
    override func accessibilityRole() -> NSAccessibility.Role? { .button }
    override func accessibilityLabel() -> String? { "Choose a DO action" }
    override func accessibilityChildren() -> [Any]? { [] }
    override var acceptsFirstResponder: Bool { true }
    override func accessibilityPerformPress() -> Bool {
        guard let openDO else { return false }
        openDO()
        return true
    }
    override func keyDown(with event: NSEvent) {
        if [36, 49, 76].contains(event.keyCode) { openDO?(); return }
        super.keyDown(with: event)
    }

    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
    override func hitTest(_ point: NSPoint) -> NSView? { bounds.contains(point) ? self : nil }

    override func mouseDown(with event: NSEvent) {
        window?.makeKey()
        window?.makeFirstResponder(self)
        startMouse = window?.convertPoint(toScreen: event.locationInWindow) ?? .zero
        startOrigin = window?.frame.origin ?? .zero
        moved = false
    }

    override func mouseDragged(with event: NSEvent) {
        guard let window else { return }
        let point = window.convertPoint(toScreen: event.locationInWindow)
        let dx = point.x - startMouse.x
        let dy = point.y - startMouse.y
        if abs(dx) + abs(dy) > 4 { moved = true }
        if moved {
            window.setFrameOrigin(NSPoint(x: startOrigin.x + dx, y: startOrigin.y + dy))
        }
    }

    override func mouseUp(with event: NSEvent) {
        // Classify the final event too: coalesced input may omit intermediate drags.
        mouseDragged(with: event)
        if moved {
            if let origin = window?.frame.origin { didMove?(origin) }
        } else {
            openDO?()
        }
    }
}

struct QuickActions: View {
    let selectText: () -> Void
    let reviewClipboard: () -> Void
    let openWorkspace: () -> Void
    let cancel: () -> Void
    private let plum = Color(red: 0.14, green: 0.04, blue: 0.13)

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Bring something to DO").font(.headline)
            Text("Choose the text. Review it before using it.")
                .font(.subheadline).foregroundColor(plum.opacity(0.75))
            Button("Review selected text", action: selectText)
                .help("Uses existing Accessibility permission. No permission is requested here.")
            Button("Review clipboard", action: reviewClipboard)
                .help("Reads copied text only after this click.")
            Divider()
            Button("Open workspace", action: openWorkspace)
            Button("Cancel", action: cancel)
            Text("No text is read by opening this menu. Nothing is sent.")
                .font(.caption).foregroundColor(plum.opacity(0.75))
        }
        .buttonStyle(.bordered)
        .tint(Color(red: 0.40, green: 0.29, blue: 0.31))
        .foregroundColor(plum)
        .padding(18)
        .frame(width: 300)
        .background(.ultraThinMaterial)
        .background(Color(red: 0.92, green: 0.78, blue: 0.87).opacity(0.45))
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSPopoverDelegate {
    var orb: NSPanel!
    var workspace: NSWindow!
    let model = CompanionModel()
    var menuItem: NSStatusItem!
    var launchAtLoginItem: NSMenuItem?
    let quickActions = NSPopover()
    private var returnFocusToOrb = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)

        workspace = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 820, height: 850),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        workspace.title = "DO by assembl · development companion"
        workspace.isReleasedWhenClosed = false
        workspace.center()
        workspace.contentView = NSHostingView(rootView: Workspace(model: model))

        orb = OrbPanel(
            contentRect: NSRect(x: 1100, y: 640, width: 96, height: 96),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        restoreOrbPosition()
        orb.level = .floating
        orb.isOpaque = false
        orb.backgroundColor = .clear
        orb.hasShadow = false
        // Movement is handled by DraggableOrbView so a drag cannot also open DO.
        orb.isMovableByWindowBackground = false
        orb.hidesOnDeactivate = false
        orb.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]

        let orbView = DraggableOrbView(rootView: Orb())
        orbView.setAccessibilityRole(.button)
        orbView.setAccessibilityLabel("Choose a DO action")
        orbView.openDO = { [weak self, weak orbView] in
            guard let self, let orbView else { return }
            self.showQuickActions(from: orbView)
        }
        orbView.didMove = { [weak self] origin in self?.saveOrbPosition(origin) }
        orb.contentView = orbView

        if UserDefaults.standard.object(forKey: CompanionPreference.orbVisible) == nil
            || UserDefaults.standard.bool(forKey: CompanionPreference.orbVisible) {
            orb.orderFrontRegardless()
        }

        menuItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let iconURL = Bundle.main.url(forResource: "DO-menu", withExtension: "png"),
           let icon = NSImage(contentsOf: iconURL) {
            icon.size = NSSize(width: 22, height: 22)
            menuItem.button?.image = icon
            menuItem.button?.imagePosition = .imageOnly
        } else {
            menuItem.button?.title = "DO"
        }
        menuItem.button?.toolTip = "DO by assembl"
        menuItem.button?.setAccessibilityLabel("DO menu")
        buildMenu()
    }

    func applicationWillTerminate(_ notification: Notification) {
        if let origin = orb?.frame.origin { saveOrbPosition(origin) }
    }

    private func defaultOrbOrigin() -> NSPoint {
        guard let screen = NSScreen.main else { return NSPoint(x: 1100, y: 640) }
        return NSPoint(x: screen.visibleFrame.maxX - 115, y: screen.visibleFrame.maxY - 115)
    }

    private func restoreOrbPosition() {
        let defaults = UserDefaults.standard
        guard defaults.object(forKey: CompanionPreference.orbX) != nil,
              defaults.object(forKey: CompanionPreference.orbY) != nil else {
            orb.setFrameOrigin(defaultOrbOrigin())
            return
        }
        let candidate = NSPoint(
            x: defaults.double(forKey: CompanionPreference.orbX),
            y: defaults.double(forKey: CompanionPreference.orbY)
        )
        let orbFrame = NSRect(origin: candidate, size: orb.frame.size)
        let isVisible = NSScreen.screens.contains { screen in
            screen.visibleFrame.intersects(orbFrame)
        }
        orb.setFrameOrigin(isVisible ? candidate : defaultOrbOrigin())
    }

    private func saveOrbPosition(_ origin: NSPoint) {
        UserDefaults.standard.set(origin.x, forKey: CompanionPreference.orbX)
        UserDefaults.standard.set(origin.y, forKey: CompanionPreference.orbY)
    }

    private func buildMenu() {
        let menu = NSMenu()
        let openItem = menu.addItem(withTitle: "Open DO", action: #selector(showWorkspace), keyEquivalent: "")
        let showItem = menu.addItem(withTitle: "Show floating DO", action: #selector(showOrb), keyEquivalent: "")
        let hideItem = menu.addItem(withTitle: "Hide floating DO", action: #selector(hideOrb), keyEquivalent: "")
        [openItem, showItem, hideItem].forEach { $0.target = self }

        menu.addItem(.separator())
        if #available(macOS 13.0, *) {
            let item = menu.addItem(withTitle: "Start DO at login", action: #selector(toggleLaunchAtLogin), keyEquivalent: "")
            item.target = self
            launchAtLoginItem = item
            refreshLaunchAtLoginItem()
        }
        let loginSettings = menu.addItem(withTitle: "Open Login Items settings…", action: #selector(openLoginItemsSettings), keyEquivalent: "")
        loginSettings.target = self

        menu.addItem(.separator())
        let quitItem = menu.addItem(withTitle: "Quit DO", action: #selector(quit), keyEquivalent: "q")
        quitItem.target = self
        menuItem.menu = menu
    }

    @available(macOS 13.0, *)
    private func refreshLaunchAtLoginItem() {
        launchAtLoginItem?.state = SMAppService.mainApp.status == .enabled ? .on : .off
    }

    @objc func toggleLaunchAtLogin() {
        guard #available(macOS 13.0, *) else { return }
        let service = SMAppService.mainApp
        do {
            if service.status == .enabled {
                try service.unregister()
                model.status = "DO will no longer start automatically when you log in."
            } else {
                try service.register()
                switch service.status {
                case .enabled:
                    model.status = "DO will start automatically when you log in."
                case .requiresApproval:
                    model.status = "Approve DO in System Settings → General → Login Items to start it automatically."
                default:
                    model.status = "DO requested launch-at-login. Check Login Items if macOS asks for approval."
                }
            }
        } catch {
            model.status = "Could not change launch-at-login: \(error.localizedDescription)"
        }
        refreshLaunchAtLoginItem()
    }

    @objc func openLoginItemsSettings() {
        if #available(macOS 13.0, *) {
            SMAppService.openSystemSettingsLoginItems()
        } else {
            NSWorkspace.shared.open(URL(fileURLWithPath: "/System/Library/PreferencePanes/Users.prefPane"))
        }
    }

    @objc func showWorkspace() {
        quickActions.performClose(nil)
        workspace.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func popoverDidClose(_ notification: Notification) {
        guard returnFocusToOrb else { return }
        returnFocusToOrb = false
        orb.makeKey()
        orb.makeFirstResponder(orb.contentView)
    }

    private func cancelQuickActions() {
        returnFocusToOrb = true
        quickActions.performClose(nil)
    }

    private func showQuickActions(from view: NSView) {
        if quickActions.isShown {
            cancelQuickActions()
            return
        }
        quickActions.delegate = self
        returnFocusToOrb = false
        quickActions.behavior = .transient
        quickActions.contentViewController = NSHostingController(rootView: QuickActions(
            selectText: { [weak self] in self?.reviewFromOrb(clipboard: false) },
            reviewClipboard: { [weak self] in self?.reviewFromOrb(clipboard: true) },
            openWorkspace: { [weak self] in self?.showWorkspace() },
            cancel: { [weak self] in self?.cancelQuickActions() }
        ))
        quickActions.show(relativeTo: view.bounds, of: view, preferredEdge: .minX)
    }

    private func reviewFromOrb(clipboard: Bool) {
        // Capture before activating DO so the existing target app stays intact.
        // These methods neither prompt for permission nor transmit the review.
        if clipboard { model.reviewClipboard() } else { model.captureSelection() }
        model.reviewVisible = true
        showWorkspace()
    }

    @objc func showOrb() {
        orb.orderFrontRegardless()
        UserDefaults.standard.set(true, forKey: CompanionPreference.orbVisible)
    }

    @objc func hideOrb() {
        orb.orderOut(nil)
        UserDefaults.standard.set(false, forKey: CompanionPreference.orbVisible)
    }

    @objc func quit() { NSApp.terminate(nil) }
}

let application = NSApplication.shared
let delegate = AppDelegate()
application.delegate = delegate
application.run()
