//
//  FoodSearchView.swift
//  FLUX Nutrition — manual food search + log, used both as a direct entry
//  point from NutritionScanView and as the fallback when the camera can't
//  confidently identify a photo.
//

import SwiftUI

struct FoodSearchView: View {
    var onFinished: () -> Void

    @Environment(FoodLogStore.self) private var store
    @State private var query = ""
    @State private var selectedFood: FoodItem?
    @State private var servings: Double = 1.0

    private var results: [FoodItem] { FoodDatabase.search(query) }

    var body: some View {
        ZStack {
            FluxScreenBackground(orbs: FluxBackdrops.workouts)
            VStack(spacing: 16) {
                searchField

                if let food = selectedFood {
                    ScrollView {
                        VStack(spacing: 14) {
                            backToListButton
                            ConfirmMealCard(food: food, servings: $servings, wasScanned: false) { entry in
                                store.add(entry)
                                onFinished()
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                } else {
                    resultsList
                }
            }
            .padding(.top, 12)
        }
        .navigationTitle("Search food")
        .navigationBarTitleDisplayMode(.inline)
        .preferredColorScheme(.dark)
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: FluxIcon.search).foregroundStyle(.white.opacity(0.45))
            TextField("", text: $query, prompt: Text("Search foods").foregroundStyle(.white.opacity(0.45)))
                .foregroundStyle(.white)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 18)
        .frame(height: 48)
        .liquidGlass(cornerRadius: 24, castsShadow: false)
        .padding(.horizontal, 16)
    }

    private var resultsList: some View {
        ScrollView {
            LazyVStack(spacing: 10) {
                ForEach(results) { food in
                    Button {
                        selectedFood = food
                        servings = 1.0
                    } label: {
                        HStack(spacing: 14) {
                            Text(food.emoji).font(.system(size: 26))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(food.name).font(FluxFont.headline()).foregroundStyle(.white)
                                Text(food.servingLabel).font(FluxFont.footnote()).foregroundStyle(.white.opacity(0.55))
                            }
                            Spacer()
                            Text("\(food.caloriesPerServing) kcal")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(FluxColor.accentLime)
                        }
                        .padding(.horizontal, 14)
                        .frame(height: 64)
                        .liquidGlass(cornerRadius: FluxRadius.md, castsShadow: false)
                    }
                    .buttonStyle(.plain)
                }

                if results.isEmpty {
                    Text("No matches for \u{201C}\(query)\u{201D}")
                        .font(FluxFont.footnote())
                        .foregroundStyle(.white.opacity(0.5))
                        .padding(.top, 40)
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 24)
        }
    }

    private var backToListButton: some View {
        HStack {
            Button {
                selectedFood = nil
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "chevron.left")
                    Text("Back to results")
                }
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.white.opacity(0.6))
            }
            .buttonStyle(.plain)
            Spacer()
        }
    }
}
