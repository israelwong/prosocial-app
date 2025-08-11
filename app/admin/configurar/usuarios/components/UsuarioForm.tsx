// Ruta: app/admin/configurar/usuarios/components/UsuarioForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCreateSchema, UserUpdateSchema, type UserForm } from '@/app/admin/_lib/actions/usuarios/usuarios.schemas';
import { crearUsuario, actualizarUsuario, eliminarUsuario } from '@/app/admin/_lib/actions/usuarios/usuarios.actions';
import { type User } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

interface Props {
    usuario?: User | null;
}

export default function UsuarioForm({ usuario }: Props) {
    const router = useRouter();
    const isEditMode = !!usuario;
    const basePath = '/admin/configurar/usuarios';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserForm>({
        resolver: zodResolver(isEditMode ? UserUpdateSchema : UserCreateSchema),
        defaultValues: {
            id: usuario?.id,
            username: usuario?.username ?? '',
            email: usuario?.email ?? '',
            telefono: usuario?.telefono ?? '',
            role: (usuario?.role === 'admin' || usuario?.role === 'empleado' || usuario?.role === 'proveedor') ? usuario.role : undefined,
            status: usuario?.status === 'active' || usuario?.status === 'inactive' ? usuario.status : 'active',
            password: '',
        },
    });

    const onSubmit = async (data: UserForm) => {
        const action = isEditMode ? actualizarUsuario : crearUsuario;
        const toastMessage = isEditMode ? 'Actualizando usuario...' : 'Creando usuario...';

        toast.loading(toastMessage);
        const result = await action(data);
        toast.dismiss();

        if (result && result.success === false) {
            toast.error(result.message || 'Hubo un error.');
        } else {
            toast.success(`¡Usuario ${isEditMode ? 'actualizado' : 'creado'}!`);
        }
    };

    const handleDelete = async () => {
        if (!usuario?.id) return;
        if (confirm('¿Seguro que quieres eliminar este usuario?')) {
            await eliminarUsuario(usuario.id);
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-zinc-700'>
                <h1 className='text-2xl font-semibold text-zinc-100'>
                    {isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre de Usuario</label>
                        <input id="username" type="text" {...register('username')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        {errors.username && <p className="text-red-400 text-xs mt-1.5">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-zinc-300 mb-1.5">Teléfono</label>
                        <input id="telefono" type="text" {...register('telefono')}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                        {errors.telefono && <p className="text-red-400 text-xs mt-1.5">{errors.telefono.message}</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">Correo Electrónico (Opcional)</label>
                    <input id="email" type="email" {...register('email')}
                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-zinc-300 mb-1.5">Rol</label>
                        <select id="role" {...register('role')}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                            <option value="">-- Selecciona un rol --</option>
                            <option value="admin">Admin</option>
                            <option value="empleado">Empleado</option>
                            <option value="proveedor">Proveedor</option>
                        </select>
                        {errors.role && <p className="text-red-400 text-xs mt-1.5">{errors.role.message}</p>}
                    </div>
                    {isEditMode && (
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-1.5">Estatus</label>
                            <select id="status" {...register('status')}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                            {errors.status && <p className="text-red-400 text-xs mt-1.5">{errors.status.message}</p>}
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                        {isEditMode ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                    </label>
                    <input id="password" type="password" {...register('password')}
                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100" />
                    {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-zinc-700">
                    <div>
                        {isEditMode && (
                            <button type="button" onClick={handleDelete} className="flex items-center text-sm text-red-500 hover:text-red-400">
                                <Trash2 size={16} className="mr-2" />
                                Eliminar Usuario
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => router.push(basePath)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-zinc-700 text-zinc-100 hover:bg-zinc-600">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                            {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
