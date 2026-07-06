import { AnimatePresence, motion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useState } from "react";

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
type Difficulty = "Easy" | "Medium" | "Chef Mode";
type Tab = "Dashboard" | "Planner" | "Recipes" | "Grocery" | "Nutrition" | "Calendar" | "Profile";

type Recipe = {
  id: string;
  title: string;
  type: MealType;
  category: string;
  color: string;
  image: string;
  time: number;
  difficulty: Difficulty;
  favorite: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  steps: string[];
};

type MealPlan = {
  id: string;
  recipeId: string;
  name: string;
  type: MealType;
  day: string;
  category: string;
  label: string;
  color: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  reminder: string;
  notes: string;
};

type GroceryItem = {
  id: string;
  name: string;
  category: string;
  purchased: boolean;
  manual: boolean;
};

type Reminder = {
  id: string;
  meal: string;
  type: MealType | "Prep";
  time: string;
  note: string;
  active: boolean;
};

type Settings = {
  darkMode: boolean;
  notifications: boolean;
  dataExport: boolean;
  appLock: boolean;
  dietaryFocus: string[];
};

type AppData = {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  groceryItems: GroceryItem[];
  reminders: Reminder[];
  waterCups: number;
  streak: number;
  healthyScore: number;
  settings: Settings;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const STORAGE_KEY = "kishiskitchen.data.v1";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];
const CATEGORIES = ["High Protein", "Balanced", "Plant Love", "Mediterranean", "Glow Bowl", "Treat"];
const GOALS = { calories: 2200, protein: 120, carbs: 235, fats: 70, water: 8 };

const photos = {
  bowl: "https://images.pexels.com/photos/3118421/pexels-photo-3118421.png?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  veggie: "https://images.pexels.com/photos/5337519/pexels-photo-5337519.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  oats: "https://images.pexels.com/photos/7937049/pexels-photo-7937049.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  kiwi: "https://images.pexels.com/photos/6823325/pexels-photo-6823325.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  salmon: "https://images.pexels.com/photos/5152283/pexels-photo-5152283.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  chicken: "https://images.pexels.com/photos/25315523/pexels-photo-25315523.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  berries: "https://images.pexels.com/photos/11394991/pexels-photo-11394991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  fruit: "https://images.pexels.com/photos/2027696/pexels-photo-2027696.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

const seedRecipes: Recipe[] = [
  {
    id: "r1",
    title: "Berry Glow Oat Bowl",
    type: "Breakfast",
    category: "Glow Bowl",
    color: "#eaa5b5",
    image: photos.oats,
    time: 10,
    difficulty: "Easy",
    favorite: true,
    calories: 390,
    protein: 22,
    carbs: 54,
    fats: 10,
    ingredients: ["rolled oats", "Greek yogurt", "blueberries", "raspberries", "chia seeds", "almond butter"],
    steps: ["Simmer oats until creamy.", "Fold in yogurt for protein.", "Top with berries, chia, and almond butter."],
  },
  {
    id: "r2",
    title: "Sage Salmon & Asparagus",
    type: "Dinner",
    category: "High Protein",
    color: "#a9c9b2",
    image: photos.salmon,
    time: 28,
    difficulty: "Medium",
    favorite: true,
    calories: 620,
    protein: 48,
    carbs: 35,
    fats: 29,
    ingredients: ["salmon fillet", "asparagus", "quinoa", "lemon", "sage", "olive oil"],
    steps: ["Roast salmon with sage and lemon.", "Steam asparagus until bright green.", "Serve over fluffy quinoa with olive oil."],
  },
  {
    id: "r3",
    title: "Lavender Chickpea Power Salad",
    type: "Lunch",
    category: "Plant Love",
    color: "#d8c1ea",
    image: photos.veggie,
    time: 18,
    difficulty: "Easy",
    favorite: false,
    calories: 520,
    protein: 24,
    carbs: 62,
    fats: 20,
    ingredients: ["chickpeas", "cucumber", "avocado", "greens", "pumpkin seeds", "tahini"],
    steps: ["Toss greens with cucumber and chickpeas.", "Add avocado and pumpkin seeds.", "Drizzle with lemon tahini dressing."],
  },
  {
    id: "r4",
    title: "Coral Chicken Quinoa Bowl",
    type: "Lunch",
    category: "Balanced",
    color: "#ee8d7e",
    image: photos.chicken,
    time: 24,
    difficulty: "Medium",
    favorite: true,
    calories: 560,
    protein: 42,
    carbs: 58,
    fats: 17,
    ingredients: ["grilled chicken", "quinoa", "spinach", "tomatoes", "feta", "citrus vinaigrette"],
    steps: ["Layer quinoa and spinach.", "Add sliced grilled chicken and tomatoes.", "Finish with feta and citrus vinaigrette."],
  },
  {
    id: "r5",
    title: "Kiwi Mint Smoothie Bowl",
    type: "Snack",
    category: "Glow Bowl",
    color: "#a9c9b2",
    image: photos.kiwi,
    time: 8,
    difficulty: "Easy",
    favorite: false,
    calories: 310,
    protein: 18,
    carbs: 42,
    fats: 8,
    ingredients: ["kiwi", "banana", "protein powder", "mint", "granola", "blackberries"],
    steps: ["Blend kiwi, banana, mint, and protein powder.", "Pour into a chilled bowl.", "Top with granola and blackberries."],
  },
  {
    id: "r6",
    title: "Blush Berry Yogurt Parfait",
    type: "Snack",
    category: "Balanced",
    color: "#f7c8d2",
    image: photos.berries,
    time: 6,
    difficulty: "Easy",
    favorite: true,
    calories: 260,
    protein: 20,
    carbs: 32,
    fats: 6,
    ingredients: ["Greek yogurt", "strawberries", "granola", "honey", "hemp hearts"],
    steps: ["Layer yogurt with strawberries.", "Add granola and hemp hearts.", "Finish with a tiny swirl of honey."],
  },
  {
    id: "r7",
    title: "Tropical Fruit Reset Bowl",
    type: "Breakfast",
    category: "Plant Love",
    color: "#ee8d7e",
    image: photos.fruit,
    time: 12,
    difficulty: "Easy",
    favorite: false,
    calories: 430,
    protein: 16,
    carbs: 74,
    fats: 9,
    ingredients: ["mango", "pineapple", "berries", "coconut yogurt", "flaxseed", "lime"],
    steps: ["Spoon coconut yogurt into a bowl.", "Arrange fruit in color blocks.", "Dust with flaxseed and lime zest."],
  },
  {
    id: "r8",
    title: "Creamy Rose Pasta Primavera",
    type: "Dinner",
    category: "Treat",
    color: "#d8c1ea",
    image: photos.bowl,
    time: 32,
    difficulty: "Chef Mode",
    favorite: false,
    calories: 690,
    protein: 26,
    carbs: 82,
    fats: 26,
    ingredients: ["chickpea pasta", "zucchini", "peas", "cashew cream", "basil", "parmesan"],
    steps: ["Cook pasta until al dente.", "Sauté vegetables in olive oil.", "Toss with cashew cream, basil, and parmesan."],
  },
];

const seedMealPlans: MealPlan[] = [
  { id: "m1", recipeId: "r1", name: "Berry Glow Oat Bowl", type: "Breakfast", day: "Mon", category: "Glow Bowl", label: "Energize", color: "#eaa5b5", calories: 390, protein: 22, carbs: 54, fats: 10, reminder: "7:30 AM", notes: "Add extra cinnamon." },
  { id: "m2", recipeId: "r4", name: "Coral Chicken Quinoa Bowl", type: "Lunch", day: "Mon", category: "Balanced", label: "Protein", color: "#ee8d7e", calories: 560, protein: 42, carbs: 58, fats: 17, reminder: "12:15 PM", notes: "Pack dressing separately." },
  { id: "m3", recipeId: "r2", name: "Sage Salmon & Asparagus", type: "Dinner", day: "Mon", category: "High Protein", label: "Goal Met", color: "#a9c9b2", calories: 620, protein: 48, carbs: 35, fats: 29, reminder: "6:30 PM", notes: "Defrost salmon in the morning." },
  { id: "m4", recipeId: "r6", name: "Blush Berry Yogurt Parfait", type: "Snack", day: "Tue", category: "Balanced", label: "Sweet", color: "#f7c8d2", calories: 260, protein: 20, carbs: 32, fats: 6, reminder: "3:30 PM", notes: "Use almond granola." },
  { id: "m5", recipeId: "r3", name: "Lavender Chickpea Power Salad", type: "Lunch", day: "Wed", category: "Plant Love", label: "Fiber", color: "#d8c1ea", calories: 520, protein: 24, carbs: 62, fats: 20, reminder: "12:30 PM", notes: "Prep chickpeas Tuesday night." },
  { id: "m6", recipeId: "r5", name: "Kiwi Mint Smoothie Bowl", type: "Snack", day: "Thu", category: "Glow Bowl", label: "Hydrate", color: "#a9c9b2", calories: 310, protein: 18, carbs: 42, fats: 8, reminder: "4:00 PM", notes: "Freeze banana slices." },
  { id: "m7", recipeId: "r8", name: "Creamy Rose Pasta Primavera", type: "Dinner", day: "Fri", category: "Treat", label: "Joy", color: "#d8c1ea", calories: 690, protein: 26, carbs: 82, fats: 26, reminder: "7:00 PM", notes: "Serve with lemon water." },
];

const defaultData: AppData = {
  recipes: seedRecipes,
  mealPlans: seedMealPlans,
  groceryItems: [
    { id: "g1", name: "sparkling mineral water", category: "Beverages", purchased: false, manual: true },
    { id: "g2", name: "rose herbal tea", category: "Wellness", purchased: true, manual: true },
    { id: "g3", name: "meal prep containers", category: "Pantry", purchased: false, manual: true },
  ],
  reminders: [
    { id: "n1", meal: "Breakfast", type: "Breakfast", time: "7:30 AM", note: "Start with protein + berries", active: true },
    { id: "n2", meal: "Lunch", type: "Lunch", time: "12:15 PM", note: "Take a mindful 20-minute break", active: true },
    { id: "n3", meal: "Dinner", type: "Dinner", time: "6:30 PM", note: "Prep salmon one day before", active: true },
    { id: "n4", meal: "Weekend Prep", type: "Prep", time: "Friday 5:00 PM", note: "Shop and wash vegetables", active: true },
  ],
  waterCups: 5,
  streak: 12,
  healthyScore: 91,
  settings: { darkMode: false, notifications: true, dataExport: true, appLock: false, dietaryFocus: ["Weight Loss", "Healthy Eating", "High Protein"] },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;
    const parsed = JSON.parse(stored) as Partial<AppData>;
    return {
      ...defaultData,
      ...parsed,
      recipes: parsed.recipes?.length ? parsed.recipes : defaultData.recipes,
      mealPlans: parsed.mealPlans ?? defaultData.mealPlans,
      groceryItems: parsed.groceryItems ?? defaultData.groceryItems,
      reminders: parsed.reminders ?? defaultData.reminders,
      settings: { ...defaultData.settings, ...parsed.settings },
    };
  } catch {
    return defaultData;
  }
}

