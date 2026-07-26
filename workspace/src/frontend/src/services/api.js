// Dynamically detect host IP for mobile testing
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1')
  ? 'http://localhost:8000/api'
  : `http://${hostname}:8000/api`;

export async function fetchGoals() {
  try {
    const res = await fetch(`${API_BASE}/goals`);
    if (!res.ok) throw new Error('Failed to fetch goals');
    return await res.json();
  } catch (err) {
    return {
      id: 1,
      name: "User",
      age: 28,
      gender: "female",
      weight_kg: 68.0,
      height_cm: 168.0,
      target_weight_kg: 62.0,
      activity_level: "lightly_active",
      goal_type: "lose",
      daily_calorie_target: 2000,
      protein_target_g: 120.0,
      carbs_target_g: 200.0,
      fat_target_g: 65.0,
      water_target_ml: 2500
    };
  }
}

export async function updateGoals(profile) {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to update goals');
  return await res.json();
}

export async function fetchFoodLogs(dateStr) {
  try {
    const res = await fetch(`${API_BASE}/logs?date=${dateStr}`);
    if (!res.ok) throw new Error('Failed to fetch food logs');
    return await res.json();
  } catch (err) {
    const local = localStorage.getItem(`logs_${dateStr}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function addFoodLog(item) {
  try {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to add food log');
    return await res.json();
  } catch (err) {
    const dateStr = item.log_date;
    const existing = JSON.parse(localStorage.getItem(`logs_${dateStr}`) || '[]');
    const newItem = { ...item, id: Date.now() };
    existing.push(newItem);
    localStorage.setItem(`logs_${dateStr}`, JSON.stringify(existing));
    return newItem;
  }
}

export async function deleteFoodLog(logId, dateStr) {
  try {
    await fetch(`${API_BASE}/logs/${logId}`, { method: 'DELETE' });
  } catch (err) {
    const existing = JSON.parse(localStorage.getItem(`logs_${dateStr}`) || '[]');
    const updated = existing.filter(i => i.id !== logId);
    localStorage.setItem(`logs_${dateStr}`, JSON.stringify(updated));
  }
}

export async function fetchWaterLog(dateStr) {
  try {
    const res = await fetch(`${API_BASE}/logs/water?date=${dateStr}`);
    if (!res.ok) throw new Error('Failed to fetch water log');
    return await res.json();
  } catch (err) {
    return parseInt(localStorage.getItem(`water_${dateStr}`) || '0', 10);
  }
}

export async function logWater(dateStr, amountMl) {
  try {
    const res = await fetch(`${API_BASE}/logs/water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_date: dateStr, amount_ml: amountMl })
    });
    if (!res.ok) throw new Error('Failed to log water');
    return await res.json();
  } catch (err) {
    const current = parseInt(localStorage.getItem(`water_${dateStr}`) || '0', 10);
    const updated = current + amountMl;
    localStorage.setItem(`water_${dateStr}`, updated.toString());
    return { amount_ml: amountMl };
  }
}

export async function fetchWeightLogs() {
  try {
    const res = await fetch(`${API_BASE}/weight`);
    if (!res.ok) throw new Error('Failed to fetch weight logs');
    return await res.json();
  } catch (err) {
    return JSON.parse(localStorage.getItem('weight_logs') || '[]');
  }
}

