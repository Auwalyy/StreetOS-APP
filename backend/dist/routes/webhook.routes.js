"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// WhatsApp Business API webhook verification
router.get('/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    }
    else {
        res.sendStatus(403);
    }
});
// WhatsApp incoming messages
router.post('/whatsapp', async (req, res) => {
    // Process incoming WhatsApp messages
    // Route to transaction/debt creation based on message content
    res.sendStatus(200);
});
exports.default = router;
//# sourceMappingURL=webhook.routes.js.map