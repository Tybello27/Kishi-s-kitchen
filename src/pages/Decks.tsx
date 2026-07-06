import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ArrowLeft, MoreVertical, BookOpen, Star,
  Trash2, Copy, Edit2, Play, HelpCircle, Filter, X,
  ChevronRight, Heart, Tag, Clock, Grid3X3, List
} from 'lucide-react';
import { useStore } from '../store';
import { getCategories, getSubjects, getColorThemes, formatDate } from '../utils';
import type { Deck, Flashcard, Difficulty } from '../types';

export default function Decks() {
  const { currentPage, pageParams, navigate, goBack } = useStore();

  if (currentPage === 'deck-detail') return <DeckDetailPage />;
  if (currentPage === 'create-deck') return <CreateDeckPage />;
  if (currentPage === 'edit-deck') return <EditDeckPage />;
  if (currentPage === 'create-card') return <CreateCardPage />;
  if (currentPage === 'edit-card') return <EditCardPage />;
  if (currentPage === 'search') return <SearchPage />;
  return <DecksListPage />;
}

function DecksListPage() {
  const { data, navigate, toggleFavoriteDeck, deleteDeck, duplicateDeck } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let decks = data.decks;
    if (search) decks = decks.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'favorites') decks = decks.filter((d) => data.favoriteDecks.includes(d.id));
    if (filter === 'recent') decks = [...decks].sort((a, b) => (b.lastStudied || '').localeCompare(a.lastStudied || ''));
    return decks;
  }, [data.decks, data.favoriteDecks, search, filter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Decks</h1>
        <button
          onClick={() => navigate('create-deck')}
          className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search decks..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
        />
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {(['all', 'favorites', 'recent'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="ml-auto p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500"
        >
          {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No decks found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first deck to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((deck, i) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <button
                onClick={() => setMenuOpen(menuOpen === deck.id ? null : deck.id)}
                className="absolute top-3 right-3 p-1 text-slate-400"
              >
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {menuOpen === deck.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-8 right-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 py-1 min-w-[140px]"
                  >
                    <button onClick={() => { navigate('edit-deck', { deckId: deck.id }); setMenuOpen(null); }} className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => { duplicateDeck(deck.id); setMenuOpen(null); }} className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Copy size={12} /> Duplicate
                    </button>
                    <button onClick={() => { deleteDeck(deck.id); setMenuOpen(null); }} className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 size={12} /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => navigate('deck-detail', { deckId: deck.id })} className="w-full text-left">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deck.colorTheme} flex items-center justify-center mb-3`}>
                  <BookOpen size={18} className="text-white" />
                </div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate pr-4">{deck.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{deck.cardCount} cards</p>
              </button>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">{deck.category}</span>
                <button onClick={() => toggleFavoriteDeck(deck.id)}>
                  <Heart size={14} className={data.favoriteDecks.includes(deck.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-300 dark:text-slate-600'} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((deck, i) => (
            <motion.button
              key={deck.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
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
              <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

function DeckDetailPage() {
  const { pageParams, navigate, goBack, getDeckById, getDeckCards, toggleFavoriteCard, toggleLearnedCard, deleteCard, toggleFavoriteDeck } = useStore();
  const deck = getDeckById(pageParams.deckId);
  const cards = getDeckCards(pageParams.deckId);
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');

  if (!deck) return null;

  const filteredCards = filterDiff === 'all' ? cards : cards.filter((c) => c.difficulty === filterDiff);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className={`px-5 pt-6 pb-8 bg-gradient-to-br ${deck.colorTheme} rounded-b-[2.5rem]`}>
        <button onClick={goBack} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white mb-1">{deck.title}</h1>
        <p className="text-white/70 text-sm">{deck.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs">{deck.category}</span>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs">{deck.subject}</span>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{deck.cardCount}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Cards</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{cards.filter((c) => c.learned).length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Learned</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{cards.filter((c) => c.favorite).length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Favorites</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="flex gap-2 mb-4">
          <button onClick={() => navigate('study', { deckId: deck.id })} className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20">
            <Play size={16} /> Study
          </button>
          <button onClick={() => navigate('quiz', { deckId: deck.id })} className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20">
            <HelpCircle size={16} /> Quiz
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">Flashcards</h3>
          <div className="flex items-center gap-2">
            <select
              value={filterDiff}
              onChange={(e) => setFilterDiff(e.target.value as Difficulty | 'all')}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 dark:text-white"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={() => navigate('create-card', { deckId: deck.id })}
              className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2 pb-6">
          {filteredCards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{card.front}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.back}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => toggleFavoriteCard(card.id)}>
                    <Heart size={14} className={card.favorite ? 'text-rose-500 fill-rose-500' : 'text-slate-300 dark:text-slate-600'} />
                  </button>
                  <button onClick={() => navigate('edit-card', { cardId: card.id })}>
                    <Edit2 size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => deleteCard(card.id)}>
                    <Trash2 size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  card.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  card.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                  {card.difficulty}
                </span>
                {card.learned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">Learned</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateDeckPage() {
  const { navigate, addDeck } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(getCategories()[0]);
  const [subject, setSubject] = useState(getSubjects(getCategories()[0])[0]);
  const [colorTheme, setColorTheme] = useState(getColorThemes()[0]);
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const deck = addDeck({
      title: title.trim(),
      description: description.trim(),
      category,
      subject,
      colorTheme,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      favorite: false,
    });
    navigate('deck-detail', { deckId: deck.id });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('decks')} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Create New Deck</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Deck Name</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Quantum Physics" className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Category</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setSubject(getSubjects(e.target.value)[0]); }} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white">
            {getCategories().map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white">
            {getSubjects(category).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Color Theme</label>
          <div className="flex gap-2 flex-wrap">
            {getColorThemes().map((c) => (
              <button key={c} onClick={() => setColorTheme(c)} className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c} ${colorTheme === c ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-950' : ''}`} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="physics, science, exam" className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
        </div>
      </div>

      <button onClick={handleSubmit} className="w-full mt-6 py-4 rounded-2xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20">
        Create Deck
      </button>
    </div>
  );
}

function EditDeckPage() {
  const { pageParams, navigate, getDeckById, updateDeck } = useStore();
  const deck = getDeckById(pageParams.deckId);
  const [title, setTitle] = useState(deck?.title || '');
  const [description, setDescription] = useState(deck?.description || '');

  if (!deck) return null;

  const handleSubmit = () => {
    updateDeck({ ...deck, title: title.trim(), description: description.trim() });
    navigate('deck-detail', { deckId: deck.id });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('deck-detail', { deckId: deck.id })} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Deck</h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Deck Name</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none" />
        </div>
      </div>
      <button onClick={handleSubmit} className="w-full mt-6 py-4 rounded-2xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20">
        Save Changes
      </button>
    </div>
  );
}

