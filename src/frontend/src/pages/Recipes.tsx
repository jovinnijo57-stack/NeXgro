import { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Clock, Users, Flame, ShoppingCart, 
  Plus, Calendar, Mic, MicOff, Info, BookOpen, ChefHat, Utensils
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface Recipe {
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

export const ALL_RECIPES: Recipe[] = [
  // BREAKFAST
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
      "Grind dal with 1/2 cup water → smooth",
      "Grind rice with 3/4 cup water → coarse",
      "Mix both + add 1 tsp salt",
      "Ferment for 8–10 hours",
      "Pour 80 ml batter into molds",
      "Steam with 2 cups water for 12 min"
    ]
  },
  {
    id: "b2",
    title: "DOSA",
    category: "Breakfast",
    time: "20 min",
    serves: 2,
    calories: "350 kcal",
    protein: "8g",
    fat: "12g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
    ingredients: [{ id: "p36", name: "Rice", qty: 3 }, { id: "p88", name: "Urad dal", qty: 1 }, { id: "p58", name: "Salt", qty: 1 }, { id: "p59", name: "Oil", qty: 1 }],
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
    id: "b3",
    title: "APPAM",
    category: "Breakfast",
    time: "25 min",
    serves: 3,
    calories: "410 kcal",
    protein: "14g",
    fat: "12g",
    carbs: "62g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [{ id: "p36", name: "Raw rice", qty: 2 }, { id: "p93", name: "Coconut", qty: 1 }, { id: "p94", name: "Yeast", qty: 1 }, { id: "p57", name: "Sugar", qty: 1 }, { id: "p58", name: "Salt", qty: 1 }],
    instructions: [
      "Soak 2 cups raw rice for 4 hours",
      "Grind rice with 1 cup grated coconut and 1/2 cup cooked rice",
      "Add 1/2 tsp yeast and 1 tbsp sugar",
      "Ferment for 6–8 hours until bubbly",
      "Pour into an Appam pan and swirl to coat edges",
      "Steam covered for 3 min"
    ]
  },
  {
    id: "b4",
    title: "PUTTU",
    category: "Breakfast",
    time: "15 min",
    serves: 2,
    calories: "320 kcal",
    protein: "6g",
    fat: "8g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [{ id: "p92", name: "Rice flour", qty: 2 }, { id: "p93", name: "Grated coconut", qty: 1 }, { id: "p58", name: "Salt", qty: 1 }],
    instructions: [
      "Mix 2 cups rice flour with 1/2 tsp salt",
      "Sprinkle 3/4 cup water gradually while mixing",
      "Texture should be moist but crumbly (no lumps)",
      "Layer 2 tbsp coconut then 1 cup flour mixture in puttu maker",
      "Steam for 6–8 min until steam escapes top"
    ]
  },
  {
    id: "b5",
    title: "UPMA",
    category: "Breakfast",
    time: "15 min",
    serves: 2,
    calories: "260 kcal",
    protein: "6g",
    fat: "10g",
    carbs: "42g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [{ id: "p90", name: "Rava (Semolina)", qty: 1 }, { id: "p14", name: "Onion", qty: 1 }, { id: "p84", name: "Ghee", qty: 2 }],
    instructions: [
      "Roast 1 cup rava until fragrant; set aside",
      "Sauté 1 tsp mustard seeds, 1 chopped onion, and chilies in 2 tbsp ghee",
      "Add 2.5 cups water and bring to a boil",
      "Slowly pour in rava while stirring constantly",
      "Cover and cook on low heat for 5 min"
    ]
  },
  {
    id: "b6",
    title: "PONGAL",
    category: "Breakfast",
    time: "25 min",
    serves: 3,
    calories: "450 kcal",
    protein: "12g",
    fat: "15g",
    carbs: "65g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [{ id: "p36", name: "Raw rice", qty: 1 }, { id: "p89", name: "Moong dal", qty: 1 }, { id: "p84", name: "Ghee", qty: 3 }, { id: "p58", name: "Salt", qty: 1 }],
    instructions: [
      "Pressure cook 1 cup rice and 1/2 cup moong dal with 4.5 cups water",
      "Mash the cooked mixture slightly",
      "Heat 3 tbsp ghee; fry 1 tsp pepper, 1 tsp cumin, and ginger",
      "Pour the tempering over the rice mixture",
      "Add 1 tsp salt and mix well"
    ]
  },
  {
    id: "b7",
    title: "POHA",
    category: "Breakfast",
    time: "10 min",
    serves: 2,
    calories: "310 kcal",
    protein: "7g",
    fat: "12g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [{ id: "p91", name: "Flattened rice (Poha)", qty: 2 }, { id: "p14", name: "Onion", qty: 1 }, { id: "p59", name: "Oil", qty: 1 }],
    instructions: [
      "Rinse 2 cups thick poha in a colander; drain well",
      "Sauté 1/2 cup peanuts, 1 onion, and 1/2 tsp turmeric in oil",
      "Add poha and 1 tsp salt; toss gently",
      "Cover and steam for 2 min",
      "Finish with 1 tbsp lemon juice and cilantro"
    ]
  },
  {
    id: "b8",
    title: "PARATHA",
    category: "Breakfast",
    time: "20 min",
    serves: 2,
    calories: "380 kcal",
    protein: "9g",
    fat: "15g",
    carbs: "52g",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80",
    ingredients: [{ id: "p56", name: "Whole wheat flour", qty: 2 }, { id: "p58", name: "Salt", qty: 1 }, { id: "p59", name: "Oil", qty: 1 }],
    instructions: [
      "Knead 2 cups flour, 1/2 tsp salt, and 3/4 cup water into a dough",
      "Rest dough for 20 min",
      "Roll into a 6-inch circle, brush with oil, and fold",
      "Roll out again and cook on a hot griddle",
      "Apply 1 tsp ghee on both sides until golden brown"
    ]
  },
  {
    id: "b9",
    title: "OMELETTE",
    category: "Breakfast",
    time: "5 min",
    serves: 1,
    calories: "220 kcal",
    protein: "14g",
    fat: "16g",
    carbs: "4g",
    image: "https://images.unsplash.com/photo-1510627489930-0c1b0ba9448f?w=800&q=80",
    ingredients: [{ id: "p37", name: "Eggs", qty: 2 }, { id: "p14", name: "Onion", qty: 2 }, { id: "p4", name: "Milk", qty: 1 }, { id: "p85", name: "Butter", qty: 1 }],
    instructions: [
      "Whisk 2 eggs with 1 tbsp milk and a pinch of salt/pepper",
      "Sauté 2 tbsp chopped onions in 1 tsp butter",
      "Pour egg mixture into the pan",
      "Cook for 2 min until base is set",
      "Fold in half and serve hot"
    ]
  },
  {
    id: "b10",
    title: "FRENCH TOAST",
    category: "Breakfast",
    time: "10 min",
    serves: 1,
    calories: "350 kcal",
    protein: "12g",
    fat: "14g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80",
    ingredients: [{ id: "p31", name: "Bread slices", qty: 2 }, { id: "p37", name: "Egg", qty: 1 }, { id: "p4", name: "Milk", qty: 1 }, { id: "p95", name: "Maple syrup", qty: 1 }],
    instructions: [
      "Whisk 1 egg, 1/4 cup milk, and 1/4 tsp cinnamon",
      "Dip 2 slices of bread into the mixture for 10 seconds per side",
      "Melt 1 tbsp butter on a skillet",
      "Fry bread for 3 min per side until golden",
      "Top with 1 tbsp maple syrup"
    ]
  },
  {
    id: "b11",
    title: "PANCAKES",
    category: "Breakfast",
    time: "15 min",
    serves: 2,
    calories: "450 kcal",
    protein: "10g",
    fat: "12g",
    carbs: "75g",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
    ingredients: [{ id: "p56", name: "Flour", qty: 1 }, { id: "p4", name: "Milk", qty: 1 }, { id: "p37", name: "Egg", qty: 1 }, { id: "p57", name: "Sugar", qty: 1 }],
    instructions: [
      "Mix 1 cup flour, 1 tbsp sugar, and 2 tsp baking powder",
      "Whisk in 1 cup milk and 1 egg until smooth",
      "Pour 1/4 cup batter onto a greased hot pan",
      "Flip when bubbles form on top (about 2 min)",
      "Cook other side for 1 min"
    ]
  },
  {
    id: "b12",
    title: "SANDWICH",
    category: "Breakfast",
    time: "10 min",
    serves: 1,
    calories: "380 kcal",
    protein: "14g",
    fat: "18g",
    carbs: "42g",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
    ingredients: [{ id: "p31", name: "Bread", qty: 2 }, { id: "p11", name: "Cheese", qty: 1 }, { id: "p1", name: "Tomato", qty: 2 }, { id: "p85", name: "Butter", qty: 1 }],
    instructions: [
      "Spread 1 tsp butter on 2 slices of bread",
      "Layer 1 slice cheese, 2 slices tomato, and lettuce",
      "Close the sandwich and grill on a pan",
      "Toast for 3 min per side until cheese melts",
      "Cut diagonally and serve"
    ]
  },
  {
    id: "b13",
    title: "SMOOTHIE BOWL",
    category: "Breakfast",
    time: "5 min",
    serves: 1,
    calories: "320 kcal",
    protein: "8g",
    fat: "6g",
    carbs: "62g",
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80",
    ingredients: [{ id: "p99", name: "Almond milk", qty: 1 }, { id: "p97", name: "Granola", qty: 2 }, { id: "p98", name: "Chia seeds", qty: 1 }],
    instructions: [
      "Blend 1 frozen banana, 1/2 cup berries, and 1/4 cup milk",
      "Texture should be thick (like soft serve)",
      "Pour into a bowl",
      "Top with 2 tbsp granola and 1 tsp chia seeds",
      "Add fresh fruit slices for garnish"
    ]
  },
  {
    id: "b14",
    title: "OATS PORRIDGE",
    category: "Breakfast",
    time: "10 min",
    serves: 1,
    calories: "290 kcal",
    protein: "12g",
    fat: "6g",
    carbs: "48g",
    image: "https://images.unsplash.com/photo-1504113888839-1c8003673ef2?w=800&q=80",
    ingredients: [{ id: "p100", name: "Rolled oats", qty: 1 }, { id: "p4", name: "Milk", qty: 1 }, { id: "p96", name: "Honey", qty: 1 }],
    instructions: [
      "Combine 1/2 cup oats and 1 cup milk in a pot",
      "Simmer for 5–7 min while stirring",
      "Add 1 tsp honey for sweetness",
      "Top with 1 tbsp chopped nuts",
      "Serve warm with sliced fruit"
    ]
  },
  // LUNCH
  {
    id: "l1",
    title: "SAMBAR",
    category: "Lunch",
    time: "25 min",
    serves: 4,
    calories: "180 kcal",
    protein: "8g",
    fat: "4g",
    carbs: "25g",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    ingredients: [{ id: "p101", name: "Toor dal", qty: 1 }, { id: "p102", name: "Sambar powder", qty: 2 }, { id: "p103", name: "Tamarind", qty: 1 }],
    instructions: [
      "Pressure cook 1 cup toor dal with 3 cups water",
      "Boil 2 cups vegetables in 1/2 cup tamarind water",
      "Add 2 tbsp sambar powder and 1 tsp salt",
      "Mix in mashed dal and simmer for 5 min",
      "Temper with 1 tsp mustard seeds and curry leaves"
    ]
  },
  {
    id: "l2",
    title: "RASAM",
    category: "Lunch",
    time: "10 min",
    serves: 4,
    calories: "80 kcal",
    protein: "2g",
    fat: "3g",
    carbs: "10g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [{ id: "p1", name: "Tomatoes", qty: 2 }, { id: "p103", name: "Tamarind", qty: 1 }, { id: "p113", name: "Garlic", qty: 4 }],
    instructions: [
      "Mash 2 tomatoes into 2 cups tamarind water",
      "Crush 4 cloves garlic, 1 tsp pepper, and 1 tsp cumin",
      "Add spices to the water and bring to a simmer",
      "Do not boil; turn off heat when frothy",
      "Temper with 1 tsp ghee and mustard seeds"
    ]
  },
  {
    id: "l3",
    title: "CHICKEN CURRY",
    category: "Lunch",
    time: "30 min",
    serves: 3,
    calories: "450 kcal",
    protein: "35g",
    fat: "25g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&q=80",
    ingredients: [{ id: "p37", name: "Chicken", qty: 1 }, { id: "p14", name: "Onion", qty: 2 }, { id: "p1", name: "Tomato", qty: 2 }],
    instructions: [
      "Sauté 2 sliced onions and 1 tbsp G-G paste in oil",
      "Add 2 chopped tomatoes and 1 tsp turmeric/chili/coriander",
      "Add 500g chicken pieces and 1 tsp salt",
      "Cover and cook in own juices for 20 min",
      "Garnish with fresh cilantro"
    ]
  },
  {
    id: "l4",
    title: "BIRYANI",
    category: "Lunch",
    time: "1 hr 25 min",
    serves: 4,
    calories: "650 kcal",
    protein: "30g",
    fat: "28g",
    carbs: "70g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&q=80",
    ingredients: [{ id: "p36", name: "Basmati rice", qty: 2 }, { id: "p104", name: "Whole spices", qty: 1 }, { id: "p105", name: "Yogurt", qty: 1 }],
    instructions: [
      "Marinate 500g meat in 1/2 cup yogurt and spices for 1 hour",
      "Parboil 2 cups rice with whole spices until 70% cooked",
      "Layer meat and rice in a heavy-bottomed pot",
      "Top with 2 tbsp ghee and fried onions",
      "Seal lid and cook on 'Dum' (low heat) for 25 min"
    ]
  },
  {
    id: "l5",
    title: "CURD RICE",
    category: "Lunch",
    time: "10 min",
    serves: 2,
    calories: "320 kcal",
    protein: "10g",
    fat: "8g",
    carbs: "50g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [{ id: "p36", name: "Cooked rice", qty: 2 }, { id: "p105", name: "Plain yogurt (Curd)", qty: 1 }, { id: "p4", name: "Milk", qty: 1 }, { id: "p106", name: "Pomegranate", qty: 1 }],
    instructions: [
      "Mash 2 cups soft cooked rice while warm",
      "Stir in 1 cup curd and 1/4 cup milk",
      "Add 1 tsp salt and grated ginger",
      "Temper with mustard seeds, urad dal, and chilies",
      "Garnish with 2 tbsp pomegranate seeds"
    ]
  },
  // DINNER
  {
    id: "d1",
    title: "ROTI & CURRY",
    category: "Dinner",
    time: "20 min",
    serves: 2,
    calories: "420 kcal",
    protein: "12g",
    fat: "14g",
    carbs: "60g",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80",
    ingredients: [{ id: "p56", name: "Atta (Wheat flour)", qty: 2 }, { id: "p58", name: "Salt", qty: 1 }],
    instructions: [
      "Knead 2 cups flour with water to make soft dough",
      "Roll into thin 7-inch circles",
      "Cook on hot griddle until bubbles appear",
      "Puff over direct flame for 5 seconds",
      "Serve hot with 1 bowl of prepared curry"
    ]
  },
  {
    id: "d2",
    title: "PANEER BUTTER MASALA",
    category: "Dinner",
    time: "15 min",
    serves: 2,
    calories: "480 kcal",
    protein: "15g",
    fat: "35g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
    ingredients: [{ id: "p30", name: "Paneer cubes", qty: 1 }, { id: "p85", name: "Butter", qty: 2 }, { id: "p40", name: "Cream", qty: 1 }, { id: "p112", name: "Cashews", qty: 1 }],
    instructions: [
      "Sauté 1 cup tomato puree in 2 tbsp butter",
      "Add 1/4 cup cashew paste and spices",
      "Simmer until oil separates",
      "Add 200g paneer and 2 tbsp heavy cream",
      "Cook for 3 min; garnish with dried fenugreek"
    ]
  },
  {
    id: "d3",
    title: "NOODLES",
    category: "Dinner",
    time: "15 min",
    serves: 2,
    calories: "400 kcal",
    protein: "12g",
    fat: "15g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
    ingredients: [{ id: "p48", name: "Egg/Veg noodles", qty: 1 }, { id: "p107", name: "Soy sauce", qty: 1 }, { id: "p108", name: "Vinegar", qty: 1 }],
    instructions: [
      "Boil 200g noodles; drain and toss in 1 tsp oil",
      "Stir-fry veggies/chicken on high heat for 5 min",
      "Add noodles + 1 tbsp soy sauce + 1 tsp vinegar",
      "Toss well for 2 min until charred",
      "Season with 1/2 tsp black pepper"
    ]
  },
  {
    id: "d4",
    title: "TOMATO SOUP",
    category: "Dinner",
    time: "20 min",
    serves: 2,
    calories: "210 kcal",
    protein: "4g",
    fat: "12g",
    carbs: "24g",
    image: "https://images.unsplash.com/photo-1547592115-30777e4d8961?w=800&q=80",
    ingredients: [{ id: "p1", name: "Tomatoes", qty: 4 }, { id: "p14", name: "Onion", qty: 1 }, { id: "p85", name: "Butter", qty: 1 }, { id: "p109", name: "Croutons", qty: 1 }],
    instructions: [
      "Pressure cook 4 tomatoes and 1 onion with 1 cup water",
      "Blend until smooth and strain through a sieve",
      "Simmer with 1 tbsp butter and 1/2 tsp sugar",
      "Add 1/4 cup cream for richness",
      "Serve with 5-6 toasted croutons"
    ]
  },
  {
    id: "d5",
    title: "STEAMED VEGETABLES",
    category: "Dinner",
    time: "10 min",
    serves: 2,
    calories: "120 kcal",
    protein: "6g",
    fat: "4g",
    carbs: "15g",
    image: "https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?w=800&q=80",
    ingredients: [{ id: "p110", name: "Broccoli", qty: 1 }, { id: "p15", name: "Carrots", qty: 2 }, { id: "p28", name: "Beans", qty: 1 }],
    instructions: [
      "Chop vegetables into even bite-sized pieces",
      "Place in a steamer basket over boiling water",
      "Steam for 6–8 min (until fork-tender but crisp)",
      "Toss with 1 tsp olive oil or butter",
      "Season with lemon juice and cracked pepper"
    ]
  },
  {
    id: "d6",
    title: "GRILLED CHICKEN",
    category: "Dinner",
    time: "15 min",
    serves: 1,
    calories: "320 kcal",
    protein: "45g",
    fat: "12g",
    carbs: "4g",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80",
    ingredients: [{ id: "p37", name: "Chicken breast", qty: 2 }, { id: "p111", name: "Oregano", qty: 1 }, { id: "p59", name: "Olive oil", qty: 1 }],
    instructions: [
      "Marinate 2 chicken breasts in oil, lemon, and herbs",
      "Preheat grill or pan to medium-high",
      "Grill for 6–7 min per side",
      "Ensure internal temp reaches 75°C",
      "Rest for 5 min before slicing"
    ]
  },
  // SNACKS
  {
    id: "s1",
    title: "SAMOSA",
    category: "Snacks",
    time: "25 min",
    serves: 4,
    calories: "280 kcal",
    protein: "6g",
    fat: "15g",
    carbs: "32g",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb0ce08?w=800&q=80",
    ingredients: [
      { id: "p114", name: "Flour (Maida)", qty: 2 },
      { id: "p13", name: "Potatoes", qty: 3 },
      { id: "p75", name: "Peas", qty: 1 }
    ],
    instructions: [
      "Mix 2 cups flour with 2 tbsp oil and water; knead stiffly",
      "Boil 3 potatoes and mash with 1/2 cup peas and spices",
      "Roll dough into circles, cut in half, and fold into cones",
      "Stuff with 2 tbsp filling and seal edges with water",
      "Deep fry in hot oil for 8–10 min until golden"
    ]
  },
  {
    id: "s2",
    title: "BANANA FRY",
    category: "Snacks",
    time: "10 min",
    serves: 3,
    calories: "310 kcal",
    protein: "4g",
    fat: "12g",
    carbs: "48g",
    image: "https://images.unsplash.com/photo-1571771894821-ad9b5886479b?w=800&q=80",
    ingredients: [
      { id: "p115", name: "Ripe bananas (Nendran)", qty: 2 },
      { id: "p114", name: "Flour", qty: 1 },
      { id: "p57", name: "Sugar", qty: 1 }
    ],
    instructions: [
      "Make a batter with 1 cup flour, 1 tbsp sugar, and a pinch of turmeric",
      "Add water to reach a thick, coating consistency",
      "Slice 2 ripe bananas lengthwise into thin strips",
      "Dip slices into batter until fully coated",
      "Fry in hot oil for 3 min per side until crispy"
    ]
  },
  {
    id: "s3",
    title: "VADA",
    category: "Snacks",
    time: "20 min",
    serves: 4,
    calories: "240 kcal",
    protein: "8g",
    fat: "14g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    ingredients: [
      { id: "p88", name: "Urad dal", qty: 1 },
      { id: "p116", name: "Peppercorns", qty: 1 },
      { id: "p113", name: "Ginger", qty: 1 }
    ],
    instructions: [
      "Soak 1 cup urad dal for 3 hours; grind to a thick, fluffy paste",
      "Mix in 1 tsp pepper, chopped ginger, and salt",
      "Wet palms and take a small ball of batter",
      "Make a hole in the center and drop gently into hot oil",
      "Fry until deep golden brown and crunchy"
    ]
  },
  {
    id: "s4",
    title: "SHAWARMA",
    category: "Snacks",
    time: "20 min",
    serves: 1,
    calories: "450 kcal",
    protein: "28g",
    fat: "22g",
    carbs: "35g",
    image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800&q=80",
    ingredients: [
      { id: "p37", name: "Chicken strips", qty: 1 },
      { id: "p117", name: "Pita bread", qty: 1 },
      { id: "p118", name: "Mayonnaise", qty: 1 }
    ],
    instructions: [
      "Marinate 300g chicken in yogurt, lemon, and spices for 2 hours",
      "Pan-roast chicken until charred and shredded",
      "Spread 1 tbsp garlic mayo on a warm pita or wrap",
      "Add chicken, sliced onions, and pickled cucumbers",
      "Roll tightly and toast the wrap for 1 min on a pan"
    ]
  },
  // DESSERTS
  {
    id: "ds1",
    title: "PAYASAM",
    category: "Desserts",
    time: "20 min",
    serves: 4,
    calories: "320 kcal",
    protein: "6g",
    fat: "10g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80",
    ingredients: [
      { id: "p119", name: "Vermicelli", qty: 1 },
      { id: "p4", name: "Milk", qty: 4 },
      { id: "p57", name: "Sugar", qty: 1 }
    ],
    instructions: [
      "Roast 1/2 cup vermicelli in 1 tsp ghee until golden",
      "Boil 4 cups milk and add the roasted vermicelli",
      "Simmer for 10 min until soft; add 3/4 cup sugar",
      "Stir in 1/2 tsp cardamom powder",
      "Garnish with fried cashews and raisins"
    ]
  },
  {
    id: "ds2",
    title: "GULAB JAMUN",
    category: "Desserts",
    time: "30 min",
    serves: 5,
    calories: "420 kcal",
    protein: "8g",
    fat: "18g",
    carbs: "62g",
    image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80",
    ingredients: [
      { id: "p120", name: "Milk powder", qty: 1 },
      { id: "p114", name: "Flour", qty: 1 },
      { id: "p57", name: "Sugar", qty: 2 },
      { id: "p121", name: "Rose water", qty: 1 }
    ],
    instructions: [
      "Make a syrup with 2 cups sugar and 2 cups water; simmer for 5 min",
      "Knead 1 cup milk powder with 2 tbsp flour into a soft dough",
      "Form small, smooth balls (no cracks)",
      "Fry in low-heat oil until dark golden brown",
      "Soak in warm syrup for at least 2 hours"
    ]
  },
  {
    id: "ds3",
    title: "PUDDING",
    category: "Desserts",
    time: "35 min",
    serves: 4,
    calories: "280 kcal",
    protein: "10g",
    fat: "12g",
    carbs: "35g",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
    ingredients: [
      { id: "p37", name: "Eggs", qty: 3 },
      { id: "p4", name: "Milk", qty: 2 },
      { id: "p57", name: "Sugar", qty: 1 },
      { id: "p122", name: "Vanilla extract", qty: 1 }
    ],
    instructions: [
      "Melt 1/4 cup sugar in a pan until it turns golden caramel",
      "Pour caramel into a mold and let it set",
      "Whisk 3 eggs, 1.5 cups milk, and 1/2 cup sugar",
      "Pour mixture over the caramel; cover with foil",
      "Steam for 25 min until set; chill before serving"
    ]
  },
  {
    id: "ds4",
    title: "BROWNIES",
    category: "Desserts",
    time: "40 min",
    serves: 6,
    calories: "450 kcal",
    protein: "6g",
    fat: "25g",
    carbs: "52g",
    image: "https://images.unsplash.com/photo-1543208541-0961a29a8837?w=800&q=80",
    ingredients: [
      { id: "p46", name: "Dark chocolate", qty: 1 },
      { id: "p85", name: "Butter", qty: 1 },
      { id: "p37", name: "Eggs", qty: 2 },
      { id: "p123", name: "Cocoa powder", qty: 1 }
    ],
    instructions: [
      "Melt 150g chocolate and 1/2 cup butter together",
      "Whisk in 2 eggs and 3/4 cup sugar",
      "Fold in 1/2 cup flour and 1/4 cup cocoa powder",
      "Pour into a square tin and bake at 180°C for 20 min",
      "Let cool completely before cutting into squares"
    ]
  },
  {
    id: "ds5",
    title: "ICE CREAM",
    category: "Desserts",
    time: "15 min",
    serves: 4,
    calories: "380 kcal",
    protein: "6g",
    fat: "22g",
    carbs: "40g",
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&q=80",
    ingredients: [
      { id: "p40", name: "Heavy cream", qty: 1 },
      { id: "p124", name: "Condensed milk", qty: 1 },
      { id: "p122", name: "Vanilla extract", qty: 1 }
    ],
    instructions: [
      "Whip 2 cups cold heavy cream until stiff peaks form",
      "Gently fold in 1 can (400g) condensed milk",
      "Add 1 tbsp vanilla extract",
      "Pour into a container and seal tightly",
      "Freeze for 6–8 hours until firm"
    ]
  },
  // HEALTHY
  {
    id: "h1",
    title: "SPROUTS SALAD",
    category: "Healthy",
    time: "10 min",
    serves: 2,
    calories: "150 kcal",
    protein: "12g",
    fat: "2g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ingredients: [
      { id: "p125", name: "Moong sprouts", qty: 1 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p1", name: "Tomato", qty: 1 },
      { id: "p12", name: "Cucumber", qty: 1 }
    ],
    instructions: [
      "Steam 1 cup moong sprouts for 5 min (optional)",
      "Finely chop 1 onion, 1 tomato, and 1 cucumber",
      "Mix sprouts with veggies and 1/4 tsp black salt",
      "Squeeze 1/2 lemon over the mixture",
      "Garnish with fresh coriander and green chilies"
    ]
  },
  {
    id: "h2",
    title: "GRILLED FISH",
    category: "Healthy",
    time: "15 min",
    serves: 1,
    calories: "320 kcal",
    protein: "45g",
    fat: "14g",
    carbs: "2g",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
    ingredients: [
      { id: "p62", name: "Fish fillet", qty: 1 },
      { id: "p59", name: "Olive oil", qty: 1 },
      { id: "p113", name: "Garlic", qty: 1 }
    ],
    instructions: [
      "Marinate 200g fish with 1 tbsp lemon juice and garlic",
      "Sprinkle a pinch of salt and 1/2 tsp black pepper",
      "Heat 1 tbsp olive oil in a grill pan",
      "Sear fish for 4 min on each side",
      "Serve with a side of steamed asparagus or greens"
    ]
  },
  {
    id: "h3",
    title: "MILLET DISH",
    category: "Healthy",
    time: "15 min",
    serves: 2,
    calories: "280 kcal",
    protein: "8g",
    fat: "6g",
    carbs: "52g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [
      { id: "p126", name: "Foxtail/Barnyard millet", qty: 1 },
      { id: "p15", name: "Veggies", qty: 1 },
      { id: "p113", name: "Ginger", qty: 1 }
    ],
    instructions: [
      "Soak 1 cup millet for 30 min; drain well",
      "Sauté ginger and mixed veggies in 1 tsp oil",
      "Add 2 cups water and bring to a boil",
      "Add millet and cook on low heat for 10–12 min",
      "Fluff with a fork and serve warm"
    ]
  },
  {
    id: "h4",
    title: "DETOX DRINK",
    category: "Healthy",
    time: "5 min",
    serves: 4,
    calories: "10 kcal",
    protein: "0g",
    fat: "0g",
    carbs: "2g",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80",
    ingredients: [
      { id: "p12", name: "Cucumber", qty: 1 },
      { id: "p127", name: "Mint", qty: 1 },
      { id: "p113", name: "Ginger", qty: 1 }
    ],
    instructions: [
      "Slice 1/2 cucumber and 1 inch ginger thinly",
      "Add to a pitcher with 1 liter water",
      "Add 10 fresh mint leaves and lemon slices",
      "Refrigerate for 4 hours to infuse",
      "Drink throughout the day for hydration"
    ]
  },
  // DRINKS
  {
    id: "dr1",
    title: "COFFEE",
    category: "Drinks",
    time: "15 min",
    serves: 1,
    calories: "120 kcal",
    protein: "6g",
    fat: "5g",
    carbs: "15g",
    image: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=800&q=80",
    ingredients: [
      { id: "p128", name: "Coffee powder", qty: 1 },
      { id: "p4", name: "Milk", qty: 1 },
      { id: "p57", name: "Sugar", qty: 1 }
    ],
    instructions: [
      "Add 2 tbsp coffee powder to the top of a filter",
      "Pour 1/2 cup boiling water; let decoction drip for 15 min",
      "Boil 1 cup full-fat milk until frothy",
      "Mix 2 tbsp decoction with milk and 1 tsp sugar",
      "Pour between two cups to create a rich foam"
    ]
  },
  {
    id: "dr2",
    title: "BUTTERMILK",
    category: "Drinks",
    time: "5 min",
    serves: 2,
    calories: "60 kcal",
    protein: "4g",
    fat: "3g",
    carbs: "6g",
    image: "https://images.unsplash.com/photo-1571212247484-29005df5015e?w=800&q=80",
    ingredients: [
      { id: "p105", name: "Curd", qty: 1 },
      { id: "p113", name: "Ginger", qty: 1 }
    ],
    instructions: [
      "Whisk 1/2 cup curd with 1.5 cups cold water",
      "Crush 1 small ginger piece and 1 green chili",
      "Add crushed spices and salt to the liquid",
      "Stir in chopped curry leaves",
      "Serve chilled as a natural probiotic drink"
    ]
  },
  {
    id: "dr3",
    title: "FRESH JUICE",
    category: "Drinks",
    time: "5 min",
    serves: 1,
    calories: "90 kcal",
    protein: "1g",
    fat: "0g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
    ingredients: [
      { id: "p81", name: "Watermelon", qty: 2 },
      { id: "p127", name: "Mint", qty: 1 }
    ],
    instructions: [
      "Blend 2 cups chilled watermelon chunks (seedless)",
      "Add 3-4 mint leaves for freshness",
      "Add a pinch of black salt to enhance flavor",
      "Pulse for 30 seconds; do not over-blend",
      "Pour into a glass over 3 ice cubes"
    ]
  },
  {
    id: "dr4",
    title: "TENDER COCONUT DRINK",
    category: "Drinks",
    time: "5 min",
    serves: 1,
    calories: "150 kcal",
    protein: "2g",
    fat: "5g",
    carbs: "25g",
    image: "https://images.unsplash.com/photo-1550258114-189f39308311?w=800&q=80",
    ingredients: [
      { id: "p129", name: "Tender coconut water", qty: 1 },
      { id: "p96", name: "Honey", qty: 1 }
    ],
    instructions: [
      "Pour 1 cup coconut water into a glass",
      "Scoop out the soft coconut meat and chop finely",
      "Stir meat into the water with 1 tsp honey",
      "Add a squeeze of lime for a zesty twist",
      "Serve immediately while cold"
    ]
  },
  // INTERNATIONAL
  {
    id: "i1",
    title: "PIZZA",
    category: "International",
    time: "20 min",
    serves: 2,
    calories: "650 kcal",
    protein: "25g",
    fat: "28g",
    carbs: "75g",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
    ingredients: [
      { id: "p130", name: "Pizza dough", qty: 1 },
      { id: "p1", name: "Tomato sauce", qty: 1 },
      { id: "p131", name: "Mozzarella", qty: 1 },
      { id: "p111", name: "Oregano", qty: 1 }
    ],
    instructions: [
      "Roll 200g dough into a 10-inch circle",
      "Spread 3 tbsp tomato sauce evenly across the base",
      "Sprinkle 1 cup mozzarella cheese over the sauce",
      "Add your favorite toppings (veggies or meat)",
      "Bake at 220°C for 12–15 min until crust is golden"
    ]
  },
  {
    id: "i2",
    title: "PASTA",
    category: "International",
    time: "15 min",
    serves: 2,
    calories: "450 kcal",
    protein: "15g",
    fat: "12g",
    carbs: "68g",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80",
    ingredients: [
      { id: "p132", name: "Penne pasta", qty: 1 },
      { id: "p1", name: "Tomato puree", qty: 1 },
      { id: "p113", name: "Garlic", qty: 3 }
    ],
    instructions: [
      "Boil 2 cups pasta in salted water until 'al dente'",
      "Sauté 3 cloves minced garlic and 1 tsp chili flakes in oil",
      "Add 1 cup tomato puree and simmer for 5 min",
      "Toss the cooked pasta into the sauce",
      "Garnish with 1 tbsp parmesan cheese and basil"
    ]
  },
  {
    id: "i3",
    title: "TACOS",
    category: "International",
    time: "15 min",
    serves: 2,
    calories: "380 kcal",
    protein: "22g",
    fat: "18g",
    carbs: "32g",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
    ingredients: [
      { id: "p133", name: "Tortilla shells", qty: 1 },
      { id: "p37", name: "Ground meat", qty: 1 },
      { id: "p134", name: "Salsa", qty: 1 }
    ],
    instructions: [
      "Cook 250g filling with taco seasoning and onions",
      "Warm 3 tortilla shells on a dry pan",
      "Fill each shell with 2 tbsp meat and shredded lettuce",
      "Top with 1 tbsp salsa and a sprinkle of cheese",
      "Serve with a lime wedge on the side"
    ]
  },
  {
    id: "i4",
    title: "RAMEN",
    category: "International",
    time: "15 min",
    serves: 1,
    calories: "420 kcal",
    protein: "18g",
    fat: "14g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80",
    ingredients: [
      { id: "p135", name: "Ramen noodles", qty: 1 },
      { id: "p37", name: "Boiled egg", qty: 1 },
      { id: "p136", name: "Scallions", qty: 1 }
    ],
    instructions: [
      "Simmer 2 cups broth with 1 tbsp soy sauce and ginger",
      "Cook 1 serving of noodles separately and drain",
      "Place noodles in a bowl and pour hot broth over them",
      "Top with a soft-boiled egg (cut in half)",
      "Garnish with sliced scallions and seaweed"
    ]
  },
  // NON-VEG SPECIALS
  {
    id: "nv1",
    title: "MUTTON CURRY",
    category: "Non-Veg",
    time: "45 min",
    serves: 4,
    calories: "550 kcal",
    protein: "35g",
    fat: "38g",
    carbs: "15g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p63", name: "Mutton", qty: 1 },
      { id: "p14", name: "Onions", qty: 3 },
      { id: "p113", name: "Ginger-Garlic paste", qty: 2 }
    ],
    instructions: [
      "Sauté 3 sliced onions until deep brown",
      "Add 500g mutton and 2 tbsp G-G paste",
      "Add 1 tsp turmeric, 2 tsp chili powder, and 1 tsp salt",
      "Pressure cook with 1 cup water for 6–8 whistles",
      "Simmer uncovered for 10 min to thicken the gravy"
    ]
  },
  {
    id: "nv2",
    title: "PRAWN CURRY",
    category: "Non-Veg",
    time: "15 min",
    serves: 2,
    calories: "320 kcal",
    protein: "28g",
    fat: "22g",
    carbs: "8g",
    image: "https://images.unsplash.com/photo-1567121298481-63bc48b30f81?w=800&q=80",
    ingredients: [
      { id: "p64", name: "Prawns", qty: 1 },
      { id: "p41", name: "Coconut milk", qty: 1 },
      { id: "p103", name: "Tamarind", qty: 1 }
    ],
    instructions: [
      "Clean and devein 250g prawns",
      "Simmer 1 cup coconut milk with turmeric and chilies",
      "Add 1 tsp tamarind paste and salt to taste",
      "Drop prawns into the boiling liquid",
      "Cook for only 3–5 min until prawns turn pink/opaque"
    ]
  },
  {
    id: "nv3",
    title: "EGG ROAST",
    category: "Non-Veg",
    time: "15 min",
    serves: 2,
    calories: "280 kcal",
    protein: "14g",
    fat: "18g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1510627489930-0c1b0ba9448f?w=800&q=80",
    ingredients: [
      { id: "p37", name: "Boiled eggs", qty: 4 },
      { id: "p14", name: "Onions", qty: 2 },
      { id: "p1", name: "Tomato", qty: 1 }
    ],
    instructions: [
      "Hard-boil 4 eggs and peel them",
      "Sauté 2 large onions with curry leaves until soft",
      "Add 1 chopped tomato and 1 tsp garam masala",
      "Make small slits in the eggs and add to the masala",
      "Toss gently for 5 min until the eggs are well coated"
    ]
  },
  {
    id: "nv4",
    title: "CHICKEN WINGS",
    category: "Non-Veg",
    time: "25 min",
    serves: 2,
    calories: "450 kcal",
    protein: "32g",
    fat: "32g",
    carbs: "8g",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80",
    ingredients: [
      { id: "p37", name: "Chicken wings", qty: 1 },
      { id: "p114", name: "Flour", qty: 1 },
      { id: "p137", name: "Buffalo sauce", qty: 1 }
    ],
    instructions: [
      "Coat 10 wings in a mix of flour and garlic powder",
      "Bake at 200°C or deep fry until crispy (15–20 min)",
      "Toss hot wings in 3 tbsp sauce of your choice",
      "Ensure even coating while wings are still warm",
      "Serve with celery sticks and dip"
    ]
  },
  // VEG SPECIALS
  {
    id: "vs1",
    title: "PANEER TIKKA",
    category: "Veg",
    time: "20 min",
    serves: 3,
    calories: "280 kcal",
    protein: "18g",
    fat: "14g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1567184109411-42021662c161?w=800&q=80",
    ingredients: [
      { id: "p30", name: "Paneer", qty: 1 },
      { id: "p105", name: "Yogurt", qty: 1 },
      { id: "p138", name: "Besan (Gram flour)", qty: 1 }
    ],
    instructions: [
      "Mix 1/2 cup yogurt, 1 tbsp besan, and spices into a paste",
      "Marinate 200g paneer cubes and veggies for 30 min",
      "Thread paneer and peppers onto skewers",
      "Grill or pan-sear for 5–8 min until charred",
      "Sprinkle with 1/2 tsp chaat masala and lemon"
    ]
  },
  {
    id: "vs2",
    title: "ALOO GOBI",
    category: "Veg",
    time: "20 min",
    serves: 4,
    calories: "180 kcal",
    protein: "4g",
    fat: "8g",
    carbs: "24g",
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?w=800&q=80",
    ingredients: [
      { id: "p13", name: "Potatoes (Aloo)", qty: 2 },
      { id: "p139", name: "Cauliflower (Gobi)", qty: 1 },
      { id: "p113", name: "Ginger", qty: 1 }
    ],
    instructions: [
      "Sauté 1 tsp cumin and 1 tbsp ginger in oil",
      "Add 2 chopped potatoes and 1 head cauliflower florets",
      "Season with 1/2 tsp turmeric and 1 tsp salt",
      "Cover and cook on low heat for 15 min (no water needed)",
      "Garnish with fresh cilantro before serving"
    ]
  },
  {
    id: "vs3",
    title: "CHANA MASALA",
    category: "Veg",
    time: "20 min",
    serves: 4,
    calories: "220 kcal",
    protein: "12g",
    fat: "6g",
    carbs: "35g",
    image: "https://images.unsplash.com/photo-1585914966076-7649e3e78a2e?w=800&q=80",
    ingredients: [
      { id: "p140", name: "Chickpeas (Chana)", qty: 1 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p1", name: "Tomato", qty: 2 }
    ],
    instructions: [
      "Soak 1 cup chickpeas overnight and pressure cook until soft",
      "Sauté 1 large onion and 2 tomatoes into a soft paste",
      "Add 2 tsp chana masala powder and the cooked beans",
      "Simmer with 1/2 cup water for 10 min",
      "Mash a few chickpeas to thicken the gravy"
    ]
  },
  {
    id: "vs4",
    title: "RAJMA",
    category: "Veg",
    time: "25 min",
    serves: 4,
    calories: "240 kcal",
    protein: "14g",
    fat: "6g",
    carbs: "38g",
    image: "https://images.unsplash.com/photo-1585914966076-7649e3e78a2e?w=800&q=80",
    ingredients: [
      { id: "p141", name: "Kidney beans (Rajma)", qty: 1 },
      { id: "p113", name: "Ginger", qty: 1 },
      { id: "p84", name: "Ghee", qty: 1 }
    ],
    instructions: [
      "Soak 1 cup rajma for 8 hours and pressure cook well",
      "Sauté puree with ginger in 1 tbsp ghee until oil separates",
      "Add cooked beans and 1 tsp salt",
      "Simmer for 15 min on low heat until creamy",
      "Serve hot with steamed Basmati rice"
    ]
  },
  {
    id: "vs5",
    title: "VEG KURMA",
    category: "Veg",
    time: "15 min",
    serves: 4,
    calories: "210 kcal",
    protein: "5g",
    fat: "14g",
    carbs: "18g",
    image: "https://images.unsplash.com/photo-1567121298481-63bc48b30f81?w=800&q=80",
    ingredients: [
      { id: "p93", name: "Coconut", qty: 1 },
      { id: "p112", name: "Cashews", qty: 1 },
      { id: "p142", name: "Poppy seeds", qty: 1 }
    ],
    instructions: [
      "Grind 1/2 cup coconut and 5 cashews into a smooth paste",
      "Boil 2 cups mixed veggies (carrots, beans, peas)",
      "Sauté spices and add the coconut paste + veggies",
      "Simmer for 5 min until the sauce thickens",
      "Add a splash of water for desired consistency"
    ]
  },
  {
    id: "vs6",
    title: "MUSHROOM CURRY",
    category: "Veg",
    time: "15 min",
    serves: 2,
    calories: "180 kcal",
    protein: "6g",
    fat: "12g",
    carbs: "10g",
    image: "https://images.unsplash.com/photo-1567121298481-63bc48b30f81?w=800&q=80",
    ingredients: [
      { id: "p143", name: "Mushrooms", qty: 1 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p113", name: "Garlic", qty: 1 },
      { id: "p40", name: "Cream", qty: 1 }
    ],
    instructions: [
      "Sauté 250g sliced mushrooms until they release water",
      "Add 1 chopped onion and 1 tsp garlic paste",
      "Stir in 1/2 cup tomato puree and spices",
      "Cook for 8 min until mushrooms are tender",
      "Finish with 2 tbsp heavy cream for a rich texture"
    ]
  },
  {
    id: "vs7",
    title: "BHINDI FRY",
    category: "Veg",
    time: "15 min",
    serves: 2,
    calories: "160 kcal",
    protein: "4g",
    fat: "10g",
    carbs: "14g",
    image: "https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?w=800&q=80",
    ingredients: [
      { id: "p144", name: "Okra (Bhindi)", qty: 1 },
      { id: "p145", name: "Amchur", qty: 1 }
    ],
    instructions: [
      "Wash and dry 250g okra completely; slice into rounds",
      "Heat 2 tbsp oil and sauté okra on medium-high",
      "Add 1/2 tsp turmeric and 1 tsp salt",
      "Fry for 10 min without a lid to avoid sliminess",
      "Toss with 1/2 tsp amchur powder for tanginess"
    ]
  }
];

export default function Recipes() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToCart = useAddToCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    return ALL_RECIPES.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAddToCart = async (recipe: Recipe) => {
    setAdding(recipe.id + "-cart");
    try {
      for (const ing of recipe.ingredients) {
        await addToCart.mutateAsync({ productId: ing.id, qty: ing.qty });
      }
      toast.success(`Ingredients for "${recipe.title}" added to cart! 🛒`);
    } catch {
      toast.error("Failed to add ingredients.");
    } finally {
      setAdding(null);
    }
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    const today = new Date();
    const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    
    const newPlan = {
      id: Date.now().toString(),
      recipeId: recipe.id,
      plannedDate: dateStr,
      recipeDetails: recipe
    };

    const existing = JSON.parse(localStorage.getItem("nexgro_meal_plans") || "[]");
    localStorage.setItem("nexgro_meal_plans", JSON.stringify([...existing, newPlan]));
    qc.invalidateQueries({ queryKey: ["meal-plans"] });
    toast.success(`"${recipe.title}" added to your Meal Plan for today! 📅`);
    navigate({ to: "/meal-planner" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-[#007000] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ChefHat className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10">
          <button onClick={() => navigate({ to: "/home" })} className="p-2 bg-white/20 rounded-xl mb-4 hover:bg-white/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-4xl font-black italic tracking-tight">Chef's Corner</h1>
          <p className="text-white/80 text-sm mt-2 max-w-xs font-medium">Curated recipes for your healthy lifestyle. Add ingredients directly to your cart.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search healthy recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border-2 border-transparent pl-14 pr-6 py-5 rounded-[2rem] text-sm font-bold shadow-xl focus:border-primary/20 outline-none transition-all"
          />
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">{recipe.category}</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-xl text-foreground leading-tight tracking-tight">{recipe.title}</h3>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-black text-orange-700">{recipe.calories}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#007000]" />
                    <span className="text-xs font-bold">{recipe.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#007000]" />
                    <span className="text-xs font-bold">Serves {recipe.serves}</span>
                  </div>
                </div>

                {/* Macro Preview */}
                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="bg-muted/50 p-2 rounded-xl text-center">
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Prot</p>
                    <p className="text-xs font-black text-foreground">{recipe.protein}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-xl text-center">
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Fat</p>
                    <p className="text-xs font-black text-foreground">{recipe.fat}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-xl text-center">
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Carbs</p>
                    <p className="text-xs font-black text-foreground">{recipe.carbs}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAddToCart(recipe)}
                    disabled={adding === recipe.id + "-cart"}
                    className="flex-1 bg-[#007000] text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#007000]/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {adding === recipe.id + "-cart" ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Add Ingredients
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleAddToMealPlan(recipe)}
                    className="w-12 h-12 bg-white border-2 border-border text-foreground rounded-2xl flex items-center justify-center hover:border-[#007000] hover:text-[#007000] active:scale-95 transition-all"
                    title="Add to Meal Plan"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
