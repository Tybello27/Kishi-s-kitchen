import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Shuffle, Volume2,
  Star, CheckCircle, Heart, Maximize2, Minimize2, Clock,
  RotateCcw, Play, Pause
} from 'lucide-react';
import { useStore } from '../store';
import { formatDuration } from '../utils';

export default function StudyMode() {
  const { pageParams, goBack, getDeckById, getDeckCards, toggleFavoriteCard, toggleLearnedCard, setCardDifficulty, recordStudySession, data } = useStore();
  const deck = getDeckById(pageParams.deckId);
  const allCards = getDeckCards(pageParams.deckId);
  const [cards, setCards] = useState(allCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffle, setShuffle] = useState(data.userSettings.shuffleMode);
  const [autoPlay, setAutoPlay] = useState(data.userSettings.autoPlay);
  const [fullscreen, setFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [studiedCount, setStudiedCount] = useState(0);
  const [sessionStart] = useState(Date.now());
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let shuffled = [...allCards];
    if (shuffle) shuffled = shuffled.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setFlipped(false);
  }, [allCards, shuffle]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoPlay && flipped) {
      autoPlayRef.current = setTimeout(() => {
        goNext();
      }, 3000);
    }
    return () => { if (autoPlayRef.current) clearTimeout(autoPlayRef.current); };
  }, [autoPlay, flipped, index]);

  const currentCard = cards[index];
  const progress = cards.length > 0 ? ((index + (flipped ? 1 : 0)) / (cards.length * 2)) * 100 : 0;

  const goNext = useCallback(() => {
    if (index < cards.length - 1) {
      setFlipped(false);
      setIndex((i) => i + 1);
      setStudiedCount((c) => c + 1);
    }
  }, [index, cards.length]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setIndex((i) => i - 1);
    }
  }, [index]);

  const handleFlip = () => setFlipped((f) => !f);

  const speak = (text: string) => {
    if (!data.userSettings.ttsEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const finishSession = () => {
    const duration = Math.floor((Date.now() - sessionStart) / 1000);
    recordStudySession({
      date: new Date().toISOString().split('T')[0],
      deckId: deck?.id || '',
      cardsStudied: studiedCount,
      correctAnswers: studiedCount,
      duration,
      xpEarned: studiedCount * 5,
    });
    goBack();
  };

  if (!deck || cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <RotateCcw size={32} className="text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">No cards in this deck</p>
        <button onClick={goBack} className="mt-4 px-6 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium">Go Back</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">{deck.title}</p>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{index + 1} / {cards.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <Clock size={12} /> {formatDuration(timer)}
          </div>
          <button onClick={() => setFullscreen(!fullscreen)} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            {fullscreen ? <Minimize2 size={18} className="text-slate-600 dark:text-slate-400" /> : <Maximize2 size={18} className="text-slate-600 dark:text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 mb-4">
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full gradient-primary" animate={{ width: `${(index / cards.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center px-5 py-4">
        <div className="perspective-1000 w-full max-w-md">
          <motion.div
            onClick={handleFlip}
            className="preserve-3d relative w-full aspect-[4/5] cursor-pointer"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Front */}
            <div className="backface-hidden absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deck.colorTheme} flex items-center justify-center mb-6`}>
                <span className="text-white text-lg font-bold">Q</span>
              </div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">{currentCard.front}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">Tap to flip</p>
            </div>
            {/* Back */}
            <div className="backface-hidden absolute inset-0 rotate-y-180 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">{currentCard.back}</p>
              {currentCard.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">{currentCard.notes}</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 pb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => speak(currentCard.front)} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <Volume2 size={18} />
          </button>
          <button onClick={() => setShuffle(!shuffle)} className={`p-3 rounded-xl border ${shuffle ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
            <Shuffle size={18} />
          </button>
          <button onClick={() => setAutoPlay(!autoPlay)} className={`p-3 rounded-xl border ${autoPlay ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {autoPlay ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => toggleFavoriteCard(currentCard.id)} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Heart size={18} className={currentCard.favorite ? 'text-rose-500 fill-rose-500' : 'text-slate-600 dark:text-slate-400'} />
          </button>
          <button onClick={() => toggleLearnedCard(currentCard.id)} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <CheckCircle size={18} className={currentCard.learned ? 'text-teal-500' : 'text-slate-600 dark:text-slate-400'} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={goPrev} disabled={index === 0} className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center disabled:opacity-30">
            <ChevronLeft size={24} className="text-slate-700 dark:text-slate-300" />
          </button>
          <button onClick={goNext} disabled={index === cards.length - 1} className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary-600/20 disabled:opacity-30">
            <ChevronRight size={28} className="text-white" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setCardDifficulty(currentCard.id, d)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                currentCard.difficulty === d
                  ? d === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    d === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {index === cards.length - 1 && flipped && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={finishSession}
            className="w-full mt-4 py-3 rounded-2xl bg-teal-600 text-white font-semibold shadow-lg"
          >
            Finish Session
          </motion.button>
        )}
      </div>
    </div>
  );
}
