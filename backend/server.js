const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

const CAMPUS_CONTEXT = `
You are CampusMate AI, the official all-in-one AI companion for students at IIUC (International Islamic University Chittagong) in Kumira, Sitakunda, Chattogram.
Respond concisely, helpfully, and with high accuracy in English and conversational Bangla.

Comprehensive IIUC Knowledge:
1. Transport & Buses:
   - Routes: Chawkbazar, GEC Circle, Bahaddarhat, Agrabad, Oxygen, Badamtoli, AK Khan, Bhatiary to Kumira.
   - Female Bus Shift: Morning from city: 6:45 AM, 7:15 AM, 7:45 AM. Return from Kumira: 1:15 PM, 1:45 PM, 2:15 PM (Gate 2).
   - Male Bus Shift: Morning from city: 8:00 AM, 8:30 AM, 9:15 AM, 10:00 AM. Return from Kumira: 3:00 PM (Class ending), 3:45 PM, 4:30 PM, 5:15 PM (Gate 1).
2. Studying & Classes:
   - Departments: CSE, EEE, Pharmacy, BBA, Law, English, Arabic & Islamic Studies.
   - Summarize slides, explain complex technical or theological concepts in Bangla, generate 3 practice MCQs.
3. Admin & Paperwork:
   - Pre-registration on IIUC Portal, Tuition fee payment via Nagad/bKash/Bank, Accounts clearance for Admit Card.
   - Minimum GPA 2.00 rule, Student Affairs Division (SAD) for ID cards, Central Library clearance.
4. Student Life & Facilities:
   - Central Cafeteria, Male & Female student residential halls in Kumira, student clubs (Computer Club, Debating Club, Dawah Club).
5. Careers & Internships:
   - Department-specific skill roadmaps (CSE Software Engineering / AI, Pharmacy clinical/industrial, BBA finance/marketing), CV optimization, interview preparation.
`;

const getSystemPrompt = (category) => {
  if (category === 'bus') {
    return `${CAMPUS_CONTEXT}\nTask: Transport & Bus Routine Advisor. Give exact routes, Female/Male departure slots, and seat boarding tips.`;
  }
  if (category === 'study') {
    return `${CAMPUS_CONTEXT}\nTask: Study Buddy & Exam Quiz Maker. Given any lecture note or topic, generate: 1. Core Summary, 2. Easy Bangla explanation, 3. Three practice MCQ exam questions with answers.`;
  }
  if (category === 'admin') {
    return `${CAMPUS_CONTEXT}\nTask: Admin & Clearance Guide. Provide step-by-step guidance on pre-registration, fee payments, and campus offices.`;
  }
  if (category === 'life') {
    return `${CAMPUS_CONTEXT}\nTask: Student Life & Campus Services. Guide on campus halls, cafeteria, clubs, lost-and-found, and campus navigation.`;
  }
  if (category === 'career') {
    return `${CAMPUS_CONTEXT}\nTask: Career & Skill Mentor. Provide tailored tech/business skill roadmaps, CV tips, and interview advice for IIUC students.`;
  }
  return `${CAMPUS_CONTEXT}\nHelp the student with their campus query concisely.`;
};

app.post('/api/chat', async (req, res) => {
  const { message, category = 'general', model = DEFAULT_MODEL, forceLocal = false } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const systemPrompt = getSystemPrompt(category);
  const prompt = `<start_of_turn>user\n${systemPrompt}\n\nStudent Query:\n${message}<end_of_turn>\n<start_of_turn>model\n`;

  if (process.env.GROQ_API_KEY && !forceLocal) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          temperature: 0.6,
          max_tokens: 650,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        return res.json({
          reply: groqData.choices[0].message.content,
          provider: 'Gemma 4 Fast Open-Weight Engine',
          isLocal: false,
        });
      }
    } catch (groqErr) {
      console.warn('Groq instant engine failed, falling back to local Ollama:', groqErr.message);
    }
  }

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: 400,
        },
      }),
    });

    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      return res.json({
        reply: data.response,
        provider: `Local Ollama (${model})`,
        isLocal: true,
      });
    }
  } catch (err) {
    console.warn('Local Ollama error:', err.message);
  }

  return res.status(500).json({
    error: 'Failed to generate response. Please ensure Ollama or internet connection is active.',
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

const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) {
        res.status(200).send('CampusMate AI API is running.');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CampusMate AI backend listening on http://localhost:${PORT}`);
});