function useKitchenData() {
  const [data, setData] = useState<AppData>(loadData);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.settings.darkMode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", data.settings.darkMode ? "#171116" : "#f3c1cb");
  }, [data.settings.darkMode]);
  return [data, setData] as const;
}

function clampPercent(value: number, goal: number) {
  return Math.min(100, Math.round((value / goal) * 100));
}

function mealEmoji(type: MealType | "Prep") {
  return type === "Breakfast" ? "🥣" : type === "Lunch" ? "🥗" : type === "Dinner" ? "🍽️" : type === "Snack" ? "🍓" : "🧺";
}

function categoryForIngredient(item: string) {
  const s = item.toLowerCase();
  if (["salmon", "chicken", "yogurt", "protein", "feta", "parmesan"].some((x) => s.includes(x))) return "Protein & Dairy";
  if (["oats", "quinoa", "pasta", "granola"].some((x) => s.includes(x))) return "Grains";
  if (["oil", "tahini", "honey", "butter", "cream"].some((x) => s.includes(x))) return "Pantry";
  if (["water", "tea"].some((x) => s.includes(x))) return "Beverages";
  return "Produce";
}

function buildGroceries(data: AppData) {
  const auto = new Map<string, GroceryItem>();
  data.mealPlans.forEach((plan) => {
    const recipe = data.recipes.find((item) => item.id === plan.recipeId);
    recipe?.ingredients.forEach((ingredient) => {
      const name = ingredient.toLowerCase();
      const manualMatch = data.groceryItems.find((item) => item.name.toLowerCase() === name);
      auto.set(name, {
        id: `auto-${name.replace(/\s+/g, "-")}`,
        name,
        category: categoryForIngredient(name),
        purchased: manualMatch?.purchased ?? false,
        manual: false,
      });
    });
  });
  const manual = data.groceryItems.filter((item) => item.manual);
  return [...auto.values(), ...manual].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

function App() {
  const [data, setData] = useKitchenData();
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [query, setQuery] = useState("");
  const [recipeFilter, setRecipeFilter] = useState("All");
  const [plannerMode, setPlannerMode] = useState<"Week" | "Month">("Week");
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()]);
  const [mealModal, setMealModal] = useState<MealPlan | null>(null);
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);
  const [groceryDraft, setGroceryDraft] = useState({ name: "", category: "Produce" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    setShowIosBanner(ios && !standalone);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const groceries = useMemo(() => buildGroceries(data), [data]);
  const todayName = DAYS[new Date().getDay()];
  const todayPlans = data.mealPlans.filter((plan) => plan.day === todayName);
  const visibleTodayPlans = todayPlans.length ? todayPlans : data.mealPlans.filter((plan) => plan.day === selectedDay).slice(0, 4);
  const totals = visibleTodayPlans.reduce(
    (sum, plan) => ({ calories: sum.calories + plan.calories, protein: sum.protein + plan.protein, carbs: sum.carbs + plan.carbs, fats: sum.fats + plan.fats }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
  const favoriteRecipes = data.recipes.filter((recipe) => recipe.favorite);
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return { recipes: [], meals: [], groceries: [] };
    return {
      recipes: data.recipes.filter((recipe) => `${recipe.title} ${recipe.category} ${recipe.ingredients.join(" ")}`.toLowerCase().includes(normalized)).slice(0, 5),
      meals: data.mealPlans.filter((meal) => `${meal.name} ${meal.day} ${meal.type}`.toLowerCase().includes(normalized)).slice(0, 5),
      groceries: groceries.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalized)).slice(0, 5),
    };
  }, [data.mealPlans, data.recipes, groceries, query]);

  const updateSettings = (settings: Partial<Settings>) => setData((current) => ({ ...current, settings: { ...current.settings, ...settings } }));

  const openCreateMeal = (day = selectedDay, recipe?: Recipe) => {
    const base = recipe ?? data.recipes[0];
    setMealModal({
      id: uid("meal"),
      recipeId: base.id,
      name: base.title,
      type: base.type,
      day,
      category: base.category,
      label: "Planned",
      color: base.color,
      calories: base.calories,
      protein: base.protein,
      carbs: base.carbs,
      fats: base.fats,
      reminder: base.type === "Breakfast" ? "7:30 AM" : base.type === "Lunch" ? "12:15 PM" : base.type === "Dinner" ? "6:30 PM" : "3:30 PM",
      notes: "",
    });
    setIsCreatingMeal(true);
  };

  const saveMeal = (meal: MealPlan) => {
    setData((current) => ({
      ...current,
      mealPlans: isCreatingMeal ? [...current.mealPlans, meal] : current.mealPlans.map((item) => (item.id === meal.id ? meal : item)),
    }));
    setMealModal(null);
    setIsCreatingMeal(false);
  };

  const duplicateMeal = (meal: MealPlan) => {
    setData((current) => ({ ...current, mealPlans: [...current.mealPlans, { ...meal, id: uid("meal"), label: "Duplicated" }] }));
  };

  const deleteMeal = (id: string) => setData((current) => ({ ...current, mealPlans: current.mealPlans.filter((meal) => meal.id !== id) }));

  const moveMeal = (mealId: string, day: string) => setData((current) => ({ ...current, mealPlans: current.mealPlans.map((meal) => (meal.id === mealId ? { ...meal, day } : meal)) }));

  const toggleRecipeFavorite = (id: string) => setData((current) => ({ ...current, recipes: current.recipes.map((recipe) => (recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe)) }));

  const setGroceryPurchased = (item: GroceryItem, purchased: boolean) => {
    setData((current) => {
      const existing = current.groceryItems.find((grocery) => grocery.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        return { ...current, groceryItems: current.groceryItems.map((grocery) => (grocery.id === existing.id ? { ...grocery, purchased } : grocery)) };
      }
      return { ...current, groceryItems: [...current.groceryItems, { ...item, id: uid("grocery"), purchased, manual: false }] };
    });
  };

  const addGrocery = () => {
    if (!groceryDraft.name.trim()) return;
    setData((current) => ({
      ...current,
      groceryItems: [...current.groceryItems, { id: uid("grocery"), name: groceryDraft.name.trim().toLowerCase(), category: groceryDraft.category, purchased: false, manual: true }],
    }));
    setGroceryDraft({ name: "", category: "Produce" });
  };

  const removeGrocery = (item: GroceryItem) => setData((current) => ({ ...current, groceryItems: current.groceryItems.filter((grocery) => grocery.id !== item.id && grocery.name !== item.name) }));

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen pb-28 text-[var(--ink)] md:pb-0">
      <DecorativeBackdrop />
      <div className="mx-auto flex w-full max-w-[1500px] gap-5 px-3 py-4 sm:px-5 lg:px-8">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="min-w-0 flex-1">
          <TopBar
            query={query}
            setQuery={setQuery}
            deferredPrompt={deferredPrompt}
            installApp={installApp}
            darkMode={data.settings.darkMode}
            toggleDarkMode={() => updateSettings({ darkMode: !data.settings.darkMode })}
            openDrawer={() => setDrawerOpen(true)}
          />
          <AnimatePresence>{query && <SearchOverlay results={searchResults} clear={() => setQuery("")} openMeal={(meal) => { setMealModal(meal); setIsCreatingMeal(false); }} openRecipe={(recipe) => { setActiveTab("Recipes"); setRecipeFilter(recipe.type); }} />}</AnimatePresence>
          {showIosBanner && <IosInstallBanner close={() => setShowIosBanner(false)} />}

          {loading ? (
            <LoadingDashboard />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} {...fadeUp}>
                {activeTab === "Dashboard" && (
                  <Dashboard
                    data={data}
                    totals={totals}
                    todayPlans={visibleTodayPlans}
                    groceries={groceries}
                    favoriteRecipes={favoriteRecipes}
                    openCreateMeal={openCreateMeal}
                    setActiveTab={setActiveTab}
                    setData={setData}
                  />
                )}
                {activeTab === "Planner" && (
                  <Planner
                    data={data}
                    mode={plannerMode}
                    setMode={setPlannerMode}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    openCreateMeal={openCreateMeal}
                    editMeal={(meal) => { setMealModal(meal); setIsCreatingMeal(false); }}
                    duplicateMeal={duplicateMeal}
                    deleteMeal={deleteMeal}
                    moveMeal={moveMeal}
                  />
                )}
                {activeTab === "Recipes" && <Recipes recipes={data.recipes} filter={recipeFilter} setFilter={setRecipeFilter} toggleFavorite={toggleRecipeFavorite} openCreateMeal={openCreateMeal} />}
                {activeTab === "Grocery" && <Grocery groceries={groceries} draft={groceryDraft} setDraft={setGroceryDraft} addGrocery={addGrocery} setPurchased={setGroceryPurchased} removeGrocery={removeGrocery} />}
                {activeTab === "Nutrition" && <Nutrition data={data} totals={totals} setData={setData} />}
                {activeTab === "Calendar" && <CalendarView data={data} moveMeal={moveMeal} />}
                {activeTab === "Profile" && <Profile data={data} updateSettings={updateSettings} installApp={installApp} canInstall={Boolean(deferredPrompt)} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} openCreateMeal={() => openCreateMeal()} />
      <FloatingAction onClick={() => openCreateMeal()} />
      <AnimatePresence>{drawerOpen && <NotificationDrawer reminders={data.reminders} close={() => setDrawerOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{mealModal && <MealModal meal={mealModal} recipes={data.recipes} onClose={() => { setMealModal(null); setIsCreatingMeal(false); }} onSave={saveMeal} />}</AnimatePresence>
    </div>
  );
}

function DecorativeBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ y: [0, 20, 0], scale: [1, 1.04, 1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[rgba(247,200,210,.34)] blur-3xl" />
      <motion.div animate={{ y: [0, -18, 0], scale: [1, 1.08, 1] }} transition={{ duration: 14, repeat: Infinity }} className="absolute right-[-6rem] top-28 h-80 w-80 rounded-full bg-[rgba(216,193,234,.34)] blur-3xl" />
      <motion.div animate={{ x: [0, 18, 0] }} transition={{ duration: 16, repeat: Infinity }} className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-[rgba(169,201,178,.24)] blur-3xl" />
    </div>
  );
}

