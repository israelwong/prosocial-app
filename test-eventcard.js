// Prueba rápida del formato en EventCard
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

// Simular la función formatDate del EventCard
const formatDate = (date) => {
  const eventDate = crearFechaLocal(date);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let timeStatus = "";
  let timeColor = "";

  if (diffDays > 0) {
    timeStatus = `en ${diffDays} días`;
    timeColor = "text-green-400";
  } else if (diffDays === 0) {
    timeStatus = "hoy";
    timeColor = "text-yellow-400";
  } else {
    timeStatus = `hace ${Math.abs(diffDays)} días`;
    timeColor = "text-red-400";
  }

  return {
    dayName: formatearFecha(eventDate, { weekday: "long" }),
    day: eventDate.getDate(),
    monthName: formatearFecha(eventDate, { month: "long" }),
    year: eventDate.getFullYear(),
    timeStatus,
    timeColor,
    shortFormat: formatearFecha(eventDate, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  };
};

console.log("=== Prueba formato EventCard ===");

// Casos de prueba
const casos = [
  "2025-08-29",
  "2025-08-16",
  new Date("2025-08-29T00:00:00.000Z"),
];

casos.forEach((caso, i) => {
  console.log(
    `\nCaso ${i + 1}: ${typeof caso === "string" ? caso : caso.toString()}`
  );

  const resultado = formatDate(caso);
  console.log("dayName:", resultado.dayName);
  console.log("day:", resultado.day);
  console.log("monthName:", resultado.monthName);
  console.log("year:", resultado.year);
  console.log("shortFormat:", resultado.shortFormat);
  console.log("timeStatus:", resultado.timeStatus);
});
