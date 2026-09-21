//
//  FoodLogRow.swift
//  FLUX Nutrition — one row in the food diary list.
//

import SwiftUI

struct FoodLogRow: View {
    let entry: FoodLogEntry

    private static let timeFormatter: DateFormatter = {
        let f = DateFormatter()
        f.timeStyle = .short
        return f
    }()

    var body: some View {
        HStack(spacing: 14) {
            Text(entry.emoji)
                .font(.system(size: 26))
                .frame(width: 48, height: 48)
                .background(Circle().fill(.white.opacity(0.08)))

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(entry.foodName)
                        .font(FluxFont.headline())
                        .foregroundStyle(.white)
                    if entry.wasScanned {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(FluxColor.accentCyan)
                    }
                }
                Text("\(Self.timeFormatter.string(from: entry.loggedAt)) · \(entry.servingLabel)")
                    .font(FluxFont.footnote())
                    .foregroundStyle(.white.opacity(0.5))
            }
            Spacer(minLength: 8)
            Text("\(entry.calories)")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(FluxColor.accentLime)
            Text("kcal")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(.white.opacity(0.4))
        }
        .padding(.horizontal, 14)
        .frame(height: 68)
        .liquidGlass(cornerRadius: FluxRadius.md, castsShadow: false)
    }
}

#Preview {
    FoodLogRow(entry: FoodLogEntry(foodName: "Grilled chicken", emoji: "🍗", servingLabel: "1 breast (172g)", servings: 1, calories: 231, wasScanned: true))
        .padding()
        .background(FluxScreenBackground(orbs: FluxBackdrops.today))
}
