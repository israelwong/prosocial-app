// Prueba de EventoHeader con fechas corregidas
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

console.log("=== Prueba EventoHeader ===");

// Casos de prueba para EventoHeader
const casos = [
  "2025-08-29",
  "2025-08-16",
  new Date("2025-08-29T00:00:00.000Z"),
  null,
];

casos.forEach((caso, i) => {
  console.log(`\nCaso ${i + 1}: ${caso}`);

  if (caso) {
    const resultado = formatearFecha(caso, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    console.log("Resultado:", resultado);
  } else {
    console.log("Resultado: Fecha por definir");
  }
});
