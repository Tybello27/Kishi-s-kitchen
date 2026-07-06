export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  image?: string;
  notes?: string;
  difficulty: Difficulty;
  favorite: boolean;
  starred: boolean;
  learned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  colorTheme: string;
  tags: string[];
  cardCount: number;
  lastStudied?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  date: string;
  deckId: string;
  cardsStudied: number;
  correctAnswers: number;
  duration: number;
  xpEarned: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  xpReward: number;
}

export interface UserStats {
  totalCardsStudied: number;
  totalCardsMastered: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  totalXP: number;
  level: number;
  accuracy: number;
  dailyGoal: number;
  cardsStudiedToday: number;
  lastStudyDate: string;
  streakHistory: { date: string; completed: boolean }[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  dailyGoal: number;
  dailyReminder: boolean;
  goalReminder: boolean;
  streakReminder: boolean;
  weeklyReminder: boolean;
  reminderTime: string;
  ttsEnabled: boolean;
  autoPlay: boolean;
  shuffleMode: boolean;
}

export interface AppData {
  version: string;
  decks: Deck[];
  flashcards: Flashcard[];
  studySessions: StudySession[];
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  userStats: UserStats;
  userSettings: UserSettings;
  onboardingComplete: boolean;
  favoriteDecks: string[];
}

export type Page =
  | 'onboarding'
  | 'dashboard'
  | 'decks'
  | 'deck-detail'
  | 'create-deck'
  | 'edit-deck'
  | 'create-card'
  | 'edit-card'
  | 'study'
  | 'quiz'
  | 'progress'
  | 'calendar'
  | 'search'
  | 'profile'
  | 'settings'
  | 'achievements';
