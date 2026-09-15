import WidgetKit
import SwiftUI

struct NeedsYouEntry: TimelineEntry {
    let date: Date
    let count: Int
    let topTitle: String
}

struct NeedsYouProvider: TimelineProvider {
    func placeholder(in context: Context) -> NeedsYouEntry {
        NeedsYouEntry(date: Date(), count: 2, topTitle: "RFP → pursuit brief")
    }

    func getSnapshot(in context: Context, completion: @escaping (NeedsYouEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NeedsYouEntry>) -> Void) {
        // DEMO stub — replace with GET /api/do/agents?grouped=1 when the app ships.
        let entry = NeedsYouEntry(date: Date(), count: 1, topTitle: "DEMO · Needs you")
        completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60))))
    }
}

struct NeedsYouWidgetView: View {
    var entry: NeedsYouEntry

    var body: some View {
        HStack(spacing: 12) {
            Text("✦").font(.title)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(entry.count)").font(.largeTitle.weight(.semibold))
                Text("Needs you").font(.caption.monospaced())
                Text(entry.topTitle).font(.footnote).lineLimit(2)
            }
        }
        .padding()
        .containerBackground(for: .widget) {
            Color(red: 0.14, green: 0.04, blue: 0.13)
        }
        .foregroundStyle(Color(red: 1, green: 0.99, blue: 0.98))
        .widgetURL(URL(string: "do://needs-you"))
    }
}

@main
struct NeedsYouWidget: Widget {
    let kind = "DoNeedsYouWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NeedsYouProvider()) { entry in
            NeedsYouWidgetView(entry: entry)
        }
        .configurationDisplayName("DO Needs you")
        .description("Approvals waiting on a human yes.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
