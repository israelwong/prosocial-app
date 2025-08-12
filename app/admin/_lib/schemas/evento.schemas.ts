import { z } from 'zod';

// Esquema para los detalles básicos de las relaciones
const ClienteSchema = z.object({
    nombre: z.string(),
});

const EventoTipoSchema = z.object({
    nombre: z.string(),
});

const EventoEtapaSchema = z.object({
    nombre: z.string(),
    posicion: z.number(),
});

// Esquema principal para un evento con todos sus detalles
export const EventoConDetallesSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    fecha_evento: z.date(),
    status: z.string(),
    clienteId: z.string(),
    eventoTipoId: z.string(),
    eventoEtapaId: z.string(),
    Cliente: ClienteSchema,
    EventoTipo: EventoTipoSchema,
    EventoEtapa: EventoEtapaSchema,
    // Puedes añadir más campos si son necesarios para la tabla
});

// Esquema para un array de eventos
export const EventosConDetallesArraySchema = z.array(EventoConDetallesSchema);

// Tipo inferido de Zod para usar en los componentes
export type EventoConDetalles = z.infer<typeof EventoConDetallesSchema>;
