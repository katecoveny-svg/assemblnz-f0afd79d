import Cocoa
import ScreenCaptureKit

// REVIEW PROPOSAL ONLY. Not linked into build.sh, instantiated or called by the app.
// Activation needs an agreed test session and explicit user gesture/OS consent.
@available(macOS 14.0, *)
final class ProposedUserWindowScreenshot: NSObject, SCContentSharingPickerObserver {
    var onStatus: (String) -> Void = { _ in }
    var onLocalReview: (CGImage) -> Void = { _ in }
    private var generation = 0
    private var selecting = false

    func beginAfterExplicitUserGestureAndApproval() {
        cancel()
        generation += 1
        selecting = true
        var configuration = SCContentSharingPickerConfiguration()
        configuration.allowedPickerModes = [.singleWindow]
        configuration.allowsChangingSelectedContent = false
        let picker = SCContentSharingPicker.shared
        picker.defaultConfiguration = configuration
        picker.add(self)
        picker.isActive = true
        onStatus("Choose one window. Its image stays local for review.")
        picker.present(using: .window)
    }

    func cancel() {
        generation += 1; selecting = false
        let picker = SCContentSharingPicker.shared
        picker.isActive = false; picker.remove(self)
    }

    func contentSharingPicker(_ picker: SCContentSharingPicker, didCancelFor stream: SCStream?) {
        DispatchQueue.main.async { self.cancel(); self.onStatus("Cancelled. Nothing was added or uploaded.") }
    }
    func contentSharingPickerStartDidFailWithError(_ error: Error) {
        DispatchQueue.main.async { self.cancel(); self.onStatus("Window capture is unavailable. Choose a screenshot file instead.") }
    }
    func contentSharingPicker(_ picker: SCContentSharingPicker, didUpdateWith filter: SCContentFilter, for stream: SCStream?) {
        DispatchQueue.main.async {
            guard self.selecting else { return }
            self.selecting = false
            let attempt = self.generation
            let configuration = SCStreamConfiguration()
            let rect = filter.contentRect
            guard rect.width > 0, rect.height > 0 else { self.cancel(); self.onStatus("No window was selected."); return }
            let scale = min(1, 1600 / max(rect.width, rect.height))
            configuration.width = max(1, Int(rect.width * scale))
            configuration.height = max(1, Int(rect.height * scale))
            configuration.capturesAudio = false
            configuration.showsCursor = false
            // One frame, no SCStream, window enumeration or background recording.
            SCScreenshotManager.captureImage(contentFilter: filter, configuration: configuration) { image, error in
                DispatchQueue.main.async {
                    guard attempt == self.generation else { return }
                    self.cancel()
                    guard error == nil, let image else { self.onStatus("Capture failed. Nothing was uploaded."); return }
                    self.onStatus("One image ready for local review. Nothing was uploaded.")
                    self.onLocalReview(image) // Future reviewed image contract must gate any Add/upload.
                }
            }
        }
    }
}
