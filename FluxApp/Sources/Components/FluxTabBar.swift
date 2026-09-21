//
//  FluxTabBar.swift
//  FLUX — the floating glass tab bar with a centre FAB, matching the Figma
//  chrome. Deliberately NOT a standard SwiftUI TabView (which can't place a
//  floating action button in its centre) — RootTabView below drives content
//  switching directly and this is a pure presentation component.
//

import SwiftUI

enum FluxTab: CaseIterable {
    case today, progress, train, profile

    var icon: String {
        switch self {
        case .today: FluxIcon.home
        case .progress: FluxIcon.activity
        case .train: FluxIcon.dumbbell
        case .profile: FluxIcon.person
        }
    }

    var label: String {
        switch self {
        case .today: "Today"
        case .progress: "Progress"
        case .train: "Train"
        case .profile: "You"
        }
    }
}

struct FluxTabBar: View {
    @Binding var selection: FluxTab
    var onFABTap: () -> Void = {}

    var body: some View {
        HStack(spacing: 0) {
            tabButton(.today)
            tabButton(.progress)

            Spacer(minLength: 0)
            fab
            Spacer(minLength: 0)

            tabButton(.train)
            tabButton(.profile)
        }
        .padding(.horizontal, 14)
        .frame(height: 66)
        .liquidGlass(cornerRadius: 33, castsShadow: true)
        .padding(.horizontal, 16)
    }

    private func tabButton(_ tab: FluxTab) -> some View {
        let active = tab == selection
        return Button {
            withAnimation(.easeOut(duration: 0.18)) { selection = tab }
        } label: {
            VStack(spacing: 3) {
                Image(systemName: tab.icon)
                    .font(.system(size: 19, weight: .semibold))
                Text(tab.label)
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(0.4)
            }
            .foregroundStyle(active ? FluxColor.accentLime : .white.opacity(0.45))
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }

    private var fab: some View {
        Button(action: onFABTap) {
            Image(systemName: FluxIcon.plus)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(FluxColor.bgBase)
                .frame(width: 52, height: 52)
                .background(Circle().fill(FluxColor.limeCyanDiagonal))
                .shadow(color: FluxColor.accentLime.opacity(0.45), radius: 12, x: 0, y: 6)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ZStack(alignment: .bottom) {
        FluxScreenBackground(orbs: FluxBackdrops.today)
        FluxTabBar(selection: .constant(.today))
            .padding(.bottom, 8)
    }
}
