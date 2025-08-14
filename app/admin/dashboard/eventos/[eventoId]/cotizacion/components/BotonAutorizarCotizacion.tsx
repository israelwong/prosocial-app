'use client'
import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { autorizarCotizacion, verificarEstadoAutorizacion } from '@/app/admin/_lib/autorizarCotizacion.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BotonAutorizarCotizacionProps {
    cotizacionId: string;
    eventoId: string;
    estadoInicial?: string;
    className?: string;
    mostrarTexto?: boolean;
    onAutorizado?: () => void;
}

export default function BotonAutorizarCotizacion({
    cotizacionId,
    eventoId,
    estadoInicial = 'pending',
    className = '',
    mostrarTexto = true,
    onAutorizado
}: BotonAutorizarCotizacionProps) {
    const [procesando, setProcesando] = useState(false);
    const [estaAutorizado, setEstaAutorizado] = useState(estadoInicial === 'autorizado');
    const router = useRouter();

    const manejarAutorizacion = async () => {
        if (estaAutorizado) {
            toast.info('Esta cotización ya está autorizada');
            return;
        }

        // Confirmación del usuario
        const confirmacion = window.confirm(
            '¿Estás seguro de que deseas autorizar esta cotización?\n\n' +
            'Esto realizará las siguientes acciones:\n' +
            '• Cambiará el estatus de la cotización a "Autorizado"\n' +
            '• Moverá el evento a la etapa "Autorizado" en el pipeline\n' +
            '• Agregará el evento a la agenda\n' +
            '• Creará una entrada en la bitácora del evento'
        );

        if (!confirmacion) return;

        setProcesando(true);

        try {
            console.log('🔥 Iniciando autorización desde UI:', cotizacionId);

            const resultado = await autorizarCotizacion(cotizacionId);

            if (resultado.success) {
                setEstaAutorizado(true);
                toast.success(resultado.message || 'Cotización autorizada exitosamente');

                // Callback personalizado si se proporciona
                if (onAutorizado) {
                    onAutorizado();
                }

                // Redirigir a seguimiento después de un breve delay
                setTimeout(() => {
                    router.push('/admin/dashboard/seguimiento');
                }, 1500);

            } else {
                toast.error(resultado.error || 'Error al autorizar cotización');
                console.error('❌ Error en autorización:', resultado.error);
            }

        } catch (error) {
            console.error('❌ Error inesperado al autorizar:', error);
            toast.error('Error inesperado al autorizar cotización');
        } finally {
            setProcesando(false);
        }
    };

    const verificarEstado = async () => {
        try {
            const estado = await verificarEstadoAutorizacion(cotizacionId);
            if (estado.estaAutorizado) {
                setEstaAutorizado(true);
            }
        } catch (error) {
            console.error('Error verificando estado:', error);
        }
    };

    React.useEffect(() => {
        verificarEstado();
    }, [cotizacionId]);

    if (estaAutorizado) {
        return (
            <div className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg ${className}`}>
                <CheckCircle size={16} />
                {mostrarTexto && <span className="text-sm font-medium">Autorizado</span>}
            </div>
        );
    }

    return (
        <button
            onClick={manejarAutorizacion}
            disabled={procesando}
            className={`
                flex items-center gap-2 px-4 py-2 
                bg-blue-600 hover:bg-blue-700 
                text-white rounded-lg 
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
            title="Autorizar cotización y mover evento al pipeline de seguimiento"
        >
            {procesando ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    {mostrarTexto && <span className="text-sm">Autorizando...</span>}
                </>
            ) : (
                <>
                    <CheckCircle size={16} />
                    {mostrarTexto && <span className="text-sm font-medium">Autorizar</span>}
                </>
            )}
        </button>
    );
}
