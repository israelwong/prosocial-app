const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkStagesAndEvents() {
    try {
        // Obtener todas las etapas
        const stages = await prisma.eventoEtapa.findMany({
            orderBy: {
                posicion: 'asc'
            }
        })

        console.log('📋 Etapas disponibles:')
        for (const stage of stages) {
            // Contar eventos en cada etapa
            const eventCount = await prisma.evento.count({
                where: {
                    eventoEtapaId: stage.id
                }
            })
            
            console.log(`- ${stage.nombre} (pos: ${stage.posicion}): ${eventCount} eventos`)
        }

        // Obtener algunos eventos de "En garantía" para verificar
        const garantiaStage = stages.find(s => s.nombre === 'En garantía')
        if (garantiaStage) {
            const garantiaEvents = await prisma.evento.findMany({
                where: {
                    eventoEtapaId: garantiaStage.id
                },
                select: {
                    id: true,
                    nombre: true,
                    Cliente: {
                        select: {
                            nombre: true
                        }
                    }
                },
                take: 5
            })

            if (garantiaEvents.length > 0) {
                console.log('\n📋 Eventos en "En garantía":')
                garantiaEvents.forEach(event => {
                    console.log(`- ${event.nombre} | Cliente: ${event.Cliente?.nombre}`)
                })
            }
        }

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkStagesAndEvents()
