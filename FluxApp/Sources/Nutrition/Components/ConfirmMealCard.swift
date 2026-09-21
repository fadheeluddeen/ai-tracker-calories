//
//  ConfirmMealCard.swift
//  FLUX Nutrition — shared "food + portion + calories + log" block used by
//  both ScanResultView (AI match) and FoodSearchView (manual pick), so the
//  confirm step looks and behaves identically regardless of how the food
//  was found.
//

import SwiftUI

struct ConfirmMealCard: View {
    let food: FoodItem
    @Binding var servings: Double
    var wasScanned: Bool
    var onLog: (FoodLogEntry) -> Void

    private var estimatedCalories: Int {
        Int((Double(food.caloriesPerServing) * servings).rounded())
    }

    var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                Text(food.emoji).font(.system(size: 40))
                VStack(alignment: .leading, spacing: 4) {
                    Text(food.name).font(FluxFont.title3()).foregroundStyle(.white)
                    Text(food.servingLabel).font(FluxFont.footnote()).foregroundStyle(.white.opacity(0.55))
                }
                Spacer()
            }

            VStack(spacing: 12) {
                HStack {
                    CaptionLabel(text: "Portion", color: .white.opacity(0.45))
                    Spacer()
                    Text(String(format: "%.1f×", servings))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                }
                HStack(spacing: 14) {
                    stepButton(systemName: "minus") { servings = max(0.5, servings - 0.5) }
                    Slider(value: $servings, in: 0.5...3.0, step: 0.5).tint(FluxColor.accentLime)
                    stepButton(systemName: "plus") { servings = min(3.0, servings + 0.5) }
                }
                HStack {
                    CaptionLabel(text: "Estimated calories", color: .white.opacity(0.45))
                    Spacer()
                    Text("\(estimatedCalories) kcal")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(FluxColor.accentLime)
                }
            }
            .padding(14)
            .liquidGlass(cornerRadius: FluxRadius.md, tint: FluxColor.accentLime, tintOpacity: 0.12, castsShadow: false)

            Button {
                onLog(FoodLogEntry(
                    foodName: food.name,
                    emoji: food.emoji,
                    servingLabel: servings == 1.0 ? food.servingLabel : String(format: "%.1f× %@", servings, food.servingLabel),
                    servings: servings,
                    calories: estimatedCalories,
                    wasScanned: wasScanned
                ))
            } label: {
                Text("Log Meal")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(FluxColor.bgBase)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Capsule().fill(FluxColor.limeSolidGradient))
                    .shadow(color: FluxColor.accentLime.opacity(0.35), radius: 14, x: 0, y: 8)
            }
            .buttonStyle(.plain)
        }
        .padding(18)
        .liquidGlass(cornerRadius: FluxRadius.lg)
    }

    private func stepButton(systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .foregroundStyle(.white)
                .frame(width: 36, height: 36)
                .liquidGlass(cornerRadius: 18, castsShadow: false)
        }
        .buttonStyle(.plain)
    }
}
