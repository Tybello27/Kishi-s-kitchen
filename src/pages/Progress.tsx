import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, Clock, Target, Flame, Award,
  BookOpen, Calendar, ChevronRight, BarChart3
} from 'lucide-react';
import { useStore } from '../store';
import { formatDuration, getToday } from '../utils';
import ProgressRing from '../components/ProgressRing';

export default function Progress() {
  const { currentPage, pageParams, navigate, goBack, data } = useStore();

  if (currentPage === 'calendar') return <CalendarPage />;
  return <ProgressDashboard />;
}

function ProgressDashboard() {
  const { data, navigate } = useStore();
  const stats = data.userStats;
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const chartData = useMemo(() => {
    if (period === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const sessions = data.studySessions.filter((s) => s.date === dateStr);
        return {
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          studied: sessions.reduce((sum, s) => sum + s.cardsStudied, 0),
          time: sessions.reduce((sum, s) => sum + s.duration, 0),
        };
      });
    }
    return Array.from({ length: 4 }, (_, i) => {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const sessions = data.studySessions.filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      });
      return {
        label: `W${4 - i}`,
        studied: sessions.reduce((sum, s) => sum + s.cardsStudied, 0),
        time: sessions.reduce((sum, s) => sum + s.duration, 0),
      };
    }).reverse();
  }, [data.studySessions, period]);

  const maxStudied = Math.max(...chartData.map((d) => d.studied), 1);

  const diffDistribution = useMemo(() => {
    const easy = data.flashcards.filter((c) => c.difficulty === 'easy').length;
    const medium = data.flashcards.filter((c) => c.difficulty === 'medium').length;
    const hard = data.flashcards.filter((c) => c.difficulty === 'hard').length;
    const total = easy + medium + hard || 1;
    return [
      { label: 'Easy', value: easy, pct: (easy / total) * 100, color: 'bg-green-500' },
      { label: 'Medium', value: medium, pct: (medium / total) * 100, color: 'bg-amber-500' },
      { label: 'Hard', value: hard, pct: (hard / total) * 100, color: 'bg-rose-500' },
    ];
  }, [data.flashcards]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Insights & Progress</h1>
        <button onClick={() => navigate('calendar')} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <Calendar size={18} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-primary-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Weekly Goal</span>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing progress={Math.min((stats.cardsStudiedToday / stats.dailyGoal) * 100, 100)} size={48} strokeWidth={4} color="#4f46e5">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{Math.round(Math.min((stats.cardsStudiedToday / stats.dailyGoal) * 100, 100))}%</span>
            </ProgressRing>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.cardsStudiedToday}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">/ {stats.dailyGoal} today</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-teal-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Cards Mastered</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCardsMastered}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{data.flashcards.filter((c) => c.learned).length} learned</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-purple-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.accuracy}%</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Quiz performance</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Longest Streak</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.longestStreak}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">days</p>
        </motion.div>
      </div>

      {/* Study Time */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">{period === 'week' ? 'Weekly' : 'Monthly'} Study</h3>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button onClick={() => setPeriod('week')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Week</button>
            <button onClick={() => setPeriod('month')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Month</button>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 h-32">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.studied / maxStudied) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 min-h-[4px]"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Difficulty Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Card Distribution</h3>
        <div className="space-y-3">
          {diffDistribution.map((d) => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">{d.label}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{d.value}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full ${d.color}`} initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 0.8, delay: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Achievements</h3>
          <button onClick={() => navigate('achievements')} className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-0.5">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {data.achievements.slice(0, 5).map((a) => (
            <div key={a.id} className={`flex-shrink-0 w-20 text-center p-3 rounded-2xl border ${a.unlockedAt ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
              <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${a.unlockedAt ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                <Award size={18} />
              </div>
              <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">{a.name}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Study Time Total */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl p-5 shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Clock size={24} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs">Total Study Time</p>
            <p className="text-white text-xl font-bold">{formatDuration(stats.totalStudyTime)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CalendarPage() {
  const { goBack, data } = useStore();
  const today = getToday();

  const days = useMemo(() => {
    const result = [];
    const d = new Date();
    d.setDate(1);
    const startDay = d.getDay();
    for (let i = 0; i < startDay; i++) result.push(null);
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const sh = data.userStats.streakHistory.find((s) => s.date === dateStr);
      result.push({ day: i, dateStr, completed: sh?.completed || false, isToday: dateStr === today });
    }
    return result;
  }, [data.userStats.streakHistory, today]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Study Calendar</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-medium text-slate-400 dark:text-slate-500 py-1">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <div key={i} className="aspect-square flex items-center justify-center">
              {day && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  day.isToday ? 'bg-primary-600 text-white' :
                  day.completed ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
                  'text-slate-600 dark:text-slate-400'
                }`}>
                  {day.day}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900/30" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Studied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary-600" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Today</span>
        </div>
      </div>
    </div>
  );
}