function TopBar({ query, setQuery, deferredPrompt, installApp, darkMode, toggleDarkMode, openDrawer }: { query: string; setQuery: (value: string) => void; deferredPrompt: BeforeInstallPromptEvent | null; installApp: () => void; darkMode: boolean; toggleDarkMode: () => void; openDrawer: () => void }) {
  return (
    <header className="sticky top-0 z-30 -mx-3 mb-4 px-3 pb-3 pt-2 backdrop-blur-xl sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8">
      <div className="glass flex items-center gap-3 rounded-[2rem] p-2.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--blush)] to-[var(--lavender)] text-2xl shadow-lg shadow-pink-200/30">👩‍🍳</div>
        <div className="hidden min-w-fit sm:block">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Kishi's Kitchen</p>
          <h1 className="text-xl font-black tracking-tight">Welcome back, Kishi 💖</h1>
        </div>
        <label className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meals, recipes, groceries..." className="h-12 w-full rounded-2xl border border-[var(--stroke)] bg-white/55 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--blush-2)] focus:bg-white/80 dark:bg-white/10 dark:focus:bg-white/15" />
        </label>
        {deferredPrompt && <button onClick={installApp} className="standalone-hidden hidden rounded-2xl bg-[var(--ink)] px-4 py-3 text-sm font-bold text-[var(--cream)] shadow-lg sm:block">Install</button>}
        <button onClick={toggleDarkMode} className="grid h-12 w-12 place-items-center rounded-2xl bg-white/55 text-xl transition hover:scale-105 dark:bg-white/10" aria-label="Toggle dark mode">{darkMode ? "☀️" : "🌙"}</button>
        <button onClick={openDrawer} className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/55 text-xl transition hover:scale-105 dark:bg-white/10" aria-label="Notifications"><span>🔔</span><span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[var(--coral)] ring-2 ring-white" /></button>
      </div>
    </header>
  );
}

function SearchOverlay({ results, clear, openMeal, openRecipe }: { results: { recipes: Recipe[]; meals: MealPlan[]; groceries: GroceryItem[] }; clear: () => void; openMeal: (meal: MealPlan) => void; openRecipe: (recipe: Recipe) => void }) {
  const empty = !results.recipes.length && !results.meals.length && !results.groceries.length;
  return (
    <motion.section {...fadeUp} className="glass-strong fixed left-3 right-3 top-24 z-40 mx-auto max-w-3xl rounded-[2rem] p-4 sm:left-8 sm:right-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black">Instant search</h2>
        <button onClick={clear} className="rounded-full bg-white/60 px-3 py-1 text-sm dark:bg-white/10">Close</button>
      </div>
      {empty ? <EmptyState icon="🔎" title="No matches yet" text="Try searching for salmon, protein, groceries, or a day of the week." /> : (
        <div className="grid gap-3 md:grid-cols-3">
          <ResultColumn title="Recipes" items={results.recipes.map((recipe) => ({ id: recipe.id, label: recipe.title, meta: `${recipe.time} min • ${recipe.calories} kcal`, action: () => openRecipe(recipe) }))} />
          <ResultColumn title="Meals" items={results.meals.map((meal) => ({ id: meal.id, label: meal.name, meta: `${meal.day} • ${meal.type}`, action: () => openMeal(meal) }))} />
          <ResultColumn title="Groceries" items={results.groceries.map((item) => ({ id: item.id, label: item.name, meta: item.category, action: clear }))} />
        </div>
      )}
    </motion.section>
  );
}

function ResultColumn({ title, items }: { title: string; items: { id: string; label: string; meta: string; action: () => void }[] }) {
  return <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{title}</p><div className="space-y-2">{items.length ? items.map((item) => <button key={item.id} onClick={item.action} className="w-full rounded-2xl bg-white/55 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/80 dark:bg-white/10"><b className="block text-sm">{item.label}</b><span className="text-xs text-[var(--muted)]">{item.meta}</span></button>) : <p className="text-sm text-[var(--muted)]">No results</p>}</div></div>;
}

