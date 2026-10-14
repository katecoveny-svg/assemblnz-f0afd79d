import WidgetKit
import SwiftUI

struct NeedsYouEntry: TimelineEntry { let date: Date; let ready: Bool }
struct NeedsYouProvider: TimelineProvider {
    func placeholder(in context: Context) -> NeedsYouEntry { NeedsYouEntry(date: Date(), ready: false) }
    func getSnapshot(in context: Context, completion: @escaping (NeedsYouEntry) -> Void) {
        completion(NeedsYouEntry(date: Date(), ready: DOStore().keyboardDraft() != nil))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<NeedsYouEntry>) -> Void) {
        let now = Date(), draft = DOStore().keyboardDraft(now: now)
        var entries = [NeedsYouEntry(date: now, ready: draft != nil)]
        if let reviewed = draft?.reviewedAt { entries.append(NeedsYouEntry(date: reviewed.addingTimeInterval(DOStore.keyboardLifetime), ready: false)) }
        completion(Timeline(entries: entries, policy: .after(now.addingTimeInterval(15 * 60))))
    }
}
struct NeedsYouWidgetView: View {
    let entry: NeedsYouEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("DO").font(.title2.weight(.semibold))
            Spacer()
            Text(entry.ready ? "A draft, ready when you are." : "What needs doing?").font(.headline)
            Text(entry.ready ? "Open and review" : "Open your workspace").font(.caption).opacity(0.8)
        }.padding(4).containerBackground(for: .widget) {
            LinearGradient(colors: [Color(red: 0.14, green: 0.04, blue: 0.13), Color(red: 0.40, green: 0.29, blue: 0.31)], startPoint: .topLeading, endPoint: .bottomTrailing)
        }.foregroundStyle(.white).widgetURL(URL(string: "assembl-do://drafts"))
    }
}
@main struct NeedsYouWidget: Widget {
    let kind = "DoNeedsYouWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NeedsYouProvider()) { NeedsYouWidgetView(entry: $0) }
            .configurationDisplayName("DO workspace")
            .description("Open your local draft workspace. No draft text appears on the widget.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
