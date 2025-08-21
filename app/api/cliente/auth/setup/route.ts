import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/admin/_lib/prismaClient';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const { clienteId, password } = await request.json()

        // Validaciones
        if (!clienteId || !password) {
            return NextResponse.json(
                { message: 'ClienteId y password son requeridos' },
                { status: 400 }
            )
        }

        // Validar longitud mínima de contraseña
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'La contraseña debe tener al menos 8 caracteres' },
                { status: 400 }
            )
        }

        // Verificar que el cliente existe
        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId }
        })

        if (!cliente) {
            return NextResponse.json(
                { message: 'Cliente no encontrado' },
                { status: 404 }
            )
        }

        // Verificar que no tenga ya una contraseña configurada
        if (cliente.passwordHash) {
            return NextResponse.json(
                { message: 'Este cliente ya tiene una contraseña configurada' },
                { status: 400 }
            )
        }

        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Actualizar el cliente con la contraseña hasheada
        const clienteActualizado = await prisma.cliente.update({
            where: {
                id: clienteId
            },
            data: {
                passwordHash,
                emailVerified: true,
                isActive: true,
                lastLogin: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Contraseña configurada exitosamente',
            cliente: {
                id: clienteActualizado.id,
                nombre: clienteActualizado.nombre,
                email: clienteActualizado.email,
                telefono: clienteActualizado.telefono
            }
        });

    } catch (error) {
        console.error('Error en setup de cliente:', error)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
