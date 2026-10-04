import Foundation

/// No production token or network endpoint is embedded in the keyboard.
/// Cloud tasks need a scoped native authentication bridge and device validation first.
enum DoKeyboardConfig {
    static let cloudPreparationEnabled = false
}
