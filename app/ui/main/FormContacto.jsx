"use client";
import { useState, useEffect } from "react";

export default function FormContacto({ params }) {
  const [formData, setFormData] = useState({
    nombre: "",
    fechaEvento: "",
    tipo_evento: "",
    paquete: "",
    asunto: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const id_paquete = params.paquete || 0;
    const id_asunto = params.asunto || 0;
    const id_tipo_evento = params.tipo_evento || 0;

    //asignación al formulario al iniciar
    setFormData((prevData) => ({
      ...prevData,
      paquete: id_paquete ? id_paquete.toString() : "",
      asunto: id_asunto ? id_asunto.toString() : "",
      tipo_evento: id_tipo_evento ? id_tipo_evento.toString() : "",
    }));
  }, [params.paquete, params.asunto, params.tipo_evento]);

  const paquetes = [
    { label: "Básico", value: 3 },
    { label: "Estándar", value: 2 },
    { label: "Todo incluido", value: 1 },
    { label: "Promoción", value: 4 },
    { label: "Personalizado", value: 5 },
  ];

  const tipos_eventos = [
    { label: "Boda", value: 1 },
    { label: "XV Años", value: 2 },
    { label: "Bautizo", value: 3 },
    { label: "Aniversario", value: 4 },
    { label: "Empresarial", value: 5 },
    { label: "Otro", value: 6 },
  ];

  const asuntos = [
    { label: "Información", value: 1 },
    { label: "Contratación", value: 2 },
    { label: "Reservación", value: 3 },
    { label: "Otro", value: 4 },
  ];

  //actualizar el valor del formulario al registar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Validación y lógica de envío del formulario
  const handleSubmit = (formData) => {
    //valida formulario antes de enviar
    let errors = {};
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    }
    if (!formData.fechaEvento.trim()) {
      errors.fechaEvento = "La fecha del evento es requerida";
    }
    if (!formData.tipo_evento.trim() || formData.tipo_evento == 0) {
      errors.tipo_evento = "El tipo de evento es requerido";
    }
    if (!formData.paquete.trim() || formData.paquete == 0) {
      errors.paquete = "El paquete es requerido";
    }
    if (!formData.asunto.trim() || formData.asunto == 0) {
      errors.asunto = "El asunto es requerido";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    //obten en label de paquete
    let paquete = paquetes.find((paquete) => paquete.value == formData.paquete);
    let asunto = asuntos.find((asunto) => asunto.value == formData.asunto);
    let tipo_evento = tipos_eventos.find(
      (tipo) => tipo.value == formData.tipo_evento
    );

    //enviar mensaje por whatsapp
    const whatsappMessage = `Hola, mi nombre es ${formData.nombre}, te comparto el motivo de mi mensaje:\n> Asunto: ${asunto.label}\n> Tipo de evento: ${tipo_evento.label}\n> Paquete: ${paquete.label}\n> Fecha: ${formData.fechaEvento}.`;

    //quita erroes de formulario
    setErrors({});

    window.open(
      `https://wa.me/5544546582?text=${encodeURIComponent(whatsappMessage)}`,
      "_blank"
    );
  };

  return (
    <div className="mx-auto max-w-screen-md px-8">
      <form>
        {/* NOMBRE */}
        <div className="my-5">
          <label
            htmlFor="txt_nombre"
            className="block text-md font-medium text-white pb-2"
          >
            * Nombre del interesado
          </label>
          <input
            type="text"
            id="txt_nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`bg-gray-700 w-full p-2 border ${
              errors.nombre ? "border-red-500" : "border-gray-500"
            } rounded`}
          />
          {errors.nombre && (
            <div className="text-red-500 text-sm mt-1">{errors.nombre}</div>
          )}
        </div>

        {/* FECHA EVENTO */}
        <div className="my-5">
          <label
            htmlFor="txt_fechaEvento"
            className="block text-md font-medium text-white pb-2"
          >
            * Fecha del evento
          </label>
          <input
            type="date"
            id="txt_fechaEvento"
            name="fechaEvento"
            value={formData.fechaEvento}
            onChange={handleChange}
            className={`bg-gray-700 w-full p-2 border ${
              errors.fechaEvento ? "border-red-500" : "border-gray-500"
            } rounded`}
          />
          {errors.fechaEvento && (
            <div className="text-red-500 text-sm mt-1">
              {errors.fechaEvento}
            </div>
          )}
        </div>

        {/* TIPO EVENTO */}
        <div className="my-5">
          <label
            htmlFor="txt_tipo_evento"
            className="block text-md font-medium text-white pb-2"
          >
            * Tipo de evento
          </label>
          <select
            id="txt_tipo_evento"
            name="tipo_evento"
            value={formData.tipo_evento}
            onChange={handleChange}
            className={`bg-gray-700 w-full p-2 border ${
              errors.tipo_evento ? "border-red-500" : "border-gray-500"
            } rounded`}
          >
            <option value="">Seleccione un tipo de evento</option>
            {tipos_eventos.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          {errors.tipo_evento && (
            <div className="text-red-500 text-sm mt-1">
              {errors.tipo_evento}
            </div>
          )}
        </div>

        {/* ASUNTO */}
        <div className="my-5">
          <label
            htmlFor="txt_tipo_evento"
            className="block text-md font-medium text-white pb-2"
          >
            * Asunto
          </label>
          <select
            id="txt_asunto"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            className={`bg-gray-700 w-full p-2 border ${
              errors.asunto ? "border-red-500" : "border-gray-500"
            } rounded`}
          >
            <option value="">Seleccione un asunto</option>
            {asuntos.map((asunto) => (
              <option key={asunto.value} value={asunto.value}>
                {asunto.label}
              </option>
            ))}
          </select>
          {errors.asunto && (
            <div className="text-red-500 text-sm mt-1">{errors.asunto}</div>
          )}
        </div>

        {/* PAQUETE */}
        <div className="my-5">
          <label
            htmlFor="txt_paquete"
            className="block text-md font-medium text-white pb-2"
          >
            * Paquete
          </label>
          <select
            id="txt_paquete"
            name="paquete"
            value={formData.paquete}
            onChange={handleChange}
            className={`bg-gray-700 w-full p-2 border ${
              errors.paquete ? "border-red-500" : "border-gray-500"
            } rounded`}
          >
            <option value="">Seleccione un paquete</option>
            {paquetes.map((paquete) => (
              <option key={paquete.value} value={paquete.value}>
                {paquete.label}
              </option>
            ))}
          </select>
          {errors.paquete && (
            <div className="text-red-500 text-sm mt-1">{errors.paquete}</div>
          )}
        </div>

        {/* ENVIAR */}
        <div className="grid-flow-row justify-center space-y-4 pt-5">
          <button
            type="button"
            className="p-3 bg-purple-700 text-white rounded-full w-full"
            onClick={() => handleSubmit(formData)}
          >
            Enviar por WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}
