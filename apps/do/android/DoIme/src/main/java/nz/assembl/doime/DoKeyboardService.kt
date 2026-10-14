package nz.assembl.doime

import android.content.ActivityNotFoundException
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.inputmethodservice.InputMethodService
import android.net.Uri
import android.text.InputType
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.CheckBox
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

/** Offline draft helper, not a native DO preparation connection or complete typing keyboard. */
class DoKeyboardService : InputMethodService() {
    private var draft = ""
    private var inputSession = 0
    private var draftSession = -1
    private var protectedField = true
    private var preview: TextView? = null
    private var status: TextView? = null
    private var reviewed: CheckBox? = null
    private var insert: Button? = null
    private var paste: Button? = null

    override fun onCreateInputView(): View {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(0xFFFFFDFB.toInt())
            setPadding(dp(12), dp(8), dp(12), dp(8))
        }
        status = label(DoImeConfig.unavailable).also { root.addView(it) }
        val actions = LinearLayout(this)
        paste = button("Paste to review") { pasteForReview() }.also {
            actions.addView(it, LinearLayout.LayoutParams(0, dp(48), 1f))
        }
        actions.addView(button("Clear") { clearDraft() }, LinearLayout.LayoutParams(0, dp(48), 1f))
        root.addView(actions)
        preview = label("").apply { contentDescription = "DO pasted draft preview" }
        root.addView(ScrollView(this).apply { addView(preview) }, LinearLayout.LayoutParams(-1, dp(100)))
        reviewed = CheckBox(this).apply {
            text = "I have reviewed this exact text"
            setTextColor(0xFF240B21.toInt())
            minHeight = dp(48)
            setOnCheckedChangeListener { _, checked -> insert?.isEnabled = checked && canInsert() }
        }.also { root.addView(it) }
        insert = button("Insert reviewed text") { insertReviewed() }.also { root.addView(it) }
        val navigation = LinearLayout(this)
        navigation.addView(button("Open DO") { openDo() }, LinearLayout.LayoutParams(0, dp(48), 1f))
        navigation.addView(button("Other keyboard") {
            clearDraft()
            (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager).showInputMethodPicker()
        }, LinearLayout.LayoutParams(0, dp(48), 1f))
        root.addView(navigation)
        clearDraft()
        return root
    }

    private fun label(value: String) = TextView(this).apply {
        text = value
        textSize = 14f
        setTextColor(0xFF240B21.toInt())
        setPadding(dp(4), dp(4), dp(4), dp(4))
    }
    private fun button(title: String, action: () -> Unit) = Button(this).apply {
        text = title
        textSize = 12f
        minHeight = dp(48)
        setOnClickListener { action() }
    }
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()

    private fun pasteForReview() {
        clearDraft()
        if (protectedField) { status?.text = "Draft review is unavailable in this private field. Use your usual keyboard."; return }
        // The clipboard is accessed only inside this explicitly tapped action.
        // Read literal text only: do not coerce URIs or resolve clipboard providers.
        val value = try {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = clipboard.primaryClip
            if (clip == null || clip.itemCount == 0) null else clip.getItemAt(0).text?.toString()
        } catch (_: SecurityException) {
            status?.text = "Clipboard access is unavailable. Open DO and paste there instead."
            return
        }
        if (value.isNullOrBlank()) { status?.text = "No plain text to paste. Copy a draft explicitly, then tap Paste to review."; return }
        if (value.length > DoImeConfig.maxDraftLength) { status?.text = "Use an excerpt of up to 12,000 characters. Nothing was inserted."; return }
        draft = value
        draftSession = inputSession
        preview?.text = value
        reviewed?.isEnabled = true
        status?.text = "Local preview only. Read the whole draft, confirm it, then insert. DO has not prepared or sent anything."
    }

    private fun canInsert() = !protectedField && draft.isNotBlank() && draftSession == inputSession
    private fun insertReviewed() {
        if (reviewed?.isChecked != true || !canInsert()) { clearDraft(); return }
        val connection = currentInputConnection
        if (connection == null) { clearDraft(); status?.text = "The text field is unavailable. Paste and review again in the intended field."; return }
        val value = draft
        clearDraft()
        val inserted = connection.commitText(value, 1)
        status?.text = if (inserted) "Inserted your reviewed text into this field. Nothing was sent by DO."
            else "The host did not accept the text. Nothing was confirmed inserted."
    }

    private fun openDo() {
        clearDraft()
        // Fixed public URL only. Never attach draft text, clipboard data, host identity or a token.
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(DoImeConfig.workspaceUrl)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (_: ActivityNotFoundException) {
            status?.text = "Open www.assembl.co.nz/do/personal in your browser. Paste there only what you want DO to use."
        } catch (_: SecurityException) {
            status?.text = "This device blocked opening the browser. Open DO yourself; no draft was transferred."
        }
    }

    private fun clearDraft() {
        draft = ""; draftSession = -1
        preview?.text = ""
        reviewed?.isChecked = false; reviewed?.isEnabled = false
        insert?.isEnabled = false
        paste?.isEnabled = !protectedField
        status?.text = if (protectedField) "Private field. Use Other keyboard to type; DO does not review text here." else DoImeConfig.unavailable
    }
    private fun isProtected(info: EditorInfo?): Boolean {
        if (info == null) return true
        val kind = info.inputType and InputType.TYPE_MASK_CLASS
        val variation = info.inputType and InputType.TYPE_MASK_VARIATION
        return info.inputType == InputType.TYPE_NULL ||
            (info.imeOptions and EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING) != 0 ||
            (kind == InputType.TYPE_CLASS_TEXT && variation in setOf(InputType.TYPE_TEXT_VARIATION_PASSWORD, InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD, InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD)) ||
            (kind == InputType.TYPE_CLASS_NUMBER && variation == InputType.TYPE_NUMBER_VARIATION_PASSWORD)
    }
    override fun onStartInput(attribute: EditorInfo?, restarting: Boolean) {
        super.onStartInput(attribute, restarting)
        inputSession += 1; protectedField = isProtected(attribute); clearDraft()
    }
    override fun onUpdateSelection(oldSelStart: Int, oldSelEnd: Int, newSelStart: Int, newSelEnd: Int, candidatesStart: Int, candidatesEnd: Int) {
        super.onUpdateSelection(oldSelStart, oldSelEnd, newSelStart, newSelEnd, candidatesStart, candidatesEnd)
        if (oldSelStart != newSelStart || oldSelEnd != newSelEnd) clearDraft()
    }
    override fun onFinishInput() { clearDraft(); super.onFinishInput() }
    override fun onFinishInputView(finishingInput: Boolean) { clearDraft(); super.onFinishInputView(finishingInput) }
    override fun onDestroy() { clearDraft(); super.onDestroy() }
}
