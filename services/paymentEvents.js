import { PrismaClient } from "@prisma/client";
import {sendSuccessfulPayment, sendWelcomeEmail, sendPedingPayment} from "./sendmail";


export async function handlePaymentCompleted(session, res) {

    const prisma = new PrismaClient();

    try {
        const paymentIntent = session;

        const emailPayment = paymentIntent.customer_details.email;
        
        // Obtener el pago correspondiente
        const pago = await prisma.pago.findFirst({
            where: { stripe_session_id: paymentIntent.id },
        });
        
        if (!pago) {
            console.log(`No se encontró el pago correspondiente para la sesión: ${paymentIntent.id}`);
            res.status(404).send(`Pago no encontrado para la sesión: ${paymentIntent.id}`);
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

        const nombre = cliente.nombre;
            const nombreEvento = evento.nombre;
            const diaEvento = new Date(evento.fecha_evento).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const montoPago = pago.monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
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
            const telefonoSoporte = '5544546582';
            const paginaWeb = 'www.prosocial.mx';
            const url = `https://prosocial.mx/dashboard/${ cliente.id }`;

        //! Acreditar el pago
        if ( paymentIntent.payment_method_types=='card' && paymentIntent.payment_status === 'paid') {
            
            // Actualizar el estatus del pago
            await prisma.pago.update({
                where: { id: pago.id },
                data: { status: 'paid' },//! Cambiar a pagado
            });

            //actualizar status cliente
            await prisma.cliente.update({
                where: { id: cliente.id },
                data: { status: 'cliente' }, //! Cambiar a cliente
            });        
            
            
            //! Si la cotización no ha sido aprobada anteriormnte
            if (cotizacion.status !== 'aprobada') {

                const eventoEtapaId = await prisma.eventoEtapa.findFirst({
                    where: { posicion: 2 },                
                });
                
                //! Actualizar el estatus de la cotización
                await prisma.cotizacion.update({
                    where: { id: cotizacion.id },
                    data: { status: 'aprobada' },
                });

                //! actualizar etapa del evento
                await prisma.evento.update({
                    where: { id: evento.id },
                    data: { 
                        eventoEtapaId
                    },
                });

                //! Crear agenda
                await prisma.agenda.create({
                    data: {
                        concepto: `Cobertura de evento ${evento.nombre}`,
                        fecha: evento.fecha_evento,
                        eventoId: evento.id,
                        agendaTipo:'Evento',
                        status: 'pendiente',
                    },
                });

                //! Enviar correo de bienvenida
                if(emailPayment){
                    await sendWelcomeEmail(
                        emailPayment,
                        {
                            nombre,
                            tipoEvento: eventoTipo.nombre,
                            nombreEvento,
                            diaEvento,
                            telefonoSoporte,
                            clienteId,
                            paginaWeb,
                            url,
                        },
                    );
                }
            }

            //! Enviar correo de notificación de pago
            await sendSuccessfulPayment(
                emailPayment,
                {
                    nombre,
                    tipoEvento: eventoTipo.nombre,
                    nombreEvento,
                    diaEvento,
                    fechaPago,
                    montoPago: montoPago.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                    metodoPago: metodoPago.toUpperCase(),
                    estadoPago: 'PAGADO',
                    telefonoSoporte,
                    clienteId,
                    paginaWeb,
                    url,
                });
            res.status(200).send('gestión completada');
        }

        //! Enviar correo de notificación pendiente
        if (paymentIntent.payment_method_types=='customer_balance'){

            await sendPedingPayment(
                emailPayment,
                {
                    nombre,
                    tipoEvento: eventoTipo.nombre,
                    nombreEvento,
                    diaEvento,
                    fechaPago,
                    montoPago: montoPago.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
                    metodoPago: metodoPago.toUpperCase(),
                    estadoPago:'PENDIENTE',
                    telefonoSoporte,
                    clienteId,
                    paginaWeb,
                    url,
                });
                res.status(200).send('El pago esta pendiente');
            }


    } catch (error) {
        console.error('Error al manejar el evento de pago:', error);
        res.status(500).send(`Error ${error}`);
    } finally {
        await prisma.$disconnect();
    }
}