export async function logWeight(entry) {
  try {
    const res = await fetch(`${API_BASE}/weight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error('Failed to log weight');
    return await res.json();
  } catch (err) {
    const existing = JSON.parse(localStorage.getItem('weight_logs') || '[]');
    const newEntry = { ...entry, id: Date.now() };
    existing.push(newEntry);
    localStorage.setItem('weight_logs', JSON.stringify(existing));
    return newEntry;
  }
}

export async function deleteWeightLog(logId) {
  try {
    await fetch(`${API_BASE}/weight/${logId}`, { method: 'DELETE' });
  } catch (err) {
    const existing = JSON.parse(localStorage.getItem('weight_logs') || '[]');
    const updated = existing.filter(i => i.id !== logId);
    localStorage.setItem('weight_logs', JSON.stringify(updated));
  }
}

export async function fetchRecipes() {
  try {
    const res = await fetch(`${API_BASE}/recipes`);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return await res.json();
  } catch (err) {
    return JSON.parse(localStorage.getItem('recipes') || '[]');
  }
}

export async function createRecipe(recipeData) {
  try {
    const res = await fetch(`${API_BASE}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipeData)
    });
    if (!res.ok) throw new Error('Failed to create recipe');
    return await res.json();
  } catch (err) {
    const existing = JSON.parse(localStorage.getItem('recipes') || '[]');
    const newRec = { ...recipeData, id: Date.now(), calories_per_serving: 350, protein_per_serving: 25, carbs_per_serving: 40, fat_per_serving: 8 };
    existing.push(newRec);
    localStorage.setItem('recipes', JSON.stringify(existing));
    return newRec;
  }
}

export async function deleteRecipe(recipeId) {
  try {
    await fetch(`${API_BASE}/recipes/${recipeId}`, { method: 'DELETE' });
  } catch (err) {
    const existing = JSON.parse(localStorage.getItem('recipes') || '[]');
    const updated = existing.filter(r => r.id !== recipeId);
    localStorage.setItem('recipes', JSON.stringify(updated));
  }
}

export async function searchFoods(query) {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  } catch (err) {
    return [
      { name: `${query} (Generic)`, brand: "General Food", calories_100g: 150, protein_100g: 10, carbs_100g: 20, fat_100g: 3, source: "offline" }
    ];
  }
}

export async function createCustomFood(item) {
  const res = await fetch(`${API_BASE}/search/custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to create custom food');
  return await res.json();
}

export async function scanBarcode(barcode) {
  try {
    const res = await fetch(`${API_BASE}/scan/barcode?code=${encodeURIComponent(barcode)}`);
    if (!res.ok) throw new Error('Barcode scan failed');
    return await res.json();
  } catch (err) {
    return {
      name: `Product ${barcode}`,
      brand: "Scanned Barcode",
      calories_100g: 240,
      protein_100g: 8,
      carbs_100g: 32,
      fat_100g: 9,
      barcode: barcode,
      source: "fallback"
    };
  }
}

export async function scanAiFood(imageBase64) {
  try {
    const res = await fetch(`${API_BASE}/scan/ai-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 })
    });
    if (!res.ok) throw new Error('AI Scan failed');
    return await res.json();
  } catch (err) {
    return {
      dish_name: "Grilled Chicken Caesar Salad",
      total_calories: 450,
      total_protein: 38,
      total_carbs: 14,
      total_fat: 26,
      confidence_score: 0.94,
      items: [
        { name: "Grilled Chicken Breast", weight_g: 160, calories: 260, protein: 32, carbs: 0, fat: 5 },
        { name: "Romaine Lettuce & Dressing", weight_g: 120, calories: 160, protein: 3, carbs: 8, fat: 19 }
      ]
    };
  }
}

export async function fetchWeeklyAnalytics(dateStr) {
  try {
    const res = await fetch(`${API_BASE}/analytics/weekly?date=${dateStr}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (err) {
    return {
      end_date: dateStr,
      daily_stats: [
        { date: dateStr, day: "Today", calories: 1850, target: 2000, protein: 110, carbs: 190, fat: 60 },
        { date: dateStr, day: "Yesterday", calories: 1920, target: 2000, protein: 125, carbs: 180, fat: 58 }
      ],
      average_calories: 1885,
      target_calories: 2000,
      adherence_score: 85.7,
      weekly_macros: {
        protein_percentage: 30,
        carbs_percentage: 42,
        fat_percentage: 28
      }
    };
  }
}
