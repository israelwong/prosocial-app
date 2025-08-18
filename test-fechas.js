// Función corregida para pruebas
const crearFechaLocal = (fecha) => {
  if (typeof fecha === "string") {
    // Si es un string en formato YYYY-MM-DD sin tiempo, crear fecha local
    if (!fecha.includes("T") && !fecha.includes(" ")) {
      const [year, month, day] = fecha.split("-").map(Number);
      return new Date(year, month - 1, day);
    } else {
      // Si incluye tiempo, extraer solo la fecha y crear fecha local
      const fechaString = fecha.split("T")[0]; // Tomar solo la parte de fecha
      const [year, month, day] = fechaString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  } else {
    // Si es un objeto Date, extraer año, mes y día y crear fecha local
    // Esto evita problemas cuando el Date viene con zona horaria UTC
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

console.log("=== Prueba de función corregida ===");

// Casos de prueba
const casos = [
  "2025-08-29",
  "2025-08-29T00:00:00.000Z",
  new Date("2025-08-29T00:00:00.000Z"),
  "2025-08-16",
  new Date("2025-08-16T00:00:00.000Z"),
];

casos.forEach((caso, i) => {
  console.log(
    `\nCaso ${i + 1}: ${typeof caso === "string" ? caso : caso.toString()}`
  );
  try {
    const fechaLocal = crearFechaLocal(caso);
    console.log("Resultado:", fechaLocal.toString());
    console.log(
      "Formateado:",
      formatearFecha(caso, { weekday: "long", day: "numeric", month: "long" })
    );
  } catch (error) {
    console.log("Error:", error.message);
  }
});
