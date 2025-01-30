'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import { MoveLeft } from 'lucide-react'
import { crearPago } from '@/app/admin/_lib/pago.actions'
import { actualizarEventoEtapaStatus } from '@/app/admin/_lib/evento.actions'
import { crearNotificacion } from '@/app/admin/_lib/notificacion.actions'
import { actualizarCotizacionStatus } from '@/app/admin/_lib/cotizacion.actions'

interface Props {
    cotizacionId: string
}

export default function TarjetaSPEI({ cotizacionId }: Props) {

    const router = useRouter()
    const searchParams = useSearchParams()
    const clienteId = searchParams?.get('clienteId') || ''
    const condicionesComercialesId = searchParams?.get('condicionesComercialesId') || ''
    const condicionesComercialesMetodoPagoId = searchParams?.get('condicionesComercialesMetodoPagoId') || ''
    const montoanticipo = searchParams?.get('montoanticipo') || ''
    const concepto = searchParams?.get('concepto') || ''
    const descripcion = searchParams?.get('descripcion') || ''
    const preciosistema = searchParams?.get('preciosistema') || ''
    const precioFinal = searchParams?.get('precioFinal') || ''
    const porcentajeAnticipo = searchParams?.get('porcentajeAnticipo') || ''
    const nombreCliente = searchParams?.get('nombreCliente') || ''
    const eventoId = searchParams?.get('eventoId') || ''

    const [clabeCopiada, setClabeCopiada] = React.useState(false)
    const [montoCopiado, setMontoCopiado] = React.useState(false)

    const [confirmandoPromesa, setConfirmandoPromesa] = React.useState(false)
    const [promesaEnviada, setPromesaEnviada] = React.useState(false)

    const clabe = '072180008805738032'
    const beneficiario = 'Israel Campos Polo Wong'
    const institucion = 'Banorte'
    const WhatsApp = '5544546582'

    //! Confirmar promesa de pago
    const confirmarPromesa = async () => {

        const pago = {
            cotizacionId,
            clienteId,
            condicionesComercialesId,
            condicionesComercialesMetodoPagoId,
            montoanticipo,
            metodoPagoId: 'cm41rj66n0007j1l1bd5601p0',
            metodo_pago: 'SPEI', // or the appropriate value
            monto: parseFloat(montoanticipo), // or the appropriate value
            concepto,
            descripcion,
            preciosistema,
            eventoId
        }

        try {

            setConfirmandoPromesa(true)
            const res = await crearPago(pago)
            // console.log('res', res)

            if (res.success) {

                await actualizarEventoEtapaStatus(
                    eventoId,
                    'cm6ecqcju0000gukqfzhu772l',
                    'pendiente'
                )

                await crearNotificacion({
                    userId: clienteId,
                    titulo: `Promesa de pago`,
                    mensaje: `Se ha creado una promesa de pago por ${montoanticipo} para el evento ${concepto}`,
                    status: 'pendiente',
                    cotizacionId
                })

                await actualizarCotizacionStatus(
                    cotizacionId,
                    'aprobada'
                )

                setPromesaEnviada(true)
                setConfirmandoPromesa(false)
                setPromesaEnviada(true)
            }
        } catch (error) {
            console.error('Error al confirmar la promesa de pago:', error)
        } finally {
            setConfirmandoPromesa(false)
        }

    }


    return (
        <>

            <Header asunto='Datos SPEI' />
            <div className='max-w-screen-sm mx-auto p-5'>

                <div>
                    <div>
                        <h1 className='text-2xl font-bold mb-3'>
                            {nombreCliente.split(' ')[0]}!
                        </h1>

                        <p className='mb-5 text-zinc-500'>
                            Te compartimos los todos los detalles para que puedas realizar el pago SPEI del <b>{porcentajeAnticipo}%</b> para reservar tu servicio.
                        </p>
                    </div>

                    <div className='p-4 rounded-md mt-4 border border-zinc-800'>
                        <div className='mb-5'>
                            <div className='text-sm text-zinc-500'>CLABE</div>
                            <div className='flex items-center justify-between'>
                                <div className='text-lg'>{clabe}</div>
                                <button className='text-zinc-500 text-sm' onClick={() => {
                                    navigator.clipboard.writeText(clabe)
                                    setClabeCopiada(true)
                                    setTimeout(() => setClabeCopiada(false), 2000)
                                }}>
                                    {clabeCopiada ?
                                        <p className='text-green-500 border border-green-500 px-2 py-1 rounded-md leading-3 text-xs'>
                                            Copiado
                                        </p>
                                        :
                                        <p className='border border-yellow-500 text-yellow-300 px-2 py-1 rounded-md leading-3 text-xs'>
                                            Copiar
                                        </p>
                                    }
                                </button>
                            </div>
                        </div>

                        <div className='mb-5'>
                            <div className='text-sm text-zinc-500'>Beneficiario</div>
                            <div className='text-lg'>{beneficiario}</div>
                        </div>

                        <div className='mb-5'>
                            <div className='text-sm text-zinc-500'>Institución</div>
                            <div className='text-lg'>{institucion}</div>
                        </div>

                        <div className='mt-b'>
                            <div className='text-sm text-zinc-500'>Monto anticipo</div>
                            <div className='flex items-center justify-between'>
                                <div className='text-lg'>
                                    {parseFloat(montoanticipo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                </div>
                                <button className='text-zinc-500 text-sm' onClick={() => {
                                    navigator.clipboard.writeText(montoanticipo)
                                    setMontoCopiado(true)
                                    setTimeout(() => setMontoCopiado(false), 2000)
                                }}>
                                    {montoCopiado ?
                                        <p className='text-green-500 border border-green-500 px-2 py-1 rounded-md leading-3 text-xs'>
                                            Copiado
                                        </p>
                                        :
                                        <p className='border border-yellow-500 text-yellow-300 px-2 py-1 rounded-md leading-3 text-xs'>
                                            Copiar
                                        </p>
                                    }
                                </button>
                            </div>
                        </div>

                        <div className='mt-4'>
                            <div className='text-sm text-zinc-500'>Concepto</div>
                            <div className='text-lg'>
                                {concepto.replace('%', ' porciento ')}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div>
                            <h2 className='font-bold mt-5 mb-2'>
                                Cuentas claras
                            </h2>
                            <ul className='text-sm text-zinc-500 list-disc pl-5 mb-5'>
                                <li>
                                    Precio total del servicio: <span className='text-zinc-400'>{parseFloat(precioFinal).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                </li>
                                <li>
                                    Porcentaje de anticipo: <span className='text-zinc-400'>{porcentajeAnticipo}%</span>
                                </li>
                                <li>
                                    Monto a pagar: <span className='text-zinc-400'>{parseFloat(montoanticipo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                </li>
                                <li>
                                    Monto a liquidar 2 días antes de la celebración de tu evento: <span className='text-zinc-400'>{(parseFloat(precioFinal) - parseFloat(montoanticipo)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                </li>
                            </ul>
                        </div>
                        {/* //! botones */}
                        <div className='space-y-3 mb-5'>

                            {promesaEnviada ? (
                                <div className='mt-5'>

                                    <div className='mb-5 border border-green-600 bg-green-700 text-green-300 p-5 rounded-md'>
                                        <p className='text-xl text-white font-semibold'>
                                            ¡{nombreCliente.split(' ')[0]} muchas gracias!
                                        </p>
                                        <p>
                                            Tu promesa de pago por {parseFloat(montoanticipo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} se ha creado exitosamente! 🎉
                                        </p>
                                    </div>

                                    <div className='mb-10 text-sm'>
                                        <p className='text-yellow-500 font-semibold mb-2'>¿Qué sigue?</p>
                                        <p className='mb-2 text-zinc-300 italic'>
                                            Realiza tu pago y envía el comprobante (captura de pantalla). <u>Nos saludamos pronto</u> 👋
                                        </p>
                                    </div>

                                </div>
                            ) : (

                                <>
                                    <button
                                        className={`border ${confirmandoPromesa ? 'border-zinc-600 bg-zinc-700 text-zinc-300' : 'border-green-600 bg-green-700 text-green-100'} font-bold px-5 py-4 rounded-md w-full flex items-center justify-center`}
                                        onClick={() => confirmarPromesa()}
                                        disabled={confirmandoPromesa}
                                    >
                                        {confirmandoPromesa ? 'Confirmando promesa...' : 'Confirmar promesa de pago'}
                                    </button>

                                    <button className='bg-blue-600 text-white px-5 py-2 rounded-md w-full flex items-center justify-center'
                                        onClick={() => router.back()}>
                                        <MoveLeft size={20} className='mr-2' />
                                        Cambiar método de pago
                                    </button>

                                    <p className='text-sm text-zinc-500'>
                                        Al confirmar la promesa de pago, la fecha de tu evento aun seguira disponible para otros clientes, por lo que te recomendamos realizar el pago lo antes posible.
                                    </p>

                                </>
                            )}
                        </div>

                    </div>
                </div>




                <Footer telefono={WhatsApp} asunto='Hola, estoy en al pagina de trasferencia, tengo una duda...' />
            </div>
        </>
    )
}
