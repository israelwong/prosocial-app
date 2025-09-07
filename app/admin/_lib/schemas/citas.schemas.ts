import { z } from 'zod'

export const CitaSchema = z.object({
    id: z.string(),
    evento_id: z.string(),
    titulo: z.string(),
    descripcion: z.string().nullable(),
    fecha_hora: z.date(),
    tipo: z.enum(['COMERCIAL', 'SEGUIMIENTO', 'PRESENTACION', 'REUNION_CIERRE']),
    modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'TELEFONICA']),
    ubicacion: z.string().nullable(),
    url_virtual: z.string().nullable(),
    duracion_minutos: z.number(),
    status: z.enum(['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO']),
    created_at: z.date(),
    updated_at: z.date()
})

export const CitaComentarioSchema = z.object({
    id: z.string(),
    cita_id: z.string(),
    contenido: z.string(),
    created_at: z.date()
})

export const CitaRecordatorioSchema = z.object({
    id: z.string(),
    cita_id: z.string(),
    fecha_recordatorio: z.date(),
    mensaje: z.string(),
    enviado: z.boolean(),
    created_at: z.date()
})

export const CitaFormSchema = z.object({
    titulo: z.string().min(1, 'El título es requerido'),
    descripcion: z.string().optional(),
    fechaHora: z.date({
        message: 'La fecha y hora son requeridas'
    }),
    tipo: z.enum(['COMERCIAL', 'SEGUIMIENTO', 'CIERRE', 'POST_VENTA'], {
        message: 'El tipo de cita es requerido'
    }),
    modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'TELEFONICA'], {
        message: 'La modalidad es requerida'
    }),
    ubicacion: z.string().optional(),
    urlVirtual: z.string().url('Debe ser una URL válida').optional().or(z.literal('').transform(() => undefined)),
    duracionMinutos: z.number().min(15, 'Mínimo 15 minutos').max(480, 'Máximo 8 horas').optional()
})

export const ComentarioFormSchema = z.object({
    contenido: z.string().min(1, 'El comentario no puede estar vacío').max(500, 'Máximo 500 caracteres')
})

export const RecordatorioFormSchema = z.object({
    fechaRecordatorio: z.date({
        message: 'La fecha del recordatorio es requerida'
    }),
    mensaje: z.string().min(1, 'El mensaje es requerido').max(200, 'Máximo 200 caracteres')
})

export type CitaFormData = z.infer<typeof CitaFormSchema> & {
    eventoId: string
}

export type ComentarioFormData = z.infer<typeof ComentarioFormSchema>
export type RecordatorioFormData = z.infer<typeof RecordatorioFormSchema>
