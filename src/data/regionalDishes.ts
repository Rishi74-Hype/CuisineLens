export interface MacroNutrients {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
  fiber: number;   // grams
  sodium: number;  // mg
}

export interface PortionOption {
  label: 'Small' | 'Medium' | 'Large';
  grams: number;
  multiplier: number;
  macros: MacroNutrients;
  description: string;
}

export interface RegionalDish {
  id: string;
  name: string;
  nativeName?: string;
  cuisine: 'South Asian' | 'Mexican' | 'East Asian' | 'Mediterranean' | 'Southeast Asian';
  regionOrStyle: string;
  mealCategory: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  description: string;
  commonIngredients: string[];
  cookingFat: string;
  nutritionalInsight: string;
  sampleImage?: string;
  defaultPortion: 'Small' | 'Medium' | 'Large';
  portions: {
    Small: PortionOption;
    Medium: PortionOption;
    Large: PortionOption;
  };
  commonModifiers: {
    name: string;
    calorieDelta: number;
    description: string;
  }[];
}

export const REGIONAL_DISHES: RegionalDish[] = [
  // SOUTH ASIAN / INDIAN
  {
    id: 'in-biryani-chicken',
    name: 'Chicken Dum Biryani with Raita',
    nativeName: 'دَم بریانی / दम बिरयानी',
    cuisine: 'South Asian',
    regionOrStyle: 'Hyderabadi / Mughlai',
    mealCategory: 'Lunch',
    description: 'Slow-cooked spiced basmati rice layered with marinated chicken, saffron, fried shallots (birista), and whole spices, served with cucumber raita.',
    commonIngredients: ['Aged Basmati Rice', 'Chicken Thighs', 'Desi Ghee', 'Yogurt', 'Fried Onions', 'Saffron', 'Whole Garam Masala'],
    cookingFat: 'Clarified Ghee & Fried Oil',
    nutritionalInsight: 'Dense in lean-to-moderate protein from marinated chicken. Ghee and fried shallots provide flavor depth; watch portion size of basmati rice for carb targets.',
    sampleImage: '/src/assets/images/regional_biryani_platter_1792609756511.jpg',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 250,
        multiplier: 0.7,
        macros: { calories: 450, protein: 24, carbs: 54, fat: 15, fiber: 2.5, sodium: 620 },
        description: '1 standard bowl, 1 piece chicken + small raita',
      },
      Medium: {
        label: 'Medium',
        grams: 380,
        multiplier: 1.0,
        macros: { calories: 640, protein: 34, carbs: 76, fat: 22, fiber: 3.5, sodium: 880 },
        description: 'Full restaurant clay handi / plate, 2 pieces chicken + raita cup',
      },
      Large: {
        label: 'Large',
        grams: 520,
        multiplier: 1.35,
        macros: { calories: 870, protein: 46, carbs: 104, fat: 30, fiber: 5.0, sodium: 1190 },
        description: 'Feast portion with boiled egg, extra gravy & raita',
      },
    },
    commonModifiers: [
      { name: 'Extra Desi Ghee', calorieDelta: 115, description: '+1 tbsp ghee drizzled on top' },
      { name: 'Double Chicken / Less Rice', calorieDelta: -40, description: 'Higher protein, 30% fewer carbs' },
      { name: 'With Boiled Egg', calorieDelta: 78, description: '+1 hard-boiled egg' },
      { name: 'Extra Cucumber Raita', calorieDelta: 55, description: 'Cooling yogurt dip' },
    ],
  },
  {
    id: 'in-butter-chicken',
    name: 'Murgh Makhani (Butter Chicken) with Naan',
    nativeName: 'बटर चिकन नान',
    cuisine: 'South Asian',
    regionOrStyle: 'Punjabi / Delhi',
    mealCategory: 'Dinner',
    description: 'Charred tandoori chicken simmered in a silky tomato, cashew, butter, and fenugreek gravy, paired with 1 butter naan.',
    commonIngredients: ['Tandoori Chicken', 'Fresh Butter', 'Cashew Paste', 'Heavy Cream', 'Kasuri Methi', 'Maida Naan'],
    cookingFat: 'White Butter & Dairy Cream',
    nutritionalInsight: 'High protein from tandoor chicken, but velvety cashew-cream gravy adds significant saturated fats. Pair with tandoori roti for a leaner profile.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 260,
        multiplier: 0.75,
        macros: { calories: 510, protein: 29, carbs: 42, fat: 25, fiber: 3.0, sodium: 710 },
        description: 'Half cup curry + 1 small plain roti/naan',
      },
      Medium: {
        label: 'Medium',
        grams: 370,
        multiplier: 1.0,
        macros: { calories: 730, protein: 39, carbs: 58, fat: 38, fiber: 4.2, sodium: 980 },
        description: 'Full bowl butter chicken + 1 large butter naan',
      },
      Large: {
        label: 'Large',
        grams: 500,
        multiplier: 1.35,
        macros: { calories: 980, protein: 52, carbs: 78, fat: 52, fiber: 5.5, sodium: 1320 },
        description: 'Generous dinner serving with 2 butter naans',
      },
    },
    commonModifiers: [
      { name: 'Swap Naan to Tandoori Roti', calorieDelta: -110, description: 'Whole wheat, unbuttered' },
      { name: 'Extra Cream/Makhani Drizzle', calorieDelta: 95, description: '+20g cream reduction' },
      { name: 'Extra Chicken Pieces', calorieDelta: 140, description: '+80g tandoori chicken breast' },
    ],
  },
  {
    id: 'in-masala-dosa',
    name: 'Mysore Masala Dosa with Sambar & Chutneys',
    nativeName: 'ಮೈಸೂರು ಮಸಾಲ ದೋಸೆ',
    cuisine: 'South Asian',
    regionOrStyle: 'South Indian / Karnataka',
    mealCategory: 'Breakfast',
    description: 'Crisp fermented rice-and-lentil crepe smeared with spicy red chili-garlic paste, stuffed with spiced potato masala, served with lentil sambar and fresh coconut chutney.',
    commonIngredients: ['Fermented Rice-Urad Dal Batter', 'Boiled Potatoes', 'Mustard Seeds', 'Red Chili Paste', 'Coconut Chutney', 'Pigeon Pea Sambar'],
    cookingFat: 'Ghee / Peanut Oil on Griddle',
    nutritionalInsight: 'Fermented batter promotes gut microbiome health. Lentil sambar adds fiber and plant protein. Coconut chutney is calorically dense from medium-chain fats.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 220,
        multiplier: 0.75,
        macros: { calories: 340, protein: 8, carbs: 52, fat: 12, fiber: 4.5, sodium: 580 },
        description: '1 compact paper dosa with half potato filling',
      },
      Medium: {
        label: 'Medium',
        grams: 320,
        multiplier: 1.0,
        macros: { calories: 470, protein: 12, carbs: 71, fat: 16, fiber: 6.2, sodium: 790 },
        description: '1 standard golden Mysore dosa + bowl of sambar + 2 chutneys',
      },
      Large: {
        label: 'Large',
        grams: 440,
        multiplier: 1.35,
        macros: { calories: 630, protein: 16, carbs: 96, fat: 22, fiber: 8.5, sodium: 1040 },
        description: 'Large ghee roast dosa with extra potato filling and double chutney',
      },
    },
    commonModifiers: [
      { name: 'Ghee Roast Finish', calorieDelta: 85, description: '+1 tbsp desi ghee crisping' },
      { name: 'Skip Coconut Chutney', calorieDelta: -90, description: 'Use only tomato/sambar' },
      { name: 'Extra Sambar', calorieDelta: 45, description: '+Lentil vegetable broth' },
    ],
  },
  {
    id: 'in-paneer-tikka',
    name: 'Paneer Tikka with Mint Chutney',
    nativeName: 'पनीर टिक्का',
    cuisine: 'South Asian',
    regionOrStyle: 'North Indian',
    mealCategory: 'Snack',
    description: 'Cubes of fresh Indian cottage cheese marinated in spiced hung yogurt, turmeric, ajwain and grilled in tandoor with bell peppers and red onions.',
    commonIngredients: ['Cottage Cheese (Paneer)', 'Hung Curd', 'Gram Flour (Besan)', 'Bell Peppers', 'Onions', 'Chaat Masala', 'Mint Coriander Chutney'],
    cookingFat: 'Mustard Oil / Ghee Brush',
    nutritionalInsight: 'Excellent vegetarian protein and calcium source. Moderate in fat due to whole milk paneer. Very low net carbs.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 180,
        multiplier: 0.75,
        macros: { calories: 310, protein: 18, carbs: 10, fat: 22, fiber: 2.0, sodium: 490 },
        description: '4 tandoor skewers (appetizer)',
      },
      Medium: {
        label: 'Medium',
        grams: 260,
        multiplier: 1.0,
        macros: { calories: 430, protein: 26, carbs: 14, fat: 31, fiber: 3.0, sodium: 680 },
        description: '6 large skewers with charred peppers & mint chutney',
      },
      Large: {
        label: 'Large',
        grams: 360,
        multiplier: 1.35,
        macros: { calories: 580, protein: 36, carbs: 19, fat: 42, fiber: 4.0, sodium: 910 },
        description: '8 skewers meal platter with pickled onions',
      },
    },
    commonModifiers: [
      { name: 'Low-Fat Tofu Swap', calorieDelta: -140, description: 'Subbed paneer for firm tofu' },
      { name: 'Add Roti Wrap', calorieDelta: 120, description: 'Rolled into a kathi roll' },
    ],
  },
  {
    id: 'in-dal-tadka-roti',
    name: 'Dal Tadka with Phulka Rotis',
    nativeName: 'दाल तड़का फुल्का',
    cuisine: 'South Asian',
    regionOrStyle: 'Home-style North Indian',
    mealCategory: 'Lunch',
    description: 'Yellow toor dal tempered with cumin, garlic, dried red chilies, and ghee, served with 2 puffed whole wheat phulkas.',
    commonIngredients: ['Toor Dal', 'Cumin Seeds', 'Garlic', 'Tomatoes', 'Whole Wheat Atta', 'Ghee'],
    cookingFat: 'Desi Ghee Tempered',
    nutritionalInsight: 'Classic balanced home-cooked meal. High complex carbohydrates and dietary fiber with moderate plant protein.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 240,
        multiplier: 0.75,
        macros: { calories: 320, protein: 13, carbs: 52, fat: 7, fiber: 7.0, sodium: 520 },
        description: '1 bowl dal + 1 phulka',
      },
      Medium: {
        label: 'Medium',
        grams: 340,
        multiplier: 1.0,
        macros: { calories: 440, protein: 18, carbs: 72, fat: 10, fiber: 9.5, sodium: 690 },
        description: 'Hearty bowl dal + 2 soft phulkas with light ghee',
      },
      Large: {
        label: 'Large',
        grams: 480,
        multiplier: 1.4,
        macros: { calories: 610, protein: 25, carbs: 100, fat: 14, fiber: 13.0, sodium: 950 },
        description: 'Big bowl dal + 3 phulkas + kachumber salad',
      },
    },
    commonModifiers: [
      { name: 'Extra Double Tadka', calorieDelta: 70, description: 'Extra ghee & fried garlic' },
      { name: 'Without Ghee on Roti', calorieDelta: -50, description: 'Dry unbuttered rotis' },
    ],
  },

  // MEXICAN & LATIN AMERICAN
  {
    id: 'mx-tacos-pastor',
    name: 'Tacos al Pastor (Street Style)',
    nativeName: 'Tacos al Pastor',
    cuisine: 'Mexican',
    regionOrStyle: 'Mexico City (CDMX)',
    mealCategory: 'Lunch',
    description: 'Thinly shaved pork marinated in achiote paste, guajillo chiles, and citrus, roasted on a trompo spit, served on warm corn tortillas with roasted pineapple, cilantro, and diced onion.',
    commonIngredients: ['Pork Shoulder', 'Achiote Paste', 'Guajillo Chiles', 'Fresh Pineapple', 'Corn Tortillas', 'White Onion', 'Cilantro', 'Salsa Verde'],
    cookingFat: 'Natural Pork Fat & Griddle Oil',
    nutritionalInsight: 'Corn tortillas provide unrefined whole-grain carbs and dietary calcium via nixtamalization. Pork is seasoned with capsicum-rich chile spices and digestive bromelain from pineapple.',
    sampleImage: '/src/assets/images/regional_tacos_pastor_1792609756799.jpg',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 180,
        multiplier: 0.67,
        macros: { calories: 340, protein: 21, carbs: 32, fat: 14, fiber: 4.0, sodium: 590 },
        description: '2 street tacos on small corn tortillas',
      },
      Medium: {
        label: 'Medium',
        grams: 270,
        multiplier: 1.0,
        macros: { calories: 510, protein: 32, carbs: 48, fat: 21, fiber: 6.0, sodium: 880 },
        description: '3 standard street tacos with grilled pineapple & salsa',
      },
      Large: {
        label: 'Large',
        grams: 390,
        multiplier: 1.45,
        macros: { calories: 740, protein: 46, carbs: 69, fat: 31, fiber: 8.5, sodium: 1280 },
        description: '4-5 street tacos with side of frijoles charros',
      },
    },
    commonModifiers: [
      { name: 'Add Fresh Guacamole', calorieDelta: 90, description: '+2 tbsp fresh avocado mash' },
      { name: 'Double Tortilla (Con Copia)', calorieDelta: 105, description: 'Stacked double corn tortillas' },
      { name: 'Add Melted Oaxaca Cheese (Gringa)', calorieDelta: 130, description: 'Flour tortilla with melted quesillo' },
    ],
  },
  {
    id: 'mx-chiles-rellenos',
    name: 'Chile Relleno with Arroz Rojo',
    nativeName: 'Chile Relleno de Queso',
    cuisine: 'Mexican',
    regionOrStyle: 'Puebla / Central Mexico',
    mealCategory: 'Dinner',
    description: 'Roasted poblano pepper stuffed with melted Oaxaca cheese, dipped in fluffy egg batter, pan-fried, and simmered in a seasoned tomato-caldo sauce with Mexican red rice.',
    commonIngredients: ['Poblano Pepper', 'Queso Oaxaca', 'Whipped Eggs', 'Tomato Puree', 'Mexican Rice', 'Mexican Oregano'],
    cookingFat: 'Vegetable / Corn Oil for Frying',
    nutritionalInsight: 'Poblano chiles are exceptionally rich in vitamins A and C. The airy egg batter absorbs frying oil, raising the fat count.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 240,
        multiplier: 0.75,
        macros: { calories: 420, protein: 18, carbs: 34, fat: 24, fiber: 4.0, sodium: 670 },
        description: '1 small stuffed chile + half cup rice',
      },
      Medium: {
        label: 'Medium',
        grams: 340,
        multiplier: 1.0,
        macros: { calories: 590, protein: 25, carbs: 48, fat: 34, fiber: 5.5, sodium: 920 },
        description: '1 standard stuffed chile with caldillo & full side rice',
      },
      Large: {
        label: 'Large',
        grams: 480,
        multiplier: 1.4,
        macros: { calories: 820, protein: 35, carbs: 68, fat: 47, fiber: 7.5, sodium: 1280 },
        description: '2 chiles rellenos plate with refried black beans',
      },
    },
    commonModifiers: [
      { name: 'Sin Capear (Unbattered/Grilled)', calorieDelta: -160, description: 'Roasted pepper without fried egg batter' },
      { name: 'Add Refried Beans', calorieDelta: 110, description: 'Side of pinto/black beans' },
    ],
  },
  {
    id: 'mx-pozole-rojo',
    name: 'Pozole Rojo with Shredded Pork & Tostadas',
    nativeName: 'Pozole Rojo de Puerco',
    cuisine: 'Mexican',
    regionOrStyle: 'Jalisco / Guerrero',
    mealCategory: 'Dinner',
    description: 'Ancestral hearty hominy corn stew simmered with tender shredded pork and a rich broth of ancho and guajillo chiles, garnished with shredded cabbage, radishes, and lime.',
    commonIngredients: ['Nixtamalized Hominy (Maíz Pozolero)', 'Pork Shoulder', 'Guajillo & Ancho Chiles', 'Mexican Oregano', 'Shredded Cabbage', 'Radishes', 'Baked Tostadas'],
    cookingFat: 'Rendered Pork Broth',
    nutritionalInsight: 'Wholesome ancestral dish rich in collagen protein, dietary fiber from hominy, and antioxidants from dried chiles. Garnishing with abundant cabbage adds micronutrients without calories.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 350,
        multiplier: 0.75,
        macros: { calories: 360, protein: 24, carbs: 38, fat: 12, fiber: 5.0, sodium: 790 },
        description: '1 small bowl with radish & cabbage garnishes',
      },
      Medium: {
        label: 'Medium',
        grams: 480,
        multiplier: 1.0,
        macros: { calories: 490, protein: 34, carbs: 52, fat: 16, fiber: 7.0, sodium: 1040 },
        description: 'Full dinner bowl + 2 baked corn tostadas',
      },
      Large: {
        label: 'Large',
        grams: 650,
        multiplier: 1.35,
        macros: { calories: 680, protein: 46, carbs: 72, fat: 23, fiber: 9.5, sodium: 1420 },
        description: 'Large fiesta bowl with extra pork shank & 3 tostadas',
      },
    },
    commonModifiers: [
      { name: 'Lean Chicken Breast Swap', calorieDelta: -80, description: 'Shredded chicken instead of pork' },
      { name: 'Extra Fried Tostadas with Crema', calorieDelta: 140, description: '+2 crisp tostadas with cream' },
    ],
  },

  // EAST ASIAN (JAPANESE & KOREAN)
  {
    id: 'ea-tonkotsu-ramen',
    name: 'Tonkotsu Ramen with Chashu & Ajitama',
    nativeName: '豚骨ラーメン',
    cuisine: 'East Asian',
    regionOrStyle: 'Fukuoka / Hakata, Japan',
    mealCategory: 'Dinner',
    description: 'Rich 16-hour pork bone broth served with springy wheat noodles, braised chashu pork belly, marinated soft-boiled ajitsuke tamago egg, wood ear mushroom, and scallions.',
    commonIngredients: ['Pork Bone Broth', 'Ramen Wheat Noodles', 'Rolled Chashu Pork Belly', 'Ajitsuke Tamago (Marinated Egg)', 'Kikurage Mushrooms', 'Scallions', 'Mayu (Black Garlic Oil)'],
    cookingFat: 'Rendered Pork Bone Emulsion & Lard',
    nutritionalInsight: 'Heavy in collagen and umami peptides from long bone extraction. Noticeable sodium from shoyu tare; chashu belly is high in saturated fat.',
    sampleImage: '/src/assets/images/regional_tonkotsu_ramen_1792609757733.jpg',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 420,
        multiplier: 0.75,
        macros: { calories: 530, protein: 26, carbs: 58, fat: 21, fiber: 2.5, sodium: 1450 },
        description: 'Half bowl portion, 1 chashu slice, half egg',
      },
      Medium: {
        label: 'Medium',
        grams: 580,
        multiplier: 1.0,
        macros: { calories: 740, protein: 36, carbs: 79, fat: 31, fiber: 3.5, sodium: 1980 },
        description: 'Standard artisan ramen bowl with 2 chashu slices & full egg',
      },
      Large: {
        label: 'Large',
        grams: 750,
        multiplier: 1.35,
        macros: { calories: 990, protein: 49, carbs: 108, fat: 42, fiber: 5.0, sodium: 2650 },
        description: 'Kaedama (extra noodle refill) + double chashu slices',
      },
    },
    commonModifiers: [
      { name: 'Do Not Drink Remaining Broth', calorieDelta: -150, description: 'Saves ~600mg sodium and broth fats' },
      { name: 'Lean Chicken Chashu Swap', calorieDelta: -90, description: 'Lean breast instead of belly' },
      { name: 'Extra Ajitama (Ramen Egg)', calorieDelta: 85, description: '+1 marinated soft egg' },
    ],
  },
  {
    id: 'ea-korean-bibimbap',
    name: 'Dolsot Bibimbap with Gochujang & Egg',
    nativeName: '돌솥 비빔밥',
    cuisine: 'East Asian',
    regionOrStyle: 'Jeonju, Korea',
    mealCategory: 'Lunch',
    description: 'Hot sizzling stone pot filled with steamed rice, seasoned sautéed vegetables (namul: spinach, bean sprouts, carrots, shiitake, fernbrake), minced beef, fried sunny egg, and toasted sesame oil.',
    commonIngredients: ['Short Grain White Rice', 'Sesame Oil', 'Gochujang', 'Sautéed Spinach', 'Gosari (Fern)', 'Lean Beef Strips', 'Fried Egg', 'Toasted Nori'],
    cookingFat: 'Pure Toasted Sesame Oil',
    nutritionalInsight: 'Nutritional gold standard for variety: delivers 6 distinct vegetables providing polyphenols and vitamins, paired with clean protein and healthy unsaturated fats from sesame oil.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 280,
        multiplier: 0.75,
        macros: { calories: 410, protein: 18, carbs: 62, fat: 10, fiber: 5.0, sodium: 640 },
        description: '1 compact bowl, light rice portion',
      },
      Medium: {
        label: 'Medium',
        grams: 390,
        multiplier: 1.0,
        macros: { calories: 570, protein: 26, carbs: 84, fat: 15, fiber: 7.2, sodium: 880 },
        description: 'Full hot sizzling dolsot bowl with fried egg & gochujang',
      },
      Large: {
        label: 'Large',
        grams: 530,
        multiplier: 1.35,
        macros: { calories: 770, protein: 36, carbs: 114, fat: 20, fiber: 9.5, sodium: 1190 },
        description: 'Generous stone bowl with extra beef and crispy nurungji rice crust',
      },
    },
    commonModifiers: [
      { name: 'Sub Brown / Multigrain Rice', calorieDelta: -20, description: 'Adds 3g fiber and lowers glycemic index' },
      { name: 'Extra Gochujang Sauce', calorieDelta: 45, description: 'Sweet fermented chili paste' },
      { name: 'Tofu Instead of Beef', calorieDelta: -50, description: '100% vegetarian bowl' },
    ],
  },
  {
    id: 'ea-salmon-teriyaki-bento',
    name: 'Salmon Teriyaki Bento with Tamagoyaki',
    nativeName: '鮭の照り焼き弁当',
    cuisine: 'East Asian',
    regionOrStyle: 'Tokyo, Japan',
    mealCategory: 'Lunch',
    description: 'Pan-seared Atlantic salmon glazed with mirin and soy teriyaki, accompanied by Japanese steamed rice, rolled sweet tamagoyaki omelet, and salted edamame.',
    commonIngredients: ['Salmon Fillet', 'Mirin & Soy Glaze', 'Japanese Steamed Rice', 'Tamagoyaki Egg', 'Edamame', 'Pickled Ginger'],
    cookingFat: 'Light Rice Bran Oil & Natural Omega-3 Fish Oil',
    nutritionalInsight: 'Exceptional cardiovascular profile: over 2,200mg of EPA/DHA Omega-3 fatty acids, high bioavailability protein, and clean carbohydrates.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 250,
        multiplier: 0.75,
        macros: { calories: 390, protein: 26, carbs: 44, fat: 12, fiber: 2.0, sodium: 620 },
        description: '100g salmon cut + 1 scoop rice + pickles',
      },
      Medium: {
        label: 'Medium',
        grams: 350,
        multiplier: 1.0,
        macros: { calories: 540, protein: 36, carbs: 62, fat: 16, fiber: 3.5, sodium: 860 },
        description: '150g glazed salmon + full rice scoop + tamagoyaki & edamame',
      },
      Large: {
        label: 'Large',
        grams: 470,
        multiplier: 1.35,
        macros: { calories: 730, protein: 49, carbs: 84, fat: 22, fiber: 4.5, sodium: 1150 },
        description: 'Double salmon portion with extra rice',
      },
    },
    commonModifiers: [
      { name: 'Light Glaze (Low Sugar)', calorieDelta: -45, description: 'Half mirin/sugar in sauce' },
      { name: 'Extra Steamed Edamame', calorieDelta: 60, description: '+4g fiber and 6g plant protein' },
    ],
  },

  // SOUTHEAST ASIAN (VIETNAMESE & THAI)
  {
    id: 'sea-pho-dac-biet',
    name: 'Pho Bo Dac Biet (Special Beef Pho)',
    nativeName: 'Phở Bò Đặc Biệt',
    cuisine: 'Southeast Asian',
    regionOrStyle: 'Hanoi / Saigon, Vietnam',
    mealCategory: 'Lunch',
    description: 'Aromatic 12-hour bone broth infused with charred ginger, cinnamon, and star anise, poured over flat rice noodles and cuts of rare beef flank, brisket, and beef tendon, with fresh herbs.',
    commonIngredients: ['Beef Bone Broth', 'Charred Star Anise & Ginger', 'Rice Banh Pho Noodles', 'Rare Eye-of-Round Beef', 'Brisket', 'Thai Basil', 'Mung Bean Sprouts', 'Lime'],
    cookingFat: 'Clear Skimmed Beef Broth',
    nutritionalInsight: 'Naturally lean and hydrating broth rich in gelatin and anti-inflammatory spices (ginger, star anise). Low in saturated fat when clear broth is requested.',
    sampleImage: '/src/assets/images/regional_pho_dac_biet_1792609757829.jpg',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 450,
        multiplier: 0.75,
        macros: { calories: 370, protein: 28, carbs: 51, fat: 6, fiber: 2.0, sodium: 1220 },
        description: '1 small bowl with rare beef slices',
      },
      Medium: {
        label: 'Medium',
        grams: 620,
        multiplier: 1.0,
        macros: { calories: 510, protein: 38, carbs: 70, fat: 9, fiber: 3.5, sodium: 1680 },
        description: 'Standard hearty noodle bowl with full herb platter & beef assortment',
      },
      Large: {
        label: 'Large',
        grams: 820,
        multiplier: 1.35,
        macros: { calories: 690, protein: 52, carbs: 95, fat: 13, fiber: 4.5, sodium: 2240 },
        description: 'Extra large bowl with extra brisket & beef meatballs',
      },
    },
    commonModifiers: [
      { name: 'Low Sodium (Drink Half Broth)', calorieDelta: -40, description: 'Saves ~750mg sodium' },
      { name: 'Extra Bean Sprouts / Less Noodles', calorieDelta: -90, description: 'Cuts carbs by 25g, boosts crunch' },
      { name: 'Extra Rare Beef Slices', calorieDelta: 95, description: '+18g lean protein' },
    ],
  },
  {
    id: 'sea-pad-thai-shrimp',
    name: 'Pad Thai Goong (Stir-Fried Rice Noodles)',
    nativeName: 'ผัดไทยกุ้งสด',
    cuisine: 'Southeast Asian',
    regionOrStyle: 'Bangkok, Thailand',
    mealCategory: 'Dinner',
    description: 'Wok-tossed rice stick noodles with wild tiger shrimp, pressed yellow tofu, eggs, dried shrimp, tamarind paste, palm sugar, fish sauce, crushed roasted peanuts, and garlic chives.',
    commonIngredients: ['Rice Noodles', 'Tiger Prawns', 'Firm Pressed Tofu', 'Eggs', 'Tamarind Paste', 'Palm Sugar', 'Crushed Peanuts', 'Beansprouts'],
    cookingFat: 'Shallot Oil in Carbon Wok',
    nutritionalInsight: 'Delicious balance of sweet, sour, salty, and umami. Crushed peanuts add healthy fats and vitamin E; palm sugar contributes to fast-absorbing carbohydrates.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 240,
        multiplier: 0.75,
        macros: { calories: 430, protein: 22, carbs: 54, fat: 15, fiber: 3.0, sodium: 880 },
        description: '1 compact plate, 3 prawns',
      },
      Medium: {
        label: 'Medium',
        grams: 340,
        multiplier: 1.0,
        macros: { calories: 590, protein: 30, carbs: 74, fat: 21, fiber: 4.5, sodium: 1190 },
        description: 'Full street-stall plate, 5 prawns, tofu, egg, peanut garnish',
      },
      Large: {
        label: 'Large',
        grams: 460,
        multiplier: 1.35,
        macros: { calories: 810, protein: 41, carbs: 101, fat: 29, fiber: 6.0, sodium: 1610 },
        description: 'Restaurant large plate with extra prawns and double egg',
      },
    },
    commonModifiers: [
      { name: 'Hold the Crushed Peanuts', calorieDelta: -85, description: 'Saves 8g fat if allergy/caloric deficit' },
      { name: 'Extra Tofu & Shrimp', calorieDelta: 80, description: '+12g protein boost' },
    ],
  },

  // MEDITERRANEAN & LEVANTINE
  {
    id: 'med-shawarma-plate',
    name: 'Chicken Shawarma Plate with Hummus & Tabbouleh',
    nativeName: 'صحن شاورما دجاج',
    cuisine: 'Mediterranean',
    regionOrStyle: 'Levantine / Beirut',
    mealCategory: 'Lunch',
    description: 'Spiced spit-roasted chicken shavings seasoned with cardamom, sumac, and cumin, served with silky chickpea hummus, fresh parsley-bulgur tabbouleh, toum garlic cream, and warm pita.',
    commonIngredients: ['Chicken Thighs', 'Chickpeas & Tahini (Hummus)', 'Flat Leaf Parsley (Tabbouleh)', 'Bulgur Wheat', 'Toum (Garlic Emulsion)', 'Extra Virgin Olive Oil', 'Warm Pita'],
    cookingFat: 'Extra Virgin Olive Oil & Garlic Toum',
    nutritionalInsight: 'Rich in heart-protective monounsaturated oleic acid from EVOO and tahini sesame seeds. Parsley tabbouleh delivers huge doses of vitamins K and C.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 280,
        multiplier: 0.75,
        macros: { calories: 440, protein: 32, carbs: 36, fat: 19, fiber: 5.5, sodium: 680 },
        description: '1 light plate with half pita bread',
      },
      Medium: {
        label: 'Medium',
        grams: 380,
        multiplier: 1.0,
        macros: { calories: 620, protein: 44, carbs: 51, fat: 27, fiber: 7.8, sodium: 940 },
        description: 'Standard mezze platter: chicken, 2 scoops hummus, tabbouleh, 1 pita',
      },
      Large: {
        label: 'Large',
        grams: 520,
        multiplier: 1.35,
        macros: { calories: 840, protein: 60, carbs: 69, fat: 37, fiber: 10.5, sodium: 1290 },
        description: 'Feast plate with extra chicken, double toum, 2 pitas',
      },
    },
    commonModifiers: [
      { name: 'Skip Pita Bread', calorieDelta: -160, description: 'Lowers carbs by 32g' },
      { name: 'Extra Toum Garlic Cream', calorieDelta: 90, description: '+1 scoop garlic emulsion' },
      { name: 'Extra Tabbouleh Herb Salad', calorieDelta: 45, description: '+Fresh greens & olive oil' },
    ],
  },
  {
    id: 'med-shakshuka',
    name: 'North African Shakshuka with Feta & Crusty Bread',
    nativeName: 'شكشوكة',
    cuisine: 'Mediterranean',
    regionOrStyle: 'Tunisian / Levantine',
    mealCategory: 'Breakfast',
    description: 'Poached eggs gently simmered in a simmering skillet sauce of crushed tomatoes, sweet bell peppers, onions, harissa chili paste, cumin, and crumbled sheep feta cheese, served with crusty sourdough bread.',
    commonIngredients: ['Pasture Eggs', 'Roma Tomatoes', 'Red Bell Peppers', 'Harissa', 'Sheep Milk Feta', 'Extra Virgin Olive Oil', 'Crusty Sourdough'],
    cookingFat: 'Extra Virgin Olive Oil',
    nutritionalInsight: 'High choline and lutein from egg yolks, powerful lycopene from cooked tomatoes, and bioavailable calcium from authentic sheep feta.',
    defaultPortion: 'Medium',
    portions: {
      Small: {
        label: 'Small',
        grams: 250,
        multiplier: 0.75,
        macros: { calories: 340, protein: 16, carbs: 28, fat: 18, fiber: 4.0, sodium: 610 },
        description: '1 egg skillet + 1 slice artisan bread',
      },
      Medium: {
        label: 'Medium',
        grams: 360,
        multiplier: 1.0,
        macros: { calories: 480, protein: 23, carbs: 40, fat: 26, fiber: 5.5, sodium: 830 },
        description: '2 egg cast iron skillet + 2 slices crusty bread with feta',
      },
      Large: {
        label: 'Large',
        grams: 490,
        multiplier: 1.35,
        macros: { calories: 650, protein: 32, carbs: 54, fat: 35, fiber: 7.0, sodium: 1120 },
        description: '3 egg family skillet with extra feta & toasted baguette',
      },
    },
    commonModifiers: [
      { name: 'Add Merguez Lamb Sausage', calorieDelta: 140, description: '+1 grilled spiced lamb link' },
      { name: 'Extra Sheep Milk Feta', calorieDelta: 75, description: '+25g crumbled feta' },
    ],
  },
];

export function findDishByKeywords(query: string): RegionalDish | undefined {
  const q = query.toLowerCase();
  return REGIONAL_DISHES.find(d => 
    d.name.toLowerCase().includes(q) || 
    d.regionOrStyle.toLowerCase().includes(q) ||
    d.commonIngredients.some(i => i.toLowerCase().includes(q))
  );
}
