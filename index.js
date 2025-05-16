import makeWASocket from '@itsukichan/baileys';

async function testPair() {
  const sock = makeWASocket({ printQRInTerminal: false });
  try {
    const code = await sock.requestPairingCode('212679894168');
    console.log('Pairing code is:', code);
  } catch (e) {
    console.error('Failed to pair:', e);
  }
}
testPair();
