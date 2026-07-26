# NutriScan AI — SDD-Pro Calorie & Nutrition Tracker

> A mobile-first, full-stack **Specification-Driven (SDD-Pro)** AI-powered calorie, macronutrient, body weight, and recipe tracking application. Powered by **Google Gemini 2.5 Vision AI**, **FatSecret Platform API**, **OpenFoodFacts Python SDK**, and **USDA Verified Nutrition Database**.

---

## 📱 Features Overview

### 1. 🤖 AI Meal & Photo Scanner (`FEAT-003`)
- Point your phone camera at any plate, dish, or meal photo.
- Uses **Google Gemini 2.5 Flash Vision** to recognize individual meal items, estimate weight (grams), and calculate calories, protein, carbs, and fat.
- Instant item breakdown with confidence score rating before logging.

### 2. 🔍 Barcode & Online Food Database Search (`FEAT-002`, `FEAT-004`)
- Real-time video barcode scanner for packaged foods using **FatSecret Platform API** and official **OpenFoodFacts Python SDK**.
- Typing auto-complete search across millions of global products and USDA lab-verified standard reference nutrition values.
- Custom serving size scaler and custom food recipe creator.

### 3. 🎯 BMR / TDEE Calorie & Macro Target Engine (`FEAT-001`)
- Mifflin-St Jeor formula calculation based on age, gender, weight, height, activity level, and weight goal (Loss, Maintenance, Gain).
- Interactive SVG Calorie Progress Ring displaying consumed vs goal vs remaining calories.
- Progress bars for Protein, Carbs, and Fats.
- Categorized meal breakdown (Breakfast, Lunch, Dinner, Snacks & Drinks).
- Daily water intake tracker.

### 4. 📉 Weight & Body Fat % Progress Tracker (`FEAT-006`)
- Log daily body weight (kg/lbs) and Body Fat %.
- Interactive progress trend charts (Recharts) with target goal weight & body fat reference lines.
- Auto-calculated **Fat Mass (kg)** vs **Lean Muscle Mass (kg)** body composition cards.

### 5. 👨‍🍳 Recipe Builder & Saved Meals (`FEAT-007`)
- Multi-ingredient recipe builder with auto-calculated per-serving calories and macros.
- Saved recipes tab to log 1 serving of a custom meal into any daily log in 1 tap.

### 6. 📊 Weekly Analytics & Goal Adherence Reports (`FEAT-005`)
- 7-Day calorie trend bar chart comparing daily intake against calorie goals.
- Weekly goal adherence rating score (%) and average daily calorie summary.
- Weekly macro balance percentage split.

---

## 🏗️ Architecture & SDD-Pro Structure

Built according to **SDD-Pro (Specification Driven Development)** standards:

```
AI-Calorie-Tracker/
├── .sdd/                      # SDD-Pro framework rules, agents & invariants
├── workspace/
│   ├── stack/stack.md         # Single Source of Truth project configuration (Combo C4)
│   ├── feats/                 # SDD-Pro Feature Specifications (FEAT-001 to FEAT-007)
│   │   ├── FEAT-001.md        # Dashboard & Goal Engine
│   │   ├── FEAT-002.md        # Typing Search & Database Lookup
│   │   ├── FEAT-003.md        # AI Photo Scanner (Gemini Vision)
│   │   ├── FEAT-004.md        # Barcode Reader (FatSecret & Open Food Facts)
│   │   ├── FEAT-005.md        # Weekly Analytics
│   │   ├── FEAT-006.md        # Weight & Body Fat Tracker
│   │   └── FEAT-007.md        # Recipe Builder & Saved Meals
│   └── src/
│       ├── backend/           # Python FastAPI Server (SQLAlchemy, SQLite, Pytest)
│       └── frontend/          # Mobile-First React + Vite + Tailwind PWA App
├── run_app.py                 # Multi-Process Launcher
└── README.md
```

---

## ⚡ Tech Stack

- **Backend**: Python 3.14, FastAPI, SQLAlchemy, SQLite, Pydantic v2, Pytest, `google-genai`, `openfoodfacts` SDK, FatSecret OAuth 2.0 API.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, PWA Web Manifest.
- **AI / Computer Vision**: Google Gemini 2.5 Flash Vision.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Python 3.8+
- Node.js 18+

### 2. Install Dependencies
```bash
# Backend dependencies
pip install -r workspace/src/backend/requirements.txt

# Frontend dependencies
npm --prefix workspace/src/frontend install
```

### 3. Run the App
```bash
python run_app.py
```

- **Frontend Mobile App**: `http://127.0.0.1:5173`
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`

---

## 📱 Testing on Your Phone (Mobile Developer Mode)

### Wi-Fi Mobile Testing
1. Run `python run_app.py`.
2. Open your phone's browser (Safari / Chrome) and go to:
   ```
   http://<YOUR_COMPUTER_IP>:5173
   ```
3. Tap **Share / Menu (`⋮`)** -> **"Add to Home Screen"** to install as a full standalone app!

### USB Debugging (Android Developer Options)
```bash
adb reverse tcp:5173 tcp:5173
adb reverse tcp:8000 tcp:8000
```
Open `http://localhost:5173` on your Android phone's Chrome browser.

---

## 🧪 Running Automated Tests

```bash
python -m pytest workspace/src/backend/tests
```

All unit tests cover FastAPI routes, BMR calculations, food logging CRUD, weight logs, recipe builder, and analytics.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
