//
//  FoodItem.swift
//  FLUX Nutrition — a single food the local database knows about.
//
//  Calorie figures are rough per-serving estimates (rounded USDA-style
//  averages for a typical serving), not a certified nutrition source.
//  They exist so the app can give a useful starting number immediately
//  after a scan — always shown as editable, never presented as exact.
//

import Foundation

struct FoodItem: Identifiable, Hashable, Codable {
    var id: String                 // stable slug, e.g. "banana"
    var name: String                // display name, e.g. "Banana"
    var emoji: String
    var caloriesPerServing: Int
    var servingLabel: String        // e.g. "1 medium (118g)"
    /// Lowercased keywords the on-device Vision classifier might return that
    /// should resolve to this food (Vision's general classifier returns
    /// broad English labels, not a nutrition-specific taxonomy — matching
    /// is necessarily fuzzy).
    var matchKeywords: [String]
}
