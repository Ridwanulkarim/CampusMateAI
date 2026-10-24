import React, { useState } from 'react';
import { 
  Bus, 
  BookOpen, 
  Building2, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Send, 
  Cpu, 
  GraduationCap, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

const TABS = [
  { id: 'bus', label: 'IIUC Bus & Transit', icon: Bus, desc: 'Bus timings, city-to-Kumira routes & delay tips' },
  { id: 'study', label: 'Study & Exam Prep', icon: BookOpen, desc: 'Lecture notes to summaries, Bangla explainer & MCQs' },
  { id: 'admin', label: 'Admin & Freshers Guide', icon: Building2, desc: 'Fees, registration, notices & campus offices' },
];

const PRESETS = {
  bus: [
    {
      title: '🚌 Morning City to Kumira Bus Times',
      text: 'What are the morning bus departure schedules from Chawkbazar, GEC, and Bahaddarhat to Kumira campus? What time should I reach the stand to get a seat?',
    },
    {
      title: '🚏 Afternoon Return Buses to City',
      text: 'When do the afternoon return buses leave Kumira for Chittagong city? Please list the departure slots and which gate male and female students board from.',
    },
  ],
  study: [
    {
      title: '💻 CSE: Binary Search Tree (BST) Notes',
      text: 'Here are my lecture notes on Binary Search Trees (BST): A BST is a binary tree where left child < parent and right child > parent. Search time is O(h) where h is height, O(log n) if balanced, but degrades to O(n) in worst case (skewed tree). In-order traversal produces sorted elements. Please give me: 1. Core summary, 2. Easy Bangla explanation, 3. Three practice MCQ exam questions with answers.',
    },
    {
      title: '📖 Islamic Studies: Maqasid al-Shariah',
      text: 'Explain the core concept of Maqasid al-Shariah (the five essential objectives: preservation of faith, life, intellect, lineage, and wealth) in simple English and conversational Bangla, and generate 3 practice quiz questions for my exam.',
    },
  ],
  admin: [
    {
      title: '💳 Semester Fee Payment & Clearance',
      text: 'How can an IIUC student pay semester tuition fees online, and what are the exact steps to get exam clearance and admit card from the accounts office?',
    },
    {
      title: '🎓 Fresher Course Add/Drop Guide',
      text: 'I am a fresher at IIUC. How does the course add/drop process work, where is the Student Affairs Division (SAD), and what do I need for a campus library card?',
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState('bus');
  const [model, setModel] = useState('gemma4:e2b');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [provider, setProvider] = useState('');
  const [isLocal, setIsLocal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handlePreset = (text) => {
    setInput(text);
  };

  const handleClear = () => {
    setInput('');
    setResponse('');
    setError('');
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          category: activeTab,
          model: model,
        }),
      });

      if (!res.ok) {
        let errText = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          errText = errData.error || errText;
        } catch (_) {
          const text = await res.text();
          if (text) errText = text;
        }
        throw new Error(errText);
      }

      const data = await res.json();

      setResponse(data.reply);
      setProvider(data.provider || 'Gemma 4');
      setIsLocal(data.isLocal ?? true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend server. Make sure Ollama or backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  CampusMate AI
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  IIUC Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">Smart Campus & Study Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemma 4 Engine</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="gemma4:e2b" className="bg-slate-900 text-slate-200">
                  gemma4:e2b (Fast Edge)
                </option>
                <option value="gemma4:12b" className="bg-slate-900 text-slate-200">
                  gemma4:12b (Deep Reasoning)
                </option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {tab.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick Demo Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS[activeTab].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePreset(p.text)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Student Query or Lecture Content</span>
              </label>
              {input && (
                <button
                  onClick={handleClear}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === 'bus'
                  ? 'Ask about Kumira bus times, routes from Chawkbazar/GEC/Bahaddarhat, or return schedules...'
                  : activeTab === 'study'
                  ? 'Paste lecture slide text, formula, or complex topic to get summary, Bangla explanation & MCQs...'
                  : 'Ask about course registration, fee clearance, office locations at IIUC...'
              }
              rows={11}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all font-mono leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500">
                Shift + Enter for new line
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md ${
                  loading || !input.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing with Gemma...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Ask CampusMate</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300">
                {error}
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 min-h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Gemma 4 Analysis & Response</span>
                {provider && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                      isLocal
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                        : 'bg-blue-950/40 border-blue-500/30 text-blue-400'
                    }`}
                  >
                    {provider}
                  </span>
                )}
              </div>

              {response && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Output</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400 gap-3">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                  <Cpu className="w-4 h-4 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  Gemma 4 is synthesizing your query...
                </div>
                <div className="text-[11px] text-slate-500">
                  Local edge inference on Apple Silicon
                </div>
              </div>
            ) : response ? (
              <div className="flex-1 overflow-y-auto max-h-[500px] text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 select-text">
                {response}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500 gap-2">
                <HelpCircle className="w-8 h-8 text-slate-700" />
                <p className="text-xs text-slate-400 max-w-sm">
                  Select a tab, pick a quick demo preset or type any question to see Gemma 4 solve real student problems.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
                Zero data tracking • 100% Open Source
              </span>
              <span>Built for IIUC Campus</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>
          CampusMate AI • Built for <span className="text-slate-400 font-medium">Hacktoberfest Hack Day Chittagong (IIUC)</span> • Powered by Google Gemma 4
        </p>
      </footer>
    </div>
  );
}
