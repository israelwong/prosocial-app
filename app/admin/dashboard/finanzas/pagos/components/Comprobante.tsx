'use client'
import React, { useEffect, useRef } from 'react'
import { Pago, Cliente, Evento, Cotizacion } from '@/app/admin/_lib/types'
import { obtenerPago, obtenerPagosCotizacion } from '@/app/admin/_lib/pago.actions'
import { obtenerCliente } from '@/app/admin/_lib/cliente.actions'
import { obtenerEventoPorId } from '@/app/admin/_lib/evento.actions'
import { obtenerCotizacion } from '@/app/admin/_lib/cotizacion.actions'
import { obtenerTipoEvento } from '@/app/admin/_lib/eventoTipo.actions'

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Props {
    pagoId: string
}

export default function PagoComprobante({ pagoId }: Props) {

    const divRef = useRef<HTMLDivElement | null>(null);

    const [pago, setPago] = React.useState<Pago | null>(null)
    const [cliente, setCliente] = React.useState<Cliente | null>(null)
    const [evento, setEvento] = React.useState<Evento | null>(null)
    const [cotizacion, setCotizacion] = React.useState<Cotizacion | null>(null)
    const [totalPagaado, setTotalPagado] = React.useState<number | null>(null)
    const [saldoPendiente, setSaldoPendiente] = React.useState<number | null>(null)
    const [tipoEvento, setTipoEvento] = React.useState<string | null>(null)
    const [fechEvento, setFechaEvento] = React.useState<string | null>(null)
    const [fechaActual, setFechaActual] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [generandoPDF, setGenerandoPDF] = React.useState(false)


    useEffect(() => {

        const fetchData = async () => {


            const data = await obtenerPago(pagoId)
            setPago(data)

            const clientePromise = data?.clienteId ? obtenerCliente(data.clienteId) : Promise.resolve(null)
            const cotizacionPromise = data?.cotizacionId ? obtenerCotizacion(data.cotizacionId) : Promise.resolve(null)

            const [cliente, cotizacion] = await Promise.all([clientePromise, cotizacionPromise])
            setCliente(cliente)
            setCotizacion(cotizacion)

            if (cotizacion?.eventoId) {
                const eventoPromise = obtenerEventoPorId(cotizacion.eventoId)
                const pagosPromise = data?.cotizacionId ? obtenerPagosCotizacion(data.cotizacionId) : Promise.resolve([])
                const [evento, pagos] = await Promise.all([eventoPromise, pagosPromise])

                setEvento(evento)
                setFechaEvento(evento?.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : null)

                if (evento?.eventoTipoId) {
                    const tipoEvento = await obtenerTipoEvento(evento.eventoTipoId)
                    setTipoEvento(tipoEvento?.nombre ?? null)
                }

                const total_pagado = pagos?.reduce((acc, pago) => acc + (pago.monto ?? 0), 0) ?? 0
                setTotalPagado(total_pagado)

                const saldo_pendiente = (cotizacion?.precio ?? 0) - (total_pagado || 0)
                setSaldoPendiente(saldo_pendiente)
            }

            setFechaActual(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }))
        }
        fetchData()
        setLoading(false)

    }, [pagoId])

    const handleDescargarComprobante = async () => {
        const element = divRef.current;

        setGenerandoPDF(true)
        if (element) {
            const canvas = await html2canvas(element, {
                scale: 2, // Mejor calidad
                backgroundColor: "#ffffff", // Fondo blanco
                useCORS: true, // Soporte para imágenes externas
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [canvas.width + 20, canvas.height + 20], // Añadir márgenes
            });

            const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
            pdf.addImage(imgData, "PNG", 10, 10, canvas.width, canvas.height);
            pdf.save(`comprobante_pago_${cliente?.nombre}_${fechaActual}.pdf`);
            setGenerandoPDF(false)
        }
    };

    if (loading) {
        return <div className="text-center items-center justify-center mx-auto h-screen flex">
            Cargando...
        </div>
    }

    return (
        <div className="mx-auto max-w-sm md:p-5 p-0 justify-center items-center">

            <div className='mb-5'>
                <h3 className='font-Bebas-Neue text-4xl text-zinc-500'>
                    Comprobante de pago
                </h3>
                <p>
                    Comparte el siguiente comprobante de pago con el cliente.
                </p>
            </div>

            <div ref={divRef} className="bg-white text-black p-4 rounded shadow-lg mb-3">
                <div className="mb-5">
                    <h3 className="font-semibold text-2xl mb-2 font-Bebas-Neue text-zinc-700">
                        Comprobante de pago
                    </h3>

                    <p className="mb-3">
                        {cliente?.nombre}! Se registró un pago a tu cuenta de ProSocial. Te compartimos tu comprobante de pago:
                    </p>
                </div>

                <div className="mb-5">
                    <ul className="mb-3">
                        <li><strong className='text-zinc-400'>Monto pagado:</strong> {pago?.monto?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} </li>
                        <li><strong className='text-zinc-400'>Método de pago:</strong> {pago?.metodo_pago} </li>
                        <li><strong className='text-zinc-400'>Fecha de pago: </strong>{pago?.updatedAt ? new Date(pago.updatedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : null}</li>
                    </ul>
                    <p className="mb-5 italic">
                        Por concepto de {pago?.concepto}:
                    </p>
                </div>

                <div className="p-5 bg-zinc-200 rounded-md mb-5">
                    <p className="text-sm underline">
                        Balance al {fechaActual}:
                    </p>
                    <ul className="">
                        <li><strong>Precio del servicio:</strong> <span className='text-zinc-600'>{cotizacion?.precio?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></li>
                        <li><strong>Total pagado:</strong> <span className='text-green-700'>{totalPagaado?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></li>
                        <li><strong>Saldo pendiente:</strong> <span className='text-red-700'>{saldoPendiente?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></li>
                    </ul>
                </div>

                <div className='mb-5'>
                    <h3>Detalles del evento</h3>
                    <ul className="list-disc list-inside px-3 py-1 text-sm">
                        <li><strong style={{ color: '#9ca3af' }}>Evento:</strong> {tipoEvento} de {evento?.nombre} </li>
                        <li><strong style={{ color: '#9ca3af' }}>Celebración:</strong> {fechEvento}</li>

                    </ul>
                </div>
            </div>

            <div>
                <button
                    className="bg-blue-900 text-white p-2 rounded-md border border-blue-700 text-sm mb-3 w-full"
                    onClick={handleDescargarComprobante}
                    disabled={generandoPDF}
                >
                    {generandoPDF ? 'Generando PDF...' : 'Descargar comprobante en PDF'}
                </button>

                <button
                    className="bg-red-600 text-white p-2 rounded-md border border-red-500 text-sm w-full"
                    onClick={() => window.close()}
                >
                    Cerrar ventana
                </button>
            </div>
        </div>
    );
}
