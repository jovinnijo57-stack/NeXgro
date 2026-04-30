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
}

export const INITIAL_RECIPES: Recipe[] = [
  // LUNCH
  {
    id: "l1",
    title: "VEGETABLE CURRY",
    category: "Lunch",
    time: "30 min",
    serves: 4,
    calories: "220 kcal",
    protein: "5g",
    fat: "14g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p15", name: "Mixed vegetables", qty: 2 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p1", name: "Tomato", qty: 1 },
      { id: "p40", name: "Coconut milk", qty: 1 }
    ],
    instructions: [
      "Sauté 1 onion and 1 chopped tomato until soft",
      "Add 2 cups mixed vegetables (potatoes, carrots, peas)",
      "Stir in 1 tsp turmeric and 1 tsp chili powder",
      "Pour in 1 cup coconut milk and 1/2 cup water",
      "Simmer for 15 min until vegetables are tender"
    ]
  },
  {
    id: "l2",
    title: "FISH CURRY",
    category: "Lunch",
    time: "25 min",
    serves: 4,
    calories: "280 kcal",
    protein: "24g",
    fat: "18g",
    carbs: "10g",
    image: "https://images.unsplash.com/photo-1567121298481-63bc48b30f81?w=800&q=80",
    ingredients: [
      { id: "p62", name: "Fish", qty: 1 },
      { id: "p103", name: "Tamarind", qty: 1 },
      { id: "p40", name: "Coconut milk", qty: 0.25 }
    ],
    instructions: [
      "Soak small ball of tamarind in 1/2 cup warm water",
      "Heat oil and sauté ginger, garlic, and green chilies",
      "Add tamarind water, 1 tsp turmeric, and 2 tsp chili powder",
      "Gently place 500g fish pieces into the gravy",
      "Cook for 10 min and finish with 1/4 cup coconut milk"
    ]
  },
  {
    id: "l3",
    title: "BEEF FRY",
    category: "Lunch",
    time: "45 min",
    serves: 4,
    calories: "420 kcal",
    protein: "32g",
    fat: "28g",
    carbs: "8g",
    image: "https://images.unsplash.com/photo-1510627489930-0c1b0ba9448f?w=800&q=80",
    ingredients: [
      { id: "p63", name: "Beef", qty: 1 },
      { id: "p14", name: "Onions", qty: 2 },
      { id: "p93", name: "Coconut slices", qty: 0.25 }
    ],
    instructions: [
      "Pressure cook 500g beef with ginger and salt for 20 min",
      "In a pan, sauté 2 sliced onions and 1/4 cup coconut slices",
      "Add cooked beef and 2 tsp garam masala",
      "Stir-fry on medium-high heat until the beef turns dark brown",
      "Garnish with plenty of curry leaves"
    ]
  },
  {
    id: "l4",
    title: "FRIED RICE",
    category: "Lunch",
    time: "15 min",
    serves: 2,
    calories: "380 kcal",
    protein: "12g",
    fat: "14g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1512058560550-42749969a6ce?w=800&q=80",
    ingredients: [
      { id: "p36", name: "Cooked rice", qty: 3 },
      { id: "p107", name: "Soy sauce", qty: 1 },
      { id: "p10", name: "Eggs", qty: 2 }
    ],
    instructions: [
      "Heat 2 tbsp oil in a wok on high heat",
      "Scramble 2 eggs or sauté 1 cup chopped veggies",
      "Add 3 cups cold cooked rice",
      "Pour 2 tbsp soy sauce and 1 tsp pepper",
      "Toss for 3 min and top with 1/4 cup scallions"
    ]
  },
  {
    id: "l5",
    title: "LEMON RICE",
    category: "Lunch",
    time: "10 min",
    serves: 2,
    calories: "280 kcal",
    protein: "6g",
    fat: "8g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p36", name: "Cooked rice", qty: 3 },
      { id: "p146", name: "Lemon", qty: 1 },
      { id: "p7", name: "Peanuts", qty: 1 }
    ],
    instructions: [
      "Heat 1 tbsp oil; fry 2 tbsp peanuts until crunchy",
      "Add 1 tsp mustard seeds and curry leaves",
      "Add 1/2 tsp turmeric and turn off the heat",
      "Mix in 3 cups cooked rice and 1 tsp salt",
      "Squeeze the juice of 1 lemon over and mix well"
    ]
  },
  {
    id: "l6",
    title: "Thali Meals",
    category: "Lunch",
    time: "45 min",
    serves: 1,
    calories: "750 kcal",
    protein: "20g",
    fat: "25g",
    carbs: "110g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p36", name: "Rice", qty: 1 },
      { id: "p101", name: "Dal", qty: 1 },
      { id: "p1", name: "Veg side", qty: 1 }
    ],
    instructions: [
      "Prepare 1 cup steamed rice as the center base",
      "Arrange 4 small bowls around the rice",
      "Fill bowls with Dal, Vegetable Curry, Curd, and Payasam",
      "Place 1 papad and 1 tsp pickle on the side",
      "Serve on a large round plate or banana leaf"
    ]
  },

  // ADDITIONAL
  {
    id: "nv1",
    title: "CHICKEN FRY",
    category: "Non-Veg",
    time: "30 min",
    serves: 2,
    calories: "450 kcal",
    protein: "32g",
    fat: "30g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1562967914-6c82c6ca2d42?w=800&q=80",
    ingredients: [
      { id: "p37", name: "Chicken pieces", qty: 1 },
      { id: "p113", name: "Ginger-garlic paste", qty: 1 },
      { id: "p147", name: "Cornflour", qty: 1 }
    ],
    instructions: [
      "Marinate 500g chicken with G-G paste, lemon, and spices",
      "Mix in 2 tbsp cornflour for extra crunch",
      "Let it rest for 30 min",
      "Deep fry in hot oil for 12–15 min",
      "Serve hot with onion rings"
    ]
  },
  {
    id: "s1",
    title: "TOAST",
    category: "Snacks",
    time: "5 min",
    serves: 1,
    calories: "180 kcal",
    protein: "4g",
    fat: "6g",
    carbs: "28g",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
    ingredients: [
      { id: "p6", name: "Bread", qty: 2 },
      { id: "p29", name: "Butter", qty: 1 },
      { id: "p95", name: "Jam/Honey", qty: 1 }
    ],
    instructions: [
      "Place 2 slices of bread in a toaster or on a pan",
      "Heat until golden brown on both sides",
      "Spread 1 tsp butter while the bread is hot",
      "Top with 1 tsp jam or honey",
      "Cut into triangles and serve immediately"
    ]
  },

  // RE-INTEGRATING PREVIOUS BESTS (DEDUPLICATED)
  {
    id: "b1",
    title: "IDLI",
    category: "Breakfast",
    time: "12 min",
    serves: 4,
    calories: "280 kcal",
    protein: "10g",
    fat: "2g",
    carbs: "48g",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    ingredients: [{ id: "p36", name: "Rice", qty: 2 }, { id: "p88", name: "Urad dal", qty: 1 }, { id: "p58", name: "Salt", qty: 1 }],
    instructions: [
      "Take 2 cups rice and wash well",
      "Take 1 cup urad dal and wash separately",
      "Soak rice in 3 cups water and dal in 2 cups water for 6 hours",
      "Grind dal with 1/2 cup water until smooth",
      "Grind rice with 3/4 cup water until coarse",
      "Mix both, add 1 tsp salt, and ferment for 8–10 hours",
      "Pour 80 ml batter into molds",
      "Steam with 2 cups water for 12 min"
    ]
  },
  {
    id: "b2",
    title: "DOSA",
    category: "Breakfast",
    time: "5 min",
    serves: 2,
    calories: "320 kcal",
    protein: "8g",
    fat: "6g",
    carbs: "58g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [{ id: "p36", name: "Rice", qty: 3 }, { id: "p88", name: "Urad dal", qty: 1 }, { id: "p59", name: "Oil", qty: 1 }],
    instructions: [
      "Soak 3 cups rice, 1 cup urad dal, and 1 tsp fenugreek for 5 hours",
      "Grind to a very smooth, pourable batter",
      "Add 1 tsp salt and ferment for 8 hours",
      "Heat a pan and grease with 1 tsp oil",
      "Spread 1 ladle of batter in a thin circle",
      "Cook for 2 min until edges are crispy"
    ]
  },
  {
    id: "b4",
    title: "PUTTU",
    category: "Breakfast",
    time: "8 min",
    serves: 2,
    calories: "220 kcal",
    protein: "5g",
    fat: "4g",
    carbs: "42g",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    ingredients: [{ id: "p92", name: "Rice flour", qty: 2 }, { id: "p93", name: "Grated coconut", qty: 1 }],
    instructions: [
      "Mix 2 cups rice flour with 1/2 tsp salt",
      "Sprinkle 3/4 cup water gradually while mixing",
      "Layer 2 tbsp coconut then 1 cup flour mixture in puttu maker",
      "Steam for 6–8 min until steam escapes top"
    ]
  },
  {
    id: "l4_old",
    title: "BIRYANI",
    category: "Lunch",
    time: "60 min",
    serves: 4,
    calories: "550 kcal",
    protein: "22g",
    fat: "25g",
    carbs: "65g",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc9?w=800&q=80",
    ingredients: [{ id: "p36", name: "Rice (Basmati)", qty: 2 }, { id: "p37", name: "Meat/Chicken", qty: 1 }, { id: "p104", name: "Whole spices", qty: 1 }],
    instructions: [
      "Marinate 500g meat in 1/2 cup yogurt and spices for 1 hour",
      "Parboil 2 cups rice with whole spices until 70% cooked",
      "Layer meat and rice in a heavy-bottomed pot",
      "Top with 2 tbsp ghee and fried onions",
      "Seal lid and cook on 'Dum' for 25 min"
    ]
  }
];

export const getRecipes = (): Recipe[] => {
  const stored = localStorage.getItem("nexgro_recipes");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_RECIPES;
    }
  }
  return INITIAL_RECIPES;
};

export const saveRecipes = (recipes: Recipe[]) => {
  localStorage.setItem("nexgro_recipes", JSON.stringify(recipes));
};

export const ALL_RECIPES = getRecipes();
