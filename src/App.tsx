import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider, useStore } from './store';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Decks from './pages/Decks';
import StudyMode from './pages/StudyMode';
import QuizMode from './pages/QuizMode';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import type { Page } from './types';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data } = useStore();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    data.userSettings.theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : data.userSettings.theme
  );

  useEffect(() => {
    const t = data.userSettings.theme;
    if (t === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      setTheme(t);
    }
  }, [data.userSettings.theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isIOS && !isStandalone) {
      setShowIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (showPrompt) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-20 left-4 right-4 z-50 glass-strong rounded-2xl p-4 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white text-xl font-bold">F</div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Install FlashMaster</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add to your home screen for quick access</p>
          </div>
          <button onClick={handleInstall} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">Install</button>
          <button onClick={() => setShowPrompt(false)} className="p-2 text-slate-400"><span className="sr-only">Close</span>✕</button>
        </div>
      </motion.div>
    );
  }

  if (showIOS) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-20 left-4 right-4 z-50 glass-strong rounded-2xl p-4 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl">📲</div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Add FlashMaster to Home Screen</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tap the share button, then "Add to Home Screen"</p>
          </div>
          <button onClick={() => setShowIOS(false)} className="p-2 text-slate-400">✕</button>
        </div>
      </motion.div>
    );
  }

  return null;
}

function Router() {
  const { currentPage, pageParams } = useStore();

  const pages: Record<Page, React.ReactNode> = {
    onboarding: <Onboarding />,
    dashboard: <Dashboard />,
    decks: <Decks />,
    'deck-detail': <Decks />,
    'create-deck': <Decks />,
    'edit-deck': <Decks />,
    'create-card': <Decks />,
    'edit-card': <Decks />,
    study: <StudyMode />,
    quiz: <QuizMode />,
    progress: <Progress />,
    calendar: <Progress />,
    search: <Decks />,
    profile: <Profile />,
    settings: <Profile />,
    achievements: <Profile />,
  };

  const showNav = currentPage !== 'onboarding' && currentPage !== 'study' && currentPage !== 'quiz';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage + JSON.stringify(pageParams)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {pages[currentPage] || <Dashboard />}
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav />}
      <PWAInstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </StoreProvider>
  );
}
