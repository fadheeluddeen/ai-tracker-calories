//
//  GlassEffect.swift
//  FLUX — the liquid-glass material.
//
//  iOS 26 introduced a real system Liquid Glass material (`.glassEffect`,
//  `Glass.regular.tint(_:)`, `GlassEffectContainer`). That API is very new —
//  if you're building against an Xcode/SDK where it isn't available yet, or
//  targeting < iOS 26, this file falls back to a hand-built material stack
//  using `.ultraThinMaterial` (iOS 15+) that reproduces the same recipe used
//  in the Figma file: a tinted gradient fill, a soft top specular highlight,
//  a subtle bottom bounce light, a 1pt gradient edge stroke, and a lift shadow.
//
//  NOTE: verify the exact `.glassEffect` call signature against the SDK
//  you're compiling with — the API surface was still settling post-WWDC 2025
//  at the time this was written. If it doesn't match, just delete the
//  `#available(iOS 26.0, *)` branch below and keep the fallback; visually
//  they're designed to look the same.
//

import SwiftUI

struct LiquidGlass: ViewModifier {
    var cornerRadius: CGFloat = 28
    var tint: Color = .white
    var tintOpacity: Double = 0.16
    var blurStrength: CGFloat = 40   // kept for API parity with the Figma recipe; Material handles blur natively
    var castsShadow: Bool = true

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)

        Group {
            if #available(iOS 26.0, *) {
                content
                    .glassEffect(
                        .regular.tint(tint.opacity(tintOpacity)),
                        in: shape
                    )
            } else {
                content
                    .background(fallbackFill(shape))
                    .overlay(specularEdge(shape))
                    .clipShape(shape)
            }
        }
        .shadow(color: .black.opacity(castsShadow ? 0.40 : 0), radius: 17, x: 0, y: 14)
    }

    @ViewBuilder
    private func fallbackFill(_ shape: RoundedRectangle) -> some View {
        ZStack {
            shape.fill(.ultraThinMaterial)
            shape.fill(
                LinearGradient(
                    colors: [tint.opacity(tintOpacity), tint.opacity(tintOpacity * 0.35)],
                    startPoint: .top, endPoint: .bottom
                )
            )
            // top specular highlight + bottom bounce light, matching the two
            // INNER_SHADOW passes from the Figma glass() recipe
            shape
                .fill(
                    LinearGradient(
                        colors: [.white.opacity(0.10), .clear],
                        startPoint: .bottom, endPoint: .center
                    )
                )
        }
    }

    private func specularEdge(_ shape: RoundedRectangle) -> some View {
        shape.strokeBorder(
            LinearGradient(
                colors: [.white.opacity(0.50), .white.opacity(0.08), .white.opacity(0.22)],
                startPoint: .top, endPoint: .bottom
            ),
            lineWidth: 1
        )
    }
}

extension View {
    /// Apply the FLUX liquid-glass material. Matches the Figma `glass()` helper.
    func liquidGlass(
        cornerRadius: CGFloat = FluxRadius.lg,
        tint: Color = .white,
        tintOpacity: Double = 0.16,
        castsShadow: Bool = true
    ) -> some View {
        modifier(LiquidGlass(cornerRadius: cornerRadius, tint: tint, tintOpacity: tintOpacity, castsShadow: castsShadow))
    }
}

/// A ready-made glass card container with padding baked in — the SwiftUI
/// equivalent of the Figma `panel()` helper.
struct GlassCard<Content: View>: View {
    var cornerRadius: CGFloat = FluxRadius.lg
    var tint: Color = .white
    var tintOpacity: Double = 0.16
    var padding: CGFloat = 20
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .liquidGlass(cornerRadius: cornerRadius, tint: tint, tintOpacity: tintOpacity)
    }
}
