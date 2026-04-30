export interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  serves: number;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  image: string;
  ingredients: { id: string; name: string; qty: number }[];
  instructions: string[];
  preparation?: string[]; // Added for hardcoded AI analysis
}

export const ALL_RECIPES: Recipe[] = [
  // LUNCH RECIPES
  {
    id: "l_veg_curry",
    title: "VEGETABLE CURRY",
    category: "Lunch",
    time: "25 min",
    serves: 4,
    calories: "180 kcal",
    protein: "4g",
    fat: "10g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p_veg", name: "Mixed vegetables", qty: 2 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p1", name: "Tomato", qty: 1 },
      { id: "p_cmilk", name: "Coconut milk", qty: 1 },
      { id: "p_spices", name: "Spices", qty: 1 }
    ],
    instructions: ["Sauté onion and tomato", "Add vegetables", "Add spices", "Simmer with coconut milk"],
    preparation: [
      "Sauté 1 onion and 1 chopped tomato until soft",
      "Add 2 cups mixed vegetables (potatoes, carrots, peas)",
      "Stir in 1 tsp turmeric and 1 tsp chili powder",
      "Pour in 1 cup coconut milk and 1/2 cup water",
      "Simmer for 15 min until vegetables are tender"
    ]
  },
  {
    id: "l_fish_curry",
    title: "FISH CURRY",
    category: "Lunch",
    time: "20 min",
    serves: 3,
    calories: "320 kcal",
    protein: "25g",
    fat: "18g",
    carbs: "8g",
    image: "https://images.unsplash.com/photo-1567121298481-63bc48b30f81?w=800&q=80",
    ingredients: [
      { id: "p62", name: "Fish", qty: 1 },
      { id: "p103", name: "Tamarind", qty: 1 },
      { id: "p_cmilk", name: "Coconut milk", qty: 1 },
      { id: "p_turmeric", name: "Turmeric", qty: 1 },
      { id: "p_chili", name: "Chili powder", qty: 1 }
    ],
    instructions: ["Soak tamarind", "Sauté spices", "Add fish", "Cook for 10 min"],
    preparation: [
      "Soak small ball of tamarind in 1/2 cup warm water",
      "Heat oil and sauté ginger, garlic, and green chilies",
      "Add tamarind water, 1 tsp turmeric, and 2 tsp chili powder",
      "Gently place 500g fish pieces into the gravy",
      "Cook for 10 min and finish with 1/4 cup coconut milk"
    ]
  },
  {
    id: "l_beef_fry",
    title: "BEEF FRY",
    category: "Lunch",
    time: "45 min",
    serves: 4,
    calories: "450 kcal",
    protein: "32g",
    fat: "28g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p_beef", name: "Beef", qty: 1 },
      { id: "p14", name: "Onions", qty: 2 },
      { id: "p_cslices", name: "Coconut slices", qty: 1 },
      { id: "p_ginger", name: "Ginger", qty: 1 },
      { id: "p_garam", name: "Garam masala", qty: 1 }
    ],
    instructions: ["Pressure cook beef", "Sauté onions", "Stir-fry until brown"],
    preparation: [
      "Pressure cook 500g beef with ginger and salt for 20 min",
      "In a pan, sauté 2 sliced onions and 1/4 cup coconut slices",
      "Add cooked beef and 2 tsp garam masala",
      "Stir-fry on medium-high heat until the beef turns dark brown",
      "Garnish with plenty of curry leaves"
    ]
  },
  {
    id: "l_fried_rice",
    title: "FRIED RICE",
    category: "Lunch",
    time: "15 min",
    serves: 2,
    calories: "420 kcal",
    protein: "8g",
    fat: "14g",
    carbs: "65g",
    image: "https://images.unsplash.com/photo-1512058560560-824872123f62?w=800&q=80",
    ingredients: [
      { id: "p36", name: "Cooked rice", qty: 1 },
      { id: "p107", name: "Soy sauce", qty: 1 },
      { id: "p136", name: "Scallions", qty: 1 },
      { id: "p10", name: "Eggs/Veggies", qty: 1 },
      { id: "p59", name: "Oil", qty: 1 }
    ],
    instructions: ["Heat oil", "Sauté veggies/eggs", "Add rice and sauce"],
    preparation: [
      "Heat 2 tbsp oil in a wok on high heat",
      "Scramble 2 eggs or sauté 1 cup chopped veggies",
      "Add 3 cups cold cooked rice",
      "Pour 2 tbsp soy sauce and 1 tsp pepper",
      "Toss for 3 min and top with 1/4 cup scallions"
    ]
  },
  {
    id: "l_lemon_rice",
    title: "LEMON RICE",
    category: "Lunch",
    time: "10 min",
    serves: 2,
    calories: "320 kcal",
    protein: "6g",
    fat: "12g",
    carbs: "48g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p36", name: "Cooked rice", qty: 1 },
      { id: "p_lemon", name: "Lemon", qty: 1 },
      { id: "p7", name: "Peanuts", qty: 1 },
      { id: "p_turmeric", name: "Turmeric", qty: 1 },
      { id: "p_cleaves", name: "Curry leaves", qty: 1 }
    ],
    instructions: ["Fry peanuts", "Add mustard and turmeric", "Mix rice and lemon"],
    preparation: [
      "Heat 1 tbsp oil; fry 2 tbsp peanuts until crunchy",
      "Add 1 tsp mustard seeds and curry leaves",
      "Add 1/2 tsp turmeric and turn off the heat",
      "Mix in 3 cups cooked rice and 1 tsp salt",
      "Squeeze the juice of 1 lemon over and mix well"
    ]
  },
  {
    id: "l_thali",
    title: "THALI MEALS",
    category: "Lunch",
    time: "40 min",
    serves: 1,
    calories: "850 kcal",
    protein: "22g",
    fat: "35g",
    carbs: "110g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p36", name: "Rice", qty: 1 },
      { id: "p101", name: "Dal", qty: 1 },
      { id: "p15", name: "Veg side", qty: 1 },
      { id: "p105", name: "Curd", qty: 1 },
      { id: "p_pickle", name: "Pickle", qty: 1 },
      { id: "p_papad", name: "Papad", qty: 1 },
      { id: "p_dessert", name: "Dessert", qty: 1 }
    ],
    instructions: ["Prepare rice", "Arrange bowls", "Serve"],
    preparation: [
      "Prepare 1 cup steamed rice as the center base",
      "Arrange 4 small bowls around the rice",
      "Fill bowls with Dal, Vegetable Curry, Curd, and Payasam",
      "Place 1 papad and 1 tsp pickle on the side",
      "Serve on a large round plate or banana leaf"
    ]
  },

  // ADDITIONAL NON-VEG & SNACKS
  {
    id: "nv_chicken_fry",
    title: "CHICKEN FRY",
    category: "Non-Veg",
    time: "45 min",
    serves: 2,
    calories: "520 kcal",
    protein: "38g",
    fat: "35g",
    carbs: "15g",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80",
    ingredients: [
      { id: "p37", name: "Chicken pieces", qty: 1 },
      { id: "p_ggpaste", name: "Ginger-garlic paste", qty: 1 },
      { id: "p_chili", name: "Chili powder", qty: 1 },
      { id: "p_cornflour", name: "Cornflour", qty: 1 }
    ],
    instructions: ["Marinate chicken", "Add cornflour", "Deep fry"],
    preparation: [
      "Marinate 500g chicken with G-G paste, lemon, and spices",
      "Mix in 2 tbsp cornflour for extra crunch",
      "Let it rest for 30 min",
      "Deep fry in hot oil for 12–15 min",
      "Serve hot with onion rings"
    ]
  },
  {
    id: "sn_toast",
    title: "TOAST",
    category: "Snacks",
    time: "5 min",
    serves: 1,
    calories: "150 kcal",
    protein: "4g",
    fat: "6g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
    ingredients: [
      { id: "p6", name: "Bread", qty: 1 },
      { id: "p29", name: "Butter", qty: 1 },
      { id: "p_jam", name: "Jam or Honey", qty: 1 }
    ],
    instructions: ["Toast bread", "Spread butter", "Add jam/honey"],
    preparation: [
      "Place 2 slices of bread in a toaster or on a pan",
      "Heat until golden brown on both sides",
      "Spread 1 tsp butter while the bread is hot",
      "Top with 1 tsp jam or honey",
      "Cut into triangles and serve immediately"
    ]
  }
];

export function getRecipes(): Recipe[] {
  if (typeof window === 'undefined') return ALL_RECIPES;
  const saved = localStorage.getItem("nexgro_recipes");
  return saved ? JSON.parse(saved) : ALL_RECIPES;
}

export function saveRecipes(recipes: Recipe[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem("nexgro_recipes", JSON.stringify(recipes));
}
