//
//  MockData.swift
//  FLUX — sample content standing in for a real data layer. Swap these for
//  HealthKit / your backend of choice; every screen reads only from here.
//

import Foundation

struct WorkoutItem: Identifiable {
    let id = UUID()
    var title: String
    var meta: String
    var iconName: String
    var gradientHexA: String
    var gradientHexB: String
}

struct PersonalBest: Identifiable {
    let id = UUID()
    var title: String
    var subtitle: String
    var value: String
    var iconName: String
    var tintHex: String
}

enum MockData {
    static let userName = "Alex"
    static let userFullName = "Alex Rivera"
    static let userInitials = "AR"
    static let memberSince = "Member since 2023 · Level 12"

    // Today
    static let moveProgress = 512.0 / 620.0
    static let exerciseProgress = 38.0 / 60.0
    static let standProgress = 9.0 / 12.0

    static let steps = "8,241"
    static let distanceKM = "6.4 km"
    static let calories = "743"

    static let recoveryPercent = "86%"

    // Workout Live
    static let elapsedTime = "28:41"
    static let liveDistance = "5.24"
    static let livePace = "5:28"
    static let liveHeart = "162"

    // Progress
    static let activeMinutesTotal = 412
    static let activeMinutesDelta = "+18% vs last week"
    static let dayStreak = "17"
    static let personalBestsCount = "5"

    static let personalBests: [PersonalBest] = [
        PersonalBest(title: "Fastest 5K", subtitle: "Sat 14 Sep · Riverside loop", value: "24:06", iconName: "map.fill", tintHex: "#3DE8FF"),
        PersonalBest(title: "Heaviest deadlift", subtitle: "Thu 12 Sep · Strength", value: "142 kg", iconName: "dumbbell.fill", tintHex: "#C8FF4D"),
    ]

    // Workouts library
    static let featuredWorkout = WorkoutItem(
        title: "VO2 Max Intervals", meta: "6 × 3 min @ 90% · 32 min",
        iconName: "bolt.fill", gradientHexA: "#3DE8FF", gradientHexB: "#C8FF4D"
    )

    static let allWorkouts: [WorkoutItem] = [
        WorkoutItem(title: "Upper Body Power", meta: "Strength · 45 min · 8 exercises", iconName: "dumbbell.fill", gradientHexA: "#C8FF4D", gradientHexB: "#3DE8FF"),
        WorkoutItem(title: "Metcon Burner", meta: "HIIT · 22 min · 6 rounds", iconName: "flame.fill", gradientHexA: "#FF4FA0", gradientHexB: "#FFA33D"),
        WorkoutItem(title: "Recovery Flow", meta: "Mobility · 18 min · 12 poses", iconName: "heart.fill", gradientHexA: "#7C5CFF", gradientHexB: "#3DE8FF"),
    ]

    // Profile
    static let lifetimeWorkouts = "184"
    static let lifetimeCalories = "62.4k"
    static let lifetimeStreak = "17"
}
