import getRawBody from 'raw-body';
import {leadsHandle} from '../../services/leadsEvents';

export const config = {
    api: {
        bodyParser: false, // Necesario para recibir correctamente el raw body
    },
};

export default async function webhook(req, res) {
    try {
        const rawBody = await getRawBody(req);
        const bodyString = rawBody.toString('utf8');
        const body = JSON.parse(bodyString);
        await leadsHandle(body, res);
        res.status(200).send('Webhook recibido correctamente');
    } catch (error) {
        console.error('Error en leadWebhook:', error.message);
        res.status(500).send('Error en leadWebhook:', error.message);
    }
}