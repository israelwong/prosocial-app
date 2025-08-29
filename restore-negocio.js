const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function restoreNegocio() {
  try {
    console.log("🔄 Creando configuración de negocio...");

    // Crear negocio principal
    const negocio = await prisma.negocio.create({
      data: {
        nombre: "Prosocial Events",
        descripcion: "Organizador de eventos sociales",
        email: "contacto@prosocial.mx",
        telefono: "+52 55 1234 5678",
        direccion: "Ciudad de México, México",
        sitioWeb: "https://prosocial.mx",
        status: "activo",
      },
    });

    console.log("✅ Negocio creado:", negocio.id);

    // Crear redes sociales de ejemplo
    const redesSociales = [
      {
        nombre: "Instagram",
        url: "https://instagram.com/prosocial.events",
        icono: "instagram",
        orden: 1,
        negocioId: negocio.id,
      },
      {
        nombre: "Facebook",
        url: "https://facebook.com/prosocial.events",
        icono: "facebook",
        orden: 2,
        negocioId: negocio.id,
      },
      {
        nombre: "WhatsApp",
        url: "https://wa.me/5255123456789",
        icono: "whatsapp",
        orden: 3,
        negocioId: negocio.id,
      },
    ];

    for (const red of redesSociales) {
      const redCreada = await prisma.redSocial.create({
        data: red,
      });
      console.log(`✅ Red social creada: ${redCreada.nombre}`);
    }

    console.log("🎉 Configuración de negocio restaurada exitosamente!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreNegocio();
