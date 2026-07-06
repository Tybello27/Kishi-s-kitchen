import type { Deck, Flashcard, StudySession, Achievement, DailyChallenge, UserStats, UserSettings, AppData } from './types';

export const STORAGE_KEY = 'flashmaster.data.v1';

const CATEGORIES = ['Science', 'Math', 'Language', 'History', 'Technology', 'Arts', 'Business', 'Medicine', 'Other'];
const SUBJECTS: Record<string, string[]> = {
  Science: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Geology'],
  Math: ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Discrete Math'],
  Language: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin'],
  History: ['World History', 'US History', 'Ancient History', 'Modern History'],
  Technology: ['Programming', 'Web Dev', 'AI/ML', 'Cybersecurity', 'Data Science'],
  Arts: ['Music', 'Visual Arts', 'Literature', 'Film'],
  Business: ['Marketing', 'Finance', 'Management', 'Economics'],
  Medicine: ['Anatomy', 'Pharmacology', 'Pathology', 'Neurology'],
  Other: ['General Knowledge', 'Trivia', 'Personal Development'],
};

const COLOR_THEMES = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-teal-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-emerald-500 to-green-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
];

const SAMPLE_DECKS: { title: string; description: string; category: string; subject: string; colorTheme: string; tags: string[] }[] = [
  { title: 'Quantum Physics', description: 'Fundamental principles of quantum mechanics', category: 'Science', subject: 'Physics', colorTheme: COLOR_THEMES[0], tags: ['physics', 'quantum', 'science'] },
  { title: 'Spanish Basics', description: 'Essential Spanish vocabulary and phrases', category: 'Language', subject: 'Spanish', colorTheme: COLOR_THEMES[1], tags: ['spanish', 'language', 'basics'] },
  { title: 'World Capitals', description: 'Capital cities from around the globe', category: 'Other', subject: 'General Knowledge', colorTheme: COLOR_THEMES[2], tags: ['geography', 'capitals', 'trivia'] },
  { title: 'JavaScript ES6+', description: 'Modern JavaScript features and syntax', category: 'Technology', subject: 'Programming', colorTheme: COLOR_THEMES[3], tags: ['javascript', 'coding', 'web'] },
  { title: 'Human Anatomy', description: 'Major systems and structures of the human body', category: 'Medicine', subject: 'Anatomy', colorTheme: COLOR_THEMES[4], tags: ['anatomy', 'biology', 'medicine'] },
];

const SAMPLE_CARDS: Record<string, { front: string; back: string; difficulty: 'easy' | 'medium' | 'hard' }[]> = {
  'Quantum Physics': [
    { front: 'What is Planck\'s constant (h)?', back: '6.626 × 10⁻³⁴ J·s. It is the quantum of electromagnetic action.', difficulty: 'medium' },
    { front: 'What is the Heisenberg Uncertainty Principle?', back: 'It states that we cannot simultaneously know the exact position and exact momentum of a particle.', difficulty: 'hard' },
    { front: 'What is wave-particle duality?', back: 'The concept that every particle or quantum entity may be described as either a particle or a wave.', difficulty: 'medium' },
    { front: 'What is Schrödinger\'s equation?', back: 'A linear partial differential equation that governs the wave function of a quantum-mechanical system.', difficulty: 'hard' },
    { front: 'What is quantum entanglement?', back: 'A physical phenomenon that occurs when a group of particles are generated or interact in a way such that the quantum state of each particle cannot be described independently.', difficulty: 'medium' },
  ],
  'Spanish Basics': [
    { front: 'Hello', back: 'Hola', difficulty: 'easy' },
    { front: 'Thank you', back: 'Gracias', difficulty: 'easy' },
    { front: 'Good morning', back: 'Buenos días', difficulty: 'easy' },
    { front: 'How are you?', back: '¿Cómo estás?', difficulty: 'easy' },
    { front: 'I don\'t understand', back: 'No entiendo', difficulty: 'medium' },
  ],
  'World Capitals': [
    { front: 'France', back: 'Paris', difficulty: 'easy' },
    { front: 'Japan', back: 'Tokyo', difficulty: 'easy' },
    { front: 'Australia', back: 'Canberra', difficulty: 'medium' },
    { front: 'Brazil', back: 'Brasília', difficulty: 'medium' },
    { front: 'South Africa', back: 'Pretoria (administrative), Cape Town (legislative), Bloemfontein (judicial)', difficulty: 'hard' },
  ],
  'JavaScript ES6+': [
    { front: 'What is destructuring?', back: 'A syntax for unpacking values from arrays or properties from objects into distinct variables.', difficulty: 'easy' },
    { front: 'What is a Promise?', back: 'An object representing the eventual completion or failure of an asynchronous operation.', difficulty: 'medium' },
    { front: 'What does async/await do?', back: 'It allows writing asynchronous code in a synchronous style using the async keyword and await operator.', difficulty: 'medium' },
    { front: 'What is the spread operator?', back: 'The ... syntax allows an iterable to be expanded in places where zero or more arguments or elements are expected.', difficulty: 'easy' },
    { front: 'What is a WeakMap?', back: 'A collection of key/value pairs where keys are objects and values can be arbitrary values, with weak references to keys.', difficulty: 'hard' },
  ],
  'Human Anatomy': [
    { front: 'How many bones are in the adult human body?', back: '206 bones', difficulty: 'easy' },
    { front: 'What is the largest organ in the human body?', back: 'The skin', difficulty: 'easy' },
    { front: 'What does the hippocampus do?', back: 'It plays a major role in learning and memory, particularly in forming new memories.', difficulty: 'medium' },
    { front: 'How many chambers does the heart have?', back: 'Four chambers: two atria and two ventricles.', difficulty: 'easy' },
    { front: 'What is the function of the myelin sheath?', back: 'It insulates nerve fibers and increases the speed of electrical impulse transmission.', difficulty: 'hard' },
  ],
};

