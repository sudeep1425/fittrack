export const FOOD_CALORIES_PER_100G = {
  rice: 130, roti: 297, chapati: 297, idli: 146, dosa: 168,
  upma: 160, poha: 130, dal: 116, chicken: 239, egg: 155,
  paneer: 265, potato: 77, banana: 89, apple: 52, milk: 61,
  curd: 98, oats: 389, bread: 265, butter: 717, cheese: 402,
  almonds: 579, walnuts: 654, peanuts: 567, salmon: 208, fish: 205,
  beef: 250, pork: 242, tomato: 18, onion: 40, cucumber: 15,
  carrot: 41, spinach: 23, broccoli: 34, pasta: 131, pizza: 266,
  burger: 295, quinoa: 120, lentils: 116, chickpeas: 164, tofu: 76,
  yogurt: 59, honey: 304, sugar: 387, oil: 884, ghee: 900,
  mutton: 294, biryani: 150, samosa: 262
};

export const getEstimatedCalories = (foodName, amountGrams) => {
  const search = String(foodName || '').trim().toLowerCase();
  const grams = Number(amountGrams);
  if (!search) return { cal: 0, per100: 0, matched: null };

  let per100 = FOOD_CALORIES_PER_100G[search];
  let matched = search;

  if (!per100) {
    for (const [food, cals] of Object.entries(FOOD_CALORIES_PER_100G)) {
      if (food.includes(search) || search.includes(food)) {
        per100 = cals;
        matched = food;
        break;
      }
    }
  }

  if (!per100 || !Number.isFinite(grams) || grams <= 0) return { cal: 0, per100: 0, matched: null };
  return { cal: Math.round((per100 * grams) / 100), per100, matched };
};
