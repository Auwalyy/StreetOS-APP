import { Router, Request, Response } from 'express';

const router = Router();

// WhatsApp Business API webhook verification
router.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// WhatsApp incoming messages
router.post('/whatsapp', async (req: Request, res: Response) => {
  // Process incoming WhatsApp messages
  // Route to transaction/debt creation based on message content
  res.sendStatus(200);
});

export default router;
