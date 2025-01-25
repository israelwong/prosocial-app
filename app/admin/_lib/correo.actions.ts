'use server';
interface Correo {
    nombre_cliente: string
    fecha_evento: string
    nombre_evento: string
    email: string
    asunto: string
    monto: number
}

export async function enviarCorreoBienvenida(correo: Correo) {

    const correoPlantilla = {
        ...correo,
        template: 'welcome'
    }

    fetch('http://localhost:3000/services/sendmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(correoPlantilla),
    });

    return true;

}

export async function enviarCorreoPagoExitoso(correo: Correo) {
    const correoPlantilla = {
        ...correo,
        template: 'welcome'
    }

    fetch('http://localhost:3000/services/sendmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(correoPlantilla),
    });

    return true;

}

