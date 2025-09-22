// Ruta: app/admin/configurar/condicionesComerciales/components/CondicionComercialForm.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CondicionComercialSchema, type CondicionComercialForm } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.schemas';
import { crearCondicionComercial, actualizarCondicionComercial, eliminarCondicionComercial } from '@/app/admin/_lib/actions/condicionesComerciales/condicionesComerciales.actions';
import { type CondicionesComerciales, type MetodoPago } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

// Interfaz para los datos que necesita el formulario
interface FormProps {
    condicion?: (CondicionesComerciales & {
        CondicionesComercialesMetodoPago: { metodoPagoId: string }[];
    }) | null;
    metodosPagoDisponibles: MetodoPago[];
}

export default function CondicionComercialForm({ condicion, metodosPagoDisponibles }: FormProps) {
    const router = useRouter();
    const isEditMode = !!condicion;

    // Métodos de pago internos (siempre disponibles para cobros manuales)
    const metodosInternosNombres = [
        'efectivo',
        'depósito bancario',
        'deposito bancario',
        'transferencia directa',
        'transferencia bancaria'
    ];

    // Separar métodos internos y externos con lógica más específica
    const metodosInternos = metodosPagoDisponibles.filter(metodo => {
        const nombreLower = metodo.metodo_pago.toLowerCase().trim();

        // Buscar coincidencia exacta o que contenga el nombre interno
        return metodosInternosNombres.some(nombre =>
            nombreLower === nombre.toLowerCase() ||
            nombreLower.includes(nombre.toLowerCase())
        );
    });

    const metodosExternos = metodosPagoDisponibles.filter(metodo => {
        const nombreLower = metodo.metodo_pago.toLowerCase().trim();

        // EXCLUIR cualquier método que esté en la lista de internos
        const esInterno = metodosInternosNombres.some(nombre =>
            nombreLower === nombre.toLowerCase() ||
            nombreLower.includes(nombre.toLowerCase())
        );

        // Si es interno, NO incluirlo en externos
        return !esInterno;
    });

    const {
        register,
        handleSubmit,
        control, // Necesario para componentes controlados como los checkboxes
        formState: { errors, isSubmitting },
    } = useForm<CondicionComercialForm>({
        resolver: zodResolver(CondicionComercialSchema),
        defaultValues: {
            id: condicion?.id,
            nombre: condicion?.nombre ?? '',
            descripcion: condicion?.descripcion ?? '',
            descuento: String(condicion?.descuento ?? ''),
            porcentaje_anticipo: String(condicion?.porcentaje_anticipo ?? ''),
            status: condicion?.status === 'inactive' ? 'inactive' : 'active',
            // Siempre incluir métodos internos + los externos seleccionados previamente
            metodosPagoIds: [
                ...metodosInternos.map(m => m.id), // Siempre incluir internos
                ...(condicion?.CondicionesComercialesMetodoPago
                    .map(mp => mp.metodoPagoId)
                    .filter(id => metodosExternos.some(m => m.id === id)) ?? []) // Solo externos previamente seleccionados
            ],
        },
    });

    const onSubmit = async (data: CondicionComercialForm) => {
        // Asegurar que siempre se incluyan los métodos internos
        const metodosInternosIds = metodosInternos.map(m => m.id);
        const metodosSeleccionados = data.metodosPagoIds || [];

        // Combinar métodos internos (siempre incluidos) + métodos externos seleccionados
        const todosLosMetodos = [...new Set([...metodosInternosIds, ...metodosSeleccionados])];

        const dataConMetodosInternos = {
            ...data,
            metodosPagoIds: todosLosMetodos
        };

        const action = isEditMode ? actualizarCondicionComercial : crearCondicionComercial;
        const toastMessage = isEditMode ? 'Actualizando...' : 'Creando...';
        toast.loading(toastMessage);
        await action(dataConMetodosInternos);
    };

    const handleDelete = async () => {
        if (!condicion?.id) return;
        if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
            toast.loading('Eliminando...');
            await eliminarCondicionComercial(condicion.id);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className='text-2xl font-semibold text-zinc-100'>
                    {isEditMode ? 'Editar Condición Comercial' : 'Nueva Condición Comercial'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6'>
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
                        <input id="nombre" type="text" {...register('nombre')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        {errors.nombre && <p className="text-red-400 text-xs mt-1.5">{errors.nombre.message}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción</label>
                    <textarea id="descripcion" {...register('descripcion')} rows={3}
                        className="flex w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                        <label htmlFor="descuento" className="block text-sm font-medium text-zinc-300 mb-1.5">Descuento (%)</label>
                        <input id="descuento" type="text" {...register('descuento')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    </div>
                    <div>
                        <label htmlFor="porcentaje_anticipo" className="block text-sm font-medium text-zinc-300 mb-1.5">Anticipo Requerido (%)</label>
                        <input id="porcentaje_anticipo" type="text" {...register('porcentaje_anticipo')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    </div>
                </div>

                {/* Métodos de Pago Internos (Siempre Disponibles) */}
                <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-base font-medium text-blue-300 mb-2 flex items-center gap-2">
                        🏢 Métodos de Pago Internos
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                            Siempre disponibles
                        </span>
                    </h3>
                    <p className="text-sm text-blue-400/80 mb-3">
                        Para uso interno en cobros manuales - Estos métodos siempre estarán disponibles para autorizar cotizaciones
                    </p>

                    {metodosInternos.length > 0 ? (
                        <div className="space-y-2">
                            {metodosInternos.map((metodo) => (
                                <label key={`interno-${metodo.id}`} className="flex items-center gap-3 text-sm text-blue-300 cursor-not-allowed opacity-75">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled={true}
                                        className="h-4 w-4 rounded border-blue-600 bg-blue-800 text-blue-600 cursor-not-allowed"
                                    />
                                    <span className="flex-1">{metodo.metodo_pago}</span>
                                    <span className="text-blue-400 text-xs">✓ Incluido automáticamente</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="text-blue-400 text-sm p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
                            ⚠️ No se encontraron métodos de pago internos configurados.
                        </div>
                    )}
                </div>

                {/* Métodos de Pago para Clientes */}
                <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-base font-medium text-zinc-200 mb-2 flex items-center gap-2">
                        💳 Métodos de Pago para Clientes
                        <span className="text-red-400 ml-1">*</span>
                    </h3>
                    <p className="text-sm text-zinc-400 mb-3">
                        Visibles para tus clientes en la pasarela de pagos - Selecciona cuáles estarán disponibles
                    </p>

                    <Controller
                        name="metodosPagoIds"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                                {metodosExternos.length > 0 ? (
                                    metodosExternos.map((metodo) => {
                                        const isSelected = field.value?.includes(metodo.id)
                                        return (
                                            <label key={`externo-${metodo.id}`} className="flex items-center gap-3 text-sm text-zinc-300 hover:text-zinc-200 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={metodo.id}
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        // Siempre mantener los métodos internos
                                                        const metodosInternosIds = metodosInternos.map(m => m.id)
                                                        const metodosExternosSeleccionados = field.value?.filter(id => metodosExternos.some(m => m.id === id)) || []

                                                        const newValues = e.target.checked
                                                            ? [...metodosInternosIds, ...metodosExternosSeleccionados, e.target.value]
                                                            : [...metodosInternosIds, ...metodosExternosSeleccionados.filter(id => id !== e.target.value)]

                                                        field.onChange(newValues)
                                                    }}
                                                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                                />
                                                <span className="flex-1">{metodo.metodo_pago}</span>
                                                {isSelected && (
                                                    <span className="text-green-400 text-xs">✓ Seleccionado</span>
                                                )}
                                            </label>
                                        )
                                    })
                                ) : (
                                    <div className="text-zinc-400 text-sm p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
                                        ℹ️ No hay métodos de pago adicionales disponibles para clientes.
                                        <a href="/admin/configurar/metodoPago" className="text-blue-400 underline ml-1">
                                            Crear método de pago
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    />

                    {/* Mostrar resumen de selección */}
                    <Controller
                        name="metodosPagoIds"
                        control={control}
                        render={({ field }) => {
                            const totalSeleccionados = field.value?.length || 0
                            const internosCount = metodosInternos.length
                            const externosCount = (field.value?.filter(id => metodosExternos.some(m => m.id === id)) || []).length

                            return (
                                <div className="mt-3 pt-3 border-t border-zinc-700 text-xs text-zinc-500">
                                    <p>
                                        📊 Resumen: {totalSeleccionados} métodos totales
                                        ({internosCount} internos + {externosCount} para clientes)
                                    </p>
                                </div>
                            )
                        }}
                    />

                    {errors.metodosPagoIds && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.metodosPagoIds.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-1.5">Estatus</label>
                    <select id="status" {...register('status')}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </select>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-zinc-700">
                    <div>
                        {isEditMode && (
                            <Button type="button" variant="destructive" onClick={handleDelete} className="flex items-center text-sm">
                                <Trash size={16} className="mr-2" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.back()}
                            className="h-10 px-4 py-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 px-4 py-2"
                        >
                            {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Condición')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
