import { motion } from 'framer-motion';
import {
  Flame, Target, BookOpen, Zap, Plus, Play, HelpCircle,
  Star, TrendingUp, Clock, Award, ChevronRight, Sparkles,
  Search, Bell
} from 'lucide-react';
import { useStore } from '../store';
import { getGreeting, getDailyQuote, getXPProgress, formatDuration } from '../utils';
import ProgressRing from '../components/ProgressRing';

export default function Dashboard() {
  const { data, navigate, toggleFavoriteDeck } = useStore();
  const stats = data.userStats;
  const quote = getDailyQuote();
  const goalProgress = Math.min((stats.cardsStudiedToday / stats.dailyGoal) * 100, 100);
  const xpProg = getXPProgress(stats.totalXP);

  const recentDecks = data.decks.slice(0, 4);
  const favoriteDecks = data.decks.filter((d) => data.favoriteDecks.includes(d.id)).slice(0, 4);

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const sessions = data.studySessions.filter((s) => s.date === dateStr);
    const count = sessions.reduce((sum, s) => sum + s.cardsStudied, 0);
    return { day: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()], count };
  });
  const maxCount = Math.max(...weekData.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-20 h-20 rounded-full bg-white" />
          <div className="absolute bottom-8 right-12 w-32 h-32 rounded-full bg-white" />
          <div className="absolute top-16 right-4 w-12 h-12 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-xl font-semibold"
            >
              {getGreeting()}
            </motion.h1>
            <p className="text-white/70 text-sm mt-1">Let's master something new today!</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('search')}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <Search size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center"
          >
            <Flame size={20} className="text-amber-300 mx-auto mb-1" />
            <p className="text-white text-lg font-bold">{stats.currentStreak}</p>
            <p className="text-white/60 text-[10px]">Day Streak</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center"
          >
            <Target size={20} className="text-teal-300 mx-auto mb-1" />
            <p className="text-white text-lg font-bold">{stats.cardsStudiedToday}</p>
            <p className="text-white/60 text-[10px]">Today's Cards</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center"
          >
            <Zap size={20} className="text-yellow-300 mx-auto mb-1" />
            <p className="text-white text-lg font-bold">{stats.totalXP}</p>
            <p className="text-white/60 text-[10px]">Total XP</p>
          </motion.div>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-20">
        {/* Daily Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Daily Goal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stats.cardsStudiedToday} / {stats.dailyGoal} cards
              </p>
            </div>
            <ProgressRing progress={goalProgress} size={56} strokeWidth={5} color="#4f46e5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(goalProgress)}%</span>
            </ProgressRing>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('create-deck')}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Plus size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Create Deck</span>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => data.decks.length > 0 && navigate('study', { deckId: data.decks[0].id })}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Play size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Study Now</span>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => data.decks.length > 0 && navigate('quiz', { deckId: data.decks[0].id })}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <HelpCircle size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Quiz Mode</span>
          </motion.button>
        </div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mt-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Weekly Progress</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{weekData.reduce((s, d) => s + d.count, 0)} cards</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.08 }}
                  className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 min-h-[4px]"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Continue Studying */}
        {recentDecks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Continue Studying</h3>
              <button onClick={() => navigate('decks')} className="text-xs text-primary-600 dark:text-primary-400 font-medium">See All</button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {recentDecks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => navigate('study', { deckId: deck.id })}
                  className="flex-shrink-0 w-36 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deck.colorTheme} flex items-center justify-center mb-3`}>
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{deck.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{deck.cardCount} cards</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Decks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Decks</h3>
            <button onClick={() => navigate('decks')} className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-0.5">
              See All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {data.decks.slice(0, 3).map((deck, i) => (
              <motion.button
                key={deck.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                onClick={() => navigate('deck-detail', { deckId: deck.id })}
                className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deck.colorTheme} flex items-center justify-center flex-shrink-0`}>
                  <BookOpen size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{deck.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{deck.category} • {deck.cardCount} cards</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavoriteDeck(deck.id); }}
                  className="p-2"
                >
                  <Star
                    size={18}
                    className={data.favoriteDecks.includes(deck.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}
                  />
                </button>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Favorite Decks */}
        {favoriteDecks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Favorite Decks</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {favoriteDecks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => navigate('study', { deckId: deck.id })}
                  className="flex-shrink-0 w-32 bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 text-left"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${deck.colorTheme} flex items-center justify-center mb-2`}>
                    <Star size={14} className="text-white" />
                  </div>
                  <p className="font-medium text-xs text-slate-900 dark:text-white truncate">{deck.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{deck.cardCount} cards</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mt-4"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Learning Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={14} className="text-primary-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Studied</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalCardsStudied}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-teal-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Mastered</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalCardsMastered}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-purple-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Accuracy</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.accuracy}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-amber-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Study Time</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatDuration(stats.totalStudyTime)}</p>
            </div>
          </div>
        </motion.div>

        {/* Level & XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl p-5 shadow-lg mt-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs">Level {stats.level}</p>
              <p className="text-white text-2xl font-bold">{stats.totalXP} XP</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={28} className="text-yellow-300" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-white/70 text-[10px] mb-1">
              <span>Level {stats.level}</span>
              <span>Level {stats.level + 1}</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-yellow-300"
                initial={{ width: 0 }}
                animate={{ width: `${xpProg}%` }}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Daily Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{quote.text}"</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">— {quote.author}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
