import { motion } from 'framer-motion';
import { Home, Layers, BookOpen, BarChart3, User } from 'lucide-react';
import { useStore } from '../store';
import type { Page } from '../types';

const navItems: { page: Page; label: string; icon: typeof Home }[] = [
  { page: 'dashboard', label: 'Home', icon: Home },
  { page: 'decks', label: 'Decks', icon: Layers },
  { page: 'study', label: 'Study', icon: BookOpen },
  { page: 'progress', label: 'Progress', icon: BarChart3 },
  { page: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const { currentPage, navigate } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-slate-200/50 dark:border-slate-700/30 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
