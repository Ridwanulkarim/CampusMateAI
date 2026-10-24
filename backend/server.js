const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor(init) {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
      this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
      this.is2D = true;
      this.isIdentity = true;
      if (Array.isArray(init) && init.length === 6) {
        this.a = init[0]; this.b = init[1]; this.c = init[2]; this.d = init[3]; this.e = init[4]; this.f = init[5];
        this.m11 = init[0]; this.m12 = init[1]; this.m21 = init[2]; this.m22 = init[3]; this.m41 = init[4]; this.m42 = init[5];
      }
    }
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    transformPoint(p) { return p || { x: 0, y: 0 }; }
    inverse() { return this; }
    invertSelf() { return this; }
  };
}

const parsePdfBuffer = async (buffer) => {
  const pdfModule = require('pdf-parse');
  if (pdfModule && pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return {
        text: result.text ? result.text.trim() : '',
        pages: result.total || 1,
      };
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  }
  if (typeof pdfModule === 'function') {
    const result = await pdfModule(buffer);
    return {
      text: result.text ? result.text.trim() : '',
      pages: result.numpages || 1,
    };
  }
  throw new Error('Unsupported pdf-parse version');
};
let Tesseract;
try {
  Tesseract = require('tesseract.js');
} catch (e) {
  Tesseract = null;
}

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

app.post(['/api/chat', '/chat'], async (req, res) => {
  const { message, category = 'general', model = DEFAULT_MODEL, language = 'auto', forceLocal = false } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const hasBanglaText = /[\u0980-\u09FF]/.test(message);
  const isBangla = language === 'bangla' || hasBanglaText;

  let langInstruction = '';
  if (isBangla) {
    langInstruction = 'CRITICAL LANGUAGE DIRECTIVE: You MUST write your entire response strictly in BENGALI (বাংলা ভাষায়). Every word, sentence, heading, bullet point, and explanation must be in pure, fluent Bangla (সম্পূর্ণ উত্তর বাংলায় লিখুন)। Even if the student query is written in English or Banglish, you MUST formulate your entire response in fluent Bengali.';
  } else {
    langInstruction = 'CRITICAL LANGUAGE DIRECTIVE: You MUST write your entire response strictly in clear, fluent ENGLISH. Do not output Bengali text unless specifically requested to translate.';
  }

  const systemPrompt = `${getSystemPrompt(category, isBangla)}\n\n${langInstruction}`;
  const userContent = isBangla
    ? `${message}\n\n(CRITICAL: Provide the complete response 100% in fluent Bengali / সম্পূর্ণ উত্তর বাংলায় দিন)`
    : `${message}\n\n(CRITICAL: Provide the complete response 100% in fluent English)`;
  const prompt = `<start_of_turn>user\n${systemPrompt}\n\nStudent Query:\n${userContent}<end_of_turn>\n<start_of_turn>model\n`;

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
            { role: 'user', content: userContent },
          ],
          temperature: 0.6,
          max_tokens: 2500,
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
          num_predict: 2048,
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

app.post(['/api/extract-file', '/extract-file'], async (req, res) => {
  const { base64, fileType, fileName } = req.body;
  if (!base64) {
    return res.status(400).json({ error: 'No file data received' });
  }

  try {
    if (fileType === 'pdf' || (fileName && fileName.toLowerCase().endsWith('.pdf'))) {
      const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const pdfData = await parsePdfBuffer(buffer);
      return res.json({
        text: pdfData.text ? pdfData.text.trim() : '',
        pages: pdfData.pages || 1,
        type: 'pdf',
        fileName: fileName || 'document.pdf',
      });
    }

    if (fileType === 'image' || (fileName && /\.(png|jpe?g|webp|bmp)$/i.test(fileName))) {
      if (!Tesseract) {
        return res.status(503).json({ error: 'Image OCR is currently active in local mode on your host machine.' });
      }
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
      return res.json({
        text: text ? text.trim() : '',
        type: 'image',
        fileName: fileName || 'image.png',
      });
    }

    return res.status(400).json({ error: 'Unsupported file format' });
  } catch (err) {
    console.error('File extraction error:', err.message);
    return res.status(500).json({ error: 'Extraction failed: ' + err.message });
  }
});

app.post(['/api/tts', '/tts'], async (req, res) => {
  const { text, gender = 'female' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const cleanText = text
    .replace(/[*#_`~>|\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  const isBangla = /[\u0980-\u09FF]/.test(cleanText);

  if (isBangla) {
    try {
      const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=bn&client=tw-ob&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
      const gRes = await fetch(gUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      });
      if (gRes.ok) {
        const buffer = await gRes.arrayBuffer();
        res.set('Content-Type', 'audio/mpeg');
        return res.send(Buffer.from(buffer));
      }
    } catch (gErr) {
      console.warn('Google Bengali TTS fallback error:', gErr.message);
    }
  }

  if (process.env.ELEVENLABS_API_KEY) {
    const voiceId = gender === 'male' ? 'pNInz6obpgDQGcFmaJgB' : '21m00Tcm4TlvDq8ikWAM';
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
    } catch (_) {}
  }

  try {
    const lang = isBangla ? 'bn' : 'en';
    const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
    const gRes = await fetch(gUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });
    if (gRes.ok) {
      const buffer = await gRes.arrayBuffer();
      res.set('Content-Type', 'audio/mpeg');
      return res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error('TTS error:', err.message);
  }

  return res.status(500).json({ error: 'TTS audio generation failed' });
});

app.get(['/api/health', '/health'], (req, res) => {
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 CampusMate AI backend listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
