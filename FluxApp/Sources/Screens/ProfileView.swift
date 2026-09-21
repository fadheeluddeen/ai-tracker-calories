//
//  ProfileView.swift
//  FLUX — identity, lifetime stats, achievements, settings.
//

import SwiftUI

struct ProfileView: View {
    @State private var healthSyncOn = true

    private let badges: [(icon: String, tint: Color, locked: Bool)] = [
        (FluxIcon.trophy, FluxColor.orbLime, false),
        (FluxIcon.flame, FluxColor.orbAmber, false),
        (FluxIcon.bolt, FluxColor.orbCyan, false),
        (FluxIcon.heart, .white, true),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                header
                identityBlock
                statsStrip
                achievementsSection
                settingsSection
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 100)
        }
        .background(FluxScreenBackground(orbs: FluxBackdrops.profile))
        .scrollIndicators(.hidden)
    }

    private var header: some View {
        HStack {
            Text("You").font(FluxFont.title1()).foregroundStyle(.white)
            Spacer()
            GlassIconButton(icon: FluxIcon.gear)
        }
    }

    private var identityBlock: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(LinearGradient(colors: [FluxColor.orbViolet, FluxColor.orbMagenta], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .overlay(Circle().strokeBorder(.white.opacity(0.3), lineWidth: 1))
                    .shadow(color: FluxColor.orbViolet.opacity(0.55), radius: 20, x: 0, y: 14)
                Text(MockData.userInitials)
                    .font(.system(size: 30, weight: .bold))
                    .foregroundStyle(FluxColor.bgBase)
            }
            .frame(width: 96, height: 96)

            VStack(spacing: 4) {
                Text(MockData.userFullName).font(FluxFont.title2()).foregroundStyle(.white)
                Text(MockData.memberSince).font(FluxFont.footnote()).foregroundStyle(.white.opacity(0.62))
            }
        }
    }

    private var statsStrip: some View {
        HStack {
            statColumn(value: MockData.lifetimeWorkouts, label: "Workouts")
            divider
            statColumn(value: MockData.lifetimeCalories, label: "Calories")
            divider
            statColumn(value: MockData.lifetimeStreak, label: "Streak")
        }
        .padding(.horizontal, 26)
        .frame(height: 86)
        .liquidGlass(cornerRadius: 26)
    }

    private func statColumn(value: String, label: String) -> some View {
        VStack(spacing: 5) {
            Text(value).font(FluxFont.title3()).foregroundStyle(.white)
            CaptionLabel(text: label, color: .white.opacity(0.38))
        }
        .frame(maxWidth: .infinity)
    }

    private var divider: some View {
        Rectangle().fill(.white.opacity(0.14)).frame(width: 1, height: 36)
    }

    private var achievementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            CaptionLabel(text: "Achievements", color: .white.opacity(0.5))
            HStack(spacing: 8) {
                ForEach(badges.indices, id: \.self) { i in
                    let b = badges[i]
                    Image(systemName: b.icon)
                        .font(.system(size: 22))
                        .foregroundStyle(b.tint)
                        .frame(width: 72, height: 72)
                        .liquidGlass(cornerRadius: FluxRadius.md, tint: b.tint, tintOpacity: b.locked ? 0.14 : 0.22, castsShadow: false)
                        .opacity(b.locked ? 0.35 : 1)
                }
            }
        }
    }

    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            CaptionLabel(text: "Settings", color: .white.opacity(0.5))
            VStack(spacing: 0) {
                SettingsRow(icon: FluxIcon.bell, label: "Notifications")
                Divider().overlay(.white.opacity(0.1))
                SettingsRow(icon: FluxIcon.heart, label: "Health sync", toggleValue: $healthSyncOn)
                Divider().overlay(.white.opacity(0.1))
                SettingsRow(icon: FluxIcon.share, label: "Share progress")
            }
            .liquidGlass(cornerRadius: FluxRadius.lg)
        }
    }
}

#Preview {
    ZStack(alignment: .bottom) {
        ProfileView()
        FluxTabBar(selection: .constant(.profile)).padding(.bottom, 8)
    }
}
