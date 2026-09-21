//
//  WeeklyBarChart.swift
//  FLUX — the 7-day "Active Minutes" bar chart on the Progress screen.
//

import SwiftUI

struct DayBar: Identifiable {
    let id = UUID()
    var day: String        // single-letter label, e.g. "M"
    var minutes: Int
    var isHighlight: Bool = false
}

struct WeeklyBarChart: View {
    let bars: [DayBar]
    var maxHeight: CGFloat = 140

    private var maxMinutes: Int { max(1, bars.map(\.minutes).max() ?? 1) }

    var body: some View {
        HStack(alignment: .bottom, spacing: 10) {
            ForEach(bars) { bar in
                VStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 15, style: .continuous)
                        .fill(
                            bar.isHighlight
                                ? AnyShapeStyle(LinearGradient(colors: [FluxColor.orbLime, FluxColor.orbCyan], startPoint: .top, endPoint: .bottom))
                                : AnyShapeStyle(.white.opacity(0.16))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 15, style: .continuous)
                                .strokeBorder(bar.isHighlight ? .clear : .white.opacity(0.20), lineWidth: 1)
                        )
                        .frame(height: max(6, CGFloat(bar.minutes) / CGFloat(maxMinutes) * maxHeight))
                        .shadow(color: bar.isHighlight ? FluxColor.orbLime.opacity(0.5) : .clear, radius: 12, x: 0, y: 6)

                    Text(bar.day)
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(1)
                        .foregroundStyle(bar.isHighlight ? FluxColor.orbLime : .white.opacity(0.38))
                }
                .frame(maxWidth: .infinity)
            }
        }
        .frame(height: maxHeight + 22, alignment: .bottom)
    }
}

#Preview {
    WeeklyBarChart(bars: [
        DayBar(day: "M", minutes: 58), DayBar(day: "T", minutes: 96),
        DayBar(day: "W", minutes: 44), DayBar(day: "T", minutes: 120),
        DayBar(day: "F", minutes: 78), DayBar(day: "S", minutes: 140, isHighlight: true),
        DayBar(day: "S", minutes: 66),
    ])
    .padding()
    .background(FluxScreenBackground(orbs: FluxBackdrops.progress))
}
