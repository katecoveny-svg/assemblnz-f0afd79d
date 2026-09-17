import WebKit

/** Native microphone permission is still a prompt, never an automatic grant.
    Restricted to the primary Assembl frame. Camera / screen capture is not enabled. */
extension CompanionModel {
    @available(macOS 12.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        let allowedPaths = ["/do/widget", "/do/meetings"]
        let trusted = origin.protocol == "https"
            && origin.host == "www.assembl.co.nz"
            && (origin.port == 0 || origin.port == 443)
            && frame.isMainFrame
            && webView.url?.scheme == "https"
            && webView.url?.host == "www.assembl.co.nz"
            && allowedPaths.contains(webView.url?.path ?? "")
        decisionHandler(trusted && type == .microphone ? .prompt : .deny)
    }
}
