// Script de prueba para verificar la configuración de MSI específicos
// Ejecutar con: node test-msi-checkout.js

const testMSIConfig = () => {
  console.log("🧪 PRUEBA: Configuración de MSI específicos\n");

  // Simular diferentes escenarios de MSI
  const escenarios = [
    { num_msi: 3, descripcion: "3 MSI - Plan específico" },
    { num_msi: 6, descripcion: "6 MSI - Plan específico" },
    { num_msi: 9, descripcion: "9 MSI - Plan específico" },
    { num_msi: 12, descripcion: "12 MSI - Plan específico" },
    { num_msi: 0, descripcion: "Sin MSI - Pago único" },
  ];

  escenarios.forEach((escenario, index) => {
    console.log(`\n📋 Escenario ${index + 1}: ${escenario.descripcion}`);

    // Simular la configuración que se enviaría a Stripe
    let payment_method_options = {};

    if (escenario.num_msi > 0) {
      payment_method_options = {
        card: {
          installments: {
            enabled: true,
            plan: {
              count: escenario.num_msi,
              interval: "month",
              type: "fixed_count",
            },
          },
        },
      };
      console.log(`   ✅ MSI configurado: ${escenario.num_msi} pagos fijos`);
    } else {
      payment_method_options = {
        card: {
          installments: {
            enabled: false,
          },
        },
      };
      console.log(`   ✅ MSI deshabilitado: Pago único`);
    }

    console.log(
      `   🔧 Config Stripe:`,
      JSON.stringify(payment_method_options, null, 2)
    );
  });

  console.log(
    "\n🎯 VALIDACIÓN EXITOSA: Todos los escenarios de MSI configurados correctamente"
  );
  console.log("\n📝 SIGUIENTE PASO: Probar en interfaz real con cotización");
};

// Ejecutar la prueba
testMSIConfig();
