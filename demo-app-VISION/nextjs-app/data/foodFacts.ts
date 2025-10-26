// Fun food facts and nutrition tips to display during loading

export interface FoodFact {
  text: string
  emoji: string
  category: 'nutrition' | 'history' | 'science' | 'tip'
}

export const foodFacts: FoodFact[] = [
  // Nutrition Tips
  {
    text: "Eating colorful fruits and vegetables ensures you get a variety of nutrients!",
    emoji: "🌈",
    category: "nutrition"
  },
  {
    text: "Dark leafy greens like spinach are packed with iron and vitamins A, C, and K.",
    emoji: "🥬",
    category: "nutrition"
  },
  {
    text: "Protein helps build and repair muscles. Aim for a variety of sources!",
    emoji: "💪",
    category: "nutrition"
  },
  {
    text: "Drinking water before meals can help with portion control and digestion.",
    emoji: "💧",
    category: "nutrition"
  },
  {
    text: "Omega-3 fatty acids in fish support brain and heart health.",
    emoji: "🐟",
    category: "nutrition"
  },
  {
    text: "Berries are loaded with antioxidants that protect your cells from damage.",
    emoji: "🫐",
    category: "nutrition"
  },
  {
    text: "Whole grains provide sustained energy and are rich in fiber.",
    emoji: "🌾",
    category: "nutrition"
  },
  {
    text: "Nuts and seeds are great sources of healthy fats and vitamin E.",
    emoji: "🥜",
    category: "nutrition"
  },
  
  // Food History & Culture
  {
    text: "Tomatoes were once thought to be poisonous in Europe!",
    emoji: "🍅",
    category: "history"
  },
  {
    text: "Pizza Margherita was created to honor Queen Margherita of Italy in 1889.",
    emoji: "🍕",
    category: "history"
  },
  {
    text: "Carrots were originally purple, not orange!",
    emoji: "🥕",
    category: "history"
  },
  {
    text: "Chocolate was used as currency by the ancient Aztecs.",
    emoji: "🍫",
    category: "history"
  },
  {
    text: "Honey never spoils. Archaeologists found 3000-year-old honey still edible!",
    emoji: "🍯",
    category: "history"
  },
  {
    text: "Pineapples used to be so expensive that people would rent them for parties!",
    emoji: "🍍",
    category: "history"
  },
  {
    text: "Ketchup was sold as medicine in the 1830s!",
    emoji: "🥫",
    category: "history"
  },
  {
    text: "French fries actually originated in Belgium, not France!",
    emoji: "🍟",
    category: "history"
  },
  
  // Food Science
  {
    text: "Bananas are berries, but strawberries aren't!",
    emoji: "🍌",
    category: "science"
  },
  {
    text: "Apples float in water because they are 25% air!",
    emoji: "🍎",
    category: "science"
  },
  {
    text: "Cucumbers are 96% water, making them super hydrating!",
    emoji: "🥒",
    category: "science"
  },
  {
    text: "Spicy foods contain capsaicin, which triggers heat receptors in your mouth.",
    emoji: "🌶️",
    category: "science"
  },
  {
    text: "Peanuts aren't nuts! They're legumes that grow underground.",
    emoji: "🥜",
    category: "science"
  },
  {
    text: "Mushrooms can produce their own vitamin D when exposed to sunlight!",
    emoji: "🍄",
    category: "science"
  },
  {
    text: "Avocados are actually a fruit, and they have more potassium than bananas!",
    emoji: "🥑",
    category: "science"
  },
  {
    text: "Onions make you cry because they release sulfuric acid when cut!",
    emoji: "🧅",
    category: "science"
  },
  
  // Cooking Tips
  {
    text: "Add a pinch of salt to desserts to enhance their sweetness!",
    emoji: "🧂",
    category: "tip"
  },
  {
    text: "Let meat rest after cooking to retain its juices and flavor.",
    emoji: "🥩",
    category: "tip"
  },
  {
    text: "Store tomatoes at room temperature for better flavor and texture.",
    emoji: "🍅",
    category: "tip"
  },
  {
    text: "Use lemon juice to prevent cut fruits from browning.",
    emoji: "🍋",
    category: "tip"
  },
  {
    text: "Toast spices in a dry pan to enhance their aroma and flavor!",
    emoji: "✨",
    category: "tip"
  },
  {
    text: "Add pasta water to your sauce for a silkier, more cohesive dish.",
    emoji: "🍝",
    category: "tip"
  },
  {
    text: "Room temperature eggs whip up better for baking!",
    emoji: "🥚",
    category: "tip"
  },
  {
    text: "Sharpen your knives regularly for safer and more efficient cooking.",
    emoji: "🔪",
    category: "tip"
  },
  {
    text: "Marinate in glass or ceramic bowls, not metal, to avoid chemical reactions.",
    emoji: "🍖",
    category: "tip"
  },
  {
    text: "Baking soda can help soften beans and reduce cooking time!",
    emoji: "🫘",
    category: "tip"
  },
  
  // More Nutrition
  {
    text: "Green tea contains catechins that boost metabolism and support weight loss.",
    emoji: "🍵",
    category: "nutrition"
  },
  {
    text: "Garlic has antibacterial properties and may boost immune function!",
    emoji: "🧄",
    category: "nutrition"
  },
  {
    text: "Sweet potatoes are rich in beta-carotene, which converts to vitamin A.",
    emoji: "🍠",
    category: "nutrition"
  },
  {
    text: "Fermented foods like yogurt promote healthy gut bacteria!",
    emoji: "🥛",
    category: "nutrition"
  },
  {
    text: "Eggs are one of the most complete protein sources with all essential amino acids.",
    emoji: "🥚",
    category: "nutrition"
  },
  {
    text: "Cinnamon can help regulate blood sugar levels naturally.",
    emoji: "🌰",
    category: "nutrition"
  },
  {
    text: "Broccoli contains more vitamin C than an orange!",
    emoji: "🥦",
    category: "nutrition"
  },
  {
    text: "Dark chocolate (70%+ cacao) is rich in antioxidants and flavonoids.",
    emoji: "🍫",
    category: "nutrition"
  },
]

// Get a random food fact
export const getRandomFact = (): FoodFact => {
  const randomIndex = Math.floor(Math.random() * foodFacts.length)
  return foodFacts[randomIndex]
}

// Get a random fact by category
export const getRandomFactByCategory = (category: FoodFact['category']): FoodFact => {
  const filtered = foodFacts.filter(fact => fact.category === category)
  const randomIndex = Math.floor(Math.random() * filtered.length)
  return filtered[randomIndex]
}

// Get multiple unique random facts
export const getMultipleRandomFacts = (count: number): FoodFact[] => {
  const shuffled = [...foodFacts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, foodFacts.length))
}
