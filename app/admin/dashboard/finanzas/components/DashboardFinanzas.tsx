'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    CreditCard,
    BarChart3,
    Calendar,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardFinanzas() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard Financiero</h1>
                    <p className="text-muted-foreground">
                        Resumen financiero y gestión de recursos
                    </p>
                </div>
            </div>

            {/* Métricas de ejemplo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            $125,500.00
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +12.5% vs mes anterior
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            $45,200.00
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Gastos operativos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            $80,300.00
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Rentabilidad: 64.0%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Flujo de Efectivo</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            $342,800.00
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Disponible
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Navegación a módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/dashboard/finanzas/pagos">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CreditCard className="h-8 w-8 text-green-600" />
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-2">Pagos</h3>
                            <p className="text-sm text-muted-foreground">
                                Gestión de pagos entrantes con filtros por mes y estado
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/dashboard/finanzas/nomina">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Users className="h-8 w-8 text-blue-600" />
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-2">Nómina</h3>
                            <p className="text-sm text-muted-foreground">
                                Pagos pendientes y historial detallado de nómina
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/dashboard/finanzas/gastos">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <FileText className="h-8 w-8 text-red-600" />
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-2">Gastos</h3>
                            <p className="text-sm text-muted-foreground">
                                Administrador avanzado de gastos operativos
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/dashboard/finanzas/reportes">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <BarChart3 className="h-8 w-8 text-purple-600" />
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-2">Reportes</h3>
                            <p className="text-sm text-muted-foreground">
                                Historial de pagos por rango de fechas y análisis
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
