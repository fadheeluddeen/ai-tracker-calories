//
//  WorkoutLiveView.swift
//  FLUX — in-progress outdoor run. No tab bar — this is a full-screen modal
//  flow, presented over the root (see RootTabView's FAB action).
//

import SwiftUI

struct WorkoutLiveView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var isPaused = false

    private let splits: [SplitData] = [
        SplitData(km: "KM 3", fraction: 196.0 / 232, pace: "5:41"),
        SplitData(km: "KM 4", fraction: 214.0 / 232, pace: "5:33"),
        SplitData(km: "KM 5", fraction: 178.0 / 232, pace: "5:47"),
        SplitData(km: "KM 6", fraction: 1.0, pace: "5:28", isCurrent: true),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                topBar
                timerBlock
                metricsPanel
                splitsPanel
                insightStrip
                controls
                Text("AUTO PAUSE ON · HOLD STOP TO END RUN")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(1)
                    .foregroundStyle(.white.opacity(0.38))
                    .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
        .background(FluxScreenBackground(orbs: FluxBackdrops.workoutLive))
        .scrollIndicators(.hidden)
    }

    private var topBar: some View {
        HStack {
            GlassIconButton(icon: "chevron.left", size: 40, iconSize: 16) { dismiss() }
            Spacer()
            VStack(spacing: 2) {
                CaptionLabel(text: "Outdoor Run", color: FluxColor.accentLime)
                Text("GPS STRONG · AUTO LAP")
                    .font(.system(size: 10, weight: .medium))
                    .tracking(0.6)
                    .foregroundStyle(.white.opacity(0.38))
            }
            Spacer()
            GlassIconButton(icon: FluxIcon.share, size: 40, iconSize: 16)
        }
    }

    private var timerBlock: some View {
        VStack(spacing: 4) {
            CaptionLabel(text: "Elapsed", color: .white.opacity(0.38))
            Text(MockData.elapsedTime)
                .font(.system(size: 68, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            Text("12S AHEAD OF TARGET")
                .font(.system(size: 10, weight: .bold))
                .tracking(0.8)
                .foregroundStyle(FluxColor.bgBase)
                .padding(.horizontal, 12)
                .padding(.vertical, 5)
                .background(Capsule().fill(FluxColor.limeSolidGradient))
        }
        .padding(.vertical, 8)
    }

    private var metricsPanel: some View {
        HStack {
            metricColumn(label: "Distance", value: MockData.liveDistance, unit: "km", alignment: .leading, icon: nil)
            Spacer()
            metricColumn(label: "Pace", value: MockData.livePace, unit: "/km", alignment: .center, icon: nil)
            Spacer()
            metricColumn(label: "Heart", value: MockData.liveHeart, unit: "bpm", alignment: .trailing, icon: FluxIcon.heart)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 22)
        .liquidGlass(cornerRadius: FluxRadius.lg)
    }

    private func metricColumn(label: String, value: String, unit: String, alignment: HorizontalAlignment, icon: String?) -> some View {
        VStack(alignment: alignment, spacing: 6) {
            HStack(spacing: 5) {
                if let icon {
                    Image(systemName: icon).font(.system(size: 11)).foregroundStyle(FluxColor.accentMagenta)
                }
                CaptionLabel(text: label, color: .white.opacity(0.38))
            }
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(value).font(.system(size: 28, weight: .bold)).foregroundStyle(.white)
                Text(unit).font(.system(size: 13, weight: .medium)).foregroundStyle(.white.opacity(0.62))
            }
        }
    }

    private var splitsPanel: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                CaptionLabel(text: "Current split · Km 6", color: .white.opacity(0.62))
                Spacer()
                Text("AVG 5:37 /km")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(0.6)
                    .foregroundStyle(.white.opacity(0.38))
            }
            VStack(spacing: 10) {
                ForEach(splits) { SplitRow(split: $0) }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 18)
        .liquidGlass(cornerRadius: FluxRadius.lg, tint: FluxColor.accentMagenta, tintOpacity: 0.18)
    }

    private var insightStrip: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(LinearGradient(colors: [Color(hex: "#FFC46B"), FluxColor.orbAmber], startPoint: .top, endPoint: .bottom))
                Image(systemName: FluxIcon.bolt).foregroundStyle(Color(hex: "#1A0E00")).font(.system(size: 16, weight: .bold))
            }
            .frame(width: 34, height: 34)
            .shadow(color: FluxColor.orbAmber.opacity(0.4), radius: 10, x: 0, y: 6)

            Text("Negative split — 12s faster than last km")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(.white)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 18)
        .frame(height: 64)
        .liquidGlass(cornerRadius: 22, tint: FluxColor.orbAmber, tintOpacity: 0.24)
    }

    private var controls: some View {
        HStack(spacing: 24) {
            Button {
                dismiss()
            } label: {
                Image(systemName: FluxIcon.stop)
                    .font(.system(size: 20))
                    .foregroundStyle(FluxColor.accentMagenta)
                    .frame(width: 64, height: 64)
                    .liquidGlass(cornerRadius: 32, castsShadow: false)
            }
            .buttonStyle(.plain)

            Button {
                isPaused.toggle()
            } label: {
                Image(systemName: isPaused ? FluxIcon.play : FluxIcon.pause)
                    .font(.system(size: 26))
                    .foregroundStyle(FluxColor.bgBase)
                    .frame(width: 84, height: 84)
                    .background(Circle().fill(FluxColor.limeCyanDiagonal))
                    .shadow(color: FluxColor.accentLime.opacity(0.45), radius: 20, x: 0, y: 10)
            }
            .buttonStyle(.plain)

            Button {
            } label: {
                Image(systemName: FluxIcon.route)
                    .font(.system(size: 20))
                    .foregroundStyle(.white)
                    .frame(width: 64, height: 64)
                    .liquidGlass(cornerRadius: 32, castsShadow: false)
            }
            .buttonStyle(.plain)
        }
        .padding(.top, 4)
    }
}

#Preview {
    WorkoutLiveView()
}
