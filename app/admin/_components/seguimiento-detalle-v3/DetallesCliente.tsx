'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { User, Phone, Mail, MapPin, Building2 } from "lucide-react"

interface DetallesClienteProps {
    cliente?: {
        id?: string
        nombre?: string
        telefono?: string
        email?: string
        direccion?: string
        empresa?: string
    } | null
}

export function DetallesCliente({ cliente }: DetallesClienteProps) {
    if (!cliente) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Detalles del Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">No hay información del cliente disponible</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Detalles del Cliente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Nombre */}
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium">Nombre</p>
                            <p className="text-sm text-gray-600">
                                {cliente.nombre || 'No especificado'}
                            </p>
                        </div>
                    </div>

                    {/* Teléfono */}
                    {cliente.telefono && (
                        <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Teléfono</p>
                                <p className="text-sm text-gray-600">
                                    {cliente.telefono}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    {cliente.email && (
                        <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-gray-600">
                                    {cliente.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empresa */}
                    {cliente.empresa && (
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Empresa</p>
                                <p className="text-sm text-gray-600">
                                    {cliente.empresa}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Dirección */}
                    {cliente.direccion && (
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Dirección</p>
                                <p className="text-sm text-gray-600">
                                    {cliente.direccion}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ID del cliente */}
                    {cliente.id && (
                        <div className="pt-2 border-t">
                            <p className="text-xs text-gray-400">
                                ID Cliente: {cliente.id}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