function CreateCardPage() {
  const { pageParams, navigate, addCard } = useStore();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const handleSubmit = () => {
    if (!front.trim() || !back.trim()) return;
    addCard({
      deckId: pageParams.deckId,
      front: front.trim(),
      back: back.trim(),
      notes: notes.trim() || undefined,
      difficulty,
      favorite: false,
      starred: false,
      learned: false,
    });
    navigate('deck-detail', { deckId: pageParams.deckId });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('deck-detail', { deckId: pageParams.deckId })} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add Flashcard</h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Front (Question)</label>
          <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="Enter the question..." rows={3} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Back (Answer)</label>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Enter the answer..." rows={3} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                  difficulty === d
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
        </div>
      </div>
      <button onClick={handleSubmit} className="w-full mt-6 py-4 rounded-2xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20">
        Add Card
      </button>
    </div>
  );
}

function EditCardPage() {
  const { pageParams, navigate, getCardById, updateCard } = useStore();
  const card = getCardById(pageParams.cardId);
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');

  if (!card) return null;

  const handleSubmit = () => {
    updateCard({ ...card, front: front.trim(), back: back.trim() });
    navigate('deck-detail', { deckId: card.deckId });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('deck-detail', { deckId: card.deckId })} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Card</h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Front</label>
          <textarea value={front} onChange={(e) => setFront(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Back</label>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none" />
        </div>
      </div>
      <button onClick={handleSubmit} className="w-full mt-6 py-4 rounded-2xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-600/20">
        Save Changes
      </button>
    </div>
  );
}

function SearchPage() {
  const { navigate, searchCards, getDeckById } = useStore();
  const [query, setQuery] = useState('');
  const results = query ? searchCards(query) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('dashboard')} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Search</h1>
      </div>
      <div className="relative mb-4">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search flashcards..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
        />
      </div>
      <div className="space-y-2">
        {results.map((card) => {
          const deck = getDeckById(card.deckId);
          return (
            <button
              key={card.id}
              onClick={() => navigate('deck-detail', { deckId: card.deckId })}
              className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 text-left"
            >
              <p className="text-sm font-medium text-slate-900 dark:text-white">{card.front}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.back}</p>
              {deck && <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-2">{deck.title}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Search as SearchIcon } from 'lucide-react';
