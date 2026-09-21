//
//  FoodDatabase.swift
//  FLUX Nutrition — a small, local, curated food/calorie table.
//
//  There is no backend and no network call here (matches the rest of the
//  app). That means calorie lookup is limited to whatever's in this list —
//  it is NOT a full nutrition database. It exists to (a) give scan results
//  a starting calorie estimate and (b) let the user log a meal by search
//  when the camera doesn't recognise it. Both paths always let the user
//  override the number before logging.
//
//  To extend: add a FoodItem with a few `matchKeywords` covering the words
//  Vision's classifier tends to return for it (lowercase, no punctuation).
//

import Foundation

enum FoodDatabase {
    static let all: [FoodItem] = [
        FoodItem(id: "apple", name: "Apple", emoji: "🍎", caloriesPerServing: 95, servingLabel: "1 medium (182g)", matchKeywords: ["apple", "granny smith", "fuji apple"]),
        FoodItem(id: "banana", name: "Banana", emoji: "🍌", caloriesPerServing: 105, servingLabel: "1 medium (118g)", matchKeywords: ["banana"]),
        FoodItem(id: "orange", name: "Orange", emoji: "🍊", caloriesPerServing: 62, servingLabel: "1 medium (131g)", matchKeywords: ["orange", "mandarin", "tangerine"]),
        FoodItem(id: "grapes", name: "Grapes", emoji: "🍇", caloriesPerServing: 104, servingLabel: "1 cup (151g)", matchKeywords: ["grape"]),
        FoodItem(id: "strawberries", name: "Strawberries", emoji: "🍓", caloriesPerServing: 49, servingLabel: "1 cup (152g)", matchKeywords: ["strawberry", "strawberries"]),
        FoodItem(id: "avocado", name: "Avocado", emoji: "🥑", caloriesPerServing: 240, servingLabel: "1 whole (150g)", matchKeywords: ["avocado", "guacamole"]),

        FoodItem(id: "pizza", name: "Pizza", emoji: "🍕", caloriesPerServing: 285, servingLabel: "1 slice, regular crust", matchKeywords: ["pizza", "flatbread"]),
        FoodItem(id: "hamburger", name: "Hamburger", emoji: "🍔", caloriesPerServing: 354, servingLabel: "1 sandwich", matchKeywords: ["hamburger", "cheeseburger", "burger"]),
        FoodItem(id: "hotdog", name: "Hot dog", emoji: "🌭", caloriesPerServing: 151, servingLabel: "1 with bun", matchKeywords: ["hotdog", "hot dog", "frankfurter"]),
        FoodItem(id: "fries", name: "French fries", emoji: "🍟", caloriesPerServing: 365, servingLabel: "1 medium serving (117g)", matchKeywords: ["french fries", "fries", "chips"]),
        FoodItem(id: "taco", name: "Taco", emoji: "🌮", caloriesPerServing: 170, servingLabel: "1 taco", matchKeywords: ["taco", "burrito"]),
        FoodItem(id: "sandwich", name: "Sandwich", emoji: "🥪", caloriesPerServing: 300, servingLabel: "1 sandwich", matchKeywords: ["sandwich", "sub", "hoagie", "club sandwich"]),
        FoodItem(id: "hummus_wrap", name: "Wrap", emoji: "🌯", caloriesPerServing: 350, servingLabel: "1 wrap", matchKeywords: ["wrap"]),

        FoodItem(id: "sushi", name: "Sushi", emoji: "🍣", caloriesPerServing: 200, servingLabel: "6 pieces", matchKeywords: ["sushi", "sashimi", "maki"]),
        FoodItem(id: "ramen", name: "Ramen", emoji: "🍜", caloriesPerServing: 436, servingLabel: "1 bowl", matchKeywords: ["ramen", "noodle soup", "noodles", "pho"]),
        FoodItem(id: "pasta", name: "Pasta", emoji: "🍝", caloriesPerServing: 220, servingLabel: "1 cup cooked", matchKeywords: ["pasta", "spaghetti", "carbonara", "macaroni"]),
        FoodItem(id: "fried_rice", name: "Fried rice", emoji: "🍚", caloriesPerServing: 333, servingLabel: "1 cup", matchKeywords: ["fried rice", "rice"]),
        FoodItem(id: "curry", name: "Curry", emoji: "🍛", caloriesPerServing: 350, servingLabel: "1 cup with rice", matchKeywords: ["curry"]),
        FoodItem(id: "dumplings", name: "Dumplings", emoji: "🥟", caloriesPerServing: 220, servingLabel: "6 pieces", matchKeywords: ["dumpling", "potsticker", "gyoza"]),

        FoodItem(id: "salad", name: "Salad", emoji: "🥗", caloriesPerServing: 150, servingLabel: "1 bowl with dressing", matchKeywords: ["salad", "greens", "caesar salad"]),
        FoodItem(id: "soup", name: "Soup", emoji: "🍲", caloriesPerServing: 170, servingLabel: "1 bowl", matchKeywords: ["soup", "stew", "broth"]),
        FoodItem(id: "steak", name: "Steak", emoji: "🥩", caloriesPerServing: 271, servingLabel: "6 oz (170g)", matchKeywords: ["steak", "beef", "meat"]),
        FoodItem(id: "grilled_chicken", name: "Grilled chicken", emoji: "🍗", caloriesPerServing: 231, servingLabel: "1 breast (172g)", matchKeywords: ["chicken", "grilled chicken", "roast chicken", "drumstick"]),
        FoodItem(id: "fish", name: "Fish fillet", emoji: "🐟", caloriesPerServing: 206, servingLabel: "1 fillet (170g)", matchKeywords: ["fish", "salmon", "tuna", "cod"]),
        FoodItem(id: "shrimp", name: "Shrimp", emoji: "🍤", caloriesPerServing: 168, servingLabel: "1 cup, cooked", matchKeywords: ["shrimp", "prawn"]),
        FoodItem(id: "egg", name: "Eggs", emoji: "🍳", caloriesPerServing: 155, servingLabel: "2 large, fried", matchKeywords: ["egg", "fried egg", "omelet", "omelette"]),

        FoodItem(id: "bread", name: "Bread", emoji: "🍞", caloriesPerServing: 79, servingLabel: "1 slice", matchKeywords: ["bread", "toast", "baguette", "loaf"]),
        FoodItem(id: "bagel", name: "Bagel", emoji: "🥯", caloriesPerServing: 245, servingLabel: "1 bagel", matchKeywords: ["bagel"]),
        FoodItem(id: "croissant", name: "Croissant", emoji: "🥐", caloriesPerServing: 231, servingLabel: "1 medium", matchKeywords: ["croissant", "pastry"]),
        FoodItem(id: "pancakes", name: "Pancakes", emoji: "🥞", caloriesPerServing: 175, servingLabel: "2 pancakes (4in)", matchKeywords: ["pancake", "waffle"]),
        FoodItem(id: "oatmeal", name: "Oatmeal", emoji: "🥣", caloriesPerServing: 158, servingLabel: "1 cup, cooked", matchKeywords: ["oatmeal", "porridge", "cereal"]),
        FoodItem(id: "yogurt", name: "Yogurt", emoji: "🥛", caloriesPerServing: 150, servingLabel: "1 cup", matchKeywords: ["yogurt", "yoghurt"]),

        FoodItem(id: "cheese", name: "Cheese", emoji: "🧀", caloriesPerServing: 113, servingLabel: "1 oz (28g)", matchKeywords: ["cheese"]),
        FoodItem(id: "nuts", name: "Mixed nuts", emoji: "🥜", caloriesPerServing: 172, servingLabel: "1 oz (28g)", matchKeywords: ["nuts", "almond", "peanut", "cashew"]),
        FoodItem(id: "popcorn", name: "Popcorn", emoji: "🍿", caloriesPerServing: 106, servingLabel: "3 cups, air-popped", matchKeywords: ["popcorn"]),
        FoodItem(id: "chips", name: "Potato chips", emoji: "🥔", caloriesPerServing: 152, servingLabel: "1 oz (28g)", matchKeywords: ["potato chips", "crisps"]),

        FoodItem(id: "donut", name: "Donut", emoji: "🍩", caloriesPerServing: 253, servingLabel: "1 glazed", matchKeywords: ["donut", "doughnut"]),
        FoodItem(id: "cookie", name: "Cookie", emoji: "🍪", caloriesPerServing: 148, servingLabel: "2 cookies", matchKeywords: ["cookie", "biscuit"]),
        FoodItem(id: "cake", name: "Cake", emoji: "🍰", caloriesPerServing: 235, servingLabel: "1 slice", matchKeywords: ["cake", "cupcake", "birthday cake"]),
        FoodItem(id: "ice_cream", name: "Ice cream", emoji: "🍨", caloriesPerServing: 137, servingLabel: "1/2 cup", matchKeywords: ["ice cream", "gelato", "sorbet"]),
        FoodItem(id: "chocolate", name: "Chocolate", emoji: "🍫", caloriesPerServing: 155, servingLabel: "1 oz (28g)", matchKeywords: ["chocolate", "candy bar"]),

        FoodItem(id: "coffee", name: "Coffee", emoji: "☕️", caloriesPerServing: 5, servingLabel: "1 cup, black", matchKeywords: ["coffee", "espresso", "latte", "cappuccino"]),
        FoodItem(id: "smoothie", name: "Smoothie", emoji: "🥤", caloriesPerServing: 250, servingLabel: "1 cup (16oz)", matchKeywords: ["smoothie", "milkshake", "shake"]),
        FoodItem(id: "juice", name: "Juice", emoji: "🧃", caloriesPerServing: 110, servingLabel: "1 cup (8oz)", matchKeywords: ["juice"]),
        FoodItem(id: "soda", name: "Soda", emoji: "🥤", caloriesPerServing: 140, servingLabel: "1 can (12oz)", matchKeywords: ["soda", "cola", "soft drink"]),

        FoodItem(id: "broccoli", name: "Broccoli", emoji: "🥦", caloriesPerServing: 55, servingLabel: "1 cup, cooked", matchKeywords: ["broccoli"]),
        FoodItem(id: "corn", name: "Corn", emoji: "🌽", caloriesPerServing: 125, servingLabel: "1 ear", matchKeywords: ["corn", "sweetcorn"]),
        FoodItem(id: "carrot", name: "Carrots", emoji: "🥕", caloriesPerServing: 25, servingLabel: "1 medium", matchKeywords: ["carrot"]),
        FoodItem(id: "tomato", name: "Tomato", emoji: "🍅", caloriesPerServing: 22, servingLabel: "1 medium", matchKeywords: ["tomato"]),
        FoodItem(id: "watermelon", name: "Watermelon", emoji: "🍉", caloriesPerServing: 46, servingLabel: "1 cup diced", matchKeywords: ["watermelon", "melon"]),

        FoodItem(id: "protein_bar", name: "Protein bar", emoji: "🍫", caloriesPerServing: 200, servingLabel: "1 bar", matchKeywords: ["protein bar", "granola bar", "energy bar"]),
        FoodItem(id: "protein_shake", name: "Protein shake", emoji: "🥤", caloriesPerServing: 160, servingLabel: "1 scoop + water", matchKeywords: ["protein shake", "protein powder"]),
    ]

    /// Fuzzy lookup against Vision's returned classification labels.
    /// Vision returns identifiers like "cheeseburger" or free-text-ish labels
    /// depending on OS version — this checks substrings both ways so small
    /// wording differences ("burger" vs "hamburger") still resolve.
    static func match(label: String) -> FoodItem? {
        let needle = label.lowercased()
        for item in all {
            for keyword in item.matchKeywords {
                if needle.contains(keyword) || keyword.contains(needle) {
                    return item
                }
            }
        }
        return nil
    }

    static func search(_ query: String) -> [FoodItem] {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else { return all }
        let q = query.lowercased()
        return all.filter { $0.name.lowercased().contains(q) || $0.matchKeywords.contains(where: { $0.contains(q) }) }
    }
}
