import { NextRequest, NextResponse } from 'next/server'
import { obtenerPaquetesParaCliente } from '@/app/admin/_lib/actions/paquetes/paquetes.actions'

export async function GET(request: NextRequest) {
    console.log('\n🚀 🚀 🚀 API PAQUETES PARA CLIENTE LLAMADA 🚀 🚀 🚀')

    try {
        // Obtener parámetros de filtro
        const { searchParams } = new URL(request.url)
        const eventoTipoId = searchParams.get('eventoTipoId')

        console.log('🔍 === INICIANDO CARGA DE PAQUETES PARA CLIENTE ===')
        console.log('🎯 eventoTipoId recibido:', eventoTipoId)

        console.log('📞 Llamando a obtenerPaquetesParaCliente()...')
        const paquetes = await obtenerPaquetesParaCliente()
        console.log('✅ obtenerPaquetesParaCliente() completado')

        console.log('📊 Total de eventos tipo obtenidos:', paquetes.length)

        // Log de la estructura de datos obtenida
        paquetes.forEach((eventoTipo, index) => {
            console.log(`\n📋 EventoTipo ${index + 1}:`)
            console.log(`  ID: ${eventoTipo.id}`)
            console.log(`  Nombre: ${eventoTipo.nombre}`)
            console.log(`  Paquetes: ${eventoTipo.Paquete.length}`)

            eventoTipo.Paquete.forEach((paquete, pIndex) => {
                console.log(`    📦 Paquete ${pIndex + 1}: ${paquete.nombre} (${paquete.PaqueteServicio.length} servicios)`)
            })
        })

        // Filtrar por tipo de evento si se especifica
        const paquetesFiltrados = eventoTipoId
            ? paquetes.filter(eventoTipo => eventoTipo.id === eventoTipoId)
            : paquetes

        console.log('\n🔍 DESPUÉS DEL FILTRADO:')
        console.log('📦 Eventos tipo filtrados:', paquetesFiltrados.length)

        if (eventoTipoId && paquetesFiltrados.length === 0) {
            console.log('⚠️ No se encontraron paquetes para eventoTipoId:', eventoTipoId)
        }

        // Extraer solo los paquetes con su información completa
        const paquetesFormateados = paquetesFiltrados.flatMap(eventoTipo =>
            eventoTipo.Paquete.map(paquete => {
                const paqueteFormateado = {
                    id: paquete.id,
                    nombre: paquete.nombre,
                    precio: paquete.precio,
                    eventoTipoId: eventoTipo.id,
                    eventoTipo: eventoTipo.nombre,
                    PaqueteServicio: paquete.PaqueteServicio
                }

                console.log(`\n✨ Paquete formateado: ${paquete.nombre}`)
                console.log(`  ID: ${paquete.id}`)
                console.log(`  EventoTipoId: ${eventoTipo.id}`)
                console.log(`  Servicios: ${paquete.PaqueteServicio.length}`)

                // Log de los primeros servicios para verificar estructura
                if (paquete.PaqueteServicio.length > 0) {
                    paquete.PaqueteServicio.slice(0, 2).forEach((servicio, sIndex) => {
                        console.log(`    🔧 Servicio ${sIndex + 1}:`, {
                            id: servicio.id,
                            nombre: servicio.Servicio?.nombre,
                            seccion: servicio.Servicio?.ServicioCategoria?.seccionCategoria?.Seccion?.nombre,
                            categoria: servicio.Servicio?.ServicioCategoria?.nombre
                        })
                    })
                }

                return paqueteFormateado
            })
        )

        console.log('\n📊 RESUMEN FINAL:')
        console.log(`✅ Paquetes formateados para enviar: ${paquetesFormateados.length}`)
        console.log('=== FIN CARGA DE PAQUETES ===\n')

        return NextResponse.json(paquetesFormateados)

        /* The `catch` block in the provided TypeScript code snippet is used to handle any errors that may
        occur during the execution of the `GET` function. Here's what the `catch` block is doing: */
        /* The `catch` block in the provided TypeScript code snippet is used to handle any errors that may
        occur during the execution of the `GET` function. Here's what the `catch` block is doing: */
    } catch (error) {
        console.error('❌ Error en API /api/paquetes/para-cliente:')
        if (error instanceof Error) {
            console.error('  Mensaje:', error.message)
            console.error('  Stack:', error.stack)
            console.error('  Error completo:', error)
            return NextResponse.json(
                { error: 'Error interno del servidor', details: error.message },
                { status: 500 }
            )
        } else {
            console.error('  Error desconocido:', error)
            return NextResponse.json(
                { error: 'Error interno del servidor', details: String(error) },
                { status: 500 }
            )
        }
    }
}
