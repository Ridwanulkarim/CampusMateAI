const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

// Campus Knowledge Base context for IIUC
const CAMPUS_CONTEXT = `
You are CampusMate AI, an intelligent, empathetic campus assistant for university students at IIUC (International Islamic University Chittagong) in Kumira, Chattogram.
You communicate clearly, warmly, and helpfully in both English and natural conversational Bangla.

Campus Facts to use:
- University: International Islamic University Chittagong (IIUC) located at Kumira, Sitakunda, Chattogram.
- Campus Transport: University student buses run between Chattogram city and Kumira campus. Major routes: Chawkbazar, GEC Circle, Bahaddarhat, Agrabad, Oxygen, Badamtoli, AK Khan, Bhatiary to Kumira.
- Morning departure times from city: 7:00 AM, 7:30 AM, 8:15 AM, 9:00 AM, 10:00 AM.
- Afternoon return buses from Kumira: 1:30 PM, 2:30 PM, 3:45 PM, 4:45 PM, 5:30 PM.
- Female and male buses have designated schedules and gates.
- Academics: Departments include CSE, EEE, Pharmacy, BBA, Law, English, Arabic & Islamic Studies (Quranic Sciences, Hadith, Dawah).
- Admin & Offices: Controller of Examinations, Student Affairs Division (SAD), Accounts/Finance office, Central Library.
`;

const getSystemPrompt = (category) => {
  if (category === 'bus') {
    return `${CAMPUS_CONTEXT}
Specific Task: Transport & Bus Schedule Assistance.
Guide students on bus timings, route points, peak rush advice, and directions to/from Kumira campus. Respond with clear bullet points. Include both English & practical Bangla tips.`;
  }

  if (category === 'study') {
    return `${CAMPUS_CONTEXT}
Specific Task: Study Buddy & Exam Prep Generator.
Given lecture notes, slide text, or a course topic, generate:
1. 📖 **Core Summary** (Key takeaways in 3-4 bullet points)
2. 💡 **Easy Explanation in বাংলা** (Simple real-world analogy in Bangla)
3. 🎯 **Practice Quiz (3 MCQs)** with options (A, B, C, D), correct answer, and 1-line explanation.`;
  }

  if (category === 'admin') {
    return `${CAMPUS_CONTEXT}
Specific Task: Admin, Fees & Campus Guide.
Help students with course registration steps, semester fee payments, admit card clearance, library cards, and knowing which office handles what. Provide actionable step-by-step guidance.`;
  }

  return `${CAMPUS_CONTEXT}
Help the student with their campus life, study routine, or general queries accurately and concisely.`;
};

app.post('/api/chat', async (req, res) => {
  const { message, category = 'general', model = DEFAULT_MODEL } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const systemPrompt = getSystemPrompt(category);
  const prompt = `<start_of_turn>user\n${systemPrompt}\n\nStudent Query:\n${message}<end_of_turn>\n<start_of_turn>model\n`;

  // 1. Try Local Ollama first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout for complete generation

    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      return res.json({
        reply: data.response,
        provider: `Local Ollama (${model})`,
        isLocal: true,
      });
    }
  } catch (err) {
    console.warn('Local Ollama unavailable or timed out:', err.message);
  }

  // 2. Cloud Fallback (Groq running open-weight Gemma)
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('Attempting hosted open-weight fallback via Groq...');
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gemma2-9b-it',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.7,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        return res.json({
          reply: groqData.choices[0].message.content,
          provider: 'Hosted Open-Weight (Gemma 2 via Groq)',
          isLocal: false,
        });
      }
    } catch (groqErr) {
      console.error('Groq fallback error:', groqErr.message);
    }
  }

  return res.status(500).json({
    error: 'Failed to generate response. Please ensure Ollama is running locally or check your API key.',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'CampusMate AI',
    defaultModel: DEFAULT_MODEL,
    timestamp: new Date().toISOString(),
  });
});

const path = require('path');

// Serve static frontend build if available
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) {
        res.status(200).send('CampusMate AI API is running. Build frontend or run dev server.');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CampusMate AI backend listening on http://localhost:${PORT}`);
});
