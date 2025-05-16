import express from 'express';
import makeWASocket from '@itsukichan/baileys';

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to request a pairing code
app.post('/pair', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const sock = makeWASocket({ printQRInTerminal: false });
    const code = await sock.requestPairingCode(phoneNumber);
    return res.status(200).json({ pairingCode: code });
  } catch (error) {
    console.error('Failed to pair:', error);
    return res.status(500).json({ error: 'Failed to generate pairing code' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('WhatsApp Pairing API is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
