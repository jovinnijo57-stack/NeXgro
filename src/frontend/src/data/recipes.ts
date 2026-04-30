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
    id: "sp1",
    title: "DAL TADKA",
    category: "Indian Favorites",
    time: "25 min",
    serves: 4,
    calories: "180 kcal",
    protein: "9g",
    fat: "8g",
    carbs: "24g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p15", name: "Toor dal", qty: 1 },
      { id: "p16", name: "Garlic", qty: 4 },
      { id: "p17", name: "Dried red chilies", qty: 2 },
      { id: "p18", name: "Cumin", qty: 1 },
      { id: "p19", name: "Ghee", qty: 2 }
    ],
    instructions: [
      "Pressure cook 1 cup toor dal with 3 cups water and turmeric",
      "Heat 2 tbsp ghee in a small pan",
      "Add 1 tsp cumin, 4 cloves garlic, and 2 red chilies",
      "Fry until garlic turns golden brown",
      "Pour the hot tempering over the cooked dal and mix"
    ]
  },
  {
    id: "sp2",
    title: "ALOO PARATHA",
    category: "Indian Favorites",
    time: "30 min",
    serves: 2,
    calories: "320 kcal",
    protein: "6g",
    fat: "12g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80",
    ingredients: [
      { id: "p20", name: "Wheat flour", qty: 2 },
      { id: "p21", name: "Boiled potatoes", qty: 2 },
      { id: "p22", name: "Green chili", qty: 1 },
      { id: "p23", name: "Amchur", qty: 0.5 },
      { id: "p24", name: "Butter", qty: 1 }
    ],
    instructions: [
      "Mash 2 boiled potatoes with chili, salt, and 1/2 tsp amchur",
      "Roll a ball of wheat dough into a small circle",
      "Place 2 tbsp potato filling in the center and seal",
      "Roll out gently into a 7-inch flatbread",
      "Cook on a griddle with 1 tsp butter until golden spots appear"
    ]
  },
  {
    id: "sp3",
    title: "PAV BHAJI",
    category: "Street Food",
    time: "40 min",
    serves: 3,
    calories: "450 kcal",
    protein: "10g",
    fat: "22g",
    carbs: "58g",
    image: "https://images.unsplash.com/photo-1626132646529-500637532537?w=800&q=80",
    ingredients: [
      { id: "p15", name: "Mixed vegetables", qty: 1.5 },
      { id: "p25", name: "Pav (Bread rolls)", qty: 4 },
      { id: "p24", name: "Butter", qty: 2 },
      { id: "p26", name: "Pav bhaji masala", qty: 2 }
    ],
    instructions: [
      "Boil and mash 2 potatoes, 1/2 cup peas, and 1/2 cup cauliflower",
      "Sauté 1 onion and 1 tomato with 2 tbsp pav bhaji masala",
      "Mix the mashed veggies with the masala and 1/2 cup water",
      "Simmer with a large cube of butter for 10 min",
      "Toast pav rolls with butter and serve with the bhaji"
    ]
  },
  {
    id: "sp4",
    title: "BHEL PURI",
    category: "Street Food",
    time: "10 min",
    serves: 2,
    calories: "180 kcal",
    protein: "4g",
    fat: "6g",
    carbs: "32g",
    image: "https://images.unsplash.com/photo-1567121298481-63bc48b30f81?w=800&q=80",
    ingredients: [
      { id: "p27", name: "Puffed rice", qty: 2 },
      { id: "p28", name: "Sev", qty: 0.25 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p1", name: "Tomato", qty: 1 },
      { id: "p29", name: "Tamarind chutney", qty: 2 }
    ],
    instructions: [
      "Mix 2 cups puffed rice with 1/4 cup sev",
      "Add 1 chopped onion and 1 chopped tomato",
      "Stir in 2 tbsp tamarind chutney and a pinch of salt",
      "Toss quickly so the puffed rice stays crunchy",
      "Garnish with fresh coriander and serve immediately"
    ]
  },
  {
    id: "sp5",
    title: "GAJAR HALWA",
    category: "Desserts",
    time: "45 min",
    serves: 4,
    calories: "320 kcal",
    protein: "4g",
    fat: "18g",
    carbs: "42g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p30", name: "Grated carrots", qty: 2 },
      { id: "p4", name: "Milk", qty: 2 },
      { id: "p31", name: "Sugar", qty: 0.5 },
      { id: "p19", name: "Ghee", qty: 2 },
      { id: "p32", name: "Cardamom", qty: 0.5 }
    ],
    instructions: [
      "Sauté 2 cups grated carrots in 2 tbsp ghee for 5 min",
      "Add 2 cups milk and cook until the milk evaporates",
      "Stir in 1/2 cup sugar and cook until thick",
      "Add 1/2 tsp cardamom powder",
      "Garnish with chopped almonds and cashews"
    ]
  },
  {
    id: "sp6",
    title: "MANGO PUDDING",
    category: "Desserts",
    time: "20 min",
    serves: 4,
    calories: "210 kcal",
    protein: "3g",
    fat: "6g",
    carbs: "38g",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
    ingredients: [
      { id: "p33", name: "Mango pulp", qty: 1 },
      { id: "p4", name: "Milk", qty: 1 },
      { id: "p31", name: "Sugar", qty: 2 },
      { id: "p34", name: "Gelatin/Agar-agar", qty: 1 }
    ],
    instructions: [
      "Dissolve 1 tsp agar-agar in 1/4 cup warm water",
      "Mix 1 cup mango pulp, 1 cup milk, and 2 tbsp sugar",
      "Heat the mixture gently (do not boil)",
      "Stir in the dissolved agar-agar",
      "Pour into molds and refrigerate for 4 hours until set"
    ]
  },
  {
    id: "sp7",
    title: "MANGO LASSI",
    category: "Drinks",
    time: "5 min",
    serves: 1,
    calories: "190 kcal",
    protein: "5g",
    fat: "4g",
    carbs: "35g",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
    ingredients: [
      { id: "p5", name: "Curd", qty: 1 },
      { id: "p33", name: "Mango pulp", qty: 0.5 },
      { id: "p31", name: "Sugar", qty: 2 },
      { id: "p32", name: "Cardamom", qty: 0.1 }
    ],
    instructions: [
      "Add 1 cup thick curd and 1/2 cup mango pulp to a blender",
      "Add 2 tbsp sugar and a pinch of cardamom",
      "Blend for 30 seconds until smooth and frothy",
      "Pour into a tall glass",
      "Serve chilled with a garnish of saffron strands"
    ]
  },
  {
    id: "sp8",
    title: "VIRGIN MOJITO",
    category: "Drinks",
    time: "5 min",
    serves: 1,
    calories: "80 kcal",
    protein: "0g",
    fat: "0g",
    carbs: "20g",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80",
    ingredients: [
      { id: "p35", name: "Lemon", qty: 1 },
      { id: "p36", name: "Mint leaves", qty: 6 },
      { id: "p31", name: "Sugar", qty: 1 },
      { id: "p37", name: "Club soda", qty: 1 },
      { id: "p38", name: "Ice", qty: 1 }
    ],
    instructions: [
      "Muddle 6 mint leaves and 2 lemon wedges in a glass",
      "Add 1 tbsp sugar or simple syrup",
      "Fill the glass with ice cubes",
      "Top up with chilled club soda",
      "Stir gently and garnish with a fresh mint sprig"
    ]
  },
  {
    id: "sp9",
    title: "BUTTER CHICKEN",
    category: "Main Course",
    time: "45 min",
    serves: 4,
    calories: "480 kcal",
    protein: "35g",
    fat: "32g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1603894584115-f73f2ec801ad?w=800&q=80",
    ingredients: [
      { id: "p61", name: "Chicken", qty: 500 },
      { id: "p39", name: "Tomato puree", qty: 1 },
      { id: "p24", name: "Butter", qty: 3 },
      { id: "p40", name: "Heavy cream", qty: 0.5 },
      { id: "p41", name: "Kasuri methi", qty: 1 }
    ],
    instructions: [
      "Marinate 500g chicken in yogurt and spices; grill until cooked",
      "Sauté 1 cup tomato puree in 3 tbsp butter until thickened",
      "Add 1 tsp sugar, salt, and 1 tsp garam masala",
      "Toss in the grilled chicken and 1/2 cup heavy cream",
      "Simmer for 5 min and garnish with 1 tsp crushed kasuri methi"
    ]
  },
  {
    id: "sp10",
    title: "VEG PULAV",
    category: "Main Course",
    time: "40 min",
    serves: 4,
    calories: "280 kcal",
    protein: "6g",
    fat: "10g",
    carbs: "48g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p42", name: "Basmati rice", qty: 1 },
      { id: "p15", name: "Mixed veggies", qty: 1 },
      { id: "p43", name: "Whole spices", qty: 1 },
      { id: "p19", name: "Ghee", qty: 2 },
      { id: "p14", name: "Onion", qty: 1 }
    ],
    instructions: [
      "Soak 1 cup Basmati rice for 20 min",
      "Sauté 1 cinnamon stick, 2 cloves, and 1 sliced onion in ghee",
      "Add 1 cup mixed vegetables and sauté for 2 min",
      "Add rice and 2 cups water; bring to a boil",
      "Cover and cook on low heat for 12 min until water is absorbed"
    ]
  },
  {
    id: "sp11",
    title: "MOMOS (Veg)",
    category: "Snacks",
    time: "35 min",
    serves: 2,
    calories: "220 kcal",
    protein: "5g",
    fat: "4g",
    carbs: "42g",
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&q=80",
    ingredients: [
      { id: "p44", name: "Maida (Flour)", qty: 1 },
      { id: "p45", name: "Cabbage", qty: 1 },
      { id: "p46", name: "Carrot", qty: 0.5 },
      { id: "p47", name: "Ginger", qty: 1 },
      { id: "p48", name: "Soy sauce", qty: 1 }
    ],
    instructions: [
      "Knead 1 cup maida with water into a soft, firm dough",
      "Sauté 1 cup grated cabbage and 1/2 cup carrot with ginger",
      "Add 1 tsp soy sauce and salt to the veggie mix",
      "Roll dough into thin circles, fill with 1 tbsp mixture, and pleat",
      "Steam in a greased steamer for 10–12 min"
    ]
  },
  {
    id: "sp12",
    title: "ALOO TIKKI",
    category: "Snacks",
    time: "25 min",
    serves: 2,
    calories: "260 kcal",
    protein: "4g",
    fat: "14g",
    carbs: "32g",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80",
    ingredients: [
      { id: "p21", name: "Boiled potatoes", qty: 3 },
      { id: "p49", name: "Cornflour", qty: 2 },
      { id: "p22", name: "Green chilies", qty: 2 },
      { id: "p50", name: "Cilantro", qty: 1 },
      { id: "p51", name: "Oil", qty: 2 }
    ],
    instructions: [
      "Mash 3 boiled potatoes with 2 tbsp cornflour",
      "Mix in chopped chilies, salt, and cilantro",
      "Shape into small, flat round patties",
      "Heat 2 tbsp oil in a shallow pan",
      "Fry patties on medium heat until both sides are dark golden brown"
    ]
  },
  {
    id: "sp13",
    title: "SPAGHETTI CARBONARA",
    category: "Global Favorites",
    time: "20 min",
    serves: 2,
    calories: "520 kcal",
    protein: "18g",
    fat: "28g",
    carbs: "52g",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
    ingredients: [
      { id: "p52", name: "Spaghetti", qty: 200 },
      { id: "p53", name: "Eggs", qty: 2 },
      { id: "p54", name: "Parmesan cheese", qty: 0.5 },
      { id: "p16", name: "Garlic", qty: 2 },
      { id: "p55", name: "Black pepper", qty: 1 }
    ],
    instructions: [
      "Boil 200g spaghetti in salted water; reserve 1/4 cup pasta water",
      "Whisk 2 eggs with 1/2 cup grated parmesan",
      "Sauté 2 cloves garlic in oil; remove garlic once browned",
      "Toss hot pasta in the oil, then remove from heat",
      "Quickly stir in egg mixture and pasta water to create a creamy sauce"
    ]
  },
  {
    id: "sp14",
    title: "FALAFEL",
    category: "Global Favorites",
    time: "40 min",
    serves: 4,
    calories: "340 kcal",
    protein: "12g",
    fat: "18g",
    carbs: "38g",
    image: "https://images.unsplash.com/photo-1593001874117-c99c87076650?w=800&q=80",
    ingredients: [
      { id: "p56", name: "Chickpeas (Soaked)", qty: 1 },
      { id: "p57", name: "Parsley", qty: 1 },
      { id: "p16", name: "Garlic", qty: 2 },
      { id: "p18", name: "Cumin", qty: 1 },
      { id: "p20", name: "Flour", qty: 2 }
    ],
    instructions: [
      "Blend 1 cup soaked chickpeas (not boiled) with parsley and garlic",
      "Mix in 1 tsp cumin and 2 tbsp flour to bind",
      "Shape into small balls or discs",
      "Deep fry in hot oil for 4–5 min until dark brown",
      "Serve inside pita bread with tahini or hummus"
    ]
  },
  {
    id: "sp15",
    title: "STRAWBERRY MILKSHAKE",
    category: "Cold Beverages",
    time: "10 min",
    serves: 1,
    calories: "280 kcal",
    protein: "6g",
    fat: "12g",
    carbs: "38g",
    image: "https://images.unsplash.com/photo-1543644906-4447339736c4?w=800&q=80",
    ingredients: [
      { id: "p58", name: "Fresh strawberries", qty: 1 },
      { id: "p4", name: "Chilled milk", qty: 1.5 },
      { id: "p31", name: "Sugar", qty: 2 },
      { id: "p59", name: "Vanilla ice cream", qty: 1 }
    ],
    instructions: [
      "Clean and hull 1 cup strawberries",
      "Blend berries with 2 tbsp sugar into a smooth puree",
      "Add 1.5 cups milk and 1 scoop vanilla ice cream",
      "Blend again until frothy and thick",
      "Pour into a glass and garnish with a strawberry slice"
    ]
  },
  {
    id: "sp16",
    title: "ICED TEA",
    category: "Cold Beverages",
    time: "10 min",
    serves: 1,
    calories: "60 kcal",
    protein: "0g",
    fat: "0g",
    carbs: "15g",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
    ingredients: [
      { id: "p60", name: "Tea bags", qty: 2 },
      { id: "p61", name: "Water", qty: 1 },
      { id: "p35", name: "Lemon", qty: 1 },
      { id: "p62", name: "Honey", qty: 1 },
      { id: "p38", name: "Ice cubes", qty: 1 }
    ],
    instructions: [
      "Brew 2 tea bags in 1 cup boiling water for 5 min",
      "Remove tea bags and stir in 1 tbsp honey",
      "Let the tea cool to room temperature",
      "Fill a tall glass with ice cubes and lemon slices",
      "Pour the tea over ice and top with a splash of cold water"
    ]
  },
  {
    id: "sp17",
    title: "LENTIL SOUP",
    category: "Soups & Sides",
    time: "20 min",
    serves: 2,
    calories: "160 kcal",
    protein: "10g",
    fat: "4g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    ingredients: [
      { id: "p63", name: "Moong dal", qty: 1 },
      { id: "p47", name: "Ginger", qty: 1 },
      { id: "p16", name: "Garlic", qty: 1 },
      { id: "p64", name: "Turmeric", qty: 1 },
      { id: "p35", name: "Lemon", qty: 1 }
    ],
    instructions: [
      "Boil 1 cup moong dal with 4 cups water and turmeric until mushy",
      "Sauté 1 tsp ginger-garlic paste in a little butter or oil",
      "Mix the dal into the sautéed paste and whisk until smooth",
      "Simmer for 5 min and add 1 tsp salt",
      "Serve hot with a squeeze of lemon juice"
    ]
  },
  {
    id: "sp18",
    title: "JEERA ALOO",
    category: "Soups & Sides",
    time: "15 min",
    serves: 3,
    calories: "220 kcal",
    protein: "3g",
    fat: "14g",
    carbs: "24g",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80",
    ingredients: [
      { id: "p21", name: "Boiled potatoes", qty: 3 },
      { id: "p18", name: "Cumin seeds (Jeera)", qty: 1.5 },
      { id: "p64", name: "Turmeric", qty: 0.5 },
      { id: "p22", name: "Green chili", qty: 2 },
      { id: "p51", name: "Oil", qty: 2 }
    ],
    instructions: [
      "Cube 3 boiled potatoes into bite-sized pieces",
      "Heat 2 tbsp oil and add 1.5 tsp cumin seeds until they sizzle",
      "Add chopped green chilies and the potato cubes",
      "Sprinkle 1/2 tsp turmeric and 1 tsp salt",
      "Toss on high heat for 5 min until the potatoes are crispy"
    ]
  },
  {
    id: "sp19",
    title: "GARLIC BREAD",
    category: "Snacks",
    time: "10 min",
    serves: 2,
    calories: "320 kcal",
    protein: "8g",
    fat: "18g",
    carbs: "34g",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&q=80",
    ingredients: [
      { id: "p65", name: "Baguette or Sliced bread", qty: 4 },
      { id: "p24", name: "Butter", qty: 2 },
      { id: "p16", name: "Garlic", qty: 3 },
      { id: "p66", name: "Oregano", qty: 1 },
      { id: "p54", name: "Cheese", qty: 2 }
    ],
    instructions: [
      "Mix 2 tbsp softened butter with 3 cloves minced garlic",
      "Spread the garlic butter generously over 4 slices of bread",
      "Sprinkle a pinch of oregano and 2 tbsp grated cheese",
      "Bake at 200°C for 5–7 min until edges are golden",
      "Serve warm as a side or a snack"
    ]
  },
  {
    id: "sp20",
    title: "CHICKEN NUGGETS",
    category: "Snacks",
    time: "20 min",
    serves: 2,
    calories: "420 kcal",
    protein: "24g",
    fat: "22g",
    carbs: "28g",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80",
    ingredients: [
      { id: "p67", name: "Chicken breast", qty: 250 },
      { id: "p28", name: "Breadcrumbs", qty: 0.5 },
      { id: "p53", name: "Egg", qty: 1 },
      { id: "p20", name: "Flour", qty: 0.25 },
      { id: "p68", name: "Spices", qty: 1 }
    ],
    instructions: [
      "Cut 250g chicken into small cubes; season with salt and pepper",
      "Coat chicken in 1/4 cup flour, then dip into a beaten egg",
      "Press firmly into 1/2 cup breadcrumbs until fully coated",
      "Deep fry in hot oil for 6–8 min until crunchy",
      "Serve with 2 tbsp tomato ketchup"
    ]
  },
  {
    id: "sp21",
    title: "CARAMEL POPCORN",
    category: "Desserts",
    time: "15 min",
    serves: 4,
    calories: "280 kcal",
    protein: "2g",
    fat: "14g",
    carbs: "42g",
    image: "https://images.unsplash.com/photo-1578465271202-de77058aa36a?w=800&q=80",
    ingredients: [
      { id: "p69", name: "Popped corn", qty: 4 },
      { id: "p31", name: "Sugar", qty: 0.5 },
      { id: "p24", name: "Butter", qty: 1 },
      { id: "p70", name: "Salt", qty: 0.1 }
    ],
    instructions: [
      "Melt 1/2 cup sugar in a pan until it turns into a brown liquid",
      "Quickly stir in 1 tbsp butter and a pinch of salt",
      "Pour the caramel over 4 cups of popped popcorn",
      "Toss immediately with a spatula to coat every piece",
      "Spread on a tray to cool and harden for 10 min"
    ]
  },
  {
    id: "sp22",
    title: "SWEET PANCAKES",
    category: "Desserts",
    time: "15 min",
    serves: 2,
    calories: "340 kcal",
    protein: "6g",
    fat: "12g",
    carbs: "52g",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
    ingredients: [
      { id: "p20", name: "Flour", qty: 1 },
      { id: "p4", name: "Milk", qty: 1.5 },
      { id: "p53", name: "Egg", qty: 1 },
      { id: "p31", name: "Sugar", qty: 1 },
      { id: "p71", name: "Nutella or Fruit", qty: 1 }
    ],
    instructions: [
      "Whisk 1 cup flour, 1.5 cups milk, and 1 egg into a thin batter",
      "Pour a thin layer onto a hot, buttered pan",
      "Cook for 1 min per side until light brown",
      "Spread 1 tbsp Nutella or add sliced strawberries inside",
      "Roll or fold the pancake and serve"
    ]
  },
  {
    id: "sp23",
    title: "PINEAPPLE JUICE",
    category: "Drinks",
    time: "10 min",
    serves: 2,
    calories: "120 kcal",
    protein: "1g",
    fat: "0g",
    carbs: "32g",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80",
    ingredients: [
      { id: "p72", name: "Fresh pineapple", qty: 1 },
      { id: "p73", name: "Black salt", qty: 0.1 },
      { id: "p31", name: "Sugar", qty: 2 },
      { id: "p38", name: "Ice cubes", qty: 4 }
    ],
    instructions: [
      "Peel and core 1 medium pineapple; cut into chunks",
      "Blend with 1/2 cup water and 2 tbsp sugar",
      "Strain the juice through a fine sieve to remove pulp",
      "Add a pinch of black salt for a tangy kick",
      "Pour into a glass over 4 ice cubes"
    ]
  },
  {
    id: "sp24",
    title: "HONEY LEMON GINGER TEA",
    category: "Drinks",
    time: "10 min",
    serves: 1,
    calories: "60 kcal",
    protein: "0g",
    fat: "0g",
    carbs: "16g",
    image: "https://images.unsplash.com/photo-1544787210-22bb6709d823?w=800&q=80",
    ingredients: [
      { id: "p47", name: "Fresh ginger", qty: 1 },
      { id: "p35", name: "Lemon juice", qty: 1 },
      { id: "p62", name: "Honey", qty: 1 },
      { id: "p61", name: "Water", qty: 2 }
    ],
    instructions: [
      "Boil 2 cups water with 1 inch crushed ginger for 5 min",
      "Strain the tea into a cup",
      "Stir in 1 tbsp honey until dissolved",
      "Add 1 tbsp lemon juice",
      "Drink warm for a soothing, healthy boost"
    ]
  },
  {
    id: "sp25",
    title: "KADHI PAKORA",
    category: "Indian Favorites",
    time: "40 min",
    serves: 4,
    calories: "380 kcal",
    protein: "12g",
    fat: "22g",
    carbs: "38g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p5", name: "Curd (Yogurt)", qty: 1 },
      { id: "p49", name: "Besan (Gram flour)", qty: 0.75 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p64", name: "Turmeric", qty: 1 },
      { id: "p47", name: "Ginger", qty: 1 }
    ],
    instructions: [
      "Mix 1 cup curd with 2 tbsp besan and 3 cups water; whisk well",
      "Make a thick paste with 1/2 cup besan, spices, and sliced onions; deep fry as small balls (pakoras)",
      "Boil the curd mixture with turmeric and ginger for 15 min on low heat",
      "Add the fried pakoras to the simmering gravy",
      "Temper with cumin, dried red chilies, and curry leaves in 1 tbsp ghee"
    ]
  },
  {
    id: "sp26",
    title: "BAINGAN BHARTA",
    category: "Indian Favorites",
    time: "35 min",
    serves: 3,
    calories: "240 kcal",
    protein: "4g",
    fat: "16g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p74", name: "Large Eggplant (Baingan)", qty: 1 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p1", name: "Tomato", qty: 2 },
      { id: "p16", name: "Garlic", qty: 2 },
      { id: "p22", name: "Green chili", qty: 1 }
    ],
    instructions: [
      "Roast 1 large eggplant over an open flame until the skin is charred and the inside is soft",
      "Peel the skin and mash the pulp thoroughly",
      "Sauté 1 chopped onion and 2 cloves garlic in oil until golden",
      "Add 2 chopped tomatoes and spices; cook until soft",
      "Mix in the mashed eggplant and cook for 5 min on medium heat"
    ]
  },
  {
    id: "sp27",
    title: "HUMMUS",
    category: "Global Favorites",
    time: "15 min",
    serves: 4,
    calories: "180 kcal",
    protein: "6g",
    fat: "12g",
    carbs: "14g",
    image: "https://images.unsplash.com/photo-1577906030559-60497f5d4bcc?w=800&q=80",
    ingredients: [
      { id: "p56", name: "Boiled chickpeas", qty: 2 },
      { id: "p75", name: "Tahini", qty: 0.25 },
      { id: "p16", name: "Garlic", qty: 2 },
      { id: "p35", name: "Lemon juice", qty: 2 },
      { id: "p51", name: "Olive oil", qty: 3 }
    ],
    instructions: [
      "Blend 2 cups boiled chickpeas with 1/4 cup tahini and 2 cloves garlic",
      "Add 2 tbsp lemon juice and a pinch of salt",
      "Slowly pour in 3 tbsp olive oil while blending until creamy",
      "If too thick, add 1 tbsp warm water to reach the desired consistency",
      "Serve in a bowl topped with a drizzle of olive oil and paprika"
    ]
  },
  {
    id: "sp28",
    title: "GREEK SALAD",
    category: "Global Favorites",
    time: "15 min",
    serves: 2,
    calories: "220 kcal",
    protein: "8g",
    fat: "16g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
    ingredients: [
      { id: "p76", name: "Cucumber", qty: 1 },
      { id: "p1", name: "Tomato", qty: 2 },
      { id: "p54", name: "Feta cheese", qty: 50 },
      { id: "p77", name: "Black olives", qty: 0.25 },
      { id: "p66", name: "Oregano", qty: 1 }
    ],
    instructions: [
      "Chop 1 cucumber and 2 tomatoes into large chunks",
      "Mix in 1/4 cup sliced black olives and 1/2 sliced red onion",
      "Top with 50g cubed feta cheese",
      "Drizzle with 2 tbsp olive oil and 1 tsp vinegar",
      "Sprinkle 1/2 tsp dried oregano over the top and toss gently"
    ]
  },
  {
    id: "sp29",
    title: "VEG MANCHURIAN",
    category: "Snacks",
    time: "40 min",
    serves: 3,
    calories: "320 kcal",
    protein: "6g",
    fat: "18g",
    carbs: "38g",
    image: "https://images.unsplash.com/photo-1512058560366-cd2429bb5c5c?w=800&q=80",
    ingredients: [
      { id: "p45", name: "Cabbage", qty: 1 },
      { id: "p46", name: "Carrot", qty: 0.5 },
      { id: "p49", name: "Cornflour", qty: 3 },
      { id: "p48", name: "Soy sauce", qty: 2 },
      { id: "p78", name: "Ginger-garlic paste", qty: 1 }
    ],
    instructions: [
      "Mix 1 cup grated cabbage and 1/2 cup carrot with 3 tbsp cornflour and spices",
      "Form into small balls and deep fry until crispy; set aside",
      "Sauté ginger, garlic, and green chilies in a pan with 1 tbsp oil",
      "Add 2 tbsp soy sauce, 1 tbsp ketchup, and a little water",
      "Toss the fried balls into the sauce and cook for 2 min until coated"
    ]
  },
  {
    id: "sp30",
    title: "CHILI PANEER",
    category: "Snacks",
    time: "30 min",
    serves: 2,
    calories: "420 kcal",
    protein: "18g",
    fat: "32g",
    carbs: "18g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [
      { id: "p79", name: "Paneer", qty: 200 },
      { id: "p80", name: "Bell peppers", qty: 1 },
      { id: "p14", name: "Onion", qty: 1 },
      { id: "p48", name: "Soy sauce", qty: 1 },
      { id: "p81", name: "Green chili sauce", qty: 1 }
    ],
    instructions: [
      "Coat 200g paneer cubes in cornflour and shallow fry until golden",
      "Sauté 1 cubed onion and 1 cubed bell pepper on high heat for 2 min",
      "Add 1 tbsp soy sauce and 1 tbsp chili sauce",
      "Stir in the fried paneer cubes",
      "Garnish with chopped spring onion greens"
    ]
  },
  {
    id: "sp31",
    title: "CHIKOO SHAKE",
    category: "Drinks",
    time: "10 min",
    serves: 1,
    calories: "240 kcal",
    protein: "4g",
    fat: "6g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1543644906-4447339736c4?w=800&q=80",
    ingredients: [
      { id: "p82", name: "Sapodilla (Chikoo)", qty: 3 },
      { id: "p4", name: "Milk", qty: 1.5 },
      { id: "p31", name: "Sugar", qty: 1 },
      { id: "p38", name: "Ice cubes", qty: 3 }
    ],
    instructions: [
      "Peel and deseed 3 ripe chikoos",
      "Blend the fruit with 1.5 cups chilled milk and 1 tbsp sugar",
      "Add 3 ice cubes for a thicker, colder consistency",
      "Blend for 45 seconds until smooth",
      "Pour into a glass and serve immediately"
    ]
  },
  {
    id: "sp32",
    title: "FRUIT CUSTARD",
    category: "Desserts",
    time: "30 min",
    serves: 4,
    calories: "280 kcal",
    protein: "6g",
    fat: "8g",
    carbs: "48g",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
    ingredients: [
      { id: "p4", name: "Milk", qty: 2 },
      { id: "p83", name: "Custard powder", qty: 2 },
      { id: "p31", name: "Sugar", qty: 3 },
      { id: "p84", name: "Mixed fruits", qty: 1 }
    ],
    instructions: [
      "Boil 2 cups milk with 3 tbsp sugar",
      "Dissolve 2 tbsp custard powder in 1/4 cup cold milk; stir into the boiling milk",
      "Cook until the mixture thickens; then cool to room temperature",
      "Chop mixed fruits and add them to the cooled custard",
      "Refrigerate for 2 hours and serve chilled"
    ]
  }
];

export const ALL_RECIPES = INITIAL_RECIPES;
