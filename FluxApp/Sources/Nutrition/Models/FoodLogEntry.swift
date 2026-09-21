//
//  FoodLogEntry.swift
//  FLUX Nutrition — one logged meal/snack.
//

import Foundation

struct FoodLogEntry: Identifiable, Codable, Hashable {
    var id: UUID = UUID()
    var foodName: String
    var emoji: String
    var servingLabel: String
    var servings: Double          // portion multiplier the user picked, e.g. 1.5
    var calories: Int             // final logged calories = caloriesPerServing * servings, rounded
    var loggedAt: Date = Date()
    /// true if this entry came from a camera scan (vs. manual search) —
    /// purely informational, shown as a small badge in the diary.
    var wasScanned: Bool = false
}
