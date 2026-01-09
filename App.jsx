import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Play, 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  Trophy, 
  Flame,
  Dumbbell,
  Save,
  X
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard');
  const [sets, setSets] = useState([]);
  const [activeSetId, setActiveSetId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState(null);
  const [editingSet, setEditingSet] = useState(null);

  useEffect(() => {
    const savedSets = localStorage.getItem('memorizer_sets');
    const savedStreak = localStorage.getItem('memorizer_streak');
    const savedLastDate = localStorage.getItem('memorizer_last_date');

    if (savedSets) setSets(JSON.parse(savedSets));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedLastDate) setLastDate(savedLastDate);

    const today = new Date().toDateString();
    if (savedLastDate && savedLastDate !== today) {
      const last = new Date(savedLastDate);
      const diffDays = Math.floor((new Date() - last) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) setStreak(0);
    }
  }, []);

  const saveToDisk = (newSets) => {
    localStorage.setItem('memorizer_sets', JSON.stringify(newSets));
    setSets(newSets);
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    if (lastDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastDate(today);
      localStorage.setItem('memorizer_streak', newStreak.toString());
      localStorage.setItem('memorizer_last_date', today);
    }
  };

  const handleAddSet = () => {
    setEditingSet({ id: Date.now(), name: '', sentences: [''], reps: 0 });
    setView('editor');
  };

  const handleEditSet = (targetSet) => {
    setEditingSet({ ...targetSet });
    setView('editor');
  };

  const handleDeleteSet = (id) => {
    const newSets = sets.filter(s => s.id !== id);
    saveToDisk(newSets);
  };

  const handleSaveSet = (updatedSet) => {
    const filteredSentences = updatedSet.sentences.filter(s => s.trim() !== '');
    if (updatedSet.name.trim() === '' || filteredSentences.length === 0) return;
    
    const newSets = sets.find(s => s.id === updatedSet.id)
      ? sets.map(s => s.id === updatedSet.id ? { ...updatedSet, sentences: filteredSentences } : s)
      : [...sets, { ...updatedSet, sentences: filteredSentences }];
    
    saveToDisk(newSets);
    setView('dashboard');
  };

  const handleCompleteRep = (setId) => {
    const newSets = sets.map(s => s.id === setId ? { ...s, reps: (s.reps || 0) + 1 } : s);
    saveToDisk(newSets);
    updateStreak();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 touch-none overscroll-none">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 pb-24">
        {view === 'dashboard' && (
          <Dashboard 
            sets={sets} 
            streak={streak} 
            onAdd={handleAddSet} 
            onEdit={handleEditSet} 
            onDelete={handleDeleteSet}
            onPlay={(id) => { setActiveSetId(id); setView('practice'); }}
          />
        )}
        
        {view === 'editor' && (
          <SetEditor 
            initialSet={editingSet} 
            onSave={handleSaveSet} 
            onCancel={() => setView('dashboard')} 
          />
        )}

        {view === 'practice' && (
          <PracticeView 
            set={sets.find(s => s.id === activeSetId)} 
            onExit={() => setView('dashboard')}
            onCompleteRep={() => handleCompleteRep(activeSetId)}
          />
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ sets, streak, onAdd, onEdit, onDelete, onPlay }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <header className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Memorizer</h1>
          <p className="text-slate-500 text-sm">Train your mind every day.</p>
        </div>
        <div className="flex items-center bg-orange-50 px-3 py-1.5 rounded-2xl border border-orange-100 shadow-sm">
          <Flame className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" />
          <span className="font-bold text-orange-700">{streak}</span>
        </div>
      </div>
    </header>

    <div className="grid gap-3">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
          <Dumbbell className="w-4 h-4 mr-2" /> Training Sets
        </h2>
      </div>

      {sets.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
          <p className="text-slate-400 mb-6">Start by adding your first set of sentences.</p>
          <button onClick={onAdd} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition">
            Create Set
          </button>
        </div>
      ) : (
        sets.map(set => (
          <div key={set.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="flex-1 min-w-0" onClick={() => onPlay(set.id)}>
              <h3 className="text-lg font-bold text-slate-800 truncate">{set.name}</h3>
              <div className="flex gap-3 text-xs font-bold text-slate-400 mt-1">
                <span>{set.sentences.length} ITEMS</span>
                <span className="text-indigo-500 uppercase">{set.reps || 0} REPS</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(set)} className="p-3 text-slate-300 hover:text-indigo-600 transition">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => onPlay(set.id)} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md active:scale-90 transition">
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>

    <button 
      onClick={onAdd}
      className="fixed bottom-8 right-6 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-50"
    >
      <Plus className="w-8 h-8" />
    </button>
  </div>
);

const SetEditor = ({ initialSet, onSave, onCancel }) => {
  const [set, setLocalSet] = useState(initialSet);

  const updateSentence = (idx, val) => {
    const newSentences = [...set.sentences];
    newSentences[idx] = val;
    setLocalSet({ ...set, sentences: newSentences });
  };

  const addSentence = () => {
    setLocalSet({ ...set, sentences: [...set.sentences, ''] });
  };

  const removeSentence = (idx) => {
    if (set.sentences.length > 1) {
      setLocalSet({ ...set, sentences: set.sentences.filter((_, i) => i !== idx) });
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-400">
      <header className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black">Edit Workout</h2>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Set Name</label>
          <input 
            className="w-full text-xl font-bold border-b border-slate-100 focus:border-indigo-600 outline-none pb-2 transition-colors"
            placeholder="Set title..."
            value={set.name}
            onChange={(e) => setLocalSet({ ...set, name: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sentences</label>
          {set.sentences.map((sentence, idx) => (
            <div key={idx} className="flex gap-2">
              <textarea 
                rows="1"
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                placeholder="Type sentence..."
                value={sentence}
                onChange={(e) => updateSentence(idx, e.target.value)}
              />
              <button 
                onClick={() => removeSentence(idx)}
                className="p-3 text-red-300 hover:text-red-500"
                disabled={set.sentences.length === 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button 
            onClick={addSentence}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-bold active:bg-slate-50 transition"
          >
            <Plus className="w-4 h-4" /> Add Sentence
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-4 font-bold text-slate-400">Discard</button>
        <button 
          onClick={() => onSave(set)}
          className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition"
        >
          Save Training
        </button>
      </div>
    </div>
  );
};

const PracticeView = ({ set, onExit, onCompleteRep }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [constructed, setConstructed] = useState([]);
  const [pool, setPool] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

  useEffect(() => {
    if (set && set.sentences[currentIdx]) {
      const words = set.sentences[currentIdx].split(/\s+/).filter(w => w.length > 0);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      if (shuffled.join(' ') === words.join(' ') && words.length > 1) shuffled.reverse();
      setPool(shuffled.map((text, i) => ({ id: i, text })));
      setConstructed([]);
      setIsCorrect(false);
    }
  }, [currentIdx, set]);

  const handleWordClick = (word, fromPool) => {
    if (isCorrect) return;
    if (fromPool) {
      setPool(pool.filter(w => w.id !== word.id));
      setConstructed([...constructed, word]);
    } else {
      setConstructed(constructed.filter(w => w.id !== word.id));
      setPool([...pool, word]);
    }
  };

  const checkAnswer = () => {
    if (constructed.map(w => w.text).join(' ') === set.sentences[currentIdx]) {
      setIsCorrect(true);
    } else {
      const btn = document.getElementById('check-btn');
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 400);
    }
  };

  const handleNext = () => {
    if (currentIdx < set.sentences.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowFinished(true);
      onCompleteRep();
    }
  };

  if (showFinished) {
    return (
      <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
        <div className="bg-indigo-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">Rep Complete!</h2>
          <p className="text-slate-400 mt-1">Excellent focus.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm inline-block min-w-[200px]">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Set Total Reps</p>
          <span className="text-5xl font-black text-indigo-600">{set.reps + 1}</span>
        </div>
        <div className="flex flex-col gap-3 px-4">
          <button 
            onClick={() => { setShowFinished(false); setCurrentIdx(0); }} 
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black active:scale-95 transition"
          >
            Start Another Rep
          </button>
          <button onClick={onExit} className="w-full py-4 text-slate-400 font-bold">Done for Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex items-center gap-4">
        <button onClick={onExit} className="p-2 -ml-2">
          <X className="w-6 h-6 text-slate-400" />
        </button>
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-700" 
            style={{ width: `${((currentIdx) / set.sentences.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black text-slate-400">{currentIdx + 1}/{set.sentences.length}</span>
      </header>

      <div className="space-y-8 min-h-[60vh] flex flex-col">
        <div className={`min-h-[140px] bg-white rounded-3xl p-5 border-2 flex flex-wrap content-start gap-2 justify-center items-center transition-colors duration-300 ${isCorrect ? 'border-green-400 bg-green-50' : 'border-slate-100 shadow-sm'}`}>
          {constructed.length === 0 && !isCorrect && (
            <p className="text-slate-300 text-sm font-medium text-center italic">Assemble the sentence</p>
          )}
          {constructed.map(word => (
            <button
              key={word.id}
              disabled={isCorrect}
              onClick={() => handleWordClick(word, false)}
              className={`px-4 py-2 rounded-xl border text-lg font-bold active:scale-90 transition-all ${isCorrect ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              {word.text}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-wrap justify-center content-center gap-2 p-2">
          {!isCorrect && pool.map(word => (
            <button
              key={word.id}
              onClick={() => handleWordClick(word, true)}
              className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-lg active:scale-90 active:translate-y-1 transition-all"
            >
              {word.text}
            </button>
          ))}
          {isCorrect && (
            <div className="animate-bounce">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          )}
        </div>

        <div className="pt-4">
          {isCorrect ? (
            <button 
              onClick={handleNext}
              className="w-full bg-green-500 text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-green-100 animate-in slide-in-from-bottom-4"
            >
              {currentIdx === set.sentences.length - 1 ? 'Finish Workout' : 'Next Item'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => { setPool([...pool, ...constructed]); setConstructed([]); }}
                className="p-5 bg-slate-200 text-slate-600 rounded-2xl active:bg-slate-300 transition"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button 
                id="check-btn"
                disabled={constructed.length === 0}
                onClick={checkAnswer}
                className="flex-1 bg-indigo-600 disabled:opacity-20 text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                Check Answer
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .shake { animation: shake 0.4s ease-in-out; background-color: #ef4444 !important; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default App;
