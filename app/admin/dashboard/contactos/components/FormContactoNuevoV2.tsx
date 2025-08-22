// Ruta: app/admin/dashboard/contactos/components/FormContactoNuevoV2.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ContactoCreateSchema,
    type ContactoCreateForm
} from '@/app/admin/_lib/actions/contactos/contactos.schemas';
import {
    crearContacto,
    verificarTelefonoUnico
} from '@/app/admin/_lib/actions/contactos/contactos.actions';
import { obtenerCanalesLegacy as obtenerCanales } from '@/app/admin/_lib/actions/canal/canal.actions';
import { type Canal } from '@/app/admin/_lib/types';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
    User,
    Phone,
    Mail,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Radio
} from 'lucide-react';

export default function FormContactoNuevoV2() {
    const router = useRouter();
    const [canales, setCanales] = useState<Canal[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCanales, setLoadingCanales] = useState(true);
    const [telefonoCheck, setTelefonoCheck] = useState<{
        checking: boolean;
        exists: boolean;
        contactoNombre?: string;
    }>({ checking: false, exists: false });

    // Obtener usuario del localStorage/cookies
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const userData = Cookies.get('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserId(user.id);
        }
    }, []);

    // React Hook Form con validación Zod
    const form = useForm<ContactoCreateForm>({
        resolver: zodResolver(ContactoCreateSchema),
        mode: 'onChange',
        defaultValues: {
            nombre: '',
            telefono: '',
            email: '',
            canalId: '',
            userId: userId,
            status: 'prospecto' as const
        }
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
        trigger,
        reset
    } = form;

    // Actualizar userId cuando se carga
    useEffect(() => {
        if (userId) {
            setValue('userId', userId);
        }
    }, [userId, setValue]);

    // Watch para el teléfono para verificación en tiempo real
    const watchedTelefono = watch('telefono');

    // Cargar canales
    useEffect(() => {
        const fetchCanales = async () => {
            try {
                setLoadingCanales(true);
                const result = await obtenerCanales();
                setCanales(result);
            } catch (error) {
                console.error('Error al cargar canales:', error);
                toast.error('Error al cargar los canales');
            } finally {
                setLoadingCanales(false);
            }
        };

        fetchCanales();
    }, []);

    // Verificar teléfono único cuando cambia
    useEffect(() => {
        const verificarTelefono = async () => {
            if (watchedTelefono && watchedTelefono.length === 10) {
                setTelefonoCheck({ checking: true, exists: false });

                try {
                    const result = await verificarTelefonoUnico({ telefono: watchedTelefono });

                    if (result.success) {
                        setTelefonoCheck({
                            checking: false,
                            exists: !result.isUnique,
                            contactoNombre: result.contactoNombre
                        });
                    }
                } catch (error) {
                    console.error('Error al verificar teléfono:', error);
                    setTelefonoCheck({ checking: false, exists: false });
                }
            } else {
                setTelefonoCheck({ checking: false, exists: false });
            }
        };

        const timeoutId = setTimeout(verificarTelefono, 500);
        return () => clearTimeout(timeoutId);
    }, [watchedTelefono]);

    // Función para enviar el formulario
    const onSubmit = async (data: ContactoCreateForm) => {
        if (telefonoCheck.exists) {
            toast.error('El teléfono ya está registrado');
            return;
        }

        setLoading(true);

        try {
            const result = await crearContacto(data);

            if (result.success) {
                toast.success('Contacto creado exitosamente');
                router.push('/admin/dashboard/contactos');
            } else {
                toast.error(result.message || 'Error al crear el contacto');
                if (result.contactoExistente) {
                    router.push(`/admin/dashboard/contactos/${result.contactoExistente}`);
                }
            }
        } catch (error) {
            console.error('Error al crear contacto:', error);
            toast.error('Error inesperado al crear el contacto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-6">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-200">
                            Nuevo Contacto
                        </h1>
                        <p className="text-zinc-500 mt-1">
                            Registra un nuevo prospecto o cliente
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Card principal */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-6">

                        {/* Información personal */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                                <User className="w-5 h-5 text-zinc-400" />
                                Información Personal
                            </h2>

                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    {...register('nombre')}
                                    type="text"
                                    placeholder="Nombre completo del contacto"
                                    className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors duration-200 ${errors.nombre ? 'border-red-600' : 'border-zinc-700'
                                        }`}
                                />
                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.nombre.message}
                                    </p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Teléfono *
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Phone className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <input
                                        {...register('telefono')}
                                        type="tel"
                                        placeholder="1234567890"
                                        maxLength={10}
                                        className={`w-full pl-10 pr-10 py-3 bg-zinc-800 border rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors duration-200 ${errors.telefono ? 'border-red-600' :
                                            telefonoCheck.exists ? 'border-red-600' :
                                                watchedTelefono && watchedTelefono.length === 10 && !telefonoCheck.exists ? 'border-green-600' :
                                                    'border-zinc-700'
                                            }`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        {telefonoCheck.checking ? (
                                            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                                        ) : telefonoCheck.exists ? (
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                        ) : watchedTelefono && watchedTelefono.length === 10 ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : null}
                                    </div>
                                </div>
                                {errors.telefono && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.telefono.message}
                                    </p>
                                )}
                                {telefonoCheck.exists && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Este teléfono ya está registrado por {telefonoCheck.contactoNombre}
                                    </p>
                                )}
                                {watchedTelefono && watchedTelefono.length === 10 && !telefonoCheck.exists && !telefonoCheck.checking && (
                                    <p className="mt-1 text-sm text-green-400 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Teléfono disponible
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Mail className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="email@ejemplo.com"
                                        className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors duration-200 ${errors.email ? 'border-red-600' : 'border-zinc-700'
                                            }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Información del canal */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                                <Radio className="w-5 h-5 text-zinc-400" />
                                Canal de Contacto
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Canal *
                                </label>
                                {loadingCanales ? (
                                    <div className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                        <span className="text-zinc-500">Cargando canales...</span>
                                    </div>
                                ) : (
                                    <select
                                        {...register('canalId')}
                                        className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors duration-200 ${errors.canalId ? 'border-red-600' : 'border-zinc-700'
                                            }`}
                                    >
                                        <option value="">Selecciona un canal</option>
                                        {canales.map(canal => (
                                            <option key={canal.id} value={canal.id}>
                                                {canal.nombre}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.canalId && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.canalId.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-900/50 transition-colors duration-200 order-2 sm:order-1"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || telefonoCheck.exists || !isValid}
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Crear Contacto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
