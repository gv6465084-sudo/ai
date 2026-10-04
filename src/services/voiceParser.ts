export interface ParsedFoodDonation {
  foodName: string;
  foodCategory: 'Cooked Meal' | 'Bakery' | 'Packed Food' | 'Raw Produce' | 'Dairy & Desserts' | 'Other';
  foodType: 'Vegetarian' | 'Non-Veg' | 'Vegan' | 'Egg';
  quantity: string;
  portions: number;
  storageCondition: 'Room Temperature' | 'Refrigerated' | 'Hot Holding' | 'Frozen';
  storageTemperature: string;
  packagingStatus: 'Packed' | 'Bulk Containers' | 'Individually Sealed' | 'Open Tray';
  preparedTime: string;
  ingredients: string;
  additionalNotes: string;
}

/**
 * Parses natural spoken voice transcript into structured food donation fields.
 */
export async function parseSpokenFoodSurplus(
  transcript: string
): Promise<ParsedFoodDonation> {
  // First, attempt backend AI parse if server is reachable
  try {
    const res = await fetch('/api/ai/parse-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.foodName) {
        return data;
      }
    }
  } catch {
    // Continue with client-side NLP parsing
  }

  const text = transcript.toLowerCase();

  // 1. Extract portion count
  let portions = 30; // default sensible portions
  const portionsMatch =
    transcript.match(/(\d+)\s*(portions?|servings?|plates?|meals?|packs?|boxes?)/i) ||
    transcript.match(/(about|around|we have|got|approximately)?\s*(\d+)\s*(portions?|servings?|meals?|people)/i);

  if (portionsMatch) {
    const num = parseInt(portionsMatch[portionsMatch.length - 2] || portionsMatch[1], 10);
    if (!isNaN(num) && num > 0) portions = num;
  } else {
    // Just find first standalone number
    const anyNumMatch = transcript.match(/\b(\d{1,4})\b/);
    if (anyNumMatch) {
      const num = parseInt(anyNumMatch[1], 10);
      if (num >= 5 && num <= 1000) portions = num;
    }
  }

  // 2. Extract Quantity (e.g. 15 kg, 20 kilos, 3 trays, 5 liters)
  let quantity = `${Math.round(portions * 0.4)} kg`;
  const kgMatch = transcript.match(/(\d+(\.\d+)?)\s*(kg|kilos?|kilograms?|liters?|ltrs?|trays?|boxes?|vessels?)/i);
  if (kgMatch) {
    quantity = `${kgMatch[1]} ${kgMatch[3]}`;
  }

  // 3. Extract Food Name & Category
  let foodName = 'Surplus Cooked Meals';
  let foodCategory: ParsedFoodDonation['foodCategory'] = 'Cooked Meal';
  let foodType: ParsedFoodDonation['foodType'] = 'Vegetarian';

  if (text.includes('biryani') || text.includes('briyani')) {
    foodName = text.includes('chicken') ? 'Chicken Biryani' : text.includes('mutton') ? 'Mutton Biryani' : 'Vegetable Biryani';
    foodCategory = 'Cooked Meal';
    foodType = text.includes('vegetable') || text.includes('veg') ? 'Vegetarian' : 'Non-Veg';
  } else if (text.includes('rice') || text.includes('pulao') || text.includes('pulav') || text.includes('sambar') || text.includes('curd rice')) {
    if (text.includes('fried rice')) foodName = text.includes('egg') ? 'Egg Fried Rice' : 'Vegetable Fried Rice';
    else if (text.includes('sambar')) foodName = 'Sambar Rice with Poriyal';
    else if (text.includes('curd')) foodName = 'Curd Rice';
    else if (text.includes('pulao')) foodName = 'Vegetable Pulao';
    else foodName = 'Vegetable Rice & Curry';
    foodCategory = 'Cooked Meal';
    foodType = 'Vegetarian';
  } else if (text.includes('chapati') || text.includes('roti') || text.includes('parotta') || text.includes('naan')) {
    foodName = 'Chapati & Mixed Vegetable Curry';
    foodCategory = 'Cooked Meal';
    foodType = 'Vegetarian';
  } else if (text.includes('bread') || text.includes('bun') || text.includes('cake') || text.includes('pastry') || text.includes('croissant') || text.includes('bakery')) {
    foodName = 'Assorted Bakery Bread & Rolls';
    foodCategory = 'Bakery';
    foodType = 'Vegetarian';
  } else if (text.includes('chicken') || text.includes('mutton') || text.includes('fish') || text.includes('meat')) {
    foodName = text.includes('curry') ? 'Chicken Curry with Gravy' : 'Non-Veg Cooked Meal';
    foodCategory = 'Cooked Meal';
    foodType = 'Non-Veg';
  } else if (text.includes('fruit') || text.includes('vegetables') || text.includes('raw') || text.includes('tomato') || text.includes('potato')) {
    foodName = 'Fresh Vegetables & Produce';
    foodCategory = 'Raw Produce';
    foodType = 'Vegan';
  } else if (text.includes('snack') || text.includes('biscuit') || text.includes('juice') || text.includes('packed')) {
    foodName = 'Packaged Snack Boxes';
    foodCategory = 'Packed Food';
    foodType = 'Vegetarian';
  } else {
    // Extract capitalized words or key nouns from transcript
    const clean = transcript
      .replace(/we have|i have|there is|there are|portions of|servings of|about|around|freshly prepared|prepared at|refrigerated|packed/gi, '')
      .trim();
    if (clean.length > 3) {
      foodName = clean.split(/[.,]/)[0].trim().slice(0, 35);
      foodName = foodName.charAt(0).toUpperCase() + foodName.slice(1);
    }
  }

  // Double check food type
  if (text.includes('non veg') || text.includes('chicken') || text.includes('mutton') || text.includes('meat') || text.includes('fish')) {
    foodType = 'Non-Veg';
  } else if (text.includes('vegan')) {
    foodType = 'Vegan';
  } else if (text.includes('egg')) {
    foodType = 'Egg';
  }

  // 4. Storage Condition & Temperature
  let storageCondition: ParsedFoodDonation['storageCondition'] = 'Refrigerated';
  let storageTemperature = '4°C';

  if (text.includes('hot') || text.includes('warmer') || text.includes('warm') || text.includes('heating')) {
    storageCondition = 'Hot Holding';
    storageTemperature = '65°C';
  } else if (text.includes('frozen') || text.includes('freezer') || text.includes('deep freeze')) {
    storageCondition = 'Frozen';
    storageTemperature = '-18°C';
  } else if (text.includes('room temp') || text.includes('ambient') || text.includes('counter') || text.includes('room temperature')) {
    storageCondition = 'Room Temperature';
    storageTemperature = '24°C';
  } else if (text.includes('fridge') || text.includes('refrigerat') || text.includes('chilled') || text.includes('cool')) {
    storageCondition = 'Refrigerated';
    storageTemperature = '4°C';
  }

  // 5. Packaging Status
  let packagingStatus: ParsedFoodDonation['packagingStatus'] = 'Packed';
  if (text.includes('box') || text.includes('sealed') || text.includes('individual') || text.includes('packed')) {
    packagingStatus = 'Packed';
  } else if (text.includes('tray') || text.includes('open')) {
    packagingStatus = 'Open Tray';
  } else if (text.includes('pot') || text.includes('vessel') || text.includes('bulk') || text.includes('container') || text.includes('degh')) {
    packagingStatus = 'Bulk Containers';
  }

  // 6. Prepared Time
  let preparedTime = '5:30 PM';
  const timeMatch = transcript.match(/(\d{1,2}(:\d{2})?\s*(am|pm))/i);
  if (timeMatch) {
    preparedTime = timeMatch[0].toUpperCase();
  } else if (text.includes('noon') || text.includes('12 pm')) {
    preparedTime = '12:00 PM';
  } else if (text.includes('lunch') || text.includes('afternoon')) {
    preparedTime = '1:30 PM';
  } else if (text.includes('morning') || text.includes('breakfast')) {
    preparedTime = '9:00 AM';
  } else if (text.includes('evening') || text.includes('dinner')) {
    preparedTime = '6:30 PM';
  }

  return {
    foodName,
    foodCategory,
    foodType,
    quantity,
    portions,
    storageCondition,
    storageTemperature,
    packagingStatus,
    preparedTime,
    ingredients: `Freshly prepared ${foodName.toLowerCase()}, seasoned with standard culinary herbs and spices.`,
    additionalNotes: `Voice recorded: "${transcript}"`,
  };
}
