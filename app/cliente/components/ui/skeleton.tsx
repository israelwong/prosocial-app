'use client';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

function Skeleton({ className = "", ...props }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-zinc-800/50 ${className}`}
            {...props}
        />
    );
}

// Skeleton para tarjetas
function CardSkeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6 ${className}`}>
            <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[180px]" />
                </div>
                <div className="flex space-x-4">
                    <Skeleton className="h-8 w-[100px]" />
                    <Skeleton className="h-8 w-[100px]" />
                </div>
            </div>
        </div>
    );
}

// Skeleton para lista de items
function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[160px]" />
                        </div>
                        <Skeleton className="h-8 w-[80px]" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Skeleton para tabla
function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="border-b border-zinc-800 p-4">
                <div className="flex space-x-4">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[140px]" />
                </div>
            </div>
            {/* Rows */}
            <div className="divide-y divide-zinc-800">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-[80px]" />
                            <Skeleton className="h-4 w-[140px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Skeleton para dashboard
function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[300px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <CardSkeleton />
                        <ListSkeleton count={4} />
                    </div>
                    <div className="space-y-6">
                        <CardSkeleton />
                        <TableSkeleton rows={6} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton para contenido de dashboard (sin min-h-screen para usar en layout)
function DashboardContentSkeleton() {
    return (
        <div className="bg-zinc-950 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[300px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <CardSkeleton />
                        <ListSkeleton count={4} />
                    </div>
                    <div className="space-y-6">
                        <CardSkeleton />
                        <TableSkeleton rows={6} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton para página de evento (versión compacta)
function EventoSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>

                {/* Header del evento */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-[250px]" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>

                {/* Secciones principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        </div>
    );
}

// Skeleton para contenido de evento (sin min-h-screen para usar en layout)
function EventoContentSkeleton() {
    return (
        <div className="bg-zinc-950 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>

                {/* Header del evento */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-[250px]" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>

                {/* Secciones principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        </div>
    );
}

// Skeleton para historial de pagos
function PagosSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-zinc-900 border-b border-zinc-800 p-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                        <Skeleton className="h-8 w-[100px]" />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Resumen */}
                    <div className="lg:col-span-1">
                        <CardSkeleton />
                    </div>

                    {/* Lista de pagos */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-[150px]" />
                                <div className="space-y-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="border border-zinc-800 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-5 w-5 rounded-full" />
                                                        <Skeleton className="h-4 w-[120px]" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Skeleton className="h-4 w-full" />
                                                        <Skeleton className="h-4 w-full" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-6 w-[80px]" />
                                                    <Skeleton className="h-8 w-[100px]" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton para página de pago
function PagoLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-2xl mx-auto pt-8 space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>

                {/* Header del pago */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="text-center space-y-4">
                        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                        <Skeleton className="h-6 w-[200px] mx-auto" />
                        <Skeleton className="h-4 w-[150px] mx-auto" />
                    </div>
                </div>

                {/* Formulario de pago */}
                <CardSkeleton />
            </div>
        </div>
    );
}

// Skeleton para formularios
function FormSkeleton() {
    return (
        <div className="space-y-6">
            {/* Campos del formulario */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Botón de submit */}
            <Skeleton className="h-12 w-full" />
        </div>
    );
}

// Skeleton para botón con loading
function ButtonLoadingSkeleton({ text = 'Procesando...' }: { text?: string }) {
    return (
        <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
            {text}
        </div>
    );
}

// Skeleton para edición de eventos
function EditarEventoSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-950 p-4">
            <div className="max-w-2xl mx-auto pt-8 space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-[60px]" />
                    <span className="text-zinc-500">/</span>
                    <Skeleton className="h-4 w-[100px]" />
                    <span className="text-zinc-500">/</span>
                    <Skeleton className="h-4 w-[80px]" />
                </div>

                {/* Header */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>

                {/* Formulario de edición */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="p-6 border-b border-zinc-800">
                        <Skeleton className="h-6 w-[150px]" />
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Campo nombre */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[120px]" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Campo dirección */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Campo sede */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Botones */}
                            <div className="flex space-x-4 pt-4">
                                <Skeleton className="h-10 w-[100px]" />
                                <Skeleton className="h-10 w-[120px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton para lista de pagos (componente interno)
function PagosListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-[120px]" />
                                <Skeleton className="h-4 w-[80px]" />
                            </div>
                            <Skeleton className="h-3 w-[200px]" />
                        </div>
                        <div className="text-right space-y-1">
                            <Skeleton className="h-4 w-[80px] ml-auto" />
                            <Skeleton className="h-3 w-[60px] ml-auto" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Skeleton compacto para validación de autenticación (layout loading)
function AuthValidationSkeleton() {
    return (
        <div className="bg-zinc-950 flex-1 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-zinc-400 text-sm">Cargando...</p>
            </div>
        </div>
    );
}

export {
    Skeleton,
    CardSkeleton,
    ListSkeleton,
    TableSkeleton,
    DashboardSkeleton,
    DashboardContentSkeleton,
    EventoSkeleton,
    EventoContentSkeleton,
    PagosSkeleton,
    PagoLoadingSkeleton,
    FormSkeleton,
    ButtonLoadingSkeleton,
    EditarEventoSkeleton,
    PagosListSkeleton,
    AuthValidationSkeleton
};
