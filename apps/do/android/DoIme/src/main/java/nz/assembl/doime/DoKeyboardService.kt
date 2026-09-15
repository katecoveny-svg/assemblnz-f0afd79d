package nz.assembl.doime

import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.inputmethodservice.InputMethodService
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

/**
 * DO IME stub — ✦ + template strip.
 * Enable in Settings → On-screen keyboard. Network calls need INTERNET permission.
 */
class DoKeyboardService : InputMethodService() {
    override fun onCreateInputView(): View {
        val strip = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(0xFF240B21.toInt())
            setPadding(24, 24, 24, 24)
        }

        DoImeConfig.templates.forEach { (title, templateId, brief) ->
            strip.addView(chip(title) { compile(templateId, brief) })
        }
        strip.addView(chip("✦") { compile(null, null) }.apply {
            setBackgroundColor(0xFF916A70.toInt())
        })
        return strip
    }

    private fun chip(label: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setTextColor(0xFFFFFDFB.toInt())
            textSize = 12f
            setOnClickListener { onClick() }
            setPadding(28, 16, 28, 16)
        }
    }

    private fun selectionOrClipboard(): String {
        val ic = currentInputConnection ?: return clipboardText()
        val selected = ic.getSelectedText(0)?.toString()
        if (!selected.isNullOrBlank()) return selected.take(2000)
        val before = ic.getTextBeforeCursor(500, 0)?.toString().orEmpty()
        val after = ic.getTextAfterCursor(500, 0)?.toString().orEmpty()
        val combined = (before + after).trim()
        return if (combined.isNotEmpty()) combined.take(2000) else clipboardText()
    }

    private fun clipboardText(): String {
        val cm = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val desc = cm.primaryClipDescription ?: return ""
        if (!desc.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)) return ""
        return cm.primaryClip?.getItemAt(0)?.coerceToText(this)?.toString().orEmpty()
    }

    private fun compile(templateId: String?, brief: String?) {
        val selection = selectionOrClipboard()
        val resolved = when {
            !brief.isNullOrBlank() -> brief
            selection.isNotBlank() -> selection
            else -> "tell me if this changes"
        }
        val apiBase = try {
            getString(R.string.do_api_base).trimEnd('/')
        } catch (_: Exception) {
            "http://10.0.2.2:3000"
        }
        val hostPkg = currentInputEditorInfo?.packageName ?: packageName

        thread {
            try {
                val url = URL("$apiBase/api/do/message")
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                }
                val payload = JSONObject()
                    .put("surface", "keyboard")
                    .put("brief", resolved)
                    .put("selection", selection)
                    .put("hostBundleId", hostPkg)
                templateId?.let { payload.put("templateId", it) }
                conn.outputStream.use { it.write(payload.toString().toByteArray()) }
                conn.responseCode
                conn.disconnect()
            } catch (_: Exception) {
                // DEMO stub — swallow; inspect /do boards after enabling network
            }
        }
        currentInputConnection?.commitText(" ✦DO ", 1)
    }
}
