const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

const CAMPUS_CONTEXT = `
You are CampusMate AI, the official all-in-one AI companion for students at IIUC (International Islamic University Chittagong) in Kumira, Sitakunda, Chattogram.
Respond concisely, helpfully, and with high accuracy. Strictly match the language of the student's question: if asked in Bangla, answer 100% in natural Bengali; if asked in English, answer 100% in clear English.

Comprehensive IIUC Knowledge:
1. Transport & Buses:
   - Routes: Chawkbazar, GEC Circle, Bahaddarhat, Agrabad, Oxygen, Badamtoli, AK Khan, Bhatiary to Kumira.
   - Female Bus Shift: Morning starting departure from city at 7:30 AM. Return departure from Kumira university campus at 1:40 PM (Dedicated Female Zone / Gate 2).
   - Male Bus Shift: Morning starting departure from city at 9:05 AM. Return departure from Kumira university campus at 4:40 PM (Central Terminal / Gate 1).
2. Studying & Classes:
   - Departments: CSE, EEE, Pharmacy, BBA, Law, English, Arabic & Islamic Studies.
   - Summarize slides, explain complex technical or theological concepts clearly, generate 3 practice MCQs.
3. Admin & Paperwork:
   - Pre-registration on IIUC Portal, Tuition fee payment via Nagad/bKash/Bank, Accounts clearance for Admit Card.
   - Minimum GPA 2.00 rule, Student Affairs Division (SAD) for ID cards, Central Library clearance.
4. Student Life & Facilities:
   - Central Cafeteria, Male & Female student residential halls in Kumira, student clubs (Computer Club, Debating Club, Dawah Club).
5. Careers & Internships:
   - Department-specific skill roadmaps (CSE Software Engineering / AI, Pharmacy clinical/industrial, BBA finance/marketing), CV optimization, interview preparation.
`;

const getSystemPrompt = (category, isBangla) => {
  if (category === 'bus') {
    return `${CAMPUS_CONTEXT}\nTask: Transport & Bus Routine Advisor. Give exact routes, Female/Male departure slots, and seat boarding tips.\nOfficial IIUC Bus Schedule:\n- Female Students: Starting departure from city at 7:30 AM | Return departure from Kumira campus at 1:40 PM (Gate 2)\n- Male Students: Starting departure from city at 9:05 AM | Return departure from Kumira campus at 4:40 PM (Gate 1)\nAlways state these exact departure and return timings explicitly whenever asked.`;
  }
  if (category === 'study') {
    if (isBangla) {
      return `${CAMPUS_CONTEXT}\nTask: Study Buddy & Exam Quiz Maker. Given any lecture note or topic, generate: ১. মূল সারসংক্ষেপ (Summary), ২. সহজ ও প্রাঞ্জল বাংলা ব্যাখ্যা (Bangla Explanation), ৩. ৩টি প্র্যাকটিস কুইজ প্রশ্ন ও উত্তর (3 Practice MCQs with Answers)।`;
    }
    return `${CAMPUS_CONTEXT}\nTask: Study Buddy & Exam Quiz Maker. Given any lecture note or topic, generate: 1. Core Summary, 2. Clear explanation with real-world examples, 3. Three practice MCQ exam questions with answers.`;
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
  const { message, category = 'general', model = DEFAULT_MODEL, language = 'auto', forceLocal = false } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const hasBanglaText = /[\u0980-\u09FF]/.test(message);
  const isBangla = language === 'bangla' || (language !== 'english' && hasBanglaText);

  let langInstruction = '';
  if (isBangla) {
    langInstruction = 'CRITICAL LANGUAGE DIRECTIVE: The student asked in Bangla. You MUST write your entire response strictly in BENGALI (বাংলা ভাষায়). Do not output English sentences or English explanations. Every heading, point, and explanation must be in natural, fluent Bangla (সম্পূর্ণ উত্তর বাংলায় লিখুন)।';
  } else {
    langInstruction = 'CRITICAL LANGUAGE DIRECTIVE: The student asked in English. You MUST write your entire response strictly in clear, fluent ENGLISH. Do not output Bengali text unless specifically requested to translate.';
  }

  const systemPrompt = `${getSystemPrompt(category, isBangla)}\n\n${langInstruction}`;
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

app.post('/api/tts', async (req, res) => {
  const { text, gender = 'female' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const cleanText = text.replace(/[*#_`]/g, '').slice(0, 300);

  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: 'ElevenLabs API key missing' });
  }

  const voiceId = gender === 'male' ? 'ErXwobaYiN019PkySvjV' : '21m00Tcm4TlvDq8ikWAM';

  try {
    const voiceRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (voiceRes.ok) {
      const buffer = await voiceRes.arrayBuffer();
      res.set('Content-Type', 'audio/mpeg');
      return res.send(Buffer.from(buffer));
    }

    const errData = await voiceRes.text();
    return res.status(500).json({ error: errData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
