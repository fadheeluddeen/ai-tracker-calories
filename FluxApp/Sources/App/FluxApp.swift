//
//  FluxApp.swift
//  FLUX — app entry point.
//
//  Xcode setup: create a new iOS App project (SwiftUI interface), delete its
//  generated ContentView.swift + <ProjectName>App.swift, then drag the whole
//  Sources/ folder in. Set this file's `@main` struct as the app's entry —
//  Xcode does this automatically once it sees the only `@main` in the target.
//

import SwiftUI

@main
struct FluxApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
        }
    }
}
