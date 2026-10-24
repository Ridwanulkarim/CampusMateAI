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
You are CampusMate AI, an intelligent campus assistant for university students at IIUC (International Islamic University Chittagong) in Kumira, Chattogram.
Communicate clearly in English and natural conversational Bangla.

Campus Facts:
- International Islamic University Chittagong (IIUC) is at Kumira, Sitakunda, Chattogram.
- Campus Buses: Run between Chittagong city and Kumira campus across Chawkbazar, GEC Circle, Bahaddarhat, Agrabad, Oxygen, Badamtoli, AK Khan, Bhatiary.
- Female Students Bus Shift:
  * Morning departure from city: 6:45 AM, 7:15 AM, 7:45 AM.
  * Return departure from Kumira: 1:15 PM, 1:45 PM, 2:15 PM (Dedicated Female Zone / Gate 2).
- Male Students Bus Shift:
  * Morning departure from city: 8:00 AM, 8:30 AM, 9:15 AM, 10:00 AM.
  * Return departure from Kumira (Classes end at 3:00 PM): 3:00 PM, 3:45 PM, 4:30 PM, 5:15 PM (Central Terminal / Gate 1).
- Academics: CSE, EEE, Pharmacy, BBA, Law, English, Arabic & Islamic Studies.
- Admin Offices: Controller of Examinations, Student Affairs Division (SAD), Accounts Office, Central Library.
`;

const getSystemPrompt = (category) => {
  if (category === 'bus') {
    return `${CAMPUS_CONTEXT}
Task: Transport & Bus Schedule Assistance.
Guide students on bus timings, route points, rush hours, and directions between city and Kumira campus in concise bullet points.`;
  }

  if (category === 'study') {
    return `${CAMPUS_CONTEXT}
Task: Study Buddy & Exam Prep.
Given lecture notes or topic, generate:
1. 📖 Core Summary (3 bullet points)
2. 💡 Easy Explanation in বাংলা
3. 🎯 3 Practice Quiz Questions (MCQs) with answers and 1-line reason.`;
  }

  if (category === 'admin') {
    return `${CAMPUS_CONTEXT}
Task: Admin, Fees & Campus Guide.
Guide students on registration, semester fee clearance, admit cards, and office locations step-by-step.`;
  }

  return `${CAMPUS_CONTEXT}
Help the student with their campus query concisely.`;
};

app.post('/api/chat', async (req, res) => {
  const { message, category = 'general', model = DEFAULT_MODEL } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const systemPrompt = getSystemPrompt(category);
  const prompt = `<start_of_turn>user\n${systemPrompt}\n\nStudent Query:\n${message}<end_of_turn>\n<start_of_turn>model\n`;

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: 800,
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
    console.warn('Local Ollama fallback:', err.message);
  }

  if (process.env.GROQ_API_KEY) {
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
          max_tokens: 600,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        return res.json({
          reply: groqData.choices[0].message.content,
          provider: 'Hosted Open-Weight (GPT-OSS-20B via Groq)',
          isLocal: false,
        });
      }
    } catch (groqErr) {
      console.error('Groq inference error:', groqErr.message);
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
