import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Settings, Moon, Sun, Bell, Download, Upload,
  Trash2, Award, Flame, BookOpen, Layers, Sparkles, ChevronRight,
  Target, Clock, User, X, CheckCircle, Lock
} from 'lucide-react';
import { useStore } from '../store';
import { formatDuration, getXPProgress, getLevelForXP } from '../utils';
import ProgressRing from '../components/ProgressRing';

export default function Profile() {
  const { currentPage, navigate, goBack } = useStore();

  if (currentPage === 'settings') return <SettingsPage />;
  if (currentPage === 'achievements') return <AchievementsPage />;
  return <ProfilePage />;
}

function ProfilePage() {
  const { data, navigate } = useStore();
  const stats = data.userStats;
  const xpProg = getXPProgress(stats.totalXP);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Achievements</h1>
        <button onClick={() => navigate('settings')} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <Settings size={18} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            C
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chibest</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Level {stats.level} Scholar</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Level {stats.level}</span>
            <span>{stats.totalXP} XP</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full gradient-primary" initial={{ width: 0 }} animate={{ width: `${xpProg}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <Flame size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.currentStreak}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Streak</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <Layers size={20} className="text-primary-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">{data.decks.length}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Decks</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <BookOpen size={20} className="text-teal-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">{data.flashcards.length}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Cards</p>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Achievements & Badges</h3>
          <button onClick={() => navigate('achievements')} className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-0.5">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {data.achievements.slice(0, 5).map((a) => (
            <div key={a.id} className={`flex-shrink-0 w-16 text-center p-2 rounded-xl ${a.unlockedAt ? 'bg-primary-50 dark:bg-primary-900/10' : 'bg-slate-50 dark:bg-slate-800/50 opacity-50'}`}>
              <div className={`w-10 h-10 rounded-lg mx-auto mb-1 flex items-center justify-center ${a.unlockedAt ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                <Award size={16} />
              </div>
              <p className="text-[9px] font-medium text-slate-700 dark:text-slate-300 truncate">{a.name}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Settings</h3>
        <div className="space-y-3">
          <button onClick={() => navigate('settings')} className="w-full flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Notifications & Reminders</span>
            </div>
            <div className={`w-10 h-5 rounded-full ${data.userSettings.dailyReminder ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${data.userSettings.dailyReminder ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
          <button onClick={() => navigate('settings')} className="w-full flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Dark Mode Support</span>
            </div>
            <div className={`w-10 h-5 rounded-full ${data.userSettings.theme === 'dark' ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${data.userSettings.theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
        <button onClick={() => navigate('settings')} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User size={16} className="text-slate-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Account Settings</span>
          </div>
          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
        </button>
      </motion.div>
    </div>
  );
}

function AchievementsPage() {
  const { goBack, data } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Achievements</h1>
      </div>
      <div className="space-y-3">
        {data.achievements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border ${
              a.unlockedAt ? 'border-primary-200 dark:border-primary-800' : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                a.unlockedAt ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {a.unlockedAt ? <Award size={22} /> : <Lock size={22} />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{a.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{a.description}</p>
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${a.unlockedAt ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`} style={{ width: `${Math.min((a.progress / a.maxProgress) * 100, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{a.progress} / {a.maxProgress}</p>
                </div>
              </div>
              {a.unlockedAt && (
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { goBack, data, updateSettings, resetProgress } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = themes.indexOf(data.userSettings.theme);
    updateSettings({ theme: themes[(idx + 1) % 3] });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashmaster-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          localStorage.setItem('flashmaster.data.v1', JSON.stringify(parsed));
          window.location.reload();
        } catch {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Appearance</h3>
          <button onClick={toggleTheme} className="w-full flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {data.userSettings.theme === 'dark' ? <Moon size={16} className="text-slate-400" /> : <Sun size={16} className="text-slate-400" />}
              <span className="text-sm text-slate-700 dark:text-slate-300">Theme</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{data.userSettings.theme}</span>
          </button>
        </div>

        {/* Study Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Study Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-300">Daily Goal</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateSettings({ dailyGoal: Math.max(5, data.userSettings.dailyGoal - 5) })} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">-</button>
                <span className="text-sm font-medium w-8 text-center">{data.userSettings.dailyGoal}</span>
                <button onClick={() => updateSettings({ dailyGoal: data.userSettings.dailyGoal + 5 })} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">+</button>
              </div>
            </div>
            <button onClick={() => updateSettings({ ttsEnabled: !data.userSettings.ttsEnabled })} className="w-full flex items-center justify-between py-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">Text-to-Speech</span>
              <div className={`w-10 h-5 rounded-full ${data.userSettings.ttsEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'} relative transition-colors`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${data.userSettings.ttsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
            <button onClick={() => updateSettings({ autoPlay: !data.userSettings.autoPlay })} className="w-full flex items-center justify-between py-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">Auto Play</span>
              <div className={`w-10 h-5 rounded-full ${data.userSettings.autoPlay ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'} relative transition-colors`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${data.userSettings.autoPlay ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
            <button onClick={() => updateSettings({ shuffleMode: !data.userSettings.shuffleMode })} className="w-full flex items-center justify-between py-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">Shuffle Mode</span>
              <div className={`w-10 h-5 rounded-full ${data.userSettings.shuffleMode ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'} relative transition-colors`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${data.userSettings.shuffleMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'dailyReminder' as const, label: 'Daily Study Reminder' },
              { key: 'goalReminder' as const, label: 'Goal Reminder' },
              { key: 'streakReminder' as const, label: 'Streak Reminder' },
              { key: 'weeklyReminder' as const, label: 'Weekly Progress' },
            ].map((item) => (
              <button key={item.key} onClick={() => updateSettings({ [item.key]: !data.userSettings[item.key] })} className="w-full flex items-center justify-between py-2">
                <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                <div className={`w-10 h-5 rounded-full ${data.userSettings[item.key] ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'} relative transition-colors`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${data.userSettings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Data</h3>
          <div className="space-y-3">
            <button onClick={exportData} className="w-full flex items-center gap-3 py-2">
              <Download size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Export Data</span>
            </button>
            <button onClick={importData} className="w-full flex items-center gap-3 py-2">
              <Upload size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Import Data</span>
            </button>
            <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3 py-2">
              <Trash2 size={16} className="text-rose-400" />
              <span className="text-sm text-rose-500">Reset Progress</span>
            </button>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reset Progress?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">This will erase all your decks, cards, and stats. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm">Cancel</button>
              <button onClick={() => { resetProgress(); setShowResetConfirm(false); }} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-medium text-sm">Reset</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
