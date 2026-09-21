//
//  FoodLogStore.swift
//  FLUX Nutrition — holds every logged food entry and persists them to a
//  JSON file in the app's Documents directory. No backend, no network —
//  matches the rest of the app. Swap `load()`/`save()` for HealthKit or a
//  real backend later without touching any view; everything reads this
//  store only through its public methods.
//

import Foundation
import Observation

@Observable
final class FoodLogStore {
    private(set) var entries: [FoodLogEntry] = []

    /// Daily calorie goal shown on the ring — a sensible default, editable
    /// later from Settings if you wire that up.
    var dailyGoal: Int = 2200

    private let fileURL: URL = {
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return dir.appendingPathComponent("flux_food_log.json")
    }()

    init() {
        load()
    }

    var todayEntries: [FoodLogEntry] {
        entries
            .filter { Calendar.current.isDateInToday($0.loggedAt) }
            .sorted { $0.loggedAt > $1.loggedAt }
    }

    var todayCalories: Int {
        todayEntries.reduce(0) { $0 + $1.calories }
    }

    var todayProgress: Double {
        guard dailyGoal > 0 else { return 0 }
        return min(1.5, Double(todayCalories) / Double(dailyGoal))
    }

    func add(_ entry: FoodLogEntry) {
        entries.append(entry)
        save()
    }

    func delete(_ entry: FoodLogEntry) {
        entries.removeAll { $0.id == entry.id }
        save()
    }

    func delete(at offsets: IndexSet, in list: [FoodLogEntry]) {
        for index in offsets {
            delete(list[index])
        }
    }

    // MARK: - Persistence

    private func load() {
        guard let data = try? Data(contentsOf: fileURL) else { return }
        entries = (try? JSONDecoder().decode([FoodLogEntry].self, from: data)) ?? []
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(entries) else { return }
        try? data.write(to: fileURL, options: .atomic)
    }
}
