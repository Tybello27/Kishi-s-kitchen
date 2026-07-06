import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Star, Zap } from 'lucide-react';
import { useStore } from '../store';
import confetti from 'canvas-confetti';

export default function QuizMode() {
  const { pageParams, goBack, getDeckById, getDeckCards, recordStudySession } = useStore();
  const deck = getDeckById(pageParams.deckId);
  const allCards = getDeckCards(pageParams.deckId);

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [timer, setTimer] = useState(0);
  const [sessionStart, setSessionStart] = useState(0);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  const generateQuestions = () => {
    const cards = [...allCards].sort(() => Math.random() - 0.5).slice(0, Math.min(allCards.length, 10));
    const qs = cards.map((card) => {
      const type = Math.random() > 0.7 ? 'truefalse' : Math.random() > 0.5 ? 'fillblank' : 'multiple';
      if (type === 'truefalse') {
        const isTrue = Math.random() > 0.5;
        return {
          type: 'truefalse' as const,
          card,
          question: `${card.front} = ${isTrue ? card.back : allCards[Math.floor(Math.random() * allCards.length)].back}`,
          answer: isTrue ? 'true' : 'false',
          options: ['true', 'false'],
        };
      }
      if (type === 'fillblank') {
        return {
          type: 'fillblank' as const,
          card,
          question: card.front,
          answer: card.back,
          options: [],
        };
      }
      const wrong = allCards.filter((c) => c.id !== card.id).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [card.back, ...wrong.map((c) => c.back)].sort(() => Math.random() - 0.5);
      return {
        type: 'multiple' as const,
        card,
        question: card.front,
        answer: card.back,
        options: opts,
      };
    });
    setQuestions(qs);
    setStarted(true);
    setSessionStart(Date.now());
    setQIndex(0);
    setScore(0);
    setResults([]);
  };

  const currentQ = questions[qIndex];

  const handleAnswer = (ans: string) => {
    if (answered) return;
    const isCorrect = ans.toLowerCase().trim() === currentQ.answer.toLowerCase().trim();
    setSelected(ans);
    setAnswered(true);
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
    setResults((r) => [...r, { question: currentQ.question, correct: isCorrect, answer: currentQ.answer, selected: ans }]);
  };

  const handleFillBlank = (input: string) => {
    handleAnswer(input);
  };

  const goNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setCorrect(false);
    } else {
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      recordStudySession({
        date: new Date().toISOString().split('T')[0],
        deckId: deck?.id || '',
        cardsStudied: questions.length,
        correctAnswers: score + (correct ? 1 : 0),
        duration,
        xpEarned: (score + (correct ? 1 : 0)) * 10,
      });
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  const restart = () => {
    setStarted(false);
    setQuestions([]);
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrect(false);
    setScore(0);
    setResults([]);
    setTimer(0);
  };

  if (!deck || allCards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6">
        <p className="text-slate-500 dark:text-slate-400">No cards available for quiz</p>
        <button onClick={goBack} className="mt-4 px-6 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium">Go Back</button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${deck.colorTheme} flex items-center justify-center mx-auto mb-6 shadow-xl`}>
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{deck.title} Quiz</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{Math.min(allCards.length, 10)} questions • Multiple formats</p>
          <button onClick={generateQuestions} className="px-8 py-4 rounded-2xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20">
            Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (qIndex >= questions.length - 1 && answered) {
    const finalScore = score + (correct ? 1 : 0);
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24 overflow-y-auto">
        <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-8">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{pct}%</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{finalScore} / {questions.length} correct</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={16} fill="currentColor" /> <span className="text-sm font-medium">+{finalScore * 10} XP</span>
            </div>
            <div className="flex items-center gap-1 text-purple-500">
              <Zap size={16} /> <span className="text-sm font-medium">{Math.floor(timer / 60)}m {timer % 60}s</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3 mb-6">
          {results.map((r, i) => (
            <div key={i} className={`rounded-2xl p-4 border ${r.correct ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'}`}>
              <div className="flex items-start gap-3">
                {r.correct ? <CheckCircle size={18} className="text-green-500 mt-0.5" /> : <XCircle size={18} className="text-rose-500 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{r.question}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Correct: {r.answer}</p>
                  {!r.correct && <p className="text-xs text-rose-500 mt-0.5">Your answer: {r.selected}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={restart} className="w-full py-4 rounded-2xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
          <RotateCcw size={18} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Question {qIndex + 1} / {questions.length}</p>
        </div>
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
          {score} pts
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full gradient-primary" animate={{ width: `${((qIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-800"
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{currentQ.question}</p>

            {currentQ.type === 'fillblank' ? (
              <div>
                <input
                  type="text"
                  disabled={answered}
                  placeholder="Type your answer..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFillBlank((e.target as HTMLInputElement).value);
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white disabled:opacity-50"
                />
                {!answered && (
                  <button onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    handleFillBlank(input?.value || '');
                  }} className="w-full mt-3 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium">
                    Submit
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {currentQ.options.map((opt: string, i: number) => {
                  const isSelected = selected === opt;
                  const isAnswer = opt === currentQ.answer;
                  let btnClass = 'w-full p-4 rounded-xl text-left text-sm font-medium transition-all border ';
                  if (!answered) {
                    btnClass += 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20';
                  } else if (isAnswer) {
                    btnClass += 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400';
                  } else if (isSelected && !isAnswer) {
                    btnClass += 'bg-rose-100 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400';
                  } else {
                    btnClass += 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-60';
                  }
                  return (
                    <button key={i} disabled={answered} onClick={() => handleAnswer(opt)} className={btnClass}>
                      <span className="inline-block w-6 text-slate-400 text-xs">{String.fromCharCode(97 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className={`flex items-center gap-2 p-3 rounded-xl ${correct ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                  {correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span className="text-sm font-medium">{correct ? 'Correct!' : `The answer is: ${currentQ.answer}`}</span>
                </div>
                <button onClick={goNext} className="w-full mt-3 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium">
                  {qIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
