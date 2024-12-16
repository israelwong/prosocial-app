// services/paymentEvents.js
import { PrismaClient } from "@prisma/client";
import {sendSuccessfulPaymentEmail, sendFailedPaymentEmail, sendWelcomeEmail} from "./sendmail";

const prisma = new PrismaClient();

export async function handlePaymentCompleted(session, res) {

    const sessionData = `
        ID de sesión: ${session.data.id}
        Estado de pago: ${session.data.payment_status}
    `;

    res.status(200).send(`session object ${sessionData}`);
    
    try {
        const paymentIntent = session;

        // Obtener el pago correspondiente
        const pago = await prisma.pago.findFirst({
            where: { stripe_session_id: paymentIntent.data.id },
        });

        if (!pago) {
            console.log('No se encontró el pago correspondiente.');
            res.status(404).send('Pago no encontrado');
            return;
        }

        // Obtener el cliente correspondiente
        const cliente = await prisma.cliente.findFirst({
            where: { id: pago.clienteId },
        });

        if (!cliente) {
            console.log('No se encontró el cliente correspondiente.');
            res.status(404).send('Cliente no encontrado');
            return;
        }

        // Obtener la cotización correspondiente
        const cotizacion = await prisma.cotizacion.findFirst({
            where: { id: pago.cotizacionId },
        });

        if (!cotizacion) {
            console.log('No se encontró la cotización correspondiente.');
            res.status(404).send('Cotización no encontrada');
            return;
        }

        // Obtener el evento correspondiente
        const evento = await prisma.evento.findFirst({
            where: { id: cotizacion.eventoId },
        });

        

        const eventoTipo = await prisma.eventoTipo.findFirst({
            where: { id: evento.eventoTipoId },
        });

        if (!eventoTipo) {
            console.log('No se encontró el tipo de evento correspondiente.');
            res.status(404).send('Tipo de evento no encontrado');
            return;
        }

        // Acreditar el pago
        await prisma.pago.update({
            where: { id: pago.id },
            data: { status: 'paid' },
        });

        // Calcular balance total
        const pagos = await prisma.pago.findMany({
            where: { clienteId: cliente.id, status: 'paid' },
        });

        const nombre = cliente.nombre;
        const nombreEvento = evento.nombre;
        const diaEvento = new Date(evento.fecha_evento).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const montoPago = pago.monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
        const precio = cotizacion.precio;
        const totalPagado = pagos.reduce((total, pago) => total + pago.monto, 0)
        const totalPendiente = (precio - totalPagado);
        const estadoPago = pago.status;
        const metodoPago = pago.metodo_pago;
        const fechaPago = new Date(pago.createdAt).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
        const clienteId = cliente.id;
        const telfonoSoporte = '5544546582';
        const paginaWeb = 'www.prosocial.mx';
        const url = `https://prosocial.mx/dashboard/${ cliente.id }`;

        //! Verificar si el evento ya fue aprobado
        if (cotizacion.status !== 'aprobada') {
            await prisma.cotizacion.update({
                where: { id: cotizacion.id },
                data: { status: 'aprobada' },
            });


            //! Enviar correo de bienvenida
            await sendWelcomeEmail(
                cliente.email,
                {
                    nombre,
                    tipoEvento: eventoTipo.nombre,
                    nombreEvento,
                    diaEvento,
                    telfonoSoporte,
                    clienteId,
                    paginaWeb,
                    url,
                },
            );
        }

        //! Enviar correo de notificación de pago
        if(paymentIntent.payment_status!== 'paid') {
            await sendSuccessfulPaymentEmail(
                cliente.email,
                {
                nombre,
                tipoEvento: eventoTipo.nombre,
                nombreEvento,
                diaEvento,
                fechaPago,
                montoPago: montoPago.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                metodoPago: metodoPago.toUpperCase(),
                estadoPago: estadoPago === 'paid' ? 'PAGADO' : estadoPago,
                totalPagado: totalPagado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                totalPendiente: totalPendiente.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                telfonoSoporte,
                clienteId,
                paginaWeb,
                url,
                
            });
            res.status(200).send('gestión completada');
        }

        //! Enviar correo de notificación de pago rechazado
        if(paymentIntent.payment_status === 'failed') {
            await sendFailedPaymentEmail(
                cliente.email,
                {
                nombre,
                tipoEvento: eventoTipo.nombre,
                nombreEvento,
                diaEvento,
                fechaPago,
                montoPago: montoPago.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                metodoPago: metodoPago.toUpperCase(),
                estadoPago: estadoPago === 'paid' ? 'PAGADO' : estadoPago,
                telfonoSoporte,
                clienteId,
                paginaWeb,
                url,
                
            });
            res.status(200).send('El pago fue rechazado');
        }

    } catch (error) {
        console.error('Error al manejar el evento de pago:', error);
        res.status(500).send(`Error ${error}`);
    }
}