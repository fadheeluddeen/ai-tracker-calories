//
//  TodayView.swift
//  FLUX — home dashboard: activity rings, stat tiles, next workout, recovery.
//

import SwiftUI

struct TodayView: View {
    @Environment(FoodLogStore.self) private var foodStore
    @State private var showingScan = false
    @State private var showingDiary = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                header
                ringsCard
                statsRow
                nutritionCard
                upNextSection
                recoveryStrip
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 100)   // clear the floating tab bar
        }
        .background(FluxScreenBackground(orbs: FluxBackdrops.today))
        .scrollIndicators(.hidden)
        .fullScreenCover(isPresented: $showingScan) { NutritionScanView() }
        .sheet(isPresented: $showingDiary) { FoodDiaryView() }
    }

    private var nutritionCard: some View {
        HStack(spacing: 16) {
            CalorieRingView(consumed: foodStore.todayCalories, goal: foodStore.dailyGoal, diameter: 76, thickness: 9)

            VStack(alignment: .leading, spacing: 6) {
                CaptionLabel(text: "Nutrition", color: .white.opacity(0.45))
                Text("\(foodStore.todayCalories) kcal today")
                    .font(FluxFont.headline())
                    .foregroundStyle(.white)
                Text(foodStore.todayEntries.isEmpty ? "Nothing logged yet" : "\(foodStore.todayEntries.count) item\(foodStore.todayEntries.count == 1 ? "" : "s") logged")
                    .font(FluxFont.footnote())
                    .foregroundStyle(.white.opacity(0.55))
            }
            Spacer(minLength: 0)

            VStack(spacing: 8) {
                Button { showingScan = true } label: {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(FluxColor.bgBase)
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(FluxColor.limeSolidGradient))
                }
                .buttonStyle(.plain)

                Button { showingDiary = true } label: {
                    Image(systemName: "list.bullet")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.7))
                        .frame(width: 40, height: 40)
                        .liquidGlass(cornerRadius: 20, castsShadow: false)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .liquidGlass(cornerRadius: FluxRadius.lg, tint: FluxColor.accentLime, tintOpacity: 0.14)
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Good morning")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white.opacity(0.62))
                Text(MockData.userName)
                    .font(FluxFont.title1())
                    .foregroundStyle(.white)
            }
            Spacer()
            GlassIconButton(icon: FluxIcon.bell, iconOpacity: 1)
                .overlay(alignment: .topTrailing) { NotificationDot() }
        }
    }

    private var ringsCard: some View {
        HStack(spacing: 18) {
            ActivityRingsView(rings: [
                RingData(color: FluxColor.ringMove, progress: MockData.moveProgress, diameter: 150),
                RingData(color: FluxColor.ringExercise, progress: MockData.exerciseProgress, diameter: 116),
                RingData(color: FluxColor.ringStand, progress: MockData.standProgress, diameter: 82),
            ])

            VStack(alignment: .leading, spacing: 16) {
                RingLegendRow(color: FluxColor.ringMove, label: "Move", value: "512 / 620 kcal")
                RingLegendRow(color: FluxColor.ringExercise, label: "Exercise", value: "38 / 60 min")
                RingLegendRow(color: FluxColor.ringStand, label: "Stand", value: "9 / 12 hr")
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 30)
        .padding(.horizontal, 20)
        .liquidGlass(cornerRadius: FluxRadius.xl)
    }

    private var statsRow: some View {
        HStack(spacing: 8) {
            StatTile(icon: FluxIcon.activity, value: MockData.steps, label: "Steps", tint: FluxColor.orbCyan)
            StatTile(icon: FluxIcon.distance, value: MockData.distanceKM, label: "Distance", tint: FluxColor.orbLime)
            StatTile(icon: FluxIcon.flame, value: MockData.calories, label: "Calories", tint: FluxColor.orbMagenta)
        }
    }

    private var upNextSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                CaptionLabel(text: "Up next")
                Spacer()
                Text("See all")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(FluxColor.accentLime)
            }

            VStack(alignment: .leading, spacing: 4) {
                CaptionLabel(text: "Strength · 45 min", color: FluxColor.accentLime)
                Text("Upper Body Power")
                    .font(FluxFont.title2())
                    .foregroundStyle(.white)
                Text("8 exercises · 3 rounds")
                    .font(FluxFont.footnote())
                    .foregroundStyle(.white.opacity(0.62))

                HStack {
                    HStack(spacing: 6) {
                        Image(systemName: FluxIcon.clock).font(.system(size: 13)).foregroundStyle(.white.opacity(0.55))
                        Text("6:30 PM · Full gym")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(.white.opacity(0.55))
                    }
                    Spacer()
                    Button {
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: FluxIcon.play).font(.system(size: 12))
                            Text("Start").font(.system(size: 15, weight: .semibold))
                        }
                        .foregroundStyle(FluxColor.bgBase)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Capsule().fill(FluxColor.limeSolidGradient))
                        .shadow(color: FluxColor.accentLime.opacity(0.35), radius: 12, x: 0, y: 6)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.top, 8)
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .liquidGlass(cornerRadius: FluxRadius.lg, tint: FluxColor.orbViolet, tintOpacity: 0.26)
        }
    }

    private var recoveryStrip: some View {
        HStack(spacing: 10) {
            Image(systemName: FluxIcon.heart)
                .foregroundStyle(FluxColor.accentMagenta)
            VStack(alignment: .leading, spacing: 1) {
                CaptionLabel(text: "Recovery", color: .white.opacity(0.45))
                Text("\(MockData.recoveryPercent) · Ready to train")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white.opacity(0.85))
            }
            Spacer()
            Image(systemName: FluxIcon.chevronRight)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white.opacity(0.4))
        }
        .padding(.horizontal, 16)
        .frame(height: 58)
        .liquidGlass(cornerRadius: 22)
    }
}

#Preview {
    ZStack(alignment: .bottom) {
        TodayView()
        FluxTabBar(selection: .constant(.today)).padding(.bottom, 8)
    }
    .environment(FoodLogStore())
}
