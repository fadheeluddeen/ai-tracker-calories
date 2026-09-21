//
//  Icons.swift
//  FLUX — SF Symbols mapping.
//
//  The Figma mock used custom hand-drawn SVG paths (Figma has no system
//  icon font to lean on). A native app should use SF Symbols instead —
//  they're free, ship with iOS, render crisply at any size/weight, and are
//  what Apple's own Liquid Glass system is designed around. This file is
//  the single place that maps each concept used in the app to its symbol.
//

enum FluxIcon {
    static let home = "house.fill"
    static let activity = "waveform.path.ecg"
    static let dumbbell = "dumbbell.fill"          // iOS 16+
    static let trophy = "trophy.fill"
    static let person = "person.fill"
    static let flame = "flame.fill"
    static let heart = "heart.fill"
    static let bolt = "bolt.fill"
    static let clock = "clock.fill"
    static let distance = "location.fill"
    static let route = "map.fill"
    static let search = "magnifyingglass"
    static let chevronRight = "chevron.right"
    static let plus = "plus"
    static let bell = "bell.fill"
    static let share = "square.and.arrow.up"
    static let gear = "gearshape.fill"
    static let play = "play.fill"
    static let pause = "pause.fill"
    static let stop = "stop.fill"
}
