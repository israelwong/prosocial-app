// pages/api/paymentEvents.js
import { handlePaymentCompleted } from '../../services/paymentEvents';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const session = req.body;
        await handlePaymentCompleted(session, res);
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}