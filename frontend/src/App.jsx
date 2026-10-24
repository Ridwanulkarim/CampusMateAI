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
  ShieldCheck,
  Users,
  Briefcase,
  AlertCircle,
  Volume2,
  Languages
} from 'lucide-react';

const TABS = [
  { 
    id: 'bus', 
    label: 'Daily Transport Booking', 
    icon: Bus, 
    desc: 'Kumira bus timings, Agrabad/GEC/Chawkbazar routes & seat guide',
    color: 'from-purple-600 to-fuchsia-600'
  },
  { 
    id: 'study', 
    label: 'Academic & Exam Prep', 
    icon: BookOpen, 
    desc: 'Lecture notes to summaries, Bangla explainer & 3 MCQs quiz',
    color: 'from-sky-600 to-blue-600'
  },
  { 
    id: 'admin', 
    label: 'Registration & Admin', 
    icon: Building2, 
    desc: 'Pre-registration, fee clearance, admit card & campus offices',
    color: 'from-emerald-600 to-teal-600'
  },
  { 
    id: 'life', 
    label: 'Student Life & Halls', 
    icon: Users, 
    desc: 'Cafeteria, Kumira residential halls, clubs & lost-and-found',
    color: 'from-amber-600 to-orange-600'
  },
  { 
    id: 'career', 
    label: 'Career & Roadmaps', 
    icon: Briefcase, 
    desc: 'CSE, EEE, BBA skill roadmaps, CV reviews & internship tips',
    color: 'from-rose-600 to-pink-600'
  },
];

