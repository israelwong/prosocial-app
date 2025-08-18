// Prueba de la función helper fechaParaInput
const crearFechaLocal = (fecha) => {
  if (typeof fecha === "string") {
    if (!fecha.includes("T") && !fecha.includes(" ")) {
      const [year, month, day] = fecha.split("-").map(Number);
      return new Date(year, month - 1, day);
    } else {
      const fechaString = fecha.split("T")[0];
      const [year, month, day] = fechaString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  } else {
    const year = fecha.getUTCFullYear();
    const month = fecha.getUTCMonth();
    const day = fecha.getUTCDate();
    return new Date(year, month, day);
  }
};

const formatearFecha = (
  fecha,
  opciones = { weekday: "long", day: "numeric", month: "long", year: "numeric" }
) => {
  const fechaLocal = crearFechaLocal(fecha);
  return fechaLocal.toLocaleDateString("es-ES", opciones);
};

// Helper para convertir fecha a formato input (YYYY-MM-DD)
const fechaParaInput = (fecha) => {
  if (!fecha) return "";
  const fechaLocal = crearFechaLocal(fecha);
  const year = fechaLocal.getFullYear();
  const month = String(fechaLocal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaLocal.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

console.log("=== Prueba FichaEventoUnificadaV2 ===");

// Casos de prueba
const casos = [
  "2025-08-29",
  "2025-08-16",
  new Date("2025-08-29T00:00:00.000Z"),
  null,
  "",
];

casos.forEach((caso, i) => {
  console.log(`\nCaso ${i + 1}: ${caso}`);

  // Para input date
  const paraInput = fechaParaInput(caso);
  console.log("Para input:", paraInput);

  // Para mostrar al usuario
  if (caso) {
    const paraUsuario = formatearFecha(caso, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    console.log("Para usuario:", paraUsuario);
  } else {
    console.log("Para usuario: No especificada");
  }
});
