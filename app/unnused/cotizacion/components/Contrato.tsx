import React from 'react'
import { CircleCheck } from 'lucide-react'

interface Props {
    nombreCliente: string
    nombreEvento: string
    tipoEvento: string
    fechaEvento: Date
    condicionesComerciales: string

    totalPrecioSistema: number
    descuento: number
    precioFinal: number
}

export default function Contrato(
    {
        nombreCliente,
        nombreEvento,
        tipoEvento,
        fechaEvento,
        condicionesComerciales,
        totalPrecioSistema,
        descuento,
        precioFinal
    }: Props
) {


    return (

        <div className=''>
            <div className='px-5 py-3'>
                <h1 className='text-xl font-semibold mb-5 uppercase'>
                    Contrato de prestación de servicios profesionales
                </h1>

                <div className=''>

                    {/* GENERALES DEL EVENTO */}
                    <ul className='mb-10 space-y-3'>
                        <li>
                            <p className='font-semibold text-zinc-500'>Nombre del evento:</p>
                            {nombreEvento}
                        </li>
                        <li>
                            <p className='font-semibold text-zinc-500'>Fecha de celebración:</p>
                            {fechaEvento ? new Date(fechaEvento.getTime() + 86400000).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}

                        </li>
                        <li>
                            <p className='font-semibold text-zinc-500'>Tipo de evento:</p>
                            {tipoEvento}
                        </li>
                    </ul>

                    {/* CONTRATO */}
                    <p className='mb-10'>
                        Contrato de prestación de servicios profesionales de fotografía y cinematografía
                        que celebran por una parte <span className='font-semibold text-zinc-500'>PROSOCIALMX</span> y por la otra en lo sucesivo el cliente <span className='font-semibold text-zinc-500 uppercase'>{nombreCliente}</span> instrumento que se celebra de conformidad con las
                        siguientes declaraciones y cláusulas:
                    </p>

                    {/* DECLARACIONES */}
                    <div className='mb-10'>
                        <h2 className='text-lg font-semibold mb-2 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> DECLARACIONES
                        </h2>
                        <ol className='list-disc list-inside text-zinc-400'>
                            <li className='mb-3'>Declara el prestador de servicios que cuenta con la capacidad técnica, equipo y el material para el desempeño de las actividades profesionales en medios audiovisuales encomendadas.</li>
                            <li className='mb-3'>Declara el cliente que conoce los servicios que ofrece el cinematógrafo, y que reconoce que cuenta la capacidad y la técnica necesarias para el cumplimiento de los fines del presente contrato.</li>
                        </ol>
                        <p className='mb-3 text-zinc-400'>Declaran las partes que por lo anterior, manifiestan su conformidad de celebrar este instrumento de conformidad a las siguientes cláusulas:</p>
                    </div>

                    {/* HONORARIOS */}
                    <div className='mb-10'>
                        <h2 className='text-lg font-semibold mb-2 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> HONORARIOS
                        </h2>

                        <p className='mb-2 text-zinc-400'>
                            A continuación se desgloza el precio del servicio contratado:
                        </p>

                        <ul className='mb-5 list-inside text-zinc-400'>
                            <li><span className='text-zinc-200'>Condiciones:</span> {condicionesComerciales}</li>
                            {descuento > 0 && (
                                <>
                                    <li><span className='text-zinc-200'>Precio del servicio:</span> {totalPrecioSistema.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</li>
                                    <li><span className='text-zinc-200'>Descuento aplicado:</span> {descuento.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</li>
                                </>
                            )}
                            <li><span className='text-zinc-200'>Precio final:</span> {precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</li>
                        </ul>
                        <p className='text-zinc-400'>
                            Por la prestación de los servicios arriba establecidos,
                            el cliente pagará la cantidad de
                            <span className='font-semibold bg-yellow-500 px-1 py-0.5 ms-1 text-yellow-900'>{precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span> (pesos mexicanos 00/100 M.N.)
                        </p>

                    </div>

                    {/* REQUERIMIENTOS */}
                    <div className='mb-10'>
                        <h2 className='text-lg font-semibold mb-2 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> REQUERIMIENTOS
                        </h2>
                        <ul className='list-inside text-zinc-400'>
                            <li className='mb-3'>El cliente proporcionará acceso a la locación y las facilidades necesarias para la realización de los servicios contratados.</li>
                            <li className='mb-3'>El cliente proporcionará acceso a los servicios de alimentación y bebidas para el equipo de producción.</li>
                        </ul>
                    </div>

                    {/* GARANTÍAS */}
                    <div className='mb-10'>

                        <h2 className='text-lg font-semibold mb-2 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> GARANTÍAS EN PRODUCCIÓN
                        </h2>
                        <ul className='list-inside space-y-2 text-zinc-400'>
                            <li className='mb-3'><span className='font-semibold text-zinc-200'>Puntualidad:</span> La producción llegará 30 minutos antes al lugar pactado.</li>
                            <li className='mb-3'><span className='font-semibold text-zinc-200'>Equipo técnico:</span> Se llevará todo el equipo contratado y accesorios necesarios.</li>
                        </ul>
                    </div>

                    {/* CANCELACIÓN */}

                    <div className='mb-10'>
                        <h2 className='text-lg font-semibold mb-2 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> EN CASO DE CANCELACIÓN
                        </h2>
                        <p className='text-zinc-400'>
                            El anticipo no es reembolsable por cancelaciones ajenas a PROSOCIAL. Si se cambia la fecha, se respeta el anticipo si PROSOCIAL está disponible. Si la fecha ya está asignada, se considerará como cancelación.
                        </p>
                    </div>

                    {/* POLÍTICAS DE SERVICIO */}
                    <div className='mb-10'>
                        <h2 className='text-lg font-semibold mb-2 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> COSTOS ADICIONALES
                        </h2>
                        <ul className='list-inside text-zinc-400'>
                            <li className='mb-3'><span className='font-semibold text-zinc-200'>Permiso de locación:</span> El cliente cubrirá permisos requeridos por la locación.</li>
                            <li className='mb-3'><span className='font-semibold text-zinc-200'>Horas extra:</span> Se agregarán al presupuesto y pagarán el día de la solicitud.</li>

                        </ul>
                    </div>


                    <div className='mb-5'>
                        <h2 className='text-lg font-semibold mb-3 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> ENTREGA DEL SERVICIO
                        </h2>
                        <ul className='list-inside text-zinc-400'>
                            <li className='mb-3'>Entrega digital máxima en 20 días hábiles después del evento.</li>
                            <li className='mb-3'>Entrega impresa máximo 30 días tras autorizar el diseño de libro.</li>
                            <li className='mb-3'>Cliente puede solicitar respaldo previo en disco de 250GB.</li>
                        </ul>
                    </div>

                    <div className=''>
                        <h2 className='text-lg font-semibold mb-3 flex items-center'>
                            <CircleCheck size={16} className='mr-2' /> GARANTÍAS EN SERVICIO
                        </h2>
                        <ul className='list-inside text-zinc-400'>
                            <li className='mb-3'>Respaldo de material audio visual en disco externo dedicado.</li>
                            <li className='mb-3'>Copia y edición de material en discos duros de trabajo dedicados.</li>
                            <li className='mb-3'>Fotos en alta resolución formato JPG con revelado digital (ajuste de exposición y balance de blancos).</li>
                            <li className='mb-3'>Calidad de video en alta definición.</li>
                            <li className='mb-3'>Plazo de observaciones: 30 días para comentarios y ajustes; después, se borran originales.</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div >


    )
}
