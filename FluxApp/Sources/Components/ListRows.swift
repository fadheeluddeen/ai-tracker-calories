//
//  ListRows.swift
//  FLUX — the reusable glass list-row patterns shared across screens.
//

import SwiftUI

/// 52x52 gradient-filled squircle icon tile, used as a leading accent on
/// workout list rows.
struct AccentTile: View {
    let icon: String
    let colors: [Color]
    var size: CGFloat = 52

    var body: some View {
        Image(systemName: icon)
            .font(.system(size: 20, weight: .semibold))
            .foregroundStyle(FluxColor.bgBase)
            .frame(width: size, height: size)
            .background(
                RoundedRectangle(cornerRadius: size * 0.35, style: .continuous)
                    .fill(LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing))
            )
    }
}

/// A workout-library row: accent tile, title + meta, trailing chevron.
struct WorkoutListRow: View {
    let icon: String
    let colors: [Color]
    let title: String
    let meta: String
    var action: () -> Void = {}

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                AccentTile(icon: icon, colors: colors)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(FluxFont.headline())
                        .foregroundStyle(.white)
                    Text(meta)
                        .font(FluxFont.footnote())
                        .foregroundStyle(.white.opacity(0.62))
                }
                Spacer(minLength: 8)
                Image(systemName: FluxIcon.chevronRight)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.6))
                    .frame(width: 32, height: 32)
                    .liquidGlass(cornerRadius: 16, castsShadow: false)
            }
            .padding(.horizontal, 14)
            .frame(height: 80)
        }
        .buttonStyle(.plain)
        .liquidGlass(cornerRadius: FluxRadius.md, castsShadow: true)
    }
}

/// A "personal best" row: tinted icon tile, title/subtitle, trailing value.
struct PersonalBestRow: View {
    let icon: String
    let tint: Color
    let title: String
    let subtitle: String
    let value: String

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(tint.opacity(0.18))
                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(tint.opacity(0.35), lineWidth: 1))
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(tint)
            }
            .frame(width: 36, height: 36)

            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(FluxFont.headline()).foregroundStyle(.white)
                Text(subtitle).font(FluxFont.footnote()).foregroundStyle(.white.opacity(0.62))
            }
            Spacer(minLength: 8)
            Text(value)
                .font(FluxFont.headline())
                .foregroundStyle(FluxColor.accentLime)
        }
        .padding(.horizontal, 12)
        .frame(height: 62)
        .liquidGlass(cornerRadius: 22, castsShadow: true)
    }
}

/// A settings row: leading icon + label, trailing chevron OR toggle.
struct SettingsRow: View {
    let icon: String
    let label: String
    var toggleValue: Binding<Bool>? = nil
    var action: () -> Void = {}

    var body: some View {
        // A toggle row must NOT be wrapped in a (disabled) Button — `.disabled()`
        // on a parent propagates to every descendant control, including a
        // nested Toggle, which would make the switch untappable. So the two
        // variants use entirely separate view trees instead of one button
        // that's conditionally disabled.
        if let toggleValue {
            row(trailing: {
                Toggle("", isOn: toggleValue)
                    .labelsHidden()
                    .tint(FluxColor.accentLime)
            })
        } else {
            Button(action: action) {
                row(trailing: {
                    Image(systemName: FluxIcon.chevronRight)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.4))
                })
            }
            .buttonStyle(.plain)
        }
    }

    private func row<Trailing: View>(@ViewBuilder trailing: () -> Trailing) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 17))
                .foregroundStyle(.white.opacity(0.7))
                .frame(width: 20)
            Text(label)
                .font(FluxFont.body())
                .foregroundStyle(.white)
            Spacer()
            trailing()
        }
        .padding(.horizontal, 18)
        .frame(height: 56)
        .contentShape(Rectangle())
    }
}

#Preview {
    VStack(spacing: 10) {
        WorkoutListRow(icon: FluxIcon.dumbbell, colors: [FluxColor.orbLime, FluxColor.orbCyan], title: "Upper Body Power", meta: "Strength · 45 min · 8 exercises")
        PersonalBestRow(icon: FluxIcon.route, tint: FluxColor.orbCyan, title: "Fastest 5K", subtitle: "Sat 14 Sep · Riverside loop", value: "24:06")
        VStack(spacing: 0) {
            SettingsRow(icon: FluxIcon.bell, label: "Notifications")
            Divider().overlay(.white.opacity(0.1))
            SettingsRow(icon: FluxIcon.heart, label: "Health sync", toggleValue: .constant(true))
        }
        .liquidGlass(cornerRadius: FluxRadius.md)
    }
    .padding()
    .background(FluxScreenBackground(orbs: FluxBackdrops.workouts))
}
