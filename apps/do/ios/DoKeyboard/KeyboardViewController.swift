import UIKit

/// Offline keyboard foundation. No clipboard reads, networking, host-app inspection or sending.
final class KeyboardViewController: UIInputViewController {
    private let stack = UIStackView()
    private let preview = UILabel()
    private let insert = UIButton(type: .system)
    private var reviewedText = ""
    private var upper = false
    private var numberMode = false
    private var keyRows: [UIStackView] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.96, green: 0.945, blue: 0.95, alpha: 1)
        stack.axis = .vertical
        stack.spacing = 6
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 5),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -5),
            stack.topAnchor.constraint(equalTo: view.topAnchor, constant: 8),
            stack.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -6)
        ])
        let tools = row()
        tools.addArrangedSubview(key("DO · review text") { [weak self] in self?.capture() })
        tools.addArrangedSubview(key("Clear") { [weak self] in self?.clearReview() })
        stack.addArrangedSubview(tools)
        preview.font = .systemFont(ofSize: 12)
        preview.textColor = UIColor(red: 0.14, green: 0.04, blue: 0.13, alpha: 1)
        preview.numberOfLines = 3
        preview.text = "On-device preview. Cloud preparation is not connected."
        preview.accessibilityLabel = "DO text preview"
        stack.addArrangedSubview(preview)
        insert.setTitle("Insert reviewed text", for: .normal)
        insert.isEnabled = false
        insert.heightAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
        insert.addAction(UIAction { [weak self] _ in self?.insertReviewed() }, for: .touchUpInside)
        stack.addArrangedSubview(insert)
        for _ in 0..<3 { let r = row(); keyRows.append(r); stack.addArrangedSubview(r) }
        rebuildKeys()
        let bottom = row()
        bottom.addArrangedSubview(key("⇧") { [weak self] in self?.upper.toggle(); self?.rebuildKeys() })
        bottom.addArrangedSubview(key("123 / ABC") { [weak self] in self?.numberMode.toggle(); self?.rebuildKeys() })
        let next = key("🌐") { [weak self] in self?.advanceToNextInputMode() }
        next.accessibilityLabel = "Next keyboard"
        bottom.addArrangedSubview(next)
        bottom.addArrangedSubview(key("space") { [weak self] in self?.type(" ") })
        bottom.addArrangedSubview(key("⌫") { [weak self] in self?.clearReview(); self?.textDocumentProxy.deleteBackward() })
        bottom.addArrangedSubview(key("return") { [weak self] in self?.type("\n") })
        stack.addArrangedSubview(bottom)
    }

    private func row() -> UIStackView {
        let row = UIStackView()
        row.axis = .horizontal; row.distribution = .fillEqually; row.spacing = 3
        return row
    }
    private func key(_ title: String, action: @escaping () -> Void) -> UIButton {
        let b = UIButton(type: .system)
        b.setTitle(title, for: .normal)
        b.titleLabel?.font = .systemFont(ofSize: title.count > 3 ? 11 : 19)
        b.setTitleColor(UIColor(red: 0.14, green: 0.04, blue: 0.13, alpha: 1), for: .normal)
        b.backgroundColor = .white; b.layer.cornerRadius = 7
        b.heightAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
        b.addAction(UIAction { _ in action() }, for: .touchUpInside)
        return b
    }
    private func rebuildKeys() {
        let rows = numberMode ? ["1234567890", "-/:;()$&@", ".,?!'\""] : ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
        for (i, row) in keyRows.enumerated() {
            row.arrangedSubviews.forEach { row.removeArrangedSubview($0); $0.removeFromSuperview() }
            for character in rows[i] {
                let text = upper ? String(character).uppercased() : String(character)
                row.addArrangedSubview(key(text) { [weak self] in self?.type(text) })
            }
        }
    }
    private func type(_ text: String) { clearReview(); textDocumentProxy.insertText(text) }
    private func capture() {
        // Read only on explicit tap. iOS supplies limited nearby text, not the whole screen.
        let selected = textDocumentProxy.selectedText
        let nearby = (textDocumentProxy.documentContextBeforeInput ?? "") + (textDocumentProxy.documentContextAfterInput ?? "")
        reviewedText = String((selected ?? nearby).prefix(2000)).trimmingCharacters(in: .whitespacesAndNewlines)
        preview.text = reviewedText.isEmpty ? "No text available here. Type normally or select text in the app first." : reviewedText
        insert.isEnabled = !reviewedText.isEmpty
    }
    private func insertReviewed() {
        guard !reviewedText.isEmpty else { return }
        let text = reviewedText
        clearReview()
        textDocumentProxy.insertText(text)
    }
    private func clearReview() {
        reviewedText = ""; insert.isEnabled = false
        preview.text = "On-device preview. Cloud preparation is not connected."
    }
    override func textDidChange(_ textInput: UITextInput?) { clearReview() }
    override func selectionDidChange(_ textInput: UITextInput?) { clearReview() }
    override func viewWillDisappear(_ animated: Bool) { super.viewWillDisappear(animated); clearReview() }
}