function IosInstallBanner({ close }: { close: () => void }) {
  return <motion.div {...fadeUp} className="standalone-hidden glass mb-4 rounded-[1.75rem] p-4"><div className="flex gap-3"><div className="text-3xl">📲</div><div className="flex-1"><h3 className="font-black">Add Kishi's Kitchen to your Home Screen</h3><p className="text-sm text-[var(--muted)]">On iPhone Safari, tap Share, then choose “Add to Home Screen” for the best app-like experience.</p></div><button onClick={close} className="h-8 w-8 rounded-full bg-white/60 dark:bg-white/10">×</button></div></motion.div>;
}

function Dashboard({ data, totals, todayPlans, groceries, favoriteRecipes, openCreateMeal, setActiveTab, setData }: { data: AppData; totals: { calories: number; protein: number; carbs: number; fats: number }; todayPlans: MealPlan[]; groceries: GroceryItem[]; favoriteRecipes: Recipe[]; openCreateMeal: (day?: string, recipe?: Recipe) => void; setActiveTab: (tab: Tab) => void; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const tips = ["Pair every carb with protein or healthy fat for softer energy curves.", "Prep two sauces this week to make healthy meals feel luxurious.", "Aim for colorful plants at lunch and dinner for micronutrient variety."];
  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <motion.div whileHover={{ y: -3 }} className="glass-strong overflow-hidden rounded-[2.25rem] p-5 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--muted)]">Daily wellness dashboard</p>
              <h2 className="mt-2 text-4xl font-black leading-tight tracking-[-0.04em] md:text-6xl">Welcome back, Kishi 💖</h2>
              <p className="mt-3 max-w-2xl text-base text-[var(--muted)] md:text-lg">A soft, nourishing plan for today—meals, hydration, groceries, reminders, and tiny habits all in one beautiful rhythm.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <QuickButton icon="＋" label="Plan meal" onClick={() => openCreateMeal()} />
                <QuickButton icon="🥗" label="Find recipe" onClick={() => setActiveTab("Recipes")} />
                <QuickButton icon="🛒" label="Groceries" onClick={() => setActiveTab("Grocery")} />
                <QuickButton icon="💧" label="Log water" onClick={() => setData((current) => ({ ...current, waterCups: Math.min(GOALS.water, current.waterCups + 1) }))} />
              </div>
            </div>
            <div className="relative min-h-64 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[rgba(247,200,210,.55)] via-white/40 to-[rgba(169,201,178,.5)] p-4 dark:from-white/10 dark:via-white/5 dark:to-white/10">
              <img src={photos.veggie} alt="Healthy colorful meal bowl" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply dark:opacity-30 dark:mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-strong)] via-transparent to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="ml-auto w-fit rounded-full bg-white/70 px-3 py-1 text-sm font-bold shadow dark:bg-black/20">{data.healthyScore}% healthy score</div>
                <div className="glass rounded-[1.5rem] p-4">
                  <p className="text-sm text-[var(--muted)]">Today’s featured recipe</p>
                  <h3 className="text-2xl font-black">Sage Salmon & Asparagus</h3>
                  <p className="text-sm text-[var(--muted)]">High protein • omega-3 • dinner ready in 28 min</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <MetricCard title="Daily Calories" value={`${totals.calories}`} suffix="kcal" goal={`${GOALS.calories} goal`} color="var(--coral)" percent={clampPercent(totals.calories, GOALS.calories)} icon="🔥" />
          <MetricCard title="Water Intake" value={`${data.waterCups}/${GOALS.water}`} suffix="cups" goal="gentle hydration" color="#7fa2e8" percent={clampPercent(data.waterCups, GOALS.water)} icon="💧" />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr_.8fr]">
        <Card title="Today's Meal Plan" action="Open planner" onAction={() => setActiveTab("Planner")}>
          <div className="space-y-3">{todayPlans.map((plan, index) => <MealTimelineItem key={plan.id} plan={plan} index={index} />)}</div>
        </Card>
        <Card title="Nutrition Summary" action="Analytics" onAction={() => setActiveTab("Nutrition")}>
          <div className="grid grid-cols-3 gap-3">
            <MacroRing label="Protein" value={totals.protein} goal={GOALS.protein} color="#b76f88" />
            <MacroRing label="Carbs" value={totals.carbs} goal={GOALS.carbs} color="#78a98a" />
            <MacroRing label="Fats" value={totals.fats} goal={GOALS.fats} color="#ee8d7e" />
          </div>
          <div className="mt-5 rounded-[1.5rem] bg-white/50 p-4 dark:bg-white/10">
            <p className="text-sm font-bold text-[var(--muted)]">Daily Health Tip</p>
            <p className="mt-1 text-lg font-black leading-snug">{tips[new Date().getDay() % tips.length]}</p>
          </div>
        </Card>
        <Card title="Healthy Eating Streak">
          <div className="flex items-center gap-4">
            <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-[var(--coral)] to-[var(--blush)] text-4xl shadow-lg">🔥</div>
            <div><p className="text-5xl font-black tracking-[-0.06em]">{data.streak}</p><p className="font-bold text-[var(--muted)]">days of nourishing choices</p><div className="mt-2 rounded-full bg-white/55 px-3 py-1 text-sm font-bold dark:bg-white/10">Next badge in 3 days</div></div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <WeeklyPlannerPreview plans={data.mealPlans} setActiveTab={setActiveTab} />
        <Card title="Favorite Recipes" action="View all" onAction={() => setActiveTab("Recipes")}>
          <div className="space-y-3">{favoriteRecipes.slice(0, 3).map((recipe) => <RecipeMini key={recipe.id} recipe={recipe} onClick={() => openCreateMeal(undefined, recipe)} />)}</div>
        </Card>
        <Card title="Grocery List Preview" action="Shop" onAction={() => setActiveTab("Grocery")}>
          <div className="space-y-2">{groceries.slice(0, 6).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/50 p-3 dark:bg-white/10"><span className={`h-4 w-4 rounded-full border ${item.purchased ? "bg-[var(--sage)]" : "bg-transparent"}`} /><span className="flex-1 capitalize">{item.name}</span><span className="text-xs text-[var(--muted)]">{item.category}</span></div>)}</div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card title="Upcoming Meal Reminders" action="Calendar" onAction={() => setActiveTab("Calendar")}>
          <div className="grid gap-3 sm:grid-cols-2">{data.reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)}</div>
        </Card>
        <Card title="Wellness Insights">
          <div className="grid gap-3 sm:grid-cols-3">
            <Insight icon="🌿" title="Fiber trend" text="Up 18% this week from chickpeas and berries." />
            <Insight icon="💤" title="Meal timing" text="Dinner reminders are helping you eat 42 min earlier." />
            <Insight icon="🏆" title="Achievement" text="Balanced Plate badge unlocked today." />
          </div>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ title, value, suffix, goal, color, percent, icon }: { title: string; value: string; suffix: string; goal: string; color: string; percent: number; icon: string }) {
  return <motion.div whileHover={{ y: -4 }} className="glass-strong rounded-[2rem] p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[var(--muted)]">{title}</p><p className="mt-1 text-4xl font-black tracking-[-0.05em]">{value} <span className="text-base text-[var(--muted)]">{suffix}</span></p><p className="text-sm text-[var(--muted)]">{goal}</p></div><ProgressRing value={percent} color={color} label={icon} size="lg" /></div></motion.div>;
}

function QuickButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return <motion.button whileTap={{ scale: 0.94 }} whileHover={{ y: -2 }} onClick={onClick} className="rounded-2xl bg-[var(--ink)] px-4 py-3 text-sm font-black text-[var(--cream)] shadow-xl shadow-pink-900/10"><span className="mr-2">{icon}</span>{label}</motion.button>;
}

function Card({ title, children, action, onAction }: { title: string; children: React.ReactNode; action?: string; onAction?: () => void }) {
  return <motion.section whileHover={{ y: -2 }} className="glass rounded-[2rem] p-4 md:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-black tracking-[-0.03em]">{title}</h2>{action && <button onClick={onAction} className="rounded-full bg-white/55 px-3 py-1.5 text-sm font-bold text-[var(--plum)] dark:bg-white/10">{action}</button>}</div>{children}</motion.section>;
}

