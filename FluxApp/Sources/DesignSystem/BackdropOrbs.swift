//
//  BackdropOrbs.swift
//  FLUX — the blurred colour orbs every screen sits on.
//
//  Glass only reads as "glass" when something colourful is behind it to
//  refract — this reproduces the Figma orb() backdrop with real Gaussian
//  blur via .blur(radius:), which SwiftUI applies as a genuine backdrop
//  blur when composited under the glass material above it.
//

import SwiftUI

struct Orb: Identifiable {
    let id = UUID()
    var color: Color
    var position: UnitPoint   // position within the backdrop frame, 0...1
    var size: CGFloat
    var opacity: Double
    var blur: CGFloat
}

struct BackdropOrbsView: View {
    let orbs: [Orb]

    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(orbs) { orb in
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [orb.color.opacity(0.95), orb.color.opacity(0)],
                                center: .center, startRadius: 0, endRadius: orb.size / 2
                            )
                        )
                        .frame(width: orb.size, height: orb.size)
                        .position(
                            x: orb.position.x * geo.size.width,
                            y: orb.position.y * geo.size.height
                        )
                        .opacity(orb.opacity)
                        .blur(radius: orb.blur)
                }
            }
        }
        .clipped()
    }
}

/// Pre-built orb sets, one per screen, matching the Figma backdrop layout.
enum FluxBackdrops {
    static let today: [Orb] = [
        Orb(color: FluxColor.orbViolet, position: UnitPoint(x: 0.20, y: 0.18), size: 420, opacity: 0.55, blur: 90),
        Orb(color: FluxColor.orbLime, position: UnitPoint(x: 0.84, y: 0.07), size: 300, opacity: 0.40, blur: 90),
        Orb(color: FluxColor.orbMagenta, position: UnitPoint(x: 0.76, y: 0.61), size: 380, opacity: 0.38, blur: 90),
        Orb(color: FluxColor.orbCyan, position: UnitPoint(x: 0.10, y: 0.82), size: 320, opacity: 0.30, blur: 90),
    ]

    static let workoutLive: [Orb] = [
        Orb(color: FluxColor.orbMagenta, position: UnitPoint(x: 0.76, y: 0.14), size: 420, opacity: 0.50, blur: 90),
        Orb(color: FluxColor.orbAmber, position: UnitPoint(x: 0.15, y: 0.35), size: 360, opacity: 0.38, blur: 90),
        Orb(color: FluxColor.orbLime, position: UnitPoint(x: 0.84, y: 0.75), size: 340, opacity: 0.35, blur: 90),
        Orb(color: FluxColor.orbViolet, position: UnitPoint(x: 0.10, y: 0.89), size: 300, opacity: 0.30, blur: 90),
    ]

    static let progress: [Orb] = [
        Orb(color: FluxColor.orbCyan, position: UnitPoint(x: 0.15, y: 0.14), size: 400, opacity: 0.45, blur: 90),
        Orb(color: FluxColor.orbLime, position: UnitPoint(x: 0.87, y: 0.35), size: 340, opacity: 0.40, blur: 90),
        Orb(color: FluxColor.orbViolet, position: UnitPoint(x: 0.20, y: 0.73), size: 380, opacity: 0.38, blur: 90),
        Orb(color: FluxColor.orbMagenta, position: UnitPoint(x: 0.87, y: 0.89), size: 300, opacity: 0.28, blur: 90),
    ]

    static let workouts: [Orb] = [
        Orb(color: FluxColor.orbLime, position: UnitPoint(x: 0.18, y: 0.16), size: 380, opacity: 0.42, blur: 90),
        Orb(color: FluxColor.orbCyan, position: UnitPoint(x: 0.84, y: 0.35), size: 400, opacity: 0.45, blur: 90),
        Orb(color: FluxColor.orbMagenta, position: UnitPoint(x: 0.15, y: 0.70), size: 340, opacity: 0.35, blur: 90),
        Orb(color: FluxColor.orbAmber, position: UnitPoint(x: 0.87, y: 0.92), size: 300, opacity: 0.30, blur: 90),
    ]

    static let profile: [Orb] = [
        Orb(color: FluxColor.orbViolet, position: UnitPoint(x: 0.50, y: 0.18), size: 440, opacity: 0.55, blur: 90),
        Orb(color: FluxColor.orbMagenta, position: UnitPoint(x: 0.84, y: 0.45), size: 340, opacity: 0.38, blur: 90),
        Orb(color: FluxColor.orbCyan, position: UnitPoint(x: 0.13, y: 0.70), size: 360, opacity: 0.35, blur: 90),
        Orb(color: FluxColor.orbLime, position: UnitPoint(x: 0.87, y: 0.92), size: 300, opacity: 0.30, blur: 90),
    ]
}

/// Standard screen background: the vertical bg gradient + a screen's orb set.
struct FluxScreenBackground: View {
    let orbs: [Orb]

    var body: some View {
        ZStack {
            FluxColor.bgGradient
            BackdropOrbsView(orbs: orbs)
        }
        .ignoresSafeArea()
    }
}
