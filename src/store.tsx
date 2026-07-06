import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppData, Deck, Flashcard, Page, UserSettings, UserStats, StudySession, Achievement, DailyChallenge } from './types';
import { loadData, saveData, generateId, getToday, getLevelForXP } from './utils';

interface StoreContextType {
  data: AppData;
  currentPage: Page;
  pageParams: Record<string, string>;
  navigate: (page: Page, params?: Record<string, string>) => void;
  goBack: () => void;
  history: Page[];
  addDeck: (deck: Omit<Deck, 'id' | 'cardCount' | 'createdAt' | 'updatedAt'>) => Deck;
  updateDeck: (deck: Deck) => void;
  deleteDeck: (deckId: string) => void;
  duplicateDeck: (deckId: string) => void;
  toggleFavoriteDeck: (deckId: string) => void;
  addCard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>) => Flashcard;
  updateCard: (card: Flashcard) => void;
  deleteCard: (cardId: string) => void;
  toggleFavoriteCard: (cardId: string) => void;
  toggleLearnedCard: (cardId: string) => void;
  setCardDifficulty: (cardId: string, difficulty: Flashcard['difficulty']) => void;
  recordStudySession: (session: Omit<StudySession, 'id'>) => void;
  updateStats: (updates: Partial<UserStats>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  completeOnboarding: () => void;
  resetProgress: () => void;
  getDeckCards: (deckId: string) => Flashcard[];
  getDeckById: (deckId: string) => Deck | undefined;
  getCardById: (cardId: string) => Flashcard | undefined;
  searchCards: (query: string) => Flashcard[];
  checkAchievements: () => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [currentPage, setCurrentPage] = useState<Page>(data.onboardingComplete ? 'dashboard' : 'onboarding');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Page[]>([]);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const navigate = useCallback((page: Page, params?: Record<string, string>) => {
    setHistory((h) => [...h, currentPage]);
    setCurrentPage(page);
    setPageParams(params || {});
  }, [currentPage]);

  const goBack = useCallback(() => {
    setHistory((h) => {
      const newHistory = [...h];
      const prev = newHistory.pop();
      if (prev) setCurrentPage(prev);
      return newHistory;
    });
  }, []);

  const addDeck = useCallback((deck: Omit<Deck, 'id' | 'cardCount' | 'createdAt' | 'updatedAt'>) => {
    const newDeck: Deck = {
      ...deck,
      id: generateId(),
      cardCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, decks: [newDeck, ...d.decks] }));
    return newDeck;
  }, []);

  const updateDeck = useCallback((deck: Deck) => {
    setData((d) => ({
      ...d,
      decks: d.decks.map((de) => (de.id === deck.id ? { ...deck, updatedAt: new Date().toISOString() } : de)),
    }));
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setData((d) => ({
      ...d,
      decks: d.decks.filter((de) => de.id !== deckId),
      flashcards: d.flashcards.filter((c) => c.deckId !== deckId),
    }));
  }, []);

  const duplicateDeck = useCallback((deckId: string) => {
    setData((d) => {
      const deck = d.decks.find((de) => de.id === deckId);
      if (!deck) return d;
      const newDeck: Deck = {
        ...deck,
        id: generateId(),
        title: `${deck.title} (Copy)`,
        cardCount: 0,
        lastStudied: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const cards = d.flashcards
        .filter((c) => c.deckId === deckId)
        .map((c) => ({
          ...c,
          id: generateId(),
          deckId: newDeck.id,
          learned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      newDeck.cardCount = cards.length;
      return {
        ...d,
        decks: [newDeck, ...d.decks],
        flashcards: [...cards, ...d.flashcards],
      };
    });
  }, []);

  const toggleFavoriteDeck = useCallback((deckId: string) => {
    setData((d) => {
      const isFav = d.favoriteDecks.includes(deckId);
      return {
        ...d,
        decks: d.decks.map((de) => (de.id === deckId ? { ...de, favorite: !isFav } : de)),
        favoriteDecks: isFav ? d.favoriteDecks.filter((id) => id !== deckId) : [...d.favoriteDecks, deckId],
      };
    });
  }, []);

  const addCard = useCallback((card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCard: Flashcard = {
      ...card,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((d) => ({
      ...d,
      flashcards: [newCard, ...d.flashcards],
      decks: d.decks.map((de) =>
        de.id === card.deckId ? { ...de, cardCount: de.cardCount + 1, updatedAt: new Date().toISOString() } : de
      ),
    }));
    return newCard;
  }, []);

  const updateCard = useCallback((card: Flashcard) => {
    setData((d) => ({
      ...d,
      flashcards: d.flashcards.map((c) => (c.id === card.id ? { ...card, updatedAt: new Date().toISOString() } : c)),
    }));
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setData((d) => {
      const card = d.flashcards.find((c) => c.id === cardId);
      if (!card) return d;
      return {
        ...d,
        flashcards: d.flashcards.filter((c) => c.id !== cardId),
        decks: d.decks.map((de) =>
          de.id === card.deckId ? { ...de, cardCount: Math.max(0, de.cardCount - 1) } : de
        ),
      };
    });
  }, []);

  const toggleFavoriteCard = useCallback((cardId: string) => {
    setData((d) => ({
      ...d,
      flashcards: d.flashcards.map((c) => (c.id === cardId ? { ...c, favorite: !c.favorite } : c)),
    }));
  }, []);

  const toggleLearnedCard = useCallback((cardId: string) => {
    setData((d) => {
      const card = d.flashcards.find((c) => c.id === cardId);
      const newLearned = !card?.learned;
      return {
        ...d,
        flashcards: d.flashcards.map((c) => (c.id === cardId ? { ...c, learned: newLearned } : c)),
        userStats: {
          ...d.userStats,
          totalCardsMastered: newLearned ? d.userStats.totalCardsMastered + 1 : Math.max(0, d.userStats.totalCardsMastered - 1),
        },
      };
    });
  }, []);

  const setCardDifficulty = useCallback((cardId: string, difficulty: Flashcard['difficulty']) => {
    setData((d) => ({
      ...d,
      flashcards: d.flashcards.map((c) => (c.id === cardId ? { ...c, difficulty } : c)),
    }));
  }, []);

  const recordStudySession = useCallback((session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = { ...session, id: generateId() };
    setData((d) => {
      const today = getToday();
      const isToday = session.date === today;
      const newStreak = d.userStats.lastStudyDate === today ? d.userStats.currentStreak :
        d.userStats.lastStudyDate === getYesterday() ? d.userStats.currentStreak + 1 : 1;
      
      const streakHistory = d.userStats.streakHistory.map((sh) =>
        sh.date === today ? { ...sh, completed: true } : sh
      );
      if (!streakHistory.find((sh) => sh.date === today)) {
        streakHistory.push({ date: today, completed: true });
      }

      return {
        ...d,
        studySessions: [newSession, ...d.studySessions],
        userStats: {
          ...d.userStats,
          totalCardsStudied: d.userStats.totalCardsStudied + session.cardsStudied,
          totalStudyTime: d.userStats.totalStudyTime + session.duration,
          totalXP: d.userStats.totalXP + session.xpEarned,
          level: getLevelForXP(d.userStats.totalXP + session.xpEarned),
          currentStreak: newStreak,
          longestStreak: Math.max(d.userStats.longestStreak, newStreak),
          cardsStudiedToday: isToday ? d.userStats.cardsStudiedToday + session.cardsStudied : session.cardsStudied,
          lastStudyDate: today,
          streakHistory,
        },
      };
    });
  }, []);

  const updateStats = useCallback((updates: Partial<UserStats>) => {
    setData((d) => ({
      ...d,
      userStats: { ...d.userStats, ...updates },
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    setData((d) => ({
      ...d,
      userSettings: { ...d.userSettings, ...settings },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setData((d) => ({ ...d, onboardingComplete: true }));
    setCurrentPage('dashboard');
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = loadData();
    fresh.onboardingComplete = true;
    setData(fresh);
  }, []);

  const getDeckCards = useCallback(
    (deckId: string) => data.flashcards.filter((c) => c.deckId === deckId),
    [data.flashcards]
  );

  const getDeckById = useCallback(
    (deckId: string) => data.decks.find((d) => d.id === deckId),
    [data.decks]
  );

  const getCardById = useCallback(
    (cardId: string) => data.flashcards.find((c) => c.id === cardId),
    [data.flashcards]
  );

  const searchCards = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return data.flashcards.filter(
        (c) =>
          c.front.toLowerCase().includes(q) ||
          c.back.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q)
      );
    },
    [data.flashcards]
  );

  const checkAchievements = useCallback(() => {
    setData((d) => {
      const newAchievements = d.achievements.map((a) => {
        let progress = a.progress;
        if (a.id === 'first-steps' && d.userStats.totalCardsStudied > 0) progress = 1;
        if (a.id === 'on-fire') progress = Math.min(d.userStats.currentStreak, a.maxProgress);
        if (a.id === 'master-scholar') progress = Math.min(d.userStats.totalCardsMastered, a.maxProgress);
        if (a.id === 'deck-builder') progress = Math.min(d.decks.length, a.maxProgress);
        if (a.id === 'perfectionist') progress = Math.min(d.userStats.totalCardsMastered, a.maxProgress);
        const wasUnlocked = !!a.unlockedAt;
        const isUnlocked = progress >= a.maxProgress;
        return {
          ...a,
          progress,
          unlockedAt: !wasUnlocked && isUnlocked ? new Date().toISOString() : a.unlockedAt,
        };
      });
      return { ...d, achievements: newAchievements };
    });
  }, []);

  const updateChallengeProgress = useCallback((challengeId: string, progress: number) => {
    setData((d) => ({
      ...d,
      dailyChallenges: d.dailyChallenges.map((c) =>
        c.id === challengeId
          ? { ...c, current: Math.min(progress, c.target), completed: progress >= c.target }
          : c
      ),
    }));
  }, []);

  const value: StoreContextType = {
    data,
    currentPage,
    pageParams,
    navigate,
    goBack,
    history,
    addDeck,
    updateDeck,
    deleteDeck,
    duplicateDeck,
    toggleFavoriteDeck,
    addCard,
    updateCard,
    deleteCard,
    toggleFavoriteCard,
    toggleLearnedCard,
    setCardDifficulty,
    recordStudySession,
    updateStats,
    updateSettings,
    completeOnboarding,
    resetProgress,
    getDeckCards,
    getDeckById,
    getCardById,
    searchCards,
    checkAchievements,
    updateChallengeProgress,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
