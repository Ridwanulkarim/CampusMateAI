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
  Users, 
  Briefcase, 
  Volume2, 
  Search, 
  Bell, 
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const TABS = [
  { 
    id: 'bus', 
    label: 'Overview & Buses', 
    icon: Bus, 
    desc: 'Kumira bus timings, Agrabad/GEC/Chawkbazar routes & seat guide'
  },
  { 
    id: 'study', 
    label: 'Academic & Exam', 
    icon: BookOpen, 
    desc: 'Lecture notes to summaries, Bangla explainer & 3 MCQs quiz'
  },
  { 
    id: 'admin', 
    label: 'Registration & Admin', 
    icon: Building2, 
    desc: 'Pre-registration, fee clearance, admit card & campus offices'
  },
  { 
    id: 'life', 
    label: 'Student Life & Halls', 
    icon: Users, 
    desc: 'Cafeteria, Kumira residential halls, clubs & lost-and-found'
  },
  { 
    id: 'career', 
    label: 'Career & Roadmaps', 
    icon: Briefcase, 
    desc: 'CSE, EEE, BBA skill roadmaps, CV reviews & internship tips'
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
    <div className="min-h-screen bg-[#dce5f2] py-4 sm:py-8 px-2 sm:px-6 flex items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-16 left-6 hidden lg:grid grid-cols-4 gap-3 opacity-35 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6a90be]" />
        ))}
      </div>

      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-[18px] border-[#c7d9ee] opacity-60 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#c7daf0] opacity-70 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-72 h-72 rounded-full bg-[#d0e0f5] opacity-50 blur-xl pointer-events-none" />

      <div className="w-full max-w-[1380px] bg-[#fbfcfe] rounded-[34px] shadow-[0_25px_70px_rgba(40,75,130,0.14)] border border-white p-4 sm:p-7 flex flex-col lg:flex-row gap-6 relative z-10">
        <aside className="w-full lg:w-56 shrink-0 bg-white rounded-[26px] p-5 shadow-[0_4px_24px_rgba(70,110,170,0.06)] border border-slate-100 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center pt-1">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3c7bed] shadow-xs mb-2">
                <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 6L28 16H39L30 22L33 32L24 26L15 32L18 22L9 16H20L24 6Z" fill="#3c7bed" opacity="0.15"/>
                  <path d="M14 14C11 18 11 27 16 33C19 36 24 38 24 38C24 38 29 36 32 33C37 27 37 18 34 14" stroke="#3c7bed" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M19 18V26C19 28.5 21 30.5 24 30.5C27 30.5 29 28.5 29 26V18" stroke="#3c7bed" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="24" cy="11" r="2.5" fill="#3c7bed"/>
                </svg>
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-800">
                IIUC PORTAL
              </span>
              <span className="text-[10px] font-bold text-[#3c7bed] tracking-wide">
                CampusMate AI
              </span>
            </div>

            <nav className="flex flex-col gap-1.5">
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-[#edf4fe] text-[#3c7bed] shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3c7bed]' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 flex flex-col gap-5 min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 pb-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Welcome, Student!
              </h1>
              <span className="bg-[#22c55e] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-2xs">
                Active
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 text-slate-700 shadow-2xs">
                <Cpu className="w-3.5 h-3.5 text-[#3c7bed]" />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="gemma4:e2b">gemma4:e2b (Fast Edge)</option>
                  <option value="gemma4:12b">gemma4:12b (Deep Reasoning)</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLanguage('bilingual')}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'bilingual'
                      ? 'bg-[#3c7bed] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🌐 EN + বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bangla')}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'bangla'
                      ? 'bg-[#22c55e] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🇧🇩 বাংলায়
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('english')}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'english'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>

              <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs transition-colors relative">
                <Bell className="w-3.5 h-3.5" />
                <span className="w-2 h-2 rounded-full bg-[#22c55e] absolute top-1 right-1"></span>
              </button>

              <div className="w-8 h-8 rounded-full bg-[#3c7bed] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                RK
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-4 bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(70,110,170,0.05)] border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-800">
                  Classes for the day
                </h3>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-[#f8faff] hover:bg-[#f0f5fd] border border-blue-100/70 rounded-2xl p-3.5 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Female Students Shift
                    </span>
                    <span className="text-[10px] bg-blue-100 text-[#3c7bed] font-bold px-2 py-0.5 rounded-full">
                      Gate 2
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1 font-medium">
                    <Clock className="w-3 h-3 text-[#3c7bed]" />
                    <span>City: 7:30 AM • Univ: 1:40 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Morning departure starts at 7:30 AM from Chawkbazar, Bahaddarhat, GEC, Agrabad to Kumira. Return bus departs at 1:40 PM from Gate 2.
                  </p>
                </div>

                <div className="bg-[#f8faff] hover:bg-[#f0f5fd] border border-blue-100/70 rounded-2xl p-3.5 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Male Students Shift
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      Gate 1
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1 font-medium">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>City: 9:05 AM • Univ: 4:40 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Morning departure starts at 9:05 AM from city stops to Kumira campus. Return bus departs at 4:40 PM from Central Terminal Gate 1.
                  </p>
                </div>

                <div className="bg-[#f8faff] border border-slate-100 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      IIUC Transit Routes
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['Chawkbazar', 'Bahaddarhat', 'GEC Circle', 'Agrabad', 'Oxygen', 'Badamtoli', 'AK Khan', 'Bhatiary'].map((route) => (
                      <span
                        key={route}
                        className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg"
                      >
                        {route}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(70,110,170,0.05)] border border-slate-100 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#3c7bed]" />
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      Student Query / Copilot
                    </span>
                  </div>
                  {input && (
                    <button
                      onClick={handleClear}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PRESETS[activeTab]?.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePreset(p.text)}
                      className="text-[11px] bg-[#f0f4fa] hover:bg-[#edf4fe] text-[#3c7bed] px-2.5 py-1 rounded-xl border border-blue-100/70 transition-colors font-medium shadow-2xs"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask any campus question or select a preset above..."
                  rows={4}
                  className="w-full bg-[#f8faff] border border-slate-200/90 rounded-2xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3c7bed] focus:ring-2 focus:ring-[#3c7bed]/15 transition-all font-sans leading-relaxed"
                />

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Shift + Enter for new line
                  </span>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !input.trim()}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
                      loading || !input.trim()
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-[#4f8cf6] hover:bg-[#3b7ee8] text-white shadow-blue-500/20 active:scale-98'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Ask CampusMate</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-600 font-medium">
                    {error}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(70,110,170,0.05)] border border-slate-100 flex flex-col gap-3 min-h-[260px]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      Gemma 4 Response
                    </span>
                    {provider && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold bg-blue-50 border-blue-200 text-[#3c7bed]">
                        {provider}
                      </span>
                    )}
                  </div>

                  {response && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSpeak}
                        disabled={playingVoice}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#3c7bed] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors shadow-2xs"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${playingVoice ? 'animate-bounce text-blue-600' : ''}`} />
                        <span>{playingVoice ? 'Speaking...' : 'Listen Voice'}</span>
                      </button>

                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-500 gap-2">
                    <div className="w-8 h-8 border-3 border-blue-100 border-t-[#3c7bed] rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-700 font-bold">Synthesizing instant response...</span>
                  </div>
                ) : response ? (
                  <div className="flex-1 overflow-y-auto max-h-[360px] text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-[#f8faff] p-3.5 rounded-xl border border-slate-200/80 select-text">
                    {response}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-slate-400 gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#3c7bed]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Pick a quick demo preset above or ask anything to see Gemma 4 synthesize answers.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(70,110,170,0.05)] border border-slate-100 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-800">
                    News & Updates
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="rounded-2xl overflow-hidden border border-blue-100 bg-gradient-to-br from-[#3b7ee8] via-[#5b95f5] to-[#8db8fc] p-4 text-white shadow-sm flex flex-col justify-between min-h-[140px] relative">
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/10 blur-sm pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Announcement
                    </span>
                    <span className="text-[10px] text-blue-100 font-medium">IIUC Notice</span>
                  </div>
                  <div className="relative z-10 mt-3">
                    <h4 className="font-extrabold text-xs leading-snug">
                      Kumira Campus Transport & Exam Matrix
                    </h4>
                    <p className="text-[10px] text-blue-100 mt-1 line-clamp-2">
                      Pre-registration clearance and bus routines updated for all departments.
                    </p>
                  </div>
                  <div className="relative z-10 mt-3">
                    <button
                      onClick={() => {
                        setActiveTab('bus');
                        handlePreset('IIUC কুমিরা ক্যাম্পাসে ফিমেল (শহর থেকে সকাল ৭:৩০, ক্যাম্পাস থেকে দুপুর ১:৪০) এবং মেল (শহর থেকে সকাল ৯:০৫, ক্যাম্পাস থেকে বিকাল ৪:৪০) স্টুডেন্টদের বাসের শিডিউল ও রুট বাংলায় বিস্তারিত জানাও।');
                      }}
                      className="text-[10px] font-bold bg-white text-[#3c7bed] px-3 py-1 rounded-lg shadow-xs hover:bg-blue-50 transition-colors"
                    >
                      Read more &gt;
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      TD
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800">Transport Division</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                        Female bus leaves city at 7:30 AM, Male bus at 9:05 AM.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      AO
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800">Accounts Office</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                        Online fee payment clearance active via Nagad/bKash/Bank.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-[#3c7bed] flex items-center justify-center font-bold text-[10px] shrink-0">
                      SAD
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800">Student Affairs</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                        Course add/drop window open for Autumn semester.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>© IIUC Kumira</span>
                <span className="font-bold text-slate-600">Gemma 4</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
