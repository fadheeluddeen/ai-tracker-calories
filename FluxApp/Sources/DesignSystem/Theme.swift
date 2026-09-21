//
//  Theme.swift
//  FLUX — design tokens (colour, radii, spacing)
//
//  Mirrors the token set from the Figma "Foundations" page 1:1 so the app
//  and the design file never drift apart.
//

import SwiftUI

extension Color {
    /// Hex initializer, e.g. Color(hex: "#C8FF4D")
    init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        s.removeAll { $0 == "#" }
        var rgb: UInt64 = 0
        Scanner(string: s).scanHexInt64(&rgb)
        let r = Double((rgb & 0xFF0000) >> 16) / 255
        let g = Double((rgb & 0x00FF00) >> 8) / 255
        let b = Double(rgb & 0x0000FF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

enum FluxColor {
    // Canvas
    static let bgBase = Color(hex: "#05060A")
    static let bgDeep = Color(hex: "#0A0C14")
    static let bgGradient = LinearGradient(colors: [bgBase, bgDeep], startPoint: .top, endPoint: .bottom)

    // Backdrop orbs — the colour every glass panel refracts
    static let orbLime = Color(hex: "#C8FF4D")
    static let orbCyan = Color(hex: "#3DE8FF")
    static let orbViolet = Color(hex: "#7C5CFF")
    static let orbMagenta = Color(hex: "#FF4FA0")
    static let orbAmber = Color(hex: "#FFA33D")

    // Content
    static let textPrimary = Color.white
    static let textSecondary = Color.white.opacity(0.62)
    static let textTertiary = Color.white.opacity(0.38)

    static let accentLime = Color(hex: "#C8FF4D")
    static let accentCyan = Color(hex: "#3DE8FF")
    static let accentMagenta = Color(hex: "#FF4FA0")
    static let accentViolet = Color(hex: "#7C5CFF")
    static let accentAmber = Color(hex: "#FFA33D")

    // Activity rings
    static let ringMove = Color(hex: "#FF4FA0")
    static let ringExercise = Color(hex: "#C8FF4D")
    static let ringStand = Color(hex: "#3DE8FF")

    /// Lime → cyan diagonal, used on primary CTAs (Start button, FAB, play controls)
    static let limeCyanDiagonal = LinearGradient(
        colors: [orbLime, orbCyan],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    static let limeSolidGradient = LinearGradient(
        colors: [Color(hex: "#D6FF6B"), Color(hex: "#A8F03D")],
        startPoint: .top, endPoint: .bottom
    )
}

enum FluxRadius {
    static let xs: CGFloat = 12
    static let sm: CGFloat = 18
    static let md: CGFloat = 24
    static let lg: CGFloat = 30
    static let xl: CGFloat = 38
    static let pill: CGFloat = 999
}

enum FluxSpace {
    static let s1: CGFloat = 4
    static let s2: CGFloat = 8
    static let s3: CGFloat = 12
    static let s4: CGFloat = 16
    static let s5: CGFloat = 20
    static let s6: CGFloat = 24
}
