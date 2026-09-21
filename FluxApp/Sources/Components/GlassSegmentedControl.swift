//
//  GlassSegmentedControl.swift
//  FLUX — small glass W/M-style segmented control used on the Progress screen.
//

import SwiftUI

struct GlassSegmentedControl: View {
    let options: [String]
    @Binding var selection: Int

    var body: some View {
        HStack(spacing: 2) {
            ForEach(options.indices, id: \.self) { i in
                let active = i == selection
                Button {
                    withAnimation(.easeOut(duration: 0.15)) { selection = i }
                } label: {
                    Text(options[i])
                        .font(.system(size: 13, weight: active ? .bold : .semibold))
                        .foregroundStyle(active ? FluxColor.bgBase : .white.opacity(0.6))
                        .frame(width: 34, height: 28)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(active ? AnyShapeStyle(FluxColor.limeSolidGradient) : AnyShapeStyle(.clear))
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .liquidGlass(cornerRadius: 18, castsShadow: false)
    }
}

/// Horizontally-scrolling glass pill chips (category filters, "All / Strength / Cardio ...").
struct GlassChip: View {
    let label: String
    var active: Bool = false

    var body: some View {
        Text(label)
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(active ? FluxColor.bgBase : .white.opacity(0.8))
            .padding(.horizontal, 16)
            .padding(.vertical, 9)
            .background(
                Group {
                    if active {
                        Capsule().fill(FluxColor.limeSolidGradient)
                    } else {
                        Capsule()
                            .fill(.ultraThinMaterial)
                            .overlay(Capsule().strokeBorder(.white.opacity(0.18), lineWidth: 1))
                    }
                }
            )
    }
}

#Preview {
    VStack(spacing: 20) {
        GlassSegmentedControl(options: ["W", "M"], selection: .constant(0))
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                GlassChip(label: "All", active: true)
                GlassChip(label: "Strength")
                GlassChip(label: "Cardio")
                GlassChip(label: "Mobility")
                GlassChip(label: "HIIT")
            }
        }
    }
    .padding()
    .background(FluxScreenBackground(orbs: FluxBackdrops.workouts))
}
