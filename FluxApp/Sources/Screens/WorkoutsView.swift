//
//  WorkoutsView.swift
//  FLUX — browsable workout library.
//

import SwiftUI

struct WorkoutsView: View {
    @State private var query = ""
    @State private var categoryIndex = 0
    private let categories = ["All", "Strength", "Cardio", "Mobility", "HIIT"]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                header
                searchField
                categoryRow
                featuredCard
                allWorkoutsSection
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 100)
        }
        .background(FluxScreenBackground(orbs: FluxBackdrops.workouts))
        .scrollIndicators(.hidden)
    }

    private var header: some View {
        HStack {
            Text("Train").font(FluxFont.title1()).foregroundStyle(.white)
            Spacer()
            GlassIconButton(icon: FluxIcon.gear)
        }
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: FluxIcon.search).foregroundStyle(.white.opacity(0.45))
            TextField("", text: $query, prompt: Text("Search workouts").foregroundStyle(.white.opacity(0.45)))
                .foregroundStyle(.white)
        }
        .padding(.horizontal, 18)
        .frame(height: 48)
        .liquidGlass(cornerRadius: 24, castsShadow: false)
    }

    private var categoryRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(categories.indices, id: \.self) { i in
                    Button {
                        withAnimation(.easeOut(duration: 0.15)) { categoryIndex = i }
                    } label: {
                        GlassChip(label: categories[i], active: i == categoryIndex)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var featuredCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    CaptionLabel(text: "Featured · This week", color: FluxColor.accentCyan)
                    Text(MockData.featuredWorkout.title)
                        .font(FluxFont.title2())
                        .foregroundStyle(.white)
                    Text(MockData.featuredWorkout.meta)
                        .font(FluxFont.footnote())
                        .foregroundStyle(.white.opacity(0.62))
                }
                Spacer()
                Button {
                } label: {
                    Image(systemName: FluxIcon.play)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(FluxColor.bgBase)
                        .frame(width: 48, height: 48)
                        .background(
                            Circle().fill(LinearGradient(colors: [FluxColor.orbCyan, FluxColor.orbLime], startPoint: .topLeading, endPoint: .bottomTrailing))
                        )
                        .shadow(color: FluxColor.orbCyan.opacity(0.42), radius: 14, x: 0, y: 6)
                }
                .buttonStyle(.plain)
            }
            HStack(spacing: 8) {
                metaChip("HIIT")
                metaChip("ADVANCED")
                metaChip("480 KCAL")
            }
        }
        .padding(20)
        .liquidGlass(cornerRadius: FluxRadius.lg, tint: FluxColor.orbCyan, tintOpacity: 0.26)
    }

    private func metaChip(_ label: String) -> some View {
        Text(label)
            .font(.system(size: 11, weight: .semibold))
            .tracking(0.8)
            .foregroundStyle(.white.opacity(0.88))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Capsule().fill(.white.opacity(0.14)))
    }

    private var allWorkoutsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            CaptionLabel(text: "All workouts", color: .white.opacity(0.42))
            VStack(spacing: 10) {
                ForEach(MockData.allWorkouts) { w in
                    WorkoutListRow(
                        icon: w.iconName,
                        colors: [Color(hex: w.gradientHexA), Color(hex: w.gradientHexB)],
                        title: w.title, meta: w.meta
                    )
                }
            }
        }
    }
}

#Preview {
    ZStack(alignment: .bottom) {
        WorkoutsView()
        FluxTabBar(selection: .constant(.train)).padding(.bottom, 8)
    }
}
