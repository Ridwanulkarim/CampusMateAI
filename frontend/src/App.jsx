import React, { useState, useRef } from 'react';
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
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  FileText,
  Image,
  Loader2,
  MoreVertical,
  X,
  ChevronDown
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
  const [language, setLanguage] = useState('auto');
  const [voiceGender, setVoiceGender] = useState('female');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [provider, setProvider] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const CurrentIcon = currentTab.icon;

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const res = await fetch('/api/extract-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            fileType: type,
            fileName: file.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to extract text from file');
        }

        const data = await res.json();
        setUploadedFile({
          name: file.name,
          type: type,
          pages: data.pages,
        });

        const promptText = `Here are my lecture notes from "${file.name}":\n\n${data.text || 'Document content attached.'}\n\nPlease provide: 1. Core summary, 2. Easy Bangla explanation, 3. Three practice MCQ exam questions with answers.`;
        setInput(promptText);
      } catch (err) {
        console.error(err);
        setError('Error uploading file: ' + err.message);
      } finally {
        setUploadingFile(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      setError('Failed to read file from computer');
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSpeak = async () => {
    if (!response || playingVoice) return;
    setPlayingVoice(true);

    const isBanglaText = /[\u0980-\u09FF]/.test(response);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: response, gender: voiceGender }),
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
      const cleanText = response.replace(/[*#_`]/g, '').slice(0, 350);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (isBanglaText) {
        utterance.lang = 'bn-BD';
        const bnVoice = voices.find(v => v.lang.startsWith('bn') || /bengali|bangla/i.test(v.name));
        if (bnVoice) utterance.voice = bnVoice;
      } else {
        utterance.lang = 'en-US';
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        if (voiceGender === 'female') {
          const femaleVoice = enVoices.find(v => /samantha|ava|karen|siri|zoe|serena|fiona|victoria|google us english/i.test(v.name)) || enVoices.find(v => /female|woman/i.test(v.name)) || enVoices[0];
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = enVoices.find(v => /alex|daniel|tom|oliver|david|fred/i.test(v.name)) || enVoices.find(v => /male|man/i.test(v.name)) || enVoices[0];
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

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
    setUploadedFile(null);
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
    <div className="min-h-screen bg-[#dce5f2] p-1.5 sm:p-3 flex items-center justify-center font-sans relative overflow-x-hidden">
      <div className="absolute top-12 left-6 hidden lg:grid grid-cols-4 gap-2.5 opacity-30 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6a90be]" />
        ))}
      </div>

      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border-[16px] border-[#c7d9ee] opacity-50 pointer-events-none" />
      <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-[#c7daf0] opacity-60 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -right-16 w-60 h-60 rounded-full bg-[#d0e0f5] opacity-40 blur-xl pointer-events-none" />

      <div className="w-full max-w-[98%] 2xl:max-w-[1680px] min-h-[95vh] bg-[#fbfcfe] rounded-2xl sm:rounded-[24px] shadow-[0_15px_45px_rgba(40,75,130,0.1)] border border-white p-2.5 sm:p-4 flex flex-col lg:flex-row gap-3 relative z-10 my-auto">
        <aside className="hidden lg:flex w-48 shrink-0 bg-white rounded-[20px] p-3 shadow-xs border border-slate-100 flex-col gap-3">
          <div className="flex flex-col items-center text-center pt-0.5">
            <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3c7bed] shadow-xs mb-1.5">
              <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 6L28 16H39L30 22L33 32L24 26L15 32L18 22L9 16H20L24 6Z" fill="#3c7bed" opacity="0.15"/>
                <path d="M14 14C11 18 11 27 16 33C19 36 24 38 24 38C24 38 29 36 32 33C37 27 37 18 34 14" stroke="#3c7bed" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M19 18V26C19 28.5 21 30.5 24 30.5C27 30.5 29 28.5 29 26V18" stroke="#3c7bed" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="24" cy="11" r="2.5" fill="#3c7bed"/>
              </svg>
            </div>
            <span className="font-extrabold text-xs tracking-tight text-slate-800">
              IIUC PORTAL
            </span>
            <span className="text-[9px] font-bold text-[#3c7bed] tracking-wide">
              CampusMate AI
            </span>
          </div>

          <nav className="flex flex-col gap-1">
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-[#edf4fe] text-[#3c7bed] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3c7bed]' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="lg:hidden flex items-center justify-between bg-white rounded-xl p-2.5 shadow-xs border border-slate-100 relative">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3c7bed] shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 6L28 16H39L30 22L33 32L24 26L15 32L18 22L9 16H20L24 6Z" fill="#3c7bed" opacity="0.15"/>
                <path d="M14 14C11 18 11 27 16 33C19 36 24 38 24 38C24 38 29 36 32 33C37 27 37 18 34 14" stroke="#3c7bed" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M19 18V26C19 28.5 21 30.5 24 30.5C27 30.5 29 28.5 29 26V18" stroke="#3c7bed" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="24" cy="11" r="2.5" fill="#3c7bed"/>
              </svg>
            </div>
            <span className="font-extrabold text-xs tracking-tight text-slate-800">
              IIUC PORTAL
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1.5 bg-[#edf4fe] text-[#3c7bed] px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100 shadow-2xs"
            >
              <CurrentIcon className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{currentTab.label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-slate-600" /> : <MoreVertical className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <>
              <div 
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-2xs z-40"
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl p-2 shadow-xl border border-slate-200 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Select Category</span>
                  <span>5 Modules</span>
                </div>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                        setError('');
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-[#edf4fe] text-[#3c7bed] font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#3c7bed]' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#3c7bed]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <main className="flex-1 flex flex-col gap-3 min-w-0">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="hidden lg:flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                Welcome, Student!
              </h1>
              <span className="bg-[#22c55e] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                Active
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-2 py-1 text-slate-700 shadow-2xs">
                <Cpu className="w-3.5 h-3.5 text-[#3c7bed]" />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="gemma4:e2b">gemma4:e2b (Fast Edge)</option>
                  <option value="gemma4:12b">gemma4:12b (Deep Reasoning)</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLanguage('auto')}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'auto'
                      ? 'bg-[#3c7bed] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Auto
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bangla')}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'bangla'
                      ? 'bg-[#22c55e] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🇧🇩 বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('english')}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg font-semibold transition-all ${
                    language === 'english'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>

              <button className="hidden sm:flex w-7 h-7 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs transition-colors">
                <Search className="w-3 h-3" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-start">
            <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-[20px] p-3 sm:p-3.5 shadow-xs border border-slate-100 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-800">
                  Classes for the day
                </h3>
                <div className="flex items-center gap-1 text-slate-400">
                  <Search className="w-3 h-3" />
                  <SlidersHorizontal className="w-3 h-3" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="bg-[#f8faff] hover:bg-[#f0f5fd] border border-blue-100/70 rounded-xl p-2.5 sm:p-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Female Students Shift
                    </span>
                    <span className="text-[10px] bg-blue-100 text-[#3c7bed] font-bold px-2 py-0.5 rounded-full">
                      Gate 2
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-1 font-medium">
                    <Clock className="w-3 h-3 text-[#3c7bed]" />
                    <span>City: 7:30 AM • Univ: 1:40 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Morning departure starts at 7:30 AM from Chawkbazar, Bahaddarhat, GEC, Agrabad to Kumira. Return bus departs at 1:40 PM from Gate 2.
                  </p>
                </div>

                <div className="bg-[#f8faff] hover:bg-[#f0f5fd] border border-blue-100/70 rounded-xl p-2.5 sm:p-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Male Students Shift
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      Gate 1
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-1 font-medium">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>City: 9:05 AM • Univ: 4:40 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Morning departure starts at 9:05 AM from city stops to Kumira campus. Return bus departs at 4:40 PM from Central Terminal Gate 1.
                  </p>
                </div>

                <div className="bg-[#f8faff] border border-slate-100 rounded-xl p-2.5 sm:p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      IIUC Transit Routes
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Chawkbazar', 'Bahaddarhat', 'GEC Circle', 'Agrabad', 'Oxygen', 'Badamtoli', 'AK Khan', 'Bhatiary'].map((route) => (
                      <span
                        key={route}
                        className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {route}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="bg-white rounded-2xl sm:rounded-[20px] p-3 sm:p-3.5 shadow-xs border border-slate-100 flex flex-col gap-2.5">
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
                      className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {PRESETS[activeTab]?.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePreset(p.text)}
                      className="text-[10px] bg-[#f0f4fa] hover:bg-[#edf4fe] text-[#3c7bed] px-2.5 py-1 rounded-lg border border-blue-100/70 transition-colors font-medium shadow-2xs text-left"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <input
                    type="file"
                    ref={pdfInputRef}
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingFile}
                    onClick={() => pdfInputRef.current?.click()}
                    className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-[#3c7bed] bg-[#f8faff] hover:bg-blue-50 border border-slate-200/90 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                  >
                    <FileText className="w-3 h-3 text-red-500" />
                    <span>Upload PDF</span>
                  </button>

                  <button
                    type="button"
                    disabled={uploadingFile}
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-[#3c7bed] bg-[#f8faff] hover:bg-blue-50 border border-slate-200/90 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                  >
                    <Image className="w-3 h-3 text-blue-500" />
                    <span>Upload Image</span>
                  </button>

                  {uploadingFile && (
                    <span className="flex items-center gap-1 text-[10px] text-[#3c7bed] font-bold animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Extracting text...</span>
                    </span>
                  )}

                  {uploadedFile && (
                    <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-[#3c7bed] border border-blue-200 px-2 py-0.5 rounded-md font-semibold truncate max-w-full">
                      <span className="truncate">📄 {uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="hover:text-red-600 ml-1 font-bold shrink-0"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask any campus question, click a preset, or upload PDF slides / notes photo..."
                  rows={3}
                  className="w-full bg-[#f8faff] border border-slate-200/90 rounded-xl p-2.5 text-sm sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3c7bed] focus:ring-2 focus:ring-[#3c7bed]/15 transition-all font-sans leading-relaxed"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    Shift + Enter for new line
                  </span>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !input.trim()}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm w-full sm:w-auto ${
                      loading || !input.trim()
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-[#4f8cf6] hover:bg-[#3b7ee8] text-white shadow-blue-500/20 active:scale-98'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Ask CampusMate</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-600 font-medium">
                    {error}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl sm:rounded-[20px] p-3 sm:p-3.5 shadow-xs border border-slate-100 flex flex-col gap-2.5 min-h-[190px]">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      Gemma 4 Response
                    </span>
                    {provider && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full border font-bold bg-blue-50 border-blue-200 text-[#3c7bed]">
                        {provider}
                      </span>
                    )}
                  </div>

                  {response && (
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setVoiceGender('female')}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                            voiceGender === 'female'
                              ? 'bg-white text-[#3c7bed] shadow-2xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          👩 Female
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoiceGender('male')}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                            voiceGender === 'male'
                              ? 'bg-white text-[#3c7bed] shadow-2xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          👨 Male
                        </button>
                      </div>

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
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-500 gap-2">
                    <div className="w-7 h-7 border-3 border-blue-100 border-t-[#3c7bed] rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-700 font-bold">Synthesizing instant response...</span>
                  </div>
                ) : response ? (
                  <div className="flex-1 overflow-y-auto max-h-[350px] text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-[#f8faff] p-3 rounded-xl border border-slate-200/80 select-text">
                    {response}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-400 gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#3c7bed]">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Pick a quick demo preset above, upload slides/notes, or ask anything to see Gemma 4 synthesize answers.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-[20px] p-3 sm:p-3.5 shadow-xs border border-slate-100 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-800">
                    News & Updates
                  </h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="rounded-xl overflow-hidden border border-blue-100 bg-gradient-to-br from-[#3b7ee8] via-[#5b95f5] to-[#8db8fc] p-3 text-white shadow-sm flex flex-col justify-between min-h-[110px] relative">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-sm pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Announcement
                    </span>
                    <span className="text-[9px] text-blue-100 font-medium">IIUC Notice</span>
                  </div>
                  <div className="relative z-10 mt-2">
                    <h4 className="font-extrabold text-xs leading-snug">
                      Kumira Campus Transport & Exam Matrix
                    </h4>
                    <p className="text-[10px] text-blue-100 mt-0.5 line-clamp-2">
                      Pre-registration clearance and bus routines updated for all departments.
                    </p>
                  </div>
                  <div className="relative z-10 mt-2">
                    <button
                      onClick={() => {
                        setActiveTab('bus');
                        handlePreset('IIUC কুমিরা ক্যাম্পাসে ফিমেল (শহর থেকে সকাল ৭:৩০, ক্যাম্পাস থেকে দুপুর ১:৪০) এবং মেল (শহর থেকে সকাল ৯:০৫, ক্যাম্পাস থেকে বিকাল ৪:৪০) স্টুডেন্টদের বাসের শিডিউল ও রুট বাংলায় বিস্তারিত জানাও।');
                      }}
                      className="text-[10px] font-bold bg-white text-[#3c7bed] px-2.5 py-0.5 rounded-md shadow-xs hover:bg-blue-50 transition-colors"
                    >
                      Read more &gt;
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                      TD
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800">Transport Division</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        Female bus leaves city at 7:30 AM, Male bus at 9:05 AM.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                      AO
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800">Accounts Office</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        Online fee payment clearance active via Nagad/bKash/Bank.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#3c7bed] flex items-center justify-center font-bold text-[9px] shrink-0">
                      SAD
                    </div>
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800">Student Affairs</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
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
