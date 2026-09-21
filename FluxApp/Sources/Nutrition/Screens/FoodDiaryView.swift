//
//  FoodDiaryView.swift
//  FLUX Nutrition — today's full food log: calorie ring + entry list.
//  Reached from the Nutrition card on Today (see TodayView).
//

import SwiftUI

struct FoodDiaryView: View {
    @Environment(FoodLogStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                FluxScreenBackground(orbs: FluxBackdrops.today)
                content
            }
            .navigationTitle("Today's Food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }.foregroundStyle(.white)
                }
            }
            .preferredColorScheme(.dark)
        }
    }

    @ViewBuilder
    private var content: some View {
        // `.swipeActions` only has an effect on a row inside a `List` — in a
        // plain ScrollView/VStack it silently does nothing. So this uses a
        // List, fully de-chromed (no separators, no default row/section
        // background) so it still reads as the same glass-row list as the
        // rest of the app, just with real swipe-to-delete underneath.
        let entries = store.todayEntries

        List {
            Section {
                CalorieRingView(consumed: store.todayCalories, goal: store.dailyGoal, diameter: 150)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets())
            }

            Section {
                if entries.isEmpty {
                    emptyState
                        .listRowBackground(Color.clear)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets())
                } else {
                    ForEach(entries) { entry in
                        FoodLogRow(entry: entry)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 5, leading: 16, bottom: 5, trailing: 16))
                            .swipeActions(edge: .trailing) {
                                Button(role: .destructive) {
                                    withAnimation { store.delete(entry) }
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "fork.knife")
                .font(.system(size: 30))
                .foregroundStyle(.white.opacity(0.4))
            Text("Nothing logged yet today")
                .font(FluxFont.headline())
                .foregroundStyle(.white.opacity(0.7))
            Text("Tap the camera on Today to scan your first meal.")
                .font(FluxFont.footnote())
                .foregroundStyle(.white.opacity(0.45))
                .multilineTextAlignment(.center)
        }
        .padding(.top, 40)
        .padding(.horizontal, 40)
    }
}

#Preview {
    FoodDiaryView()
        .environment(FoodLogStore())
}
