const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getStageIds() {
    try {
        // Obtener todas las etapas de seguimiento
        const stages = await prisma.eventoEtapa.findMany({
            where: {
                OR: [
                    { nombre: { contains: 'Aprobado', mode: 'insensitive' } },
                    { nombre: { contains: 'edición', mode: 'insensitive' } },
                    { nombre: { contains: 'revisión', mode: 'insensitive' } },
                    { nombre: { contains: 'cliente', mode: 'insensitive' } },
                    { nombre: { contains: 'garantía', mode: 'insensitive' } }
                ]
            },
            orderBy: { posicion: 'asc' }
        })

        console.log('📋 Etapas de seguimiento y sus IDs:')
        console.log('```typescript')
        console.log('const etapasConocidas = {')
        stages.forEach(stage => {
            console.log(`    '${stage.nombre}': '${stage.id}',`)
        })
        console.log('}')
        console.log('```')

        console.log('\n📋 Para usar en el código:')
        stages.forEach(stage => {
            console.log(`- ${stage.nombre}: ${stage.id}`)
        })

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

getStageIds()
