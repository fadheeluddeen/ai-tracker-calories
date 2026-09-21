//
//  ProgressScreenView.swift
//  FLUX — weekly analytics: active minutes chart, streaks, personal bests.
//
//  Named `ProgressScreenView` (not `ProgressView`) to avoid colliding with
//  SwiftUI's own built-in `ProgressView` type.
//

import SwiftUI

struct ProgressScreenView: View {
    @State private var periodSelection = 0

    private let weekBars: [DayBar] = [
        DayBar(day: "M", minutes: 58), DayBar(day: "T", minutes: 96),
        DayBar(day: "W", minutes: 44), DayBar(day: "T", minutes: 120),
        DayBar(day: "F", minutes: 78), DayBar(day: "S", minutes: 140, isHighlight: true),
        DayBar(day: "S", minutes: 66),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                header
                chartCard
                streaksRow
                personalBestsSection
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 100)
        }
        .background(FluxScreenBackground(orbs: FluxBackdrops.progress))
        .scrollIndicators(.hidden)
    }

    private var header: some View {
        HStack {
            Text("Progress").font(FluxFont.title1()).foregroundStyle(.white)
            Spacer()
            GlassSegmentedControl(options: ["W", "M"], selection: $periodSelection)
        }
    }

    private var chartCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                CaptionLabel(text: "Active minutes", color: .white.opacity(0.38))
                Spacer()
                Text(MockData.activeMinutesDelta)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(FluxColor.accentLime)
            }
            HStack(alignment: .lastTextBaseline, spacing: 6) {
                Text("\(MockData.activeMinutesTotal)").font(FluxFont.title1()).foregroundStyle(.white)
                Text("min").font(.system(size: 17, weight: .medium)).foregroundStyle(.white.opacity(0.62))
                Spacer()
                Text("avg 59 / day").font(.system(size: 13, weight: .medium)).foregroundStyle(.white.opacity(0.38))
            }
            WeeklyBarChart(bars: weekBars)
        }
        .padding(20)
        .liquidGlass(cornerRadius: FluxRadius.lg)
    }

    private var streaksRow: some View {
        HStack(spacing: 9) {
            BigStatCard(icon: FluxIcon.flame, value: MockData.dayStreak, label: "Day streak", tint: FluxColor.orbAmber)
            BigStatCard(icon: FluxIcon.trophy, value: MockData.personalBestsCount, label: "Personal bests", tint: FluxColor.orbViolet)
        }
    }

    private var personalBestsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                CaptionLabel(text: "Recent personal bests", color: .white.opacity(0.38))
                Spacer()
                Text("SEE ALL")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(0.8)
                    .foregroundStyle(FluxColor.accentLime.opacity(0.85))
            }
            VStack(spacing: 10) {
                ForEach(MockData.personalBests) { pb in
                    PersonalBestRow(icon: pb.iconName, tint: Color(hex: pb.tintHex), title: pb.title, subtitle: pb.subtitle, value: pb.value)
                }
            }
        }
    }
}

#Preview {
    ZStack(alignment: .bottom) {
        ProgressScreenView()
        FluxTabBar(selection: .constant(.progress)).padding(.bottom, 8)
    }
}
