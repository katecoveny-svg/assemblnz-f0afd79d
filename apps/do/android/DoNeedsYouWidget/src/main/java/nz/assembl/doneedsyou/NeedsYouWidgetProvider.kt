package nz.assembl.doneedsyou

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

/**
 * DEMO App Widget — Needs you count + top title.
 * Replace placeholder strings with GET /api/do/agents?grouped=1 when shipping.
 */
class NeedsYouWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (id in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.needs_you_widget).apply {
                setTextViewText(R.id.count, "1")
                setTextViewText(R.id.label, "Needs you")
                setTextViewText(R.id.title, "DEMO · RFP → pursuit brief")
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("do://needs-you"))
                val pending = PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
                setOnClickPendingIntent(R.id.root, pending)
            }
            appWidgetManager.updateAppWidget(id, views)
        }
    }
}
