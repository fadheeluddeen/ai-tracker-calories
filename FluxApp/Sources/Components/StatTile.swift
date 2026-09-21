//
//  StatTile.swift
//  FLUX — small tinted-glass stat card (Steps / Distance / Calories, etc).
//

import SwiftUI

struct StatTile: View {
    let icon: String
    let value: String
    let label: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ZStack {
                RoundedRectangle(cornerRadius: 11, style: .continuous)
                    .fill(tint.opacity(0.20))
                    .overlay(
                        RoundedRectangle(cornerRadius: 11, style: .continuous)
                            .strokeBorder(tint.opacity(0.35), lineWidth: 1)
                    )
                Image(systemName: icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(tint)
            }
            .frame(width: 32, height: 32)

            Text(value)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(.white)
            CaptionLabel(text: label, color: .white.opacity(0.45))
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .liquidGlass(cornerRadius: FluxRadius.md, tint: tint, tintOpacity: 0.18)
    }
}

/// A larger variant used on the Progress screen (icon + big number + caption,
/// space-between so the caption sits at the bottom of a fixed-height card).
struct BigStatCard: View {
    let icon: String
    let value: String
    let label: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(tint)
            Spacer(minLength: 8)
            Text(value)
                .font(FluxFont.title2())
                .foregroundStyle(.white)
            CaptionLabel(text: label, color: .white.opacity(0.55))
        }
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: 112, alignment: .leading)
        .liquidGlass(cornerRadius: FluxRadius.md, tint: tint, tintOpacity: 0.22)
    }
}

#Preview {
    ZStack {
        FluxScreenBackground(orbs: FluxBackdrops.today)
        HStack(spacing: 8) {
            StatTile(icon: FluxIcon.activity, value: "8,241", label: "Steps", tint: FluxColor.orbCyan)
            StatTile(icon: FluxIcon.distance, value: "6.4 km", label: "Distance", tint: FluxColor.orbLime)
            StatTile(icon: FluxIcon.flame, value: "743", label: "Calories", tint: FluxColor.orbMagenta)
        }
        .padding(20)
    }
}