function ProgressRing({ value, color, label, size = "md" }: { value: number; color: string; label: string; size?: "sm" | "md" | "lg" }) {
  const sizes = size === "lg" ? "h-24 w-24 text-2xl" : size === "sm" ? "h-14 w-14 text-sm" : "h-20 w-20 text-lg";
  return <div className={`ring-progress relative grid shrink-0 place-items-center rounded-full ${sizes}`} style={{ "--value": value, "--accent": color } as CSSProperties}><div className="absolute inset-[10%] grid place-items-center rounded-full bg-[var(--card-strong)] font-black shadow-inner"><span>{label}</span></div></div>;
}

function MacroRing({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = clampPercent(value, goal);
  return <div className="rounded-[1.5rem] bg-white/45 p-3 text-center dark:bg-white/10"><div className="mx-auto"><ProgressRing value={pct} color={color} label={`${pct}%`} /></div><p className="mt-2 font-black">{label}</p><p className="text-xs text-[var(--muted)]">{value}g / {goal}g</p></div>;
}

function MealTimelineItem({ plan, index }: { plan: MealPlan; index: number }) {
  return <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex gap-3 rounded-[1.5rem] bg-white/50 p-3 dark:bg-white/10"><div className="grid h-14 w-14 place-items-center rounded-2xl text-2xl" style={{ background: `${plan.color}55` }}>{mealEmoji(plan.type)}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate font-black">{plan.name}</p><span className="text-xs font-bold text-[var(--muted)]">{plan.reminder}</span></div><p className="text-sm text-[var(--muted)]">{plan.type} • {plan.calories} kcal</p><div className="mt-2 flex gap-2 text-xs"><span className="rounded-full bg-[var(--sage)]/30 px-2 py-1">P {plan.protein}g</span><span className="rounded-full bg-[var(--lavender)]/30 px-2 py-1">C {plan.carbs}g</span><span className="rounded-full bg-[var(--coral)]/25 px-2 py-1">F {plan.fats}g</span></div></div></motion.div>;
}

function WeeklyPlannerPreview({ plans, setActiveTab }: { plans: MealPlan[]; setActiveTab: (tab: Tab) => void }) {
  return <Card title="Weekly Meal Planner" action="Drag & plan" onAction={() => setActiveTab("Planner")}><div className="grid grid-cols-7 gap-2">{DAYS.map((day) => { const count = plans.filter((plan) => plan.day === day).length; return <button key={day} onClick={() => setActiveTab("Planner")} className="rounded-2xl bg-white/45 p-2 text-center transition hover:-translate-y-1 dark:bg-white/10"><p className="text-xs font-bold text-[var(--muted)]">{day}</p><div className="mx-auto my-2 h-14 rounded-full bg-gradient-to-t from-[var(--blush)] to-[var(--sage)]" style={{ opacity: Math.max(0.25, count / 4), height: `${36 + count * 10}px` }} /><p className="text-xs font-black">{count}</p></button>; })}</div></Card>;
}

function RecipeMini({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-[1.5rem] bg-white/50 p-2 text-left transition hover:-translate-y-1 dark:bg-white/10"><img src={recipe.image} alt={recipe.title} className="h-16 w-16 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-black">{recipe.title}</p><p className="text-sm text-[var(--muted)]">{recipe.time} min • {recipe.difficulty}</p></div><span>♡</span></button>;
}

function ReminderCard({ reminder }: { reminder: Reminder }) {
  return <div className="rounded-[1.5rem] bg-white/50 p-4 dark:bg-white/10"><div className="flex items-start gap-3"><span className="text-3xl">{mealEmoji(reminder.type)}</span><div><p className="font-black">{reminder.meal}</p><p className="text-sm text-[var(--muted)]">{reminder.time}</p><p className="mt-2 rounded-full bg-[var(--blush)]/25 px-3 py-1 text-sm">{reminder.note}</p></div></div></div>;
}

function Insight({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="rounded-[1.5rem] bg-white/50 p-4 dark:bg-white/10"><span className="text-3xl">{icon}</span><h3 className="mt-2 font-black">{title}</h3><p className="text-sm text-[var(--muted)]">{text}</p></div>;
}

function Planner({ data, mode, setMode, selectedDay, setSelectedDay, openCreateMeal, editMeal, duplicateMeal, deleteMeal, moveMeal }: { data: AppData; mode: "Week" | "Month"; setMode: (mode: "Week" | "Month") => void; selectedDay: string; setSelectedDay: (day: string) => void; openCreateMeal: (day?: string, recipe?: Recipe) => void; editMeal: (meal: MealPlan) => void; duplicateMeal: (meal: MealPlan) => void; deleteMeal: (id: string) => void; moveMeal: (mealId: string, day: string) => void }) {
  return (
    <div className="space-y-5">
      <PageHero eyebrow="Meal planner" title="Create a nourishing week with drag-and-drop ease." text="Plan breakfast, lunch, dinner, and snacks with color labels, reminders, recipes, duplicate flows, and soft wellness-focused scheduling." action={<Segmented value={mode} values={["Week", "Month"]} onChange={(value) => setMode(value as "Week" | "Month")} />} />
      <div className="glass rounded-[2rem] p-3"><div className="flex gap-2 overflow-auto premium-scroll">{DAYS.map((day) => <button key={day} onClick={() => setSelectedDay(day)} className={`min-w-20 rounded-2xl px-4 py-3 font-black transition ${selectedDay === day ? "bg-[var(--ink)] text-[var(--cream)]" : "bg-white/45 dark:bg-white/10"}`}>{day}</button>)}</div></div>
      <section className="grid gap-3 lg:grid-cols-7">
        {DAYS.map((day) => {
          const plans = data.mealPlans.filter((plan) => plan.day === day).sort((a, b) => MEAL_TYPES.indexOf(a.type) - MEAL_TYPES.indexOf(b.type));
          return (
            <div key={day} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("meal-id"); if (id) moveMeal(id, day); }} className={`glass min-h-64 rounded-[2rem] p-3 ${selectedDay === day ? "ring-2 ring-[var(--blush-2)]" : ""}`}>
              <div className="mb-3 flex items-center justify-between"><h3 className="font-black">{day}</h3><button onClick={() => openCreateMeal(day)} className="grid h-8 w-8 place-items-center rounded-full bg-[var(--ink)] text-[var(--cream)]">+</button></div>
              <div className="space-y-3">{plans.length ? plans.map((meal) => <PlannerMealCard key={meal.id} meal={meal} recipe={data.recipes.find((recipe) => recipe.id === meal.recipeId)} editMeal={editMeal} duplicateMeal={duplicateMeal} deleteMeal={deleteMeal} />) : <EmptyDrop day={day} />}</div>
            </div>
          );
        })}
      </section>
      {mode === "Month" && <MonthPlanner plans={data.mealPlans} />}
    </div>
  );
}

function PlannerMealCard({ meal, recipe, editMeal, duplicateMeal, deleteMeal }: { meal: MealPlan; recipe?: Recipe; editMeal: (meal: MealPlan) => void; duplicateMeal: (meal: MealPlan) => void; deleteMeal: (id: string) => void }) {
  return (
    <motion.article draggable onDragStartCapture={(event) => event.dataTransfer.setData("meal-id", meal.id)} whileHover={{ y: -3 }} className="cursor-grab rounded-[1.5rem] bg-white/60 p-3 shadow-sm active:cursor-grabbing dark:bg-white/10">
      {recipe && <img src={recipe.image} alt={meal.name} className="mb-3 h-24 w-full rounded-[1.2rem] object-cover" />}
      <div className="flex items-start gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${meal.color}55` }}>{mealEmoji(meal.type)}</span><div className="min-w-0 flex-1"><p className="font-black leading-tight">{meal.name}</p><p className="text-xs text-[var(--muted)]">{meal.type} • {meal.calories} kcal</p></div></div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold"><span className="rounded-full px-2 py-1" style={{ background: `${meal.color}35` }}>{meal.category}</span><span className="rounded-full bg-white/70 px-2 py-1 dark:bg-white/10">{meal.label}</span><span className="rounded-full bg-white/70 px-2 py-1 dark:bg-white/10">⏰ {meal.reminder}</span></div>
      <div className="mt-3 flex gap-2"><button onClick={() => editMeal(meal)} className="flex-1 rounded-xl bg-white/70 py-2 text-xs font-black dark:bg-white/10">Edit</button><button onClick={() => duplicateMeal(meal)} className="flex-1 rounded-xl bg-white/70 py-2 text-xs font-black dark:bg-white/10">Duplicate</button><button onClick={() => deleteMeal(meal.id)} className="rounded-xl bg-[var(--coral)]/20 px-3 py-2 text-xs font-black">Delete</button></div>
    </motion.article>
  );
}

function EmptyDrop({ day }: { day: string }) {
  return <div className="rounded-[1.5rem] border border-dashed border-[var(--stroke)] p-4 text-center text-sm text-[var(--muted)]">Drop a meal here for {day}, or tap + to create one.</div>;
}

function MonthPlanner({ plans }: { plans: MealPlan[] }) {
  const cells = Array.from({ length: 35 }, (_, index) => index + 1);
  return <Card title="Monthly Meal Calendar"><div className="grid grid-cols-7 gap-2">{cells.map((cell) => { const day = DAYS[cell % 7]; const count = plans.filter((plan) => plan.day === day).length; return <div key={cell} className="min-h-20 rounded-2xl bg-white/45 p-2 dark:bg-white/10"><p className="text-xs font-bold text-[var(--muted)]">{cell}</p>{count > 0 && <div className="mt-2 rounded-full bg-[var(--blush)]/40 px-2 py-1 text-[11px] font-bold">{count} meals</div>}</div>; })}</div></Card>;
}

function Recipes({ recipes, filter, setFilter, toggleFavorite, openCreateMeal }: { recipes: Recipe[]; filter: string; setFilter: (filter: string) => void; toggleFavorite: (id: string) => void; openCreateMeal: (day?: string, recipe?: Recipe) => void }) {
  const [localSearch, setLocalSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const filtered = recipes.filter((recipe) => (filter === "All" || recipe.type === filter || recipe.category === filter) && (difficulty === "All" || recipe.difficulty === difficulty) && `${recipe.title} ${recipe.ingredients.join(" ")}`.toLowerCase().includes(localSearch.toLowerCase()));
  return (
    <div className="space-y-5">
      <PageHero eyebrow="Recipe library" title="Pinterest-pretty meals with nutrition details." text="Search, filter, favorite, review ingredients, scan macros, and schedule any recipe directly into the meal planner." />
      <div className="glass rounded-[2rem] p-4"><div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]"><input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder="Search ingredients or recipes" className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 outline-none dark:bg-white/10" /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 outline-none dark:bg-[#241a20]"><option>All</option>{MEAL_TYPES.map((type) => <option key={type}>{type}</option>)}{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 outline-none dark:bg-[#241a20]"><option>All</option><option>Easy</option><option>Medium</option><option>Chef Mode</option></select></div></div>
      {filtered.length ? <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} toggleFavorite={toggleFavorite} openCreateMeal={openCreateMeal} />)}</section> : <EmptyState icon="🍽️" title="No recipes found" text="Try another search or filter. Your recipe library is ready for new inspiration." />}
    </div>
  );
}

