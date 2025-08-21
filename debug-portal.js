// Script de debug para el portal de clientes
// Simula el flujo completo de autenticación

async function testLogin() {
  const email = "ing.israel.wong@gmail.com";

  console.log("🔐 Probando login con:", email);

  try {
    const response = await fetch(
      "http://localhost:3000/api/cliente/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          telefono: null,
        }),
      }
    );

    const data = await response.json();

    console.log("📊 Respuesta del login:");
    console.log("- Status:", response.status);
    console.log("- Success:", data.success);
    console.log("- HasPassword:", data.hasPassword);
    console.log("- Cliente:", data.cliente);
    console.log("- Message:", data.message);

    if (data.success && !data.hasPassword) {
      console.log("\n✅ Cliente necesita configurar contraseña");
      console.log("📍 Siguiente paso: Ir a /cliente/auth/setup");
    } else if (data.success && data.hasPassword) {
      console.log("\n✅ Cliente ya tiene contraseña configurada");
      console.log("📍 Siguiente paso: Ir a /cliente/dashboard");
    } else {
      console.log("\n❌ Error en login:", data.message);
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
}

// Función para probar el setup
async function testSetup(clienteId, password) {
  console.log("\n🔧 Probando setup de contraseña...");

  try {
    const response = await fetch(
      "http://localhost:3000/api/cliente/auth/setup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: clienteId,
          password: password,
        }),
      }
    );

    const data = await response.json();

    console.log("📊 Respuesta del setup:");
    console.log("- Status:", response.status);
    console.log("- Success:", data.success);
    console.log("- Message:", data.message);
    console.log("- Cliente:", data.cliente);
  } catch (error) {
    console.error("❌ Error en setup:", error);
  }
}

// Función para probar eventos
async function testEventos(clienteId) {
  console.log("\n📅 Probando carga de eventos...");

  try {
    const response = await fetch(
      `http://localhost:3000/api/cliente/eventos/${clienteId}`
    );
    const data = await response.json();

    console.log("📊 Respuesta de eventos:");
    console.log("- Status:", response.status);
    console.log("- Success:", data.success);
    console.log("- Eventos count:", data.eventos?.length || 0);

    if (data.eventos && data.eventos.length > 0) {
      console.log("- Primer evento:", data.eventos[0].nombre);
    }
  } catch (error) {
    console.error("❌ Error al cargar eventos:", error);
  }
}

// Ejecutar pruebas
testLogin();
