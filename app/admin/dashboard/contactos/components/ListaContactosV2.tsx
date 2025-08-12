// Ruta: app/admin/dashboard/contactos/components/ListaContactosV2.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { obtenerContactos } from '@/app/admin/_lib/actions/contactos/contactos.actions';
import { obtenerCanales } from '@/app/admin/_lib/canal.actions';
import {
    Search,
    Plus,
    Filter,
    Users,
    Phone,
    Mail,
    Calendar,
    ChevronRight,
    X,
    RefreshCw,
    User,
    Building,
    Trash2
} from 'lucide-react';
import { type Cliente, type Canal } from '@/app/admin/_lib/types';

interface ContactoConDatos extends Cliente {
    Canal?: { id: string; nombre: string } | null;
    _count?: { Evento: number };
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function ListaContactosV2() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Estados principales
    const [contactos, setContactos] = useState<ContactoConDatos[]>([]);
    const [canales, setCanales] = useState<Canal[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || '');
    const [canalFilter, setCanalFilter] = useState(searchParams?.get('canal') || '');
    const [showFilters, setShowFilters] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchCanales = async () => {
            try {
                const result = await obtenerCanales();
                setCanales(result);
            } catch (error) {
                console.error('Error al cargar canales:', error);
            }
        };
        fetchCanales();
    }, []);

    // Función para cargar contactos
    const fetchContactos = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm || undefined,
                status: (statusFilter as 'prospecto' | 'cliente' | 'descartado' | undefined) || undefined,
                canalId: canalFilter || undefined,
                page,
                limit: 20
            };

            const result = await obtenerContactos(params);

            if (result.success && result.data) {
                setContactos(result.data as ContactoConDatos[]);
                setPagination(result.pagination!);
            } else {
                console.error('Error al cargar contactos:', result.message);
            }
        } catch (error) {
            console.error('Error al cargar contactos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar contactos cuando cambien los filtros
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchContactos();
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, canalFilter]);

    // Función para limpiar filtros
    const limpiarFiltros = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCanalFilter('');
        setShowFilters(false);
    };

    // Función para obtener color del status
    const getStatusColor = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case 'cliente':
                return 'bg-green-900/50 text-green-400 border-green-700';
            case 'prospecto':
                return 'bg-blue-900/50 text-blue-400 border-blue-700';
            case 'descartado':
                return 'bg-red-900/50 text-red-400 border-red-700';
            default:
                return 'bg-zinc-900/50 text-zinc-400 border-zinc-700';
        }
    };

    // Función para obtener color del canal
    const getCanalColor = (canal?: { color?: string }) => {
        if (canal?.color) {
            return `bg-${canal.color}-900/20 text-${canal.color}-400 border-${canal.color}-700`;
        }
        return 'bg-zinc-900/50 text-zinc-400 border-zinc-700';
    };

    // Estadísticas calculadas
    const stats = useMemo(() => {
        const total = contactos.length;
        const clientes = contactos.filter(c => c.status === 'cliente').length;
        const prospectos = contactos.filter(c => c.status === 'prospecto').length;

        return { total: pagination.total, clientes, prospectos };
    }, [contactos, pagination.total]);

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium text-zinc-200">
                            Contactos
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            {stats.total} contactos
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/admin/dashboard/contactos/nuevo')}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-md text-sm transition-colors duration-200"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar contactos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-md transition-colors duration-200 ${showFilters || statusFilter || canalFilter
                            ? 'bg-zinc-700 text-zinc-200'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => fetchContactos(pagination.page)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-md transition-colors duration-200"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Filtros expandidos */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-900/30 rounded-md border border-zinc-800">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                        >
                            <option value="">Todos los status</option>
                            <option value="prospecto">Prospecto</option>
                            <option value="cliente">Cliente</option>
                            <option value="descartado">Descartado</option>
                        </select>

                        <select
                            value={canalFilter}
                            onChange={(e) => setCanalFilter(e.target.value)}
                            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                        >
                            <option value="">Todos los canales</option>
                            {canales.map(canal => (
                                <option key={canal.id} value={canal.id}>
                                    {canal.nombre}
                                </option>
                            ))}
                        </select>

                        {(statusFilter || canalFilter) && (
                            <button
                                onClick={limpiarFiltros}
                                className="text-sm text-zinc-500 hover:text-zinc-300 text-left"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                {/* Lista de contactos */}
                <div className="space-y-2">
                    {loading ? (
                        // Skeleton loading
                        <div className="space-y-2">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="border border-zinc-800 rounded-md p-3 animate-pulse">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                                            <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
                                        </div>
                                        <div className="h-4 bg-zinc-800 rounded w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : contactos.length > 0 ? (
                        contactos.map((contacto) => (
                            <div
                                key={contacto.id}
                                onClick={() => router.push(`/admin/dashboard/contactos/${contacto.id}`)}
                                className="border border-zinc-800 hover:border-zinc-700 rounded-md p-3 transition-colors duration-200 cursor-pointer group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-medium text-zinc-200 truncate">
                                                {contacto.nombre}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-md ${getStatusColor(contacto.status)}`}>
                                                {contacto.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                                            {contacto.telefono && (
                                                <span>{contacto.telefono}</span>
                                            )}
                                            {contacto.Canal && (
                                                <span>{contacto.Canal.nombre}</span>
                                            )}
                                            {contacto._count && contacto._count.Evento > 0 && (
                                                <span>{contacto._count.Evento} eventos</span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200 flex-shrink-0" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-zinc-500" />
                            </div>
                            <h3 className="text-sm font-medium text-zinc-400 mb-1">
                                No se encontraron contactos
                            </h3>
                            <p className="text-sm text-zinc-600 mb-4">
                                {searchTerm || statusFilter || canalFilter
                                    ? 'Intenta ajustar los filtros'
                                    : 'Agrega tu primer contacto'
                                }
                            </p>
                            {!(searchTerm || statusFilter || canalFilter) && (
                                <button
                                    onClick={() => router.push('/admin/dashboard/contactos/nuevo')}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-md text-sm transition-colors duration-200"
                                >
                                    Crear contacto
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-3 pt-4">
                        <button
                            onClick={() => fetchContactos(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                        >
                            Anterior
                        </button>

                        <span className="text-sm text-zinc-500">
                            {pagination.page} / {pagination.pages}
                        </span>

                        <button
                            onClick={() => fetchContactos(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
