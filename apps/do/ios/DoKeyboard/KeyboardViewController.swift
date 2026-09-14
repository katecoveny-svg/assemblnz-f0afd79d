import UIKit

/// Minimal Keyboard Extension view controller stub for DO.
/// Wire this as the principal class of a Keyboard Extension target in Xcode.
final class KeyboardViewController: UIInputViewController {
    private let strip = UIStackView()
    private let starButton = UIButton(type: .system)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.14, green: 0.04, blue: 0.13, alpha: 1)

        strip.axis = .horizontal
        strip.spacing = 8
        strip.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(strip)

        for item in DoKeyboardConfig.templates {
            let button = UIButton(type: .system)
            button.setTitle(item.title, for: .normal)
            button.setTitleColor(UIColor(red: 0.96, green: 0.95, blue: 0.95, alpha: 1), for: .normal)
            button.titleLabel?.font = UIFont.monospacedSystemFont(ofSize: 12, weight: .medium)
            button.backgroundColor = UIColor.white.withAlphaComponent(0.12)
            button.layer.cornerRadius = 8
            button.contentEdgeInsets = UIEdgeInsets(top: 8, left: 10, bottom: 8, right: 10)
            button.addAction(UIAction { [weak self] _ in
                self?.compile(templateId: item.templateId, brief: item.brief)
            }, for: .touchUpInside)
            strip.addArrangedSubview(button)
        }

        starButton.setTitle("✦", for: .normal)
        starButton.setTitleColor(.white, for: .normal)
        starButton.titleLabel?.font = UIFont.systemFont(ofSize: 20, weight: .semibold)
        starButton.backgroundColor = UIColor(red: 0.57, green: 0.42, blue: 0.44, alpha: 1)
        starButton.layer.cornerRadius = 8
        starButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 14, bottom: 8, right: 14)
        starButton.addAction(UIAction { [weak self] _ in
            self?.compile(templateId: nil, brief: nil)
        }, for: .touchUpInside)
        strip.addArrangedSubview(starButton)

        NSLayoutConstraint.activate([
            strip.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 12),
            strip.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -12),
            strip.topAnchor.constraint(equalTo: view.topAnchor, constant: 10),
            strip.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -10),
            view.heightAnchor.constraint(greaterThanOrEqualToConstant: 56),
        ])
    }

    private func currentSelectionOrClipboard() -> String {
        let before = textDocumentProxy.documentContextBeforeInput ?? ""
        let after = textDocumentProxy.documentContextAfterInput ?? ""
        let combined = (before + after).trimmingCharacters(in: .whitespacesAndNewlines)
        if !combined.isEmpty { return String(combined.prefix(2000)) }
        return UIPasteboard.general.string ?? ""
    }

    private func compile(templateId: String?, brief: String?) {
        let selection = currentSelectionOrClipboard()
        let resolvedBrief = (brief?.isEmpty == false ? brief! : (selection.isEmpty ? "tell me if this changes" : selection))
        let hostBundle = parent?.value(forKey: "_hostBundleID") as? String

        var request = URLRequest(url: DoKeyboardConfig.apiBaseURL.appendingPathComponent("api/do/message"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload: [String: Any?] = [
            "surface": "keyboard",
            "brief": resolvedBrief,
            "templateId": templateId,
            "selection": selection,
            "hostBundleId": hostBundle,
            "hostApp": hostBundle,
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: payload.compactMapValues { $0 })

        // Full Access required for network. DEMO: fire-and-forget; open /do to review.
        URLSession.shared.dataTask(with: request).resume()
        textDocumentProxy.insertText(" ✦DO ")
    }
}
