//! Archivo para hacer pruebas de la función handlePaymentCompleted desde thunder-client
import { handlePaymentCompleted } from '../../services/paymentEvents';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const session = req.body.data.object;
        await handlePaymentCompleted(session, res);
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}