const PRESETS = {
  bus: [
    {
      title: '🇧🇩 বাংলায় বাসের সময়সূচী',
      text: 'IIUC কুমিরা ক্যাম্পাসে ফিমেল (শহর থেকে সকাল ৭:৩০, ক্যাম্পাস থেকে দুপুর ১:৪০) এবং মেল (শহর থেকে সকাল ৯:০৫, ক্যাম্পাস থেকে বিকাল ৪:৪০) স্টুডেন্টদের বাসের শিডিউল ও রুট বাংলায় বিস্তারিত জানাও।',
    },
    {
      title: '🧕 Female Bus (City: 7:30 AM | Univ: 1:40 PM)',
      text: 'What is the exact bus schedule for Female students at IIUC? (City starting departure: 7:30 AM, Kumira return departure: 1:40 PM from Gate 2)',
    },
    {
      title: '👨 Male Bus (City: 9:05 AM | Univ: 4:40 PM)',
      text: 'What is the exact bus schedule for Male students at IIUC? (City starting departure: 9:05 AM, Kumira return departure: 4:40 PM from Gate 1)',
    },
  ],
  study: [
    {
      title: '🇧🇩 বাংলায় লেকচার নোটস ও কুইজ',
      text: 'অপারেটিং সিস্টেমের ডেডলক (Deadlock) এর ৪টি শর্ত বাস্তব জীবনের উদাহরণ দিয়ে সহজ বাংলায় বুঝিয়ে দাও এবং আমার পরীক্ষার জন্য ৩টি প্র্যাকটিস কুইজ তৈরি করো।',
    },
    {
      title: '🇧🇩 English to Bangla Lecture Explainer',
      text: 'Translate and explain this English engineering lecture on Operating System Deadlocks into simple conversational Bangla with real-world examples: "A deadlock happens when multiple processes are blocked because each is holding a resource and waiting for another resource held by another process."',
    },
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
      title: '💳 Semester Fee Payment & Admit Clearance',
      text: 'How can an IIUC student pay semester tuition fees online, and what are the exact steps to get exam clearance and admit card from the accounts office?',
    },
    {
      title: '🎓 Pre-Registration & Course Add/Drop Guide',
      text: 'How does the Pre-Registration and course add/drop process work at IIUC, where is the Student Affairs Division (SAD), and what are the rules if GPA is below 2.00?',
    },
  ],
  life: [
    {
      title: '🍲 Campus Cafeteria & Kumira Residential Halls',
      text: 'Tell me about the central cafeteria meal timings, male and female residential halls at Kumira, and active student clubs at IIUC like Computer Club and Debating Club.',
    },
    {
      title: '🔍 Lost and Found / Campus Amenities',
      text: 'How do I report a lost student ID or notebook on campus, and where can students study quietly during exam week?',
    },
  ],
  career: [
    {
      title: '🚀 CSE Fresher to Software Engineer Roadmap',
      text: 'Give me a structured 4-year skill roadmap for a CSE student at IIUC to land a software engineering or AI internship by 3rd year. What tech stack and projects should I build?',
    },
    {
      title: '📄 Student CV & Interview Feedback',
      text: 'What are the top 5 mistakes university students make in their technical CVs, and how can an IIUC graduate stand out for software and IT jobs in Bangladesh?',
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState('bus');
  const [model, setModel] = useState('gemma4:e2b');
  const [language, setLanguage] = useState('bilingual');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [provider, setProvider] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(false);
  const [error, setError] = useState('');

  const handleSpeak = async () => {
    if (!response || playingVoice) return;
    setPlayingVoice(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: response }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingVoice(false);
        audio.onerror = () => setPlayingVoice(false);
        await audio.play();
        return;
      }
    } catch (_) {}

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = response.replace(/[*#_`]/g, '').slice(0, 400);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setPlayingVoice(false);
      utterance.onerror = () => setPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingVoice(false);
    }
  };

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
          language: language,
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
      setIsLocal(data.isLocal ?? false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-sm shadow-fuchsia-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  IIUC PORTAL
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs">
                  CampusMate AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Smart Campus & Academic Copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemma 4 AI Engine</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/90 rounded-xl px-2.5 py-1 text-slate-700">
              <Cpu className="w-4 h-4 text-purple-600" />
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="gemma4:e2b">gemma4:e2b (Fast Edge)</option>
                <option value="gemma4:12b">gemma4:12b (Deep Reasoning)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs md:text-sm font-semibold">
              IIUC Portal AI Companion covers all 5 student pillars: Buses, Study Quizzes, Pre-Registration, Halls & Career Roadmaps.
            </p>
          </div>
          <span className="hidden sm:inline-block shrink-0 text-xs bg-white/20 px-2.5 py-1 rounded-lg font-medium backdrop-blur-xs">
            Kumira Campus
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                className={`flex flex-col items-start gap-2.5 p-3.5 rounded-2xl border transition-all text-left shadow-xs ${
                  isActive
                    ? 'bg-white border-purple-400/80 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20'
                    : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-sm`
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-xs ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {tab.label}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Quick Demo Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS[activeTab]?.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePreset(p.text)}
                className="text-xs bg-slate-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors font-medium shadow-2xs"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'bus' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 border border-fuchsia-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                  🧕
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">Female Students Shift</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
                      Gate 2
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-medium flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>🏙️ <strong className="text-slate-900">From City:</strong> 7:30 AM (Starting)</span>
                    <span>🏛️ <strong className="text-slate-900">From University:</strong> 1:40 PM (Return)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                  👨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">Male Students Shift</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Gate 1
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-medium flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>🏙️ <strong className="text-slate-900">From City:</strong> 9:05 AM (Starting)</span>
                    <span>🏛️ <strong className="text-slate-900">From University:</strong> 4:40 PM (Return)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <span>Student Query / Lecture Content</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage('bilingual')}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'bilingual'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🌐 EN + বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bangla')}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'bangla'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🇧🇩 বাংলায়
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('english')}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'english'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🇬🇧 English
                </button>

                {input && (
                  <button
                    onClick={handleClear}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors pl-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or click a preset button above to see instant answers..."
              rows={11}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 transition-all font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-400">
                Shift + Enter for new line
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                  loading || !input.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-purple-500/25 active:scale-98'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5 min-h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Gemma 4 Synthesis & Response
                </span>
                {provider && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full border font-semibold bg-purple-50 border-purple-200 text-purple-700">
                    {provider}
                  </span>
                )}
              </div>

              {response && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSpeak}
                    disabled={playingVoice}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors shadow-2xs"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingVoice ? 'animate-bounce text-fuchsia-600' : ''}`} />
                    <span>{playingVoice ? 'Speaking...' : 'Listen Voice'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 border border-slate-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500 gap-3">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                  <Cpu className="w-4 h-4 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-xs text-slate-700 font-bold">
                  Synthesizing instant response...
                </div>
                <div className="text-[11px] text-slate-400">
                  Open-weight AI acceleration
                </div>
              </div>
            ) : response ? (
              <div className="flex-1 overflow-y-auto max-h-[500px] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-[#f8fafc] p-4 rounded-xl border border-slate-200/80 select-text">
                {response}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400 gap-2">
                <HelpCircle className="w-9 h-9 text-slate-300" />
                <p className="text-xs text-slate-500 max-w-sm">
                  Select a category above, pick a demo preset or enter your query to see Gemma 4 solve campus problems.
                </p>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Zero data tracking • 100% Open Source
              </span>
              <span className="font-medium text-slate-500">Official IIUC Portal Companion</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          IIUC Portal AI Companion • Built for <span className="text-purple-700 font-bold">Hacktoberfest Hack Day Chittagong (IIUC)</span> • Powered by Google Gemma 4
        </p>
      </footer>
    </div>
  );
}