function RecipeCard({ recipe, toggleFavorite, openCreateMeal }: { recipe: Recipe; toggleFavorite: (id: string) => void; openCreateMeal: (day?: string, recipe?: Recipe) => void }) {
  return <motion.article whileHover={{ y: -5 }} className="glass overflow-hidden rounded-[2rem]"><div className="relative h-56"><img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /><button onClick={() => toggleFavorite(recipe.id)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/80 text-xl shadow dark:bg-black/30">{recipe.favorite ? "♥" : "♡"}</button><div className="absolute bottom-4 left-4 right-4 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em]">{recipe.type} • {recipe.category}</p><h3 className="text-2xl font-black leading-tight">{recipe.title}</h3></div></div><div className="p-4"><div className="mb-4 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-white/60 px-3 py-1.5 dark:bg-white/10">⏱ {recipe.time} min</span><span className="rounded-full bg-[var(--sage)]/30 px-3 py-1.5">{recipe.difficulty}</span><span className="rounded-full bg-[var(--coral)]/20 px-3 py-1.5">{recipe.calories} kcal</span></div><div className="grid grid-cols-3 gap-2 text-center text-sm"><NutritionFact label="Protein" value={`${recipe.protein}g`} /><NutritionFact label="Carbs" value={`${recipe.carbs}g`} /><NutritionFact label="Fats" value={`${recipe.fats}g`} /></div><div className="mt-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Ingredients</p><p className="mt-1 text-sm capitalize text-[var(--muted)]">{recipe.ingredients.slice(0, 5).join(" • ")}</p></div><details className="mt-3 rounded-2xl bg-white/45 p-3 dark:bg-white/10"><summary className="cursor-pointer font-black">Preparation steps</summary><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--muted)]">{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol></details><button onClick={() => openCreateMeal(undefined, recipe)} className="mt-4 w-full rounded-2xl bg-[var(--ink)] py-3 font-black text-[var(--cream)]">Add to plan</button></div></motion.article>;
}

function NutritionFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/50 p-3 dark:bg-white/10"><p className="font-black">{value}</p><p className="text-xs text-[var(--muted)]">{label}</p></div>;
}

