import { Metadata } from 'next';
import { obtenerCatalogoCompleto } from '@/app/admin/_lib/actions/catalogo/catalogo.actions';
// Importa el nuevo componente organizador
import Organizador from './components/Organizador';
import { Servicio, ServicioCategoria, ServicioSeccion } from '@prisma/client';

export const metadata: Metadata = {
    title: 'Organizador de Catálogo de Servicios',
};

// --- TIPOS PARA LOS DATOS CRUDOS DEL SERVIDOR ---
type RawServicio = Servicio & {
    ServicioGasto?: { id: string; nombre: string; costo: number; servicioId: string }[];
    precio_publico: number; // Ahora calculado dinámicamente
};
type RawCategoria = ServicioCategoria & { Servicio: RawServicio[] };
type RawSeccionCategoria = { ServicioCategoria: RawCategoria };
type RawSeccion = ServicioSeccion & { seccionCategorias: RawSeccionCategoria[] };
type RawCatalogo = RawSeccion[];


// Función para transformar los datos del servidor a la estructura que esperan los componentes cliente
const transformCatalogoData = (catalogo: RawCatalogo) => {
    console.log('🔍 FRONTEND DEBUG - Datos originales de BD:');
    catalogo.forEach((seccion, secIndex) => {
        console.log(`Sección ${secIndex}: "${seccion.nombre}" (pos BD: ${seccion.posicion})`);
        seccion.seccionCategorias.forEach((sc, catIndex) => {
            console.log(`  Categoría ${catIndex}: "${sc.ServicioCategoria.nombre}" (pos BD: ${sc.ServicioCategoria.posicion})`);
            sc.ServicioCategoria.Servicio.forEach((servicio, servIndex) => {
                console.log(`    Servicio ${servIndex}: "${servicio.nombre}" (pos BD: ${servicio.posicion})`);
            });
        });
    });

    return catalogo.map((seccion: RawSeccion) => ({
        ...seccion,
        categorias: seccion.seccionCategorias.map((sc: RawSeccionCategoria) => ({
            ...sc.ServicioCategoria,
            servicios: sc.ServicioCategoria.Servicio.map(servicio => ({
                ...servicio,
                // Mantener la posición explícitamente
                posicion: servicio.posicion
            })) || [],
            // Aseguramos que seccionId esté disponible para la lógica de dnd-kit
            seccionId: seccion.id,
            // Mantener la posición explícitamente
            posicion: sc.ServicioCategoria.posicion
        }))
    }));
};

export default async function CatalogoPage() {
    const rawCatalogo = await obtenerCatalogoCompleto();
    const catalogo = transformCatalogoData(rawCatalogo as RawCatalogo);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className='mb-6 pb-4 border-b border-zinc-700'>
                <h1 className="text-2xl font-semibold text-zinc-100">Organizador de Catálogo</h1>
                <p className="text-sm text-zinc-400 mt-1">Arrastra para ordenar. Oculta hijos al mover secciones o categorías.</p>
            </div>
            <Organizador initialCatalogo={catalogo} />
        </div>
    );
}
