// Prueba rápida del formato en ListaEventosSimple
const formatearFecha = (
  fecha,
  opciones = { weekday: "long", day: "numeric", month: "long", year: "numeric" }
) => {
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

  const fechaLocal = crearFechaLocal(fecha);
  return fechaLocal.toLocaleDateString("es-ES", opciones);
};

console.log("=== Prueba formato ListaEventosSimple ===");

// Casos de prueba con el formato específico
const casos = [
  "2025-08-29",
  "2025-08-16",
  new Date("2025-08-29T00:00:00.000Z"),
];

casos.forEach((caso, i) => {
  console.log(
    `\nCaso ${i + 1}: ${typeof caso === "string" ? caso : caso.toString()}`
  );

  // Formato original que se usaba
  const formatoOriginal = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const resultado = formatearFecha(caso, formatoOriginal);
  console.log("Resultado:", resultado);
});
