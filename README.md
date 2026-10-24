# CampusMate AI
An intelligent, on-device campus life & study assistant for IIUC students powered by Google Gemma 4.

---

## The problem
Students at International Islamic University Chittagong (IIUC) face recurring friction every single week:
1. **Scattered transit information:** University buses commute between Chittagong city and the Kumira campus across different routes (Chawkbazar, GEC, Bahaddarhat, Agrabad), but schedules are scattered on Facebook groups and word-of-mouth. Students regularly miss morning buses or struggle during afternoon rush hours.
2. **Study & exam prep fatigue:** Course materials, lecture slides, and past concepts (especially in CSE, Islamic Studies, and General Science) are hard to condense before exams. Students lack an instant tool to turn slide notes into practice quiz questions and easy Bangla explanations.
3. **Complex campus admin:** Freshers and seniors alike waste hours figuring out fee clearance, course add/drop, and office protocols across the campus.

---

## The solution
**CampusMate AI** is an open-source web application designed specifically for university students. It solves three critical campus pillars:
- 🚌 **IIUC Bus & Transit Navigator:** Instant lookup for city-to-Kumira schedules, boarding gates, and delay management tips.
  - **Female Students Shift:** Starts from city at 7:30 AM | Return departure from Kumira campus at 1:40 PM (Dedicated Gate 2 zone).
  - **Male Students Shift:** Starts from city at 9:05 AM | Return departure from Kumira campus at 4:40 PM (Central Terminal Gate 1).
- 📚 **Lecture-to-Quiz & Bangla Explainer:** Ingests lecture notes/slides and instantly synthesizes core summaries, simple conversational Bangla explanations, and 3 practice MCQ exam questions with solutions.
- 🏛️ **Admin & Freshers Guide:** Step-by-step guidance on course registration, semester fees, and campus office navigation.

The application runs **100% locally and offline on user laptops using Gemma 4**, ensuring privacy, zero API costs, and resilience even when campus Wi-Fi is congested.

---

## How it works

### Model(s) Used
- **Primary Model (On-Device Local Inference):** [Google Gemma 4:e2b](https://ollama.com/library/gemma) & [Gemma 4:12b](https://ollama.com/library/gemma) running locally via **Ollama** on MacBook Pro (`http://localhost:11434`).
- **Cloud Fallback (Production Hosted Inference):** [Gemma 2 9B IT](https://huggingface.co/google/gemma-2-9b-it) hosted on Groq for 100% public uptime on web deployment.

### Tech Stack
- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express.js (serving local Ollama API bridge + cloud failover)
- **Deployment:** Vercel (Production) & Localhost (Onsite Live Defense)
- **License:** OSI-Approved MIT License

### Datasets & Knowledge Grounding
- Official IIUC Campus bus schedule matrix:
  - Female students: 7:30 AM starting departure from city, 1:40 PM return departure from Kumira campus (Gate 2).
  - Male students: 9:05 AM starting departure from city, 4:40 PM return departure from Kumira campus (Gate 1).
  - Routes: Chawkbazar, GEC Circle, Bahaddarhat, Agrabad, Oxygen, Badamtoli, AK Khan, Bhatiary to Kumira.
- IIUC academic administration procedures & department directory.

---

## How to run it

### Prerequisites
- Node.js (v18+)
- [Ollama](https://ollama.com) installed with Gemma 4:
```bash
ollama run gemma4:e2b
```

### 1. Clone the repo
```bash
git clone https://github.com/Ridwanulkarim/CampusMateAI.git
cd CampusMateAI
```

### 2. Install requirements
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Run the app
```bash
# Terminal 1: Start Backend (Port 5001)
npm run server

# Terminal 2: Start Frontend (Port 5173)
npm run client
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Models and AI Disclosure (Rulebook Compliance)
- **Open-Weight Models in Product:** Google Gemma 4 (`gemma4:e2b` and `gemma4:12b`) self-hosted locally via Ollama.
- **AI Coding Assistant Disclosure:** Antigravity AI Assistant was utilized as an intelligent pair-programmer for scaffolding Vite templates, Tailwind UI styling, and verifying syntax.
- **Human Author Contributions:** The campus domain knowledge grounding, dual-inference failover architecture (Local Ollama + Groq), system prompt engineering for the 3 campus pillars, interactive preset data, and end-to-end integration were designed and implemented by Ridwanul Karim.

---

## What's not done yet
- **Real-time GPS bus tracking:** Currently uses static verified schedule routines; integrating live GPS IoT trackers from university buses is planned for v2.
- **Direct PDF/Image slide OCR:** Currently students paste text directly; adding direct PDF file upload parsing is on the future roadmap.

---

## Credits
- [Google Gemma](https://ai.google.dev/gemma) for open-weight language models.
- [Ollama](https://ollama.com) for local LLM orchestration.
- [Tailwind CSS](https://tailwindcss.com) & [Lucide Icons](https://lucide.dev) for interface design.
- Major League Hacking (MLH), DEV, UniDevs & Machine Learning Bangladesh for organizing Hacktoberfest Hack Day Chittagong at IIUC.

---

## License
Licensed under the [MIT License](LICENSE).
