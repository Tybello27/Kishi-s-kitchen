import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Layers, Trophy, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../store';

const slides = [
  {
    icon: Sparkles,
    title: 'Smart Learning',
    description: 'AI-powered spaced repetition helps you remember more with less effort.',
    color: 'from-blue-500 to-indigo-600',
    bgIcon: '✨',
  },
  {
    icon: Layers,
    title: 'Beautiful Flashcards',
    description: 'Create stunning flashcards with images, notes, and custom formatting.',
    color: 'from-purple-500 to-pink-600',
    bgIcon: '📚',
  },
  {
    icon: Brain,
    title: 'Quiz Mode',
    description: 'Test your knowledge with multiple choice, true/false, and fill-in-the-blank quizzes.',
    color: 'from-teal-500 to-cyan-600',
    bgIcon: '🧠',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Visualize your learning journey with detailed statistics and insights.',
    color: 'from-amber-500 to-orange-600',
    bgIcon: '📈',
  },
  {
    icon: Trophy,
    title: 'Achievements',
    description: 'Earn badges, maintain streaks, and level up as you master new topics.',
    color: 'from-rose-500 to-red-600',
    bgIcon: '🏆',
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useStore();
  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-8">
              <div className={`w-40 h-40 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl`}>
                <Icon size={64} className="text-white" />
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 text-4xl"
              >
                {slide.bgIcon}
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">{slide.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xs leading-relaxed">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-12 pt-4">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-colors ${
                i === index ? 'bg-primary-500 w-8' : 'bg-slate-200 dark:bg-slate-700 w-2'
              }`}
              animate={{ width: i === index ? 32 : 8 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (index < slides.length - 1) setIndex(index + 1);
            else completeOnboarding();
          }}
          className={`w-full py-4 rounded-2xl font-semibold text-white text-lg shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r ${slide.color} hover:opacity-90 transition-opacity`}
        >
          {index < slides.length - 1 ? (
            <>
              Next <ChevronRight size={20} />
            </>
          ) : (
            'Get Started'
          )}
        </button>
      </div>
    </div>
  );
}
