//
//  ScanResultView.swift
//  FLUX Nutrition — shows what the on-device classifier saw, lets the user
//  confirm/adjust the food and portion, then logs it.
//

import SwiftUI

struct ScanResultView: View {
    let image: UIImage
    let candidates: [FoodRecognitionCandidate]
    var onFinished: () -> Void

    @Environment(FoodLogStore.self) private var store
    @State private var selectedCandidate: FoodRecognitionCandidate?
    @State private var servings: Double = 1.0
    @State private var showingSearch = false

    /// Only candidates Vision returned AND our local database recognises.
    private var matchedCandidates: [FoodRecognitionCandidate] {
        candidates.filter { $0.matchedFood != nil }
    }

    private var selectedFood: FoodItem? { selectedCandidate?.matchedFood }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                photo

                if matchedCandidates.isEmpty {
                    noMatchCard
                } else {
                    candidateChips
                    if let food = selectedFood {
                        ConfirmMealCard(food: food, servings: $servings, wasScanned: true) { entry in
                            store.add(entry)
                            onFinished()
                        }
                    }
                    searchInsteadLink
                }
            }
            .padding(16)
        }
        .background(FluxScreenBackground(orbs: FluxBackdrops.today))
        .navigationTitle("Confirm meal")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if selectedCandidate == nil {
                selectedCandidate = matchedCandidates.first
            }
        }
        .navigationDestination(isPresented: $showingSearch) {
            FoodSearchView(onFinished: onFinished)
        }
        .preferredColorScheme(.dark)
    }

    private var photo: some View {
        Image(uiImage: image)
            .resizable()
            .scaledToFill()
            .frame(height: 220)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: FluxRadius.lg, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: FluxRadius.lg, style: .continuous)
                    .strokeBorder(.white.opacity(0.18), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.4), radius: 17, x: 0, y: 14)
    }

    private var candidateChips: some View {
        VStack(alignment: .leading, spacing: 10) {
            CaptionLabel(text: "Does this look right?", color: .white.opacity(0.5))
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(matchedCandidates) { candidate in
                        Button {
                            selectedCandidate = candidate
                        } label: {
                            HStack(spacing: 6) {
                                if let food = candidate.matchedFood {
                                    Text(food.emoji)
                                }
                                Text(candidate.matchedFood?.name ?? candidate.label.capitalized)
                                Text("\(Int(candidate.confidence * 100))%")
                                    .foregroundStyle(.white.opacity(0.5))
                            }
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(.white)
                        }
                        .buttonStyle(.plain)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(
                            Capsule().fill(candidate.id == selectedCandidate?.id ? AnyShapeStyle(FluxColor.limeSolidGradient) : AnyShapeStyle(.white.opacity(0.1)))
                        )
                        .overlay(
                            Capsule().strokeBorder(.white.opacity(candidate.id == selectedCandidate?.id ? 0 : 0.18), lineWidth: 1)
                        )
                    }
                }
            }
        }
    }

    private var searchInsteadLink: some View {
        Button { showingSearch = true } label: {
            Text("Not right? Search manually")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.white.opacity(0.55))
        }
        .buttonStyle(.plain)
    }

    private var noMatchCard: some View {
        VStack(spacing: 14) {
            Image(systemName: "questionmark.circle")
                .font(.system(size: 34))
                .foregroundStyle(.white.opacity(0.5))
            Text("We couldn't confidently match this to a food we know")
                .font(FluxFont.headline())
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
            if let topLabel = candidates.first?.label {
                Text("Vision saw: \(topLabel)")
                    .font(FluxFont.footnote())
                    .foregroundStyle(.white.opacity(0.5))
            }
            Button { showingSearch = true } label: {
                Text("Search manually")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(FluxColor.bgBase)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(Capsule().fill(FluxColor.limeSolidGradient))
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
        }
        .padding(24)
        .liquidGlass(cornerRadius: FluxRadius.lg)
    }
}
