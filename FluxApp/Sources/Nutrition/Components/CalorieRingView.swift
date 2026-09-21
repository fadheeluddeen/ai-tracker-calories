//
//  CalorieRingView.swift
//  FLUX Nutrition — single ring showing today's calories vs. goal.
//

import SwiftUI

struct CalorieRingView: View {
    let consumed: Int
    let goal: Int
    var diameter: CGFloat = 130
    var thickness: CGFloat = 14

    private var progress: Double {
        guard goal > 0 else { return 0 }
        return min(1.0, Double(consumed) / Double(goal))
    }

    private var overGoal: Bool { consumed > goal }

    var body: some View {
        ZStack {
            Circle()
                .stroke(FluxColor.accentAmber.opacity(0.16), lineWidth: thickness)

            Circle()
                .trim(from: 0, to: max(0.001, progress))
                .stroke(
                    overGoal ? AnyShapeStyle(FluxColor.accentMagenta) : AnyShapeStyle(FluxColor.limeCyanDiagonal),
                    style: StrokeStyle(lineWidth: thickness, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))

            VStack(spacing: 2) {
                Text("\(consumed)")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(.white)
                Text("of \(goal) kcal")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.45))
            }
        }
        .frame(width: diameter, height: diameter)
    }
}

#Preview {
    ZStack {
        FluxScreenBackground(orbs: FluxBackdrops.today)
        CalorieRingView(consumed: 1450, goal: 2200)
    }
}
