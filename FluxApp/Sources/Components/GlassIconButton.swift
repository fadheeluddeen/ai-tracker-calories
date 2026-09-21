//
//  GlassIconButton.swift
//  FLUX — a circular glass button holding one SF Symbol. Used for the bell,
//  back/share buttons, settings gear, chevrons, etc.
//

import SwiftUI

struct GlassIconButton: View {
    let icon: String
    var size: CGFloat = 44
    var iconSize: CGFloat = 17
    var tint: Color = .white
    var iconOpacity: Double = 0.85
    var action: () -> Void = {}

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: iconSize, weight: .semibold))
                .foregroundStyle(tint.opacity(iconOpacity))
                .frame(width: size, height: size)
                .liquidGlass(cornerRadius: size / 2, castsShadow: false)
        }
        .buttonStyle(.plain)
    }
}

/// A small unread-notification dot, positioned via `.overlay(alignment:)`
/// on whatever it's attached to (see `GlassIconButton().overlay(alignment: .topTrailing) { NotificationDot() }`).
struct NotificationDot: View {
    var body: some View {
        Circle()
            .fill(FluxColor.accentMagenta)
            .frame(width: 10, height: 10)
            .overlay(Circle().stroke(FluxColor.bgBase.opacity(0.85), lineWidth: 1.5))
            .shadow(color: FluxColor.accentMagenta.opacity(0.6), radius: 5)
            .offset(x: 4, y: -4)
    }
}

#Preview {
    ZStack {
        FluxScreenBackground(orbs: FluxBackdrops.today)
        HStack(spacing: 16) {
            GlassIconButton(icon: FluxIcon.bell)
                .overlay(alignment: .topTrailing) { NotificationDot() }
            GlassIconButton(icon: FluxIcon.gear)
            GlassIconButton(icon: FluxIcon.share)
        }
    }
}
