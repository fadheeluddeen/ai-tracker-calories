//
//  SplitRow.swift
//  FLUX — one per-kilometre pace row on the Workout Live screen.
//

import SwiftUI

struct SplitData: Identifiable {
    let id = UUID()
    var km: String
    var fraction: Double   // 0...1, relative bar fill
    var pace: String
    var isCurrent: Bool = false
}

struct SplitRow: View {
    let split: SplitData

    var body: some View {
        HStack(spacing: 8) {
            Text(split.km)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(split.isCurrent ? FluxColor.accentLime : .white.opacity(0.62))
                .frame(width: 34, alignment: .leading)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 5, style: .continuous)
                        .fill(.white.opacity(0.12))
                    RoundedRectangle(cornerRadius: 5, style: .continuous)
                        .fill(LinearGradient(colors: [FluxColor.orbLime, FluxColor.orbCyan], startPoint: .leading, endPoint: .trailing))
                        .frame(width: geo.size.width * max(0.02, min(1, split.fraction)))
                        .opacity(split.isCurrent ? 1 : 0.65)
                }
            }
            .frame(height: 10)

            Text(split.pace)
                .font(.system(size: 12, weight: split.isCurrent ? .semibold : .medium))
                .foregroundStyle(.white.opacity(split.isCurrent ? 1 : 0.62))
                .frame(width: 40, alignment: .trailing)
        }
    }
}

#Preview {
    VStack(spacing: 10) {
        SplitRow(split: SplitData(km: "KM 3", fraction: 196.0/232, pace: "5:41"))
        SplitRow(split: SplitData(km: "KM 4", fraction: 214.0/232, pace: "5:33"))
        SplitRow(split: SplitData(km: "KM 5", fraction: 178.0/232, pace: "5:47"))
        SplitRow(split: SplitData(km: "KM 6", fraction: 1.0, pace: "5:28", isCurrent: true))
    }
    .padding()
    .liquidGlass(tint: FluxColor.accentMagenta, tintOpacity: 0.18)
    .padding()
    .background(FluxScreenBackground(orbs: FluxBackdrops.workoutLive))
}
