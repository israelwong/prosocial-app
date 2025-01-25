// import {sendSuccessfulPayment, sendWelcomeEmail, sendPedingPayment} from "./sendmail";
import { PrismaClient } from "@prisma/client";
export async function handlePaymentCompleted(session, res) {
    const prisma = new PrismaClient();
    try {

        const paymentIntent = session;

        // Obtener el pago correspondiente
        const pago = await prisma.pago.findFirst({
            where: { stripe_session_id: paymentIntent.id },
        });
        
        if (!pago) {
            console.log(`No se encontró el pago correspondiente para la sesión: ${paymentIntent.id}`);
            res.status(404).send(`Pago no encontrado para la sesión: ${paymentIntent.id}`);
            return;
        }

        //! Acreditar el pago
        if ( paymentIntent.payment_method_types=='card' && paymentIntent.payment_status === 'paid') {    
            await prisma.pago.update({
                where: { id: pago.id },
                data: { status: 'paid' },//! Cambiar a pagado
            });
        }
    } catch (error) {
        console.error('Error al manejar el evento de pago:', error);
        res.status(500).send(`Error ${error}`);
    } finally {
        await prisma.$disconnect();
    }
}