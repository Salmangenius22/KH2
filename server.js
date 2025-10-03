// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat sederhana (riwayat disimpan di memori server)
let chatHistory = [];

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    let prompt = "Kamu adalah chatbot ramah lingkungan bernama EcoBot. Jawab singkat dan jelas dalam bahasa Indonesia.\n\n";
    for (const turn of chatHistory) {
      prompt += `User: ${turn.user}\nEcoBot: ${turn.bot}\n\n`;
    }
    prompt += `User: ${message}\nEcoBot:`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      temperature: 0.3,
      maxOutputTokens: 300
    });

    const reply = response?.text || 'Maaf, saya tidak bisa menjawab sekarang.';

    chatHistory.push({ user: message, bot: reply });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
