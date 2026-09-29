import UIKit
import Social
import UniformTypeIdentifiers

final class ShareViewController: SLComposeServiceViewController {
    private var loading = true
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Save to DO"
        placeholder = "Review this text. It will be saved on this iPhone, not sent to a model."
        navigationController?.navigationBar.tintColor = UIColor(red: 0.14, green: 0.04, blue: 0.13, alpha: 1)
        let items = extensionContext?.inputItems.compactMap { $0 as? NSExtensionItem } ?? []
        if let text = items.compactMap({ $0.attributedContentText?.string }).first, !text.isEmpty {
            textView.text = text; loading = false; validateContent(); return
        }
        let providers = items.flatMap { $0.attachments ?? [] }
        guard let provider = providers.first(where: { $0.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) || $0.hasItemConformingToTypeIdentifier(UTType.url.identifier) }) else {
            loading = false; validateContent(); return
        }
        let type = provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) ? UTType.plainText.identifier : UTType.url.identifier
        provider.loadItem(forTypeIdentifier: type, options: nil) { [weak self] item, error in
            DispatchQueue.main.async {
                guard let self else { return }
                self.loading = false
                if let value = item as? String { self.textView.text = value }
                else if let url = item as? URL { self.textView.text = url.absoluteString }
                if error != nil { self.placeholder = "Could not read this item. Paste or type the text you want to save." }
                self.validateContent()
            }
        }
    }
    override func isContentValid() -> Bool {
        charactersRemaining = NSNumber(value: 12000 - (contentText?.count ?? 0))
        return !loading && (try? DOStore().validate(contentText ?? "")) != nil
    }
    override func didSelectPost() {
        do {
            try DOStore().save(contentText ?? "")
            extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        } catch {
            let alert = UIAlertController(title: "Not saved", message: error.localizedDescription, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
        }
    }
}
