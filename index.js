import express from 'express';
import { default as makeWASocket, Browsers } from '@itsukichan/baileys';
import Pino from 'pino';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// مسار ملف الجلسة
const AUTH_FILE = path.resolve('./cards.json');

// تحميل الجلسة إن وجدت
let authState = { creds: null, keys: {} };
if (fs.existsSync(AUTH_FILE)) {
  authState = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
}

// تقديم الملفات الثابتة
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// تهيئة الـ socket
const sock = makeWASocket({
  auth: authState,
  printQRInTerminal: false,           // بدون طباعة QR
  logger: Pino({ level: 'silent' }),  // كتم الرسائل في الكونسول
  browser: Browsers.ubuntu('MyApp')    // اسم وهمي للمتصفح
});

// عند تحديث بيانات الاعتماد، نحفظها في cards.json
sock.ev.on('creds.update', () => {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(authState, null, 2));
});

// لمراقبة حالة الاتصال (اختياري)
sock.ev.on('connection.update', update => {
  console.log('Connection Update:', update);
});

/**
 * نقطة النهاية لإرسال رقم الهاتف واستقبال الـ Pairing Code
 * المتوقّع body: { number: "1234567890" }
 */
app.post('/code', async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ code: null, msg: 'رقم الهاتف مطلوب' });
    }
    // اطلب كود الـ Pairing من Baileys
    const pairingCode = await sock.requestPairingCode(number);
    // إعادة الكود للواجهة الأمامية
    return res.json({ code: pairingCode });
  } catch (error) {
    console.error('Error requesting code:', error);
    return res.status(500).json({ code: null, msg: 'حدث خطأ، حاول مرة أخرى' });
  }
});

/**
 * نقطة النهاية الرئيسية (/)
 * تعرض ملف index.html
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// بدء الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
