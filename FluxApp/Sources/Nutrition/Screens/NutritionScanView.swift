//
//  NutritionScanView.swift
//  FLUX Nutrition — entry point: take/choose a photo, run on-device
//  classification, then push into the result screen. Presented full-screen
//  from the root (see RootTabView).
//

import SwiftUI

struct NutritionScanView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(FoodLogStore.self) private var store

    @State private var showingCamera = false
    @State private var showingLibrary = false
    @State private var pickedImage: UIImage?
    @State private var candidates: [FoodRecognitionCandidate] = []
    @State private var isClassifying = false
    @State private var errorMessage: String?
    @State private var navigateToResult = false
    @State private var navigateToSearch = false

    var body: some View {
        NavigationStack {
            ZStack {
                FluxScreenBackground(orbs: FluxBackdrops.today)
                content
            }
            .navigationTitle("Log a meal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(.white)
                }
            }
            .navigationDestination(isPresented: $navigateToResult) {
                if let pickedImage {
                    // `onFinished` dismisses THIS view (NutritionScanView) — since it's
                    // the fullScreenCover root, that tears down the whole nutrition
                    // flow (including the pushed result screen) in one step, landing
                    // the user back on Today rather than one screen back.
                    ScanResultView(image: pickedImage, candidates: candidates, onFinished: { dismiss() })
                }
            }
            .navigationDestination(isPresented: $navigateToSearch) {
                FoodSearchView(onFinished: { dismiss() })
            }
        }
        .sheet(isPresented: $showingCamera) {
            ImagePicker(sourceType: .camera, onImagePicked: { handlePicked($0) }, onCancel: { showingCamera = false })
                .ignoresSafeArea()
        }
        .sheet(isPresented: $showingLibrary) {
            ImagePicker(sourceType: .photoLibrary, onImagePicked: { handlePicked($0) }, onCancel: { showingLibrary = false })
                .ignoresSafeArea()
        }
        .alert(
            "Couldn't recognise that",
            isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } }),
            presenting: errorMessage
        ) { _ in
            Button("OK") { errorMessage = nil }
        } message: { message in
            Text(message)
        }
        .preferredColorScheme(.dark)
    }

    @ViewBuilder
    private var content: some View {
        VStack(spacing: 20) {
            Spacer(minLength: 20)

            ZStack {
                Circle()
                    .fill(FluxColor.limeCyanDiagonal.opacity(0.18))
                    .frame(width: 140, height: 140)
                if isClassifying {
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(1.4)
                } else {
                    Image(systemName: "camera.viewfinder")
                        .font(.system(size: 46, weight: .medium))
                        .foregroundStyle(FluxColor.accentLime)
                }
            }

            VStack(spacing: 6) {
                Text(isClassifying ? "Identifying your meal…" : "Snap a photo of your food")
                    .font(FluxFont.title3())
                    .foregroundStyle(.white)
                Text("On-device recognition — nothing leaves your phone.")
                    .font(FluxFont.footnote())
                    .foregroundStyle(.white.opacity(0.55))
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, 32)

            Spacer(minLength: 8)

            VStack(spacing: 12) {
                Button {
                    if ImagePicker.isCameraAvailable {
                        showingCamera = true
                    } else {
                        showingLibrary = true   // simulator / no camera: fall back gracefully
                    }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "camera.fill")
                        Text(ImagePicker.isCameraAvailable ? "Take Photo" : "Choose Photo (no camera on this device)")
                    }
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(FluxColor.bgBase)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Capsule().fill(FluxColor.limeSolidGradient))
                }
                .buttonStyle(.plain)
                .disabled(isClassifying)

                if ImagePicker.isCameraAvailable {
                    Button {
                        showingLibrary = true
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "photo.on.rectangle")
                            Text("Choose from Library")
                        }
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .liquidGlass(cornerRadius: 26, castsShadow: false)
                    }
                    .buttonStyle(.plain)
                    .disabled(isClassifying)
                }

                Button {
                    navigateToSearch = true
                } label: {
                    Text("Or search manually")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.6))
                }
                .buttonStyle(.plain)
                .disabled(isClassifying)
                .padding(.top, 4)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
    }

    private func handlePicked(_ image: UIImage) {
        showingCamera = false
        showingLibrary = false
        pickedImage = image
        isClassifying = true

        Task {
            do {
                let results = try await FoodClassifier.classify(image)
                candidates = results
                isClassifying = false
                navigateToResult = true
            } catch {
                isClassifying = false
                errorMessage = error.localizedDescription
            }
        }
    }
}

#Preview {
    NutritionScanView()
        .environment(FoodLogStore())
}
