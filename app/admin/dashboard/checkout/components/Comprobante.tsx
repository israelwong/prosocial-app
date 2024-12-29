'use client';
import { useEffect, useState } from 'react';
import { obtenerDetallesPago } from '@/app/admin/_lib/pago.actons';
import { Pago, Cliente, Evento, Cotizacion } from '@/app/admin/_lib/types';

interface props {
    pagoId: string
}

export default function Comprobante({ pagoId }: props) {

    const [pago, setPago] = useState<Pago>();
    const [cliente, setCliente] = useState<Cliente>();
    const [evento, setEvento] = useState<Evento>();
    const [cotizacion, setCotizacion] = useState<Cotizacion>();
    const [loading, setLoading] = useState(true);
    const [pagos, setPagos] = useState<Pago[]>([]);

    useEffect(() => {
        obtenerDetallesPago(pagoId).then((data) => {
            if (data.pago) {
                setPago(data.pago);
            }
            if (data.cliente) {
                setCliente(data.cliente);
            }
            if (data.evento) {
                setEvento(data.evento);
            }
            if (data.cotizacion) {
                setCotizacion(data.cotizacion);
            }
            if (data.pagosCotizacion) {
                setPagos(data.pagosCotizacion);
            }
            setLoading(false);
        });
    }, [pagoId]);


    return (
        <div>
            Comprobante de pago {pagoId}

            {loading && <p>Cargando...</p>}

            {!loading && pago && cliente && evento && cotizacion && (
                <div>
                    <p>Cliente: {cliente.nombre}</p>
                    <p>Evento: {evento.nombre}</p>
                    <p>Cotización: {cotizacion.id}</p>
                    <p>Monto: {pago.monto}</p>
                    <p>Concepto: {pago.concepto}</p>
                    <p>Descripción: {pago.descripcion}</p>
                    <p>Fecha de pago: {pago.createdAt?.toString()}</p>
                    <p>Estado: {pago.status}</p>
                    <p>Metodo de pago: {pago.metodo_pago}</p>
                    <p>Stripe payment id: {pago.stripe_payment_id}</p>
                    <p>Cliente id: {pago.clienteId}</p>
                    <p>Cotización id: {pago.cotizacionId}</p>
                    <p>Condiciones comerciales id: {pago.condicionesComercialesId}</p>
                    <p>Condiciones comerciales metodo de pago id: {pago.condicionesComercialesMetodoPagoId}</p>

                    <h3>Pagos de la cotización</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Concepto</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Método de pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map((pago, index) => (
                                <tr key={index}>
                                    <td>{pago.createdAt?.toString()}</td>
                                    <td>{pago.monto}</td>
                                    <td>{pago.concepto}</td>
                                    <td>{pago.descripcion}</td>
                                    <td>{pago.status}</td>
                                    <td>{pago.metodo_pago}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    )
}
