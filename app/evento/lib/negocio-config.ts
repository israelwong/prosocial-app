import { obtenerConfiguracionCompleta } from '@/app/admin/_lib/actions/negocio/negocio.actions'

/**
 * Función helper para obtener la configuración del negocio
 * Retorna datos por defecto si no se encuentra configuración
 */
export async function obtenerConfiguracionNegocio() {
    try {
        const config = await obtenerConfiguracionCompleta()
        console.log('🔍 Config obtenida:', {
            negocio: !!config.negocio,
            redesSocialesCount: config.redesSociales?.length || 0,
            redesSociales: config.redesSociales
        })

        if (!config.negocio) {
            // Configuración por defecto si no hay datos en la BD
            return {
                nombre: 'ProSocial',
                logotipo: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg',
                isotipo: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg',
                slogan: 'Momentos para toda la vida',
                telefono: '5544546582',
                whatsapp: '5544546582',
                email: 'contacto@prosocial.mx',
                horarios: [],
                redesSociales: []
            }
        }

        const negocio = config.negocio

        return {
            nombre: negocio.nombre || 'ProSocial',
            logotipo: negocio.logoUrl || 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg',
            isotipo: negocio.isotipoUrl || 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg',
            slogan: 'Momentos para toda la vida', // Este campo no está en la BD aún
            telefono: negocio.telefono || '5544546582',
            whatsapp: negocio.telefono || '5544546582', // Usamos el mismo teléfono para WhatsApp
            email: negocio.email || 'contacto@prosocial.mx',
            horarios: config.horarios || [],
            redesSociales: config.redesSociales || []
        }
    } catch (error) {
        console.error('Error al obtener configuración del negocio:', error)

        // Retornar configuración por defecto en caso de error
        return {
            nombre: 'ProSocial',
            logotipo: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg',
            isotipo: 'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg',
            slogan: 'Momentos para toda la vida',
            telefono: '5544546582',
            whatsapp: '5544546582',
            email: 'contacto@prosocial.mx',
            horarios: [],
            redesSociales: []
        }
    }
}
