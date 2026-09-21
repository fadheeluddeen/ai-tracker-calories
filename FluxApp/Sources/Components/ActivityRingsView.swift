//
//  ActivityRingsView.swift
//  FLUX — three concentric progress rings (Move / Exercise / Stand).
//

import SwiftUI

struct RingData: Identifiable {
    let id = UUID()
    var color: Color
    var progress: Double   // 0...1
    var diameter: CGFloat
}

struct ActivityRingsView: View {
    let rings: [RingData]
    var thickness: CGFloat = 15

    var body: some View {
        ZStack {
            ForEach(rings) { ring in
                Circle()
                    .stroke(ring.color.opacity(0.16), lineWidth: thickness)
                    .frame(width: ring.diameter, height: ring.diameter)

                Circle()
                    .trim(from: 0, to: max(0.001, min(1, ring.progress)))
                    .stroke(ring.color, style: StrokeStyle(lineWidth: thickness, lineCap: .round))
                    .frame(width: ring.diameter, height: ring.diameter)
                    .rotationEffect(.degrees(-90))
            }
        }
        .frame(
            width: rings.map(\.diameter).max() ?? 0,
            height: rings.map(\.diameter).max() ?? 0
        )
    }
}

/// One legend row: coloured dot + uppercase label + value.
struct RingLegendRow: View {
    let color: Color
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: 9) {
            Circle().fill(color).frame(width: 8, height: 8)
            VStack(alignment: .leading, spacing: 2) {
                CaptionLabel(text: label, color: color)
                Text(value)
                    .font(FluxFont.footnote())
                    .foregroundStyle(.white.opacity(0.72))
            }
        }
    }
}

#Preview {
    ZStack {
        FluxScreenBackground(orbs: FluxBackdrops.today)
        HStack(spacing: 18) {
            ActivityRingsView(rings: [
                RingData(color: FluxColor.ringMove, progress: 0.82, diameter: 150),
                RingData(color: FluxColor.ringExercise, progress: 0.64, diameter: 116),
                RingData(color: FluxColor.ringStand, progress: 0.45, diameter: 82),
            ])
            VStack(alignment: .leading, spacing: 16) {
                RingLegendRow(color: FluxColor.ringMove, label: "Move", value: "512 / 620 kcal")
                RingLegendRow(color: FluxColor.ringExercise, label: "Exercise", value: "38 / 60 min")
                RingLegendRow(color: FluxColor.ringStand, label: "Stand", value: "9 / 12 hr")
            }
        }
        .padding(30)
        .liquidGlass(cornerRadius: FluxRadius.xl)
        .padding(20)
    }
}
