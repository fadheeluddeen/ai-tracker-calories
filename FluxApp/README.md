# FLUX — SwiftUI source

Native SwiftUI implementation of the FLUX fitness app, matching the Figma design
(`../figma-build/`) 1:1 in layout and content, translated into idiomatic SwiftUI
rather than a literal port.

## Get it into Xcode

1. On a Mac, open Xcode → **File → New → Project… → iOS → App**.
2. Product Name: `Flux`. Interface: **SwiftUI**. Uncheck Core Data / Tests unless you want them.
3. Delete the two files Xcode generates for you: `ContentView.swift` and `FluxApp.swift` (the placeholder one — you're about to bring your own).
4. In Finder, drag the whole `Sources/` folder from this directory into the Xcode project navigator ("Copy items if needed" ✅, add to target ✅).
5. Build & run (⌘R) on an iPhone 16 Pro simulator. `FluxApp.swift`'s `@main` struct is the entry point — Xcode picks it up automatically.

No external dependencies, no SPM packages, no CocoaPods — everything is stock SwiftUI + SF Symbols.

## What's here

```
Sources/
  App/
    FluxApp.swift        — @main entry point
    RootTabView.swift     — owns the 4 tabs, the FAB's "Start Workout / Log a
                             Meal" choice, and creates + injects FoodLogStore
  DesignSystem/
    Theme.swift            — colour tokens, radii, spacing (mirrors Figma "Foundations")
    Typography.swift       — the type ramp, built on SF Pro
    GlassEffect.swift       — the liquid-glass material (see note below)
    BackdropOrbs.swift      — the blurred colour-orb backdrops, one set per screen
    Icons.swift             — SF Symbol names (see note below)
  Components/               — every reusable piece: tab bar, glass buttons,
                               stat tiles, activity rings, chart, list rows, etc.
  Screens/
    TodayView.swift              — now also has the Nutrition summary card
    WorkoutLiveView.swift
    ProgressScreenView.swift     (named to avoid clashing with SwiftUI's own `ProgressView`)
    WorkoutsView.swift
    ProfileView.swift
  Models/
    MockData.swift          — all sample content lives here; swap for HealthKit
                               or your backend without touching any view
  Nutrition/                — the AI camera food/calorie tracker layer (see below)
    Models/                  FoodItem, FoodDatabase (local calorie table),
                              FoodLogEntry, FoodLogStore (persisted, @Observable)
    Vision/                  FoodClassifier.swift — on-device recognition
    Camera/                  ImagePicker.swift — camera/photo-library bridge
    Components/              CalorieRingView, FoodLogRow, ConfirmMealCard
    Screens/                 NutritionScanView, ScanResultView, FoodSearchView,
                              FoodDiaryView
```

## The Nutrition layer (AI camera calorie tracker)

Reachable two ways: the **camera icon** on Today's new Nutrition card, or the
FAB → **Log a Meal**.

**Flow:** `NutritionScanView` (take/choose a photo) → `FoodClassifier`
(on-device Vision recognition, no network) → `ScanResultView` (confirm the
food, adjust portion, see the estimated calories) → logged into
`FoodLogStore`, which `FoodDiaryView` and Today's Nutrition card both read.
If the camera doesn't confidently recognise the photo, or the user just
wants to type it in, `FoodSearchView` covers manual entry from the same
local food list.

**Read this before you assume it's more accurate than it is:**

- **Recognition** uses Apple's built-in `VNClassifyImageRequest` — a
  *general-purpose* on-device image classifier, not a food-specific model.
  It does well on distinct, common foods (a banana, a slice of pizza, a
  burger) and will guess wrong on plated/mixed/unusual dishes. There's no
  bundled or downloaded ML model — it ships with iOS.
- **Calories** come from a small hand-curated local table
  (`FoodDatabase.swift`, ~50 common foods) matched fuzzily against whatever
  label Vision returns. This is **not** a nutrition database — it's rough,
  per-serving averages meant to get the user close, always shown as an
  editable number before logging, never presented as exact.
- **Both limitations are the direct cost of "no backend, fully offline."**
  If you want materially better accuracy, the two upgrade paths are: (1)
  bundle a food-specific Core ML model (e.g. train one in Create ML on a
  dataset like Food-101, or use Apple's sample food-classifier project) and
  swap it into `FoodClassifier.swift` in place of `VNClassifyImageRequest`,
  or (2) call a real nutrition API (USDA FoodData Central, Edamam, etc.) for
  the calorie lookup instead of the local table — which reintroduces a
  network dependency the rest of this app deliberately doesn't have.
- **Storage** is a JSON file in the app's Documents directory
  (`FoodLogStore.swift`) — no HealthKit, no CloudKit, no backend. Swap it
  for HealthKit's dietary-energy APIs if you want the numbers to show up in
  Apple Health too.

### Required Info.plist entry

The camera will **crash the app at launch of the camera picker** (not a
build error — a runtime crash) without a usage description. In Xcode:
target → **Info** tab → add row **Privacy - Camera Usage Description**,
value e.g. *"FLUX uses your camera to recognise food for calorie logging."*
(Photo library access needs no entry on modern iOS for the picker used
here, since `ImagePicker` uses `UIImagePickerController`, not the raw
Photos framework.)

## Two things I changed on purpose vs. the Figma file

- **Icons**: the Figma mock used hand-drawn SVG paths (Figma has nothing else to
  draw with). The app uses **SF Symbols** instead (`Icons.swift`) — free, crisp
  at any size, and what a real iOS app should use. If a specific glyph doesn't
  match closely enough for your taste, swap the string in `Icons.swift`; nothing
  else needs to change.
- **Status bar / home indicator**: the Figma screens hand-drew a fake status bar
  and home indicator (Figma has no device chrome). The app does **not** — iOS
  renders its own, so those layers were simply dropped. This is more correct,
  not a simplification.

## About the glass effect

`GlassEffect.swift` tries the real **iOS 26 Liquid Glass** system material
(`.glassEffect(...)`) when available, and falls back to a hand-built
`.ultraThinMaterial` stack (tint gradient + specular edge + lift shadow) on
older OS versions or if that exact API shape doesn't match your SDK — the two
are designed to look the same. **That iOS 26 API was very new when this was
written and its exact signature may have shifted** — if it fails to compile,
just delete the `#available(iOS 26.0, *)` branch in `LiquidGlass.body` and let
every call fall through to the Material-based fallback; visually you'll see no
difference in the simulator.

## Verification status

This was written on Windows with no Xcode available, so **it has not been
compiled**. I did a manual pass for brace/paren balance, duplicate type names,
and cross-checked every call site's arguments against its declaration — but a
first real build on your machine may surface something I couldn't catch by
inspection. Most likely spots, if anything: the iOS 26 `.glassEffect` call
(noted above), or a stray SF Symbol name that doesn't exist on your SDK version.

For the Nutrition layer specifically, the same caveat applies to: the exact
`VNClassifyImageRequest` / `VNImageRequestHandler` call shape in
`FoodClassifier.swift` (Vision's API is stable, but double-check against your
SDK), and remember the **Camera Info.plist entry above** — that one won't
show up as a build error at all, only a crash the first time someone taps
"Take Photo."