const QUOTES = [
  { text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King' },
  { text: 'Education is the passport to the future.', author: 'Malcolm X' },
  { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
  { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
  { text: 'The mind is not a vessel to be filled but a fire to be ignited.', author: 'Plutarch' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
  { text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates' },
];

const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlockedAt'>[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Study your first flashcard', icon: 'footprints', maxProgress: 1 },
  { id: 'on-fire', name: 'On Fire', description: 'Maintain a 7-day streak', icon: 'flame', maxProgress: 7 },
  { id: 'master-scholar', name: 'Master Scholar', description: 'Master 100 flashcards', icon: 'graduation-cap', maxProgress: 100 },
  { id: 'deck-builder', name: 'Deck Builder', description: 'Create 5 decks', icon: 'layers', maxProgress: 5 },
  { id: 'quiz-whiz', name: 'Quiz Whiz', description: 'Score 100% on a quiz', icon: 'target', maxProgress: 1 },
  { id: 'night-owl', name: 'Night Owl', description: 'Study after 10 PM', icon: 'moon', maxProgress: 1 },
  { id: 'early-bird', name: 'Early Bird', description: 'Study before 7 AM', icon: 'sun', maxProgress: 1 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Mark 50 cards as learned', icon: 'check-circle', maxProgress: 50 },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function createDefaultData(): AppData {
  const today = getToday();
  const decks: Deck[] = SAMPLE_DECKS.map((d) => ({
    ...d,
    id: generateId(),
    cardCount: 0,
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const flashcards: Flashcard[] = [];
  decks.forEach((deck) => {
    const cards = SAMPLE_CARDS[deck.title] || [];
    cards.forEach((c) => {
      flashcards.push({
        id: generateId(),
        deckId: deck.id,
        front: c.front,
        back: c.back,
        difficulty: c.difficulty,
        favorite: false,
        starred: false,
        learned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
    deck.cardCount = cards.length;
  });

  const streakHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      completed: i < 3 ? true : Math.random() > 0.6,
    };
  }).reverse();

  return {
    version: '1',
    decks,
    flashcards,
    studySessions: [],
    achievements: ACHIEVEMENTS.map((a) => ({ ...a, progress: 0 })),
    dailyChallenges: [
      { id: generateId(), title: 'Study 10 Cards', description: 'Review 10 flashcards today', target: 10, current: 0, completed: false, xpReward: 50 },
      { id: generateId(), title: 'Master 3 Cards', description: 'Mark 3 cards as learned', target: 3, current: 0, completed: false, xpReward: 75 },
      { id: generateId(), title: 'Complete a Quiz', description: 'Finish a quiz session', target: 1, current: 0, completed: false, xpReward: 100 },
    ],
    userStats: {
      totalCardsStudied: 0,
      totalCardsMastered: 0,
      currentStreak: 3,
      longestStreak: 7,
      totalStudyTime: 0,
      totalXP: 350,
      level: 3,
      accuracy: 78,
      dailyGoal: 20,
      cardsStudiedToday: 0,
      lastStudyDate: today,
      streakHistory,
    },
    userSettings: {
      theme: 'system',
      dailyGoal: 20,
      dailyReminder: true,
      goalReminder: true,
      streakReminder: true,
      weeklyReminder: true,
      reminderTime: '20:00',
      ttsEnabled: true,
      autoPlay: false,
      shuffleMode: false,
    },
    onboardingComplete: false,
    favoriteDecks: [],
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed.version === '1') return parsed;
    }
  } catch {
    // ignore
  }
  const data = createDefaultData();
  saveData(data);
  return data;
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning, Chibest ☀️';
  if (hour < 17) return 'Good Afternoon, Chibest 👋';
  if (hour < 21) return 'Good Evening, Chibest 🌆';
  return 'Welcome back, Chibest 📚';
}

export function getDailyQuote() {
  const index = new Date().getDate() % QUOTES.length;
  return QUOTES[index];
}

export function getLevelForXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function getXPProgress(xp: number): number {
  const level = getLevelForXP(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getCategories(): string[] {
  return CATEGORIES;
}

export function getSubjects(category: string): string[] {
  return SUBJECTS[category] || ['General'];
}

export function getColorThemes(): string[] {
  return COLOR_THEMES;
}

export { generateId, getToday };
