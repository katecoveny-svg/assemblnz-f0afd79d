import Cocoa
import SwiftUI
import WebKit
import ApplicationServices

final class CompanionModel: NSObject, ObservableObject, WKNavigationDelegate, WKUIDelegate {
    @Published var status = "Choose an app, select text, then bring it here when you want help."
    @Published var review = ""
    @Published var targetName = "your app"
    @Published var destinationChecked = false
    var target: NSRunningApplication?
    let web = WKWebView(frame: .zero)
    override init() {
        super.init()
        web.navigationDelegate = self
        web.uiDelegate = self
        web.load(URLRequest(url: URL(string: "https://www.assembl.co.nz/do/widget")!))
        if let active = NSWorkspace.shared.frontmostApplication, active.processIdentifier != ProcessInfo.processInfo.processIdentifier { target = active; targetName = active.localizedName ?? "your app" }
        NSWorkspace.shared.notificationCenter.addObserver(self, selector: #selector(activated(_:)), name: NSWorkspace.didActivateApplicationNotification, object: nil)
    }
    @objc func activated(_ notification: Notification) {
        guard let app = notification.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication,
              app.processIdentifier != ProcessInfo.processInfo.processIdentifier else { return }
        target = app; targetName = app.localizedName ?? "your app"; destinationChecked = false
    }
    func enableInteraction() {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        status = AXIsProcessTrustedWithOptions(options) ? "App interaction is available. Each capture or paste still needs your click." : "Allow DO in System Settings → Privacy & Security → Accessibility, then return here."
    }
    func focusedElement() -> AXUIElement? {
        guard AXIsProcessTrusted() else { status = "Use Enable app interaction first. Nothing was read or changed."; return nil }
        guard let app = target, !app.isTerminated else { status = "Choose the app you want to work in first."; return nil }
        let application = AXUIElementCreateApplication(app.processIdentifier)
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(application, kAXFocusedUIElementAttribute as CFString, &value) == .success,
              let raw = value, CFGetTypeID(raw) == AXUIElementGetTypeID() else { status = "This app does not expose a focused text field. Use copy and paste yourself."; return nil }
        let element = raw as! AXUIElement
        var subrole: CFTypeRef?
        AXUIElementCopyAttributeValue(element, kAXSubroleAttribute as CFString, &subrole)
        if (subrole as? String) == "AXSecureTextField" { status = "DO does not read or write password fields."; return nil }
        return element
    }
    func captureSelection() {
        guard let element = focusedElement() else { return }
        var selected: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, kAXSelectedTextAttribute as CFString, &selected) == .success,
              let text = selected as? String, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { status = "No selected text is available from \(targetName). Select the relevant text there, or copy it and use Review clipboard."; return }
        review = String(text.prefix(12000)); destinationChecked = false
        status = "Selected text from \(targetName) is here for review. It has not been sent to DO."
    }
    func reviewClipboard() {
        guard let text = NSPasteboard.general.string(forType: .string), !text.isEmpty else { status = "The clipboard has no text."; return }
        review = String(text.prefix(12000)); destinationChecked = false
        status = "Clipboard text is here for review. Nothing has been pasted or sent."
    }
    func addToDO() {
        guard web.url?.host == "www.assembl.co.nz", web.url?.path == "/do/widget", !review.isEmpty else { status = "Open the DO workspace before adding text."; return }
        let data: [String: Any] = ["type": "assembl-do:context", "text": review, "title": "Reviewed app selection", "url": ""]
        guard let json = try? JSONSerialization.data(withJSONObject: data), let encoded = String(data: json, encoding: .utf8) else { return }
        web.evaluateJavaScript("window.postMessage(\(encoded), 'https://www.assembl.co.nz')") { _, error in
            DispatchQueue.main.async { self.status = error == nil ? "Text offered to the DO editor. Check it there and choose a task; preparation has not started." : "The workspace did not accept the text. Copy it into DO instead." }
        }
    }
    func pasteReviewed() {
        guard destinationChecked, !review.isEmpty, let element = focusedElement() else { return }
        var settable: DarwinBoolean = false
        guard AXUIElementIsAttributeSettable(element, kAXSelectedTextAttribute as CFString, &settable) == .success, settable.boolValue else { status = "This field does not support safe text insertion. Copy and paste manually."; return }
        let result = AXUIElementSetAttributeValue(element, kAXSelectedTextAttribute as CFString, review as CFString)
        status = result == .success ? "Inserted reviewed text in \(targetName). Nothing was sent or submitted." : "The app refused insertion. Nothing was sent; use manual paste."
        destinationChecked = false
    }
    func open(_ path: String) { web.load(URLRequest(url: URL(string: "https://www.assembl.co.nz" + path)!)) }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if url.scheme == "https", url.host == "www.assembl.co.nz" { decisionHandler(.allow); return }
        if navigationAction.navigationType == .linkActivated, ["https", "mailto"].contains(url.scheme ?? "") { NSWorkspace.shared.open(url) }
        decisionHandler(.cancel)
    }
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url, ["https", "mailto"].contains(url.scheme ?? "") { NSWorkspace.shared.open(url) }
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
    var body: some View {
        VStack(spacing: 10) {
            HStack { Text("DO").font(.title.bold()); Text("by assembl").foregroundColor(.secondary); Spacer(); Button("Workspace") { model.open("/do/widget") }; Button("Bills & budget") { model.open("/do/bills") }; Button("School admin") { model.open("/do/family") } }
            HStack { Button("Enable app interaction") { model.enableInteraction() }; Button("Use selected text") { model.captureSelection() }; Button("Review clipboard") { model.reviewClipboard() }; Spacer(); Text(model.targetName).lineLimit(1) }
            TextEditor(text: $model.review).font(.system(size: 12)).frame(height: 85).border(Color.purple.opacity(0.2)).accessibilityLabel("Text for your review")
            HStack { Button("Add to DO") { model.addToDO() }.disabled(model.review.isEmpty); Button("Clear") { model.review = ""; model.destinationChecked = false }; Spacer(); Toggle("I checked the destination in \(model.targetName)", isOn: $model.destinationChecked).toggleStyle(.checkbox); Button("Paste reviewed text") { model.pasteReviewed() }.disabled(!model.destinationChecked || model.review.isEmpty) }
            Text(model.status).font(.system(size: 11)).frame(maxWidth: .infinity, alignment: .leading).fixedSize(horizontal: false, vertical: true)
            WebWorkspace(model: model)
        }.padding(14).background(Color(red: 0.97, green: 0.95, blue: 0.97)).frame(minWidth: 680, minHeight: 720)
    }
}
struct Orb: View {
    var body: some View {
        Group {
            ZStack {
                Circle().fill(RadialGradient(colors: [Color(red: 0.94, green: 0.81, blue: 1), Color(red: 0.64, green: 0.29, blue: 0.95), Color(red: 0.20, green: 0.04, blue: 0.38)], center: .topLeading, startRadius: 0, endRadius: 73)).frame(width: 64, height: 64).shadow(color: .purple.opacity(0.7), radius: 13)
                Image(systemName: "sparkle").font(.system(size: 34, weight: .light)).foregroundColor(.white).rotationEffect(.degrees(12))
                Circle().fill(.white).frame(width: 5, height: 5).offset(x: 26, y: -25).shadow(color: .white, radius: 6)
            }.frame(width: 96, height: 96)
        }.help("Click to open DO. Drag to move.").accessibilityLabel("Open DO")
    }
}
final class DraggableOrbView: NSHostingView<Orb> {
    var openDO: (() -> Void)?
    var startMouse = NSPoint.zero
    var startOrigin = NSPoint.zero
    var moved = false
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
    override func hitTest(_ point: NSPoint) -> NSView? { bounds.contains(point) ? self : nil }
    override func mouseDown(with event: NSEvent) { startMouse = NSEvent.mouseLocation; startOrigin = window?.frame.origin ?? .zero; moved = false }
    override func mouseDragged(with event: NSEvent) {
        let point = NSEvent.mouseLocation
        let dx = point.x - startMouse.x; let dy = point.y - startMouse.y
        if abs(dx) + abs(dy) > 4 { moved = true }
        if moved { window?.setFrameOrigin(NSPoint(x: startOrigin.x + dx, y: startOrigin.y + dy)) }
    }
    override func mouseUp(with event: NSEvent) { if !moved { openDO?() } }
}
final class AppDelegate: NSObject, NSApplicationDelegate {
    var orb: NSPanel!
    var workspace: NSWindow!
    let model = CompanionModel()
    var menuItem: NSStatusItem!
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        workspace = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 820, height: 850), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        workspace.title = "DO by assembl · development companion"; workspace.isReleasedWhenClosed = false; workspace.center()
        workspace.contentView = NSHostingView(rootView: Workspace(model: model))
        orb = NSPanel(contentRect: NSRect(x: 1100, y: 640, width: 96, height: 96), styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        if let screen = NSScreen.main { orb.setFrameOrigin(NSPoint(x: screen.visibleFrame.maxX - 115, y: screen.visibleFrame.maxY - 115)) }
        orb.level = .floating; orb.isOpaque = false; orb.backgroundColor = .clear; orb.hasShadow = false; orb.isMovableByWindowBackground = true; orb.hidesOnDeactivate = false; orb.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        let orbView = DraggableOrbView(rootView: Orb()); orbView.openDO = { [weak self] in self?.showWorkspace() }; orb.contentView = orbView; orb.orderFrontRegardless()
        menuItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength); menuItem.button?.title = "✦ DO"
        let menu = NSMenu(); menu.addItem(withTitle: "Open DO", action: #selector(showWorkspace), keyEquivalent: ""); menu.addItem(withTitle: "Show floating DO", action: #selector(showOrb), keyEquivalent: ""); menu.addItem(withTitle: "Hide floating DO", action: #selector(hideOrb), keyEquivalent: ""); menu.addItem(.separator()); menu.addItem(withTitle: "Quit DO", action: #selector(quit), keyEquivalent: "q"); menu.items.forEach { $0.target = self }; menuItem.menu = menu
    }
    @objc func showWorkspace() { workspace.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true) }
    @objc func showOrb() { orb.orderFrontRegardless() }
    @objc func hideOrb() { orb.orderOut(nil) }
    @objc func quit() { NSApp.terminate(nil) }
}
let application = NSApplication.shared
let delegate = AppDelegate()
application.delegate = delegate
application.run()