function Grocery({ groceries, draft, setDraft, addGrocery, setPurchased, removeGrocery }: { groceries: GroceryItem[]; draft: { name: string; category: string }; setDraft: (draft: { name: string; category: string }) => void; addGrocery: () => void; setPurchased: (item: GroceryItem, purchased: boolean) => void; removeGrocery: (item: GroceryItem) => void }) {
  const groups = groceries.reduce<Record<string, GroceryItem[]>>((acc, item) => { acc[item.category] = [...(acc[item.category] ?? []), item]; return acc; }, {});
  const purchased = groceries.filter((item) => item.purchased).length;
  return <div className="space-y-5"><PageHero eyebrow="Grocery list" title="Auto-generated shopping, beautifully organized." text="Ingredients from meal plans become a checklist. Add extras, categorize, mark purchased, and shop offline." /><Card title="Shopping progress"><div className="flex items-center gap-4"><ProgressRing value={clampPercent(purchased, Math.max(1, groceries.length))} color="var(--sage)" label={`${purchased}/${groceries.length}`} size="lg" /><div className="flex-1"><div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Add grocery item" className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 outline-none dark:bg-white/10" /><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 outline-none dark:bg-[#241a20]"><option>Produce</option><option>Protein & Dairy</option><option>Grains</option><option>Pantry</option><option>Beverages</option><option>Wellness</option></select><button onClick={addGrocery} className="rounded-2xl bg-[var(--ink)] px-5 py-3 font-black text-[var(--cream)]">Add</button></div></div></div></Card>{groceries.length ? <section className="grid gap-5 lg:grid-cols-2">{Object.entries(groups).map(([category, items]) => <Card key={category} title={category}>{items.map((item) => <div key={`${item.id}-${item.name}`} className="mb-2 flex items-center gap-3 rounded-[1.25rem] bg-white/50 p-3 dark:bg-white/10"><button onClick={() => setPurchased(item, !item.purchased)} className={`grid h-7 w-7 place-items-center rounded-full border border-[var(--stroke)] ${item.purchased ? "bg-[var(--sage)] text-white" : "bg-white/40"}`}>{item.purchased ? "✓" : ""}</button><span className={`flex-1 capitalize ${item.purchased ? "text-[var(--muted)] line-through" : ""}`}>{item.name}</span><span className="rounded-full bg-white/50 px-2 py-1 text-[11px] font-bold dark:bg-white/10">{item.manual ? "Manual" : "Auto"}</span><button onClick={() => removeGrocery(item)} className="rounded-full bg-[var(--coral)]/20 px-3 py-1 text-xs font-black">Remove</button></div>)}</Card>)}</section> : <EmptyState icon="🛒" title="Your list is sparkling clean" text="Plan meals or add groceries manually to begin." />}</div>;
}

function Nutrition({ data, totals, setData }: { data: AppData; totals: { calories: number; protein: number; carbs: number; fats: number }; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const week = [1640, 1810, 1720, 1960, totals.calories || 1850, 2100, 1780];
  return <div className="space-y-5"><PageHero eyebrow="Nutrition tracker" title="Calm analytics for calories, macros, water, and habits." text="Visualize daily calorie tracking, macronutrient progress, hydration, healthy eating score, weekly reports, and monthly meal statistics." /><section className="grid gap-5 lg:grid-cols-4"><MetricCard title="Calories" value={`${totals.calories}`} suffix="kcal" goal={`${GOALS.calories} target`} color="var(--coral)" percent={clampPercent(totals.calories, GOALS.calories)} icon="🔥" /><MetricCard title="Protein" value={`${totals.protein}`} suffix="g" goal={`${GOALS.protein} target`} color="#b76f88" percent={clampPercent(totals.protein, GOALS.protein)} icon="💪" /><MetricCard title="Water" value={`${data.waterCups}/${GOALS.water}`} suffix="cups" goal="hydration" color="#7fa2e8" percent={clampPercent(data.waterCups, GOALS.water)} icon="💧" /><MetricCard title="Health Score" value={`${data.healthyScore}`} suffix="/100" goal="excellent" color="var(--sage)" percent={data.healthyScore} icon="🌿" /></section><section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><Card title="Weekly Nutrition Report"><div className="flex h-72 items-end gap-2 rounded-[1.5rem] bg-white/45 p-4 dark:bg-white/10">{week.map((value, index) => <div key={DAYS[index]} className="flex flex-1 flex-col items-center gap-2"><motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(14, (value / 2400) * 100)}%` }} className="w-full rounded-t-2xl bg-gradient-to-t from-[var(--coral)] to-[var(--lavender)]" /><span className="text-xs font-bold text-[var(--muted)]">{DAYS[index]}</span></div>)}</div></Card><Card title="Macronutrient Progress"><div className="grid grid-cols-3 gap-3"><MacroRing label="Protein" value={totals.protein} goal={GOALS.protein} color="#b76f88" /><MacroRing label="Carbs" value={totals.carbs} goal={GOALS.carbs} color="#78a98a" /><MacroRing label="Fats" value={totals.fats} goal={GOALS.fats} color="#ee8d7e" /></div><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setData((current) => ({ ...current, waterCups: Math.min(GOALS.water, current.waterCups + 1) }))} className="rounded-2xl bg-[var(--ink)] py-3 font-black text-[var(--cream)]">+ Water cup</button><button onClick={() => setData((current) => ({ ...current, waterCups: Math.max(0, current.waterCups - 1) }))} className="rounded-2xl bg-white/55 py-3 font-black dark:bg-white/10">Undo</button></div></Card></section><Card title="Monthly Meal Statistics & Achievements"><div className="grid gap-3 md:grid-cols-4"><Insight icon="🏅" title="Balanced Plate" text="5 balanced meal days this month." /><Insight icon="🥬" title="Plant Variety" text="22 plant foods rotated." /><Insight icon="💧" title="Hydration" text="Average 6.4 cups daily." /><Insight icon="✨" title="Wellness Insight" text="Protein breakfasts improved snack control." /></div></Card></div>;
}

function CalendarView({ data, moveMeal }: { data: AppData; moveMeal: (mealId: string, day: string) => void }) {
  return <div className="space-y-5"><PageHero eyebrow="Calendar" title="Meal prep, weekly schedule, and reminders at a glance." text="Review upcoming meals, drag items across the weekly calendar, and see prep reminders in one refined overview." /><section className="grid gap-3 lg:grid-cols-7">{DAYS.map((day) => <div key={day} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("meal-id"); if (id) moveMeal(id, day); }} className="glass rounded-[2rem] p-3"><h3 className="mb-3 font-black">{day}</h3><div className="space-y-2">{data.mealPlans.filter((meal) => meal.day === day).map((meal) => <div key={meal.id} draggable onDragStart={(event) => event.dataTransfer.setData("meal-id", meal.id)} className="rounded-2xl bg-white/55 p-3 text-sm dark:bg-white/10"><b>{meal.name}</b><p className="text-xs text-[var(--muted)]">{meal.reminder} • {meal.type}</p></div>)}</div></div>)}</section><section className="grid gap-5 lg:grid-cols-2"><Card title="Meal Prep Calendar"><div className="space-y-3"><ReminderCard reminder={{ id: "p1", meal: "Wash greens", type: "Prep", time: "Sunday 4:00 PM", note: "Prep salad bases for 3 days", active: true }} /><ReminderCard reminder={{ id: "p2", meal: "Defrost Salmon", type: "Prep", time: "Wednesday 8:00 PM", note: "Move salmon to fridge", active: true }} /><ReminderCard reminder={{ id: "p3", meal: "Batch quinoa", type: "Prep", time: "Monday 6:00 PM", note: "Cook 3 servings", active: true }} /></div></Card><Card title="Reminder Overview"><div className="grid gap-3 sm:grid-cols-2">{data.reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)}</div></Card></section></div>;
}

function Profile({ data, updateSettings, installApp, canInstall }: { data: AppData; updateSettings: (settings: Partial<Settings>) => void; installApp: () => void; canInstall: boolean }) {
  const focusOptions = ["Weight Loss", "Weight Gain", "Healthy Eating", "High Protein", "Plant Forward"];
  const toggleFocus = (focus: string) => {
    const next = data.settings.dietaryFocus.includes(focus) ? data.settings.dietaryFocus.filter((item) => item !== focus) : [...data.settings.dietaryFocus, focus];
    updateSettings({ dietaryFocus: next });
  };
  return <div className="space-y-5"><PageHero eyebrow="Profile & settings" title="Welcome back, Kishi 💖" text="Personalize the experience, manage app preferences, review achievements, and install the PWA for daily wellness rituals." /><section className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><Card title="Kishi's Profile"><div className="flex items-center gap-4 rounded-[2rem] bg-gradient-to-br from-[rgba(247,200,210,.55)] to-[rgba(216,193,234,.45)] p-5"><div className="grid h-20 w-20 place-items-center rounded-full bg-white/60 text-4xl shadow">👩🏻‍🍳</div><div><h3 className="text-3xl font-black">Kishi</h3><p className="text-[var(--muted)]">Wellness-focused meal planning</p></div></div><div className="mt-4 flex flex-wrap gap-2">{focusOptions.map((focus) => <button key={focus} onClick={() => toggleFocus(focus)} className={`rounded-full px-4 py-2 text-sm font-black ${data.settings.dietaryFocus.includes(focus) ? "bg-[var(--ink)] text-[var(--cream)]" : "bg-white/55 dark:bg-white/10"}`}>{focus}</button>)}</div></Card><Card title="Settings"><Toggle label="Dark Mode" icon="🌙" checked={data.settings.darkMode} onChange={() => updateSettings({ darkMode: !data.settings.darkMode })} /><Toggle label="Notifications" icon="🔔" checked={data.settings.notifications} onChange={() => updateSettings({ notifications: !data.settings.notifications })} /><Toggle label="Data Export" icon="↥" checked={data.settings.dataExport} onChange={() => updateSettings({ dataExport: !data.settings.dataExport })} /><Toggle label="App Lock" icon="🔒" checked={data.settings.appLock} onChange={() => updateSettings({ appLock: !data.settings.appLock })} />{canInstall && <button onClick={installApp} className="standalone-hidden mt-4 w-full rounded-2xl bg-[var(--ink)] py-3 font-black text-[var(--cream)]">Install Kishi's Kitchen</button>}</Card></section><Card title="Achievement Badges"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Insight icon="🔥" title={`${data.streak}-day streak`} text="Consistent healthy eating." /><Insight icon="💖" title="Self-care chef" text="Logged hydration today." /><Insight icon="🥗" title="Meal prep muse" text="Weekly planner filled." /><Insight icon="🌈" title="Colorful plate" text="Five colors added." /></div></Card><EmptyState icon="✨" title="Beautiful empty states included" text="When a search, list, or planner section has no content, Kishi's Kitchen responds with graceful guidance instead of dead ends." /></div>;
}

function Toggle({ label, icon, checked, onChange }: { label: string; icon: string; checked: boolean; onChange: () => void }) {
  return <button onClick={onChange} className="mb-3 flex w-full items-center gap-3 rounded-[1.5rem] bg-white/50 p-4 text-left dark:bg-white/10"><span className="text-2xl">{icon}</span><span className="flex-1 font-black">{label}</span><span className={`relative h-8 w-14 rounded-full transition ${checked ? "bg-[var(--blush-2)]" : "bg-black/10 dark:bg-white/15"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-7" : "left-1"}`} /></span></button>;
}

function MealModal({ meal, recipes, onClose, onSave }: { meal: MealPlan; recipes: Recipe[]; onClose: () => void; onSave: (meal: MealPlan) => void }) {
  const [draft, setDraft] = useState(meal);
  const syncRecipe = (recipeId: string) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    setDraft((current) => ({ ...current, recipeId, name: recipe.title, type: recipe.type, category: recipe.category, color: recipe.color, calories: recipe.calories, protein: recipe.protein, carbs: recipe.carbs, fats: recipe.fats }));
  };
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-2 backdrop-blur-sm md:place-items-center"><motion.section initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="glass-strong max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[2.25rem] p-5 premium-scroll"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">Add to Plan / Recipe</h2><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/60 text-xl dark:bg-white/10">×</button></div><div className="grid gap-3 md:grid-cols-2"><label className="md:col-span-2"><span className="mb-1 block text-sm font-bold text-[var(--muted)]">Recipe</span><select value={draft.recipeId} onChange={(event) => syncRecipe(event.target.value)} className="w-full rounded-2xl border border-[var(--stroke)] bg-white/65 px-4 py-3 outline-none dark:bg-[#241a20]">{recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title}</option>)}</select></label><Field label="Meal Name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} /><label><span className="mb-1 block text-sm font-bold text-[var(--muted)]">Meal Type</span><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as MealType })} className="w-full rounded-2xl border border-[var(--stroke)] bg-white/65 px-4 py-3 outline-none dark:bg-[#241a20]">{MEAL_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label><label><span className="mb-1 block text-sm font-bold text-[var(--muted)]">Meal Date</span><select value={draft.day} onChange={(event) => setDraft({ ...draft, day: event.target.value })} className="w-full rounded-2xl border border-[var(--stroke)] bg-white/65 px-4 py-3 outline-none dark:bg-[#241a20]">{DAYS.map((day) => <option key={day}>{day}</option>)}</select></label><Field label="Prep Reminder" value={draft.reminder} onChange={(value) => setDraft({ ...draft, reminder: value })} /><Field label="Category" value={draft.category} onChange={(value) => setDraft({ ...draft, category: value })} /><Field label="Label / Badge" value={draft.label} onChange={(value) => setDraft({ ...draft, label: value })} /><NumberField label="Calories" value={draft.calories} onChange={(value) => setDraft({ ...draft, calories: value })} /><NumberField label="Protein" value={draft.protein} onChange={(value) => setDraft({ ...draft, protein: value })} /><NumberField label="Carbs" value={draft.carbs} onChange={(value) => setDraft({ ...draft, carbs: value })} /><NumberField label="Fats" value={draft.fats} onChange={(value) => setDraft({ ...draft, fats: value })} /><label className="md:col-span-2"><span className="mb-1 block text-sm font-bold text-[var(--muted)]">Notes</span><textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={4} placeholder="Notes, prep instructions, or reminders" className="w-full resize-none rounded-2xl border border-[var(--stroke)] bg-white/65 px-4 py-3 outline-none dark:bg-white/10" /></label></div><div className="mt-5 flex gap-3"><button onClick={onClose} className="flex-1 rounded-2xl bg-white/60 py-3 font-black dark:bg-white/10">Cancel</button><button onClick={() => onSave(draft)} className="flex-1 rounded-2xl bg-[var(--ink)] py-3 font-black text-[var(--cream)]">Save meal</button></div></motion.section></motion.div>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="mb-1 block text-sm font-bold text-[var(--muted)]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-[var(--stroke)] bg-white/65 px-4 py-3 outline-none dark:bg-white/10" /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label><span className="mb-1 block text-sm font-bold text-[var(--muted)]">{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-2xl border border-[var(--stroke)] bg-white/65 px-4 py-3 outline-none dark:bg-white/10" /></label>;
}

function PageHero({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) {
  return <section className="glass-strong rounded-[2.25rem] p-5 md:p-7"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--muted)]">{eyebrow}</p><h2 className="mt-2 max-w-4xl text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">{title}</h2><p className="mt-3 max-w-3xl text-[var(--muted)] md:text-lg">{text}</p></div>{action}</div></section>;
}

function Segmented({ value, values, onChange }: { value: string; values: string[]; onChange: (value: string) => void }) {
  return <div className="flex rounded-2xl bg-white/50 p-1 dark:bg-white/10">{values.map((item) => <button key={item} onClick={() => onChange(item)} className={`rounded-xl px-4 py-2 font-black ${value === item ? "bg-[var(--ink)] text-[var(--cream)]" : "text-[var(--muted)]"}`}>{item}</button>)}</div>;
}

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="glass rounded-[2rem] p-8 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[2rem] bg-white/55 text-4xl dark:bg-white/10">{icon}</div><h3 className="mt-4 text-2xl font-black">{title}</h3><p className="mx-auto mt-2 max-w-md text-[var(--muted)]">{text}</p></div>;
}

function LoadingDashboard() {
  return <div className="grid gap-5"><div className="glass-strong rounded-[2.25rem] p-6"><div className="pulse-skeleton h-10 w-2/3 rounded-full" /><div className="mt-4 grid gap-4 md:grid-cols-3"><div className="pulse-skeleton h-40 rounded-[2rem]" /><div className="pulse-skeleton h-40 rounded-[2rem]" /><div className="pulse-skeleton h-40 rounded-[2rem]" /></div></div><div className="grid gap-5 lg:grid-cols-3"><div className="pulse-skeleton h-72 rounded-[2rem]" /><div className="pulse-skeleton h-72 rounded-[2rem]" /><div className="pulse-skeleton h-72 rounded-[2rem]" /></div></div>;
}

function NotificationDrawer({ reminders, close }: { reminders: Reminder[]; close: () => void }) {
  return <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="glass-strong fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-auto p-5 premium-scroll"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Notifications</p><h2 className="text-3xl font-black">Meal reminders</h2></div><button onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-white/60 text-xl dark:bg-white/10">×</button></div><div className="space-y-3">{reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)}</div><div className="mt-5 rounded-[1.5rem] bg-[var(--sage)]/20 p-4"><h3 className="font-black">Daily Health Tip</h3><p className="text-sm text-[var(--muted)]">A glass of water before coffee can make your morning routine feel lighter and more intentional.</p></div></motion.aside>;
}

function Sidebar({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const tabs: { tab: Tab; icon: string }[] = [
    { tab: "Dashboard", icon: "🏠" }, { tab: "Planner", icon: "🗓️" }, { tab: "Recipes", icon: "♡" }, { tab: "Grocery", icon: "🛒" }, { tab: "Nutrition", icon: "◎" }, { tab: "Calendar", icon: "🔔" }, { tab: "Profile", icon: "👤" },
  ];
  return <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-[2.25rem] glass p-4 lg:block"><div className="mb-8 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[var(--blush)] to-[var(--lavender)] text-2xl">👩‍🍳</div><div><p className="font-black">Kishi's Kitchen</p><p className="text-xs text-[var(--muted)]">Daily meal wellness</p></div></div><nav className="space-y-2">{tabs.map((item) => <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-black transition ${activeTab === item.tab ? "bg-[var(--ink)] text-[var(--cream)] shadow-lg" : "hover:bg-white/45 dark:hover:bg-white/10"}`}><span>{item.icon}</span>{item.tab}</button>)}</nav><div className="absolute bottom-4 left-4 right-4 rounded-[1.5rem] bg-white/45 p-4 dark:bg-white/10"><p className="font-black">12-day glow streak 🔥</p><p className="text-sm text-[var(--muted)]">Keep planning for a new badge.</p></div></aside>;
}

function BottomNav({ activeTab, setActiveTab, openCreateMeal }: { activeTab: Tab; setActiveTab: (tab: Tab) => void; openCreateMeal: () => void }) {
  const tabs: { tab: Tab; icon: string }[] = [
    { tab: "Dashboard", icon: "⌂" }, { tab: "Planner", icon: "▤" }, { tab: "Recipes", icon: "♡" }, { tab: "Grocery", icon: "🛒" }, { tab: "Profile", icon: "◌" },
  ];
  return <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 px-3 lg:hidden"><div className="glass-strong mx-auto flex max-w-lg items-center justify-around rounded-t-[2rem] p-2"><button onClick={openCreateMeal} className="absolute left-1/2 top-[-1.6rem] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-[var(--blush-2)] to-[var(--plum)] text-4xl text-white shadow-2xl shadow-pink-900/30">+</button>{tabs.map((item, index) => <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex w-14 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-black ${index === 2 ? "mr-16" : ""} ${activeTab === item.tab ? "text-[var(--plum)]" : "text-[var(--muted)]"}`}><span className="text-xl">{item.icon}</span>{item.tab === "Dashboard" ? "Home" : item.tab}</button>)}</div></nav>;
}

function FloatingAction({ onClick }: { onClick: () => void }) {
  return <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={onClick} className="fixed bottom-8 right-6 z-30 hidden h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[var(--blush-2)] to-[var(--plum)] text-4xl text-white shadow-2xl shadow-pink-900/25 lg:grid" aria-label="Create meal">+</motion.button>;
}

export default App;
