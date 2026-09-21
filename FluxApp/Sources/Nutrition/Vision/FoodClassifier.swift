//
//  FoodClassifier.swift
//  FLUX Nutrition — on-device "AI camera" recognition.
//
//  This uses Apple's built-in Vision classifier (`VNClassifyImageRequest`),
//  which ships with iOS and runs fully on-device — no network call, no
//  bundled model, no backend. It is a GENERAL image classifier (thousands
//  of everyday object/scene categories, not a food-specific model), so it
//  recognises common foods well ("pizza", "banana", "hamburger", "salad")
//  but will misfire on plated/mixed/unusual dishes. That's the honest
//  tradeoff of "no backend, works offline, ships today" — see the README
//  for how to swap in a dedicated food-only Core ML model later if you
//  want materially better accuracy.
//

import UIKit
import Vision

struct FoodRecognitionCandidate: Identifiable {
    let id = UUID()
    let label: String
    let confidence: Float          // 0...1
    let matchedFood: FoodItem?     // nil if nothing in FoodDatabase matched this label
}

enum FoodClassifier {
    enum ClassificationError: LocalizedError {
        case invalidImage
        var errorDescription: String? { "Couldn't read that photo — please try another." }
    }

    /// Returns the top candidate labels, most confident first, each paired
    /// with a FoodDatabase match if one was found.
    static func classify(_ image: UIImage) async throws -> [FoodRecognitionCandidate] {
        guard let cgImage = image.cgImage else { throw ClassificationError.invalidImage }
        let orientation = image.cgImagePropertyOrientation

        // Vision's `.perform()` runs the model synchronously and can take a
        // noticeable moment — hop off the calling context so the UI never
        // blocks. CGImage (a Core Foundation type) crosses the boundary
        // here rather than UIImage itself.
        return try await Task.detached(priority: .userInitiated) {
            let request = VNClassifyImageRequest()
            let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation)
            try handler.perform([request])

            let observations = request.results ?? []
            return observations
                .sorted { $0.confidence > $1.confidence }
                .prefix(8)
                .map { observation -> FoodRecognitionCandidate in
                    let label = observation.identifier.replacingOccurrences(of: "_", with: " ")
                    return FoodRecognitionCandidate(
                        label: label,
                        confidence: observation.confidence,
                        matchedFood: FoodDatabase.match(label: label)
                    )
                }
        }.value
    }
}

private extension UIImage {
    /// Vision wants a `CGImagePropertyOrientation`, UIKit gives us `UIImage.Orientation` — bridge the two.
    var cgImagePropertyOrientation: CGImagePropertyOrientation {
        switch imageOrientation {
        case .up: .up
        case .upMirrored: .upMirrored
        case .down: .down
        case .downMirrored: .downMirrored
        case .left: .left
        case .leftMirrored: .leftMirrored
        case .right: .right
        case .rightMirrored: .rightMirrored
        @unknown default: .up
        }
    }
}
