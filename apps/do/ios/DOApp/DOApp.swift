import SwiftUI
import WidgetKit
import UIKit

@main struct DOApp: App {
    var body: some Scene { WindowGroup { DOHomeView() } }
}

private enum DOColour {
    static let plum = Color(red: 36/255, green: 11/255, blue: 33/255)
    static let paper = Color(red: 1, green: 253/255, blue: 251/255)
    static let rose = Color(red: 145/255, green: 106/255, blue: 112/255)
}

struct DOHomeView: View {
    @Environment(\.scenePhase) private var phase
    @Environment(\.openURL) private var openURL
    @State private var text = ""
    @State private var reviewed = false
    @State private var drafts: [DODraft] = []
    @State private var message = ""
    @State private var showSetup = false
    @State private var keyboardReady = false
    private let store = DOStore()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("YOUR WORK. A LITTLE LIGHTER.").font(.caption2.monospaced()).tracking(2).foregroundStyle(DOColour.rose)
                        Text("What needs\ndoing?").font(.custom("InstrumentSans-Regular", size: 44, relativeTo: .largeTitle).weight(.semibold)).tracking(-2).fixedSize(horizontal: false, vertical: true)
                        Text("Bring a little context. Leave with something useful.").foregroundStyle(.secondary)
                    }
                    Image("WorkInPocket").resizable().scaledToFill().frame(height: 180).clipped().clipShape(RoundedRectangle(cornerRadius: 28)).accessibilityLabel("Sculptural paper and phone concept artwork")
                    HStack(spacing: 12) {
                        Label("On this iPhone", systemImage: "iphone")
                        Spacer()
                        Text(keyboardReady ? "Keyboard draft ready" : "Nothing sent").foregroundStyle(DOColour.rose)
                    }.font(.custom("InstrumentSans-Regular", size: 12, relativeTo: .caption))
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("Your draft").font(.custom("InstrumentSans-Regular", size: 20, relativeTo: .title3).weight(.semibold))
                            Spacer()
                            PasteButton(payloadType: String.self) { values in
                                if let value = values.first { text = value; reviewed = false }
                            }.tint(DOColour.plum)
                        }
                        TextEditor(text: $text).frame(minHeight: 190).padding(8).scrollContentBackground(.hidden)
                            .background(DOColour.paper).clipShape(RoundedRectangle(cornerRadius: 16))
                            .accessibilityLabel("Draft text")
                        HStack {
                            Text("\(text.count) / 12,000").font(.caption.monospaced()).foregroundStyle(text.count > 12000 ? .red : .secondary)
                            Spacer()
                            Button("Clear") { text = ""; reviewed = false }.font(.custom("InstrumentSans-Regular", size: 16, relativeTo: .callout))
                        }
                        Button { perform { try store.save(text); message = "Saved on this iPhone."; reload() } } label: {
                            Label("Save draft", systemImage: "tray.and.arrow.down").frame(maxWidth: .infinity)
                        }.buttonStyle(.bordered).disabled(!valid)
                        Button {
                            perform {
                                let value = try store.validate(text)
                                UIPasteboard.general.setItems([["public.utf8-plain-text": value]], options: [.localOnly: true, .expirationDate: Date().addingTimeInterval(120)])
                                openURL(URL(string: "https://www.assembl.co.nz/do/widget")!)
                                message = "Copied for two minutes. Paste in DO, review its result, then bring the draft back here."
                            }
                        } label: { Label("Copy & open DO", systemImage: "arrow.up.right.square").frame(maxWidth: .infinity) }
                            .buttonStyle(.borderedProminent).tint(DOColour.plum).disabled(!valid)
                        Text("Opens the live workspace in your browser. Paste only what you want DO to use; cloud preparation has its own sign-in and consent. This native editor does not call a model.").font(.custom("InstrumentSans-Regular", size: 12, relativeTo: .caption)).foregroundStyle(.secondary)
                        Toggle("I’ve checked this exact draft", isOn: $reviewed).disabled(!valid)
                        HStack {
                            Button("Use in keyboard") {
                                perform { try store.releaseToKeyboard(text, reviewed: reviewed); message = "Available to your DO keyboard for one hour. Tap Load draft there, review it, then insert."; reload() }
                            }.buttonStyle(.borderedProminent).tint(DOColour.plum).disabled(!valid || !reviewed)
                            ShareLink(item: text) { Label("Share", systemImage: "square.and.arrow.up") }.disabled(!valid || !reviewed)
                        }
                    }.padding(20).background(.white.opacity(0.85)).clipShape(RoundedRectangle(cornerRadius: 28))
                    if !message.isEmpty { Text(message).font(.custom("InstrumentSans-Regular", size: 16, relativeTo: .callout)).foregroundStyle(DOColour.rose).accessibilityAddTraits(.updatesFrequently) }
                    if keyboardReady {
                        Button("Remove draft from keyboard", role: .destructive) { perform { try store.clearKeyboard(); message = "Keyboard access removed. A loaded draft is rechecked before insertion."; reload() } }
                    }
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Pick up where you left off.").font(.custom("InstrumentSans-Regular", size: 22, relativeTo: .title2).weight(.semibold))
                        if drafts.isEmpty { Text("Save a draft here, or share text from another app to DO. Up to 20 drafts stay on this device until you delete them.").foregroundStyle(.secondary) }
                        ForEach(drafts) { draft in
                            HStack {
                                Button { text = draft.text; reviewed = false; message = "Draft opened. Review any edits before sharing." } label: {
                                    VStack(alignment: .leading, spacing: 5) { Text(draft.title).lineLimit(2); Text(draft.createdAt, style: .date).font(.custom("InstrumentSans-Regular", size: 12, relativeTo: .caption)).foregroundStyle(.secondary) }.frame(maxWidth: .infinity, alignment: .leading)
                                }
                                Button(role: .destructive) { perform { try store.remove(draft); reload() } } label: { Image(systemName: "trash").frame(width: 44, height: 44) }.accessibilityLabel("Delete \(draft.title)")
                            }.padding(16).background(.white.opacity(0.65)).clipShape(RoundedRectangle(cornerRadius: 20))
                        }
                    }
                    Text("Less admin, more mahi.").font(.custom("InstrumentSans-Regular", size: 17, relativeTo: .headline).weight(.semibold)).padding(.vertical, 18)
                }.padding(20).frame(maxWidth: 680)
            }
            .background(LinearGradient(colors: [DOColour.paper, Color(red: 0.95, green: 0.90, blue: 0.93)], startPoint: .topLeading, endPoint: .bottomTrailing))
            .font(.custom("InstrumentSans-Regular", size: 17, relativeTo: .body))
            .foregroundStyle(DOColour.plum)
            .navigationTitle("DO").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Set up", systemImage: "keyboard") { showSetup = true } } }
            .sheet(isPresented: $showSetup) { setup }
            .onChange(of: text) { _, _ in reviewed = false }
            .onChange(of: phase) { _, value in if value == .active { reload() } }
            .onOpenURL { url in if url.scheme == "assembl-do" { reload() } }
            .task { reload() }
        }
    }
    private var valid: Bool { (try? store.validate(text)) != nil }
    private func perform(_ action: () throws -> Void) { do { try action() } catch { message = error.localizedDescription } }
    private func reload() {
        perform { drafts = try store.drafts(); keyboardReady = store.keyboardDraft() != nil; WidgetCenter.shared.reloadAllTimelines() }
    }
    private var setup: some View {
        NavigationStack {
            List {
                Section("Your keyboard") {
                    Text("After installing the signed app: Settings → General → Keyboard → Keyboards → Add New Keyboard → DO. Use the globe key to switch.")
                    Text("DO never reads your clipboard or sends keystrokes. Tap Load draft to read the one draft you released from this app, then review and insert it. Full Access is not requested.")
                    Text("Secure fields and some apps use Apple’s keyboard instead. The keyboard cannot see the whole screen or float across apps.")
                }
                Section("Bring work to DO") { Text("Select text in another app, use Share, then DO. Review and save it locally. Open DO to edit or prepare it in the web workspace.") }
                Section("Your data") { Text("Drafts stay in this app’s shared device storage, protected while the device is locked and excluded from backup. Saved drafts remain until deleted. Keyboard availability expires after one hour. Sharing or opening a website is always your action.") }
                Section("Development build") { Text("This build has no native cloud-preparation connection. TestFlight/App Store availability is not established. Signing and real-device testing are still required.") }
            }.navigationTitle("DO on your iPhone").toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { showSetup = false } } }
        }
    }
}
