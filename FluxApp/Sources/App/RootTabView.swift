//
//  RootTabView.swift
//  FLUX — top-level navigation: the four main screens + the FAB. The FAB
//  now offers a choice (a workout, tapping the FAB now offers "Start
//  Workout" or "Log Meal" since both are quick-add actions), and this is
//  also where the shared FoodLogStore is created and injected — every
//  Nutrition screen reads it via `@Environment(FoodLogStore.self)`.
//

import SwiftUI

struct RootTabView: View {
    @State private var selection: FluxTab = .today
    @State private var showingWorkoutLive = false
    @State private var showingScan = false
    @State private var showingFABChoice = false
    @State private var foodStore = FoodLogStore()

    var body: some View {
        ZStack(alignment: .bottom) {
            content
                .transaction { $0.animation = nil }

            FluxTabBar(selection: $selection) {
                showingFABChoice = true
            }
            .padding(.bottom, 8)
        }
        .confirmationDialog("Quick add", isPresented: $showingFABChoice, titleVisibility: .visible) {
            Button("Start Workout") { showingWorkoutLive = true }
            Button("Log a Meal") { showingScan = true }
            Button("Cancel", role: .cancel) {}
        }
        .fullScreenCover(isPresented: $showingWorkoutLive) {
            WorkoutLiveView()
        }
        .fullScreenCover(isPresented: $showingScan) {
            NutritionScanView()
        }
        .environment(foodStore)
        .preferredColorScheme(.dark)
    }

    @ViewBuilder
    private var content: some View {
        switch selection {
        case .today: TodayView()
        case .progress: ProgressScreenView()
        case .train: WorkoutsView()
        case .profile: ProfileView()
        }
    }
}

#Preview {
    RootTabView()
}
