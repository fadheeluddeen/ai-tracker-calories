//
//  Typography.swift
//  FLUX — type ramp, mapped onto SF Pro (the system font) rather than Inter.
//
//  Inter was used in the Figma mock as an Inter-for-SF-Pro stand-in; a native
//  app should just use San Francisco, the actual font iOS 26's Liquid Glass
//  system is built around. Sizes/weights/tracking are carried over exactly.
//

import SwiftUI

enum FluxFont {
    static func display() -> Font { .system(size: 56, weight: .bold, design: .default) }
    static func title1() -> Font { .system(size: 34, weight: .bold) }
    static func title2() -> Font { .system(size: 26, weight: .bold) }
    static func title3() -> Font { .system(size: 20, weight: .semibold) }
    static func headline() -> Font { .system(size: 17, weight: .semibold) }
    static func body() -> Font { .system(size: 16, weight: .regular) }
    static func callout() -> Font { .system(size: 15, weight: .medium) }
    static func footnote() -> Font { .system(size: 13, weight: .medium) }
    static func caption() -> Font { .system(size: 11, weight: .semibold) }
    static func numeric() -> Font { .system(size: 44, weight: .bold, design: .rounded) }
}

/// Uppercase, wide-tracked label used for section headers and small metric
/// captions throughout the app ("STEPS", "UP NEXT", "MOVE").
struct CaptionLabel: View {
    let text: String
    var color: Color = FluxColor.textTertiary

    var body: some View {
        Text(text.uppercased())
            .font(FluxFont.caption())
            .tracking(1.2)
            .foregroundStyle(color)
    }
}

extension View {
    /// Convenience: apply a Flux type style + tracking + colour in one call.
    func fluxFont(_ font: Font, tracking: CGFloat = 0, color: Color = FluxColor.textPrimary) -> some View {
        self.font(font).tracking(tracking).foregroundStyle(color)
    }
}
