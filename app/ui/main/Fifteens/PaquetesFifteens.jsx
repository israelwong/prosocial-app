"use client";
import React, { useState, useEffect } from "react";
import ColumnaPaquete from "@/app/ui/main/ColumnaPaquete";
import Link from "next/link";

export default function PaquetesFifteens() {
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar el archivo JSON
    fetch("/fifteens_paquetes_v2.json")
      .then((response) => response.json())
      .then((data) => {
        setPaquetes(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar el archivo JSON:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-16">Cargando paquetes...</div>;
  }

  return (
    <>
      <div className="container mx-auto pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {paquetes.map((plan) => (
            <div key={plan.id} className="flex flex-col">
              <ColumnaPaquete
                id={plan.id}
                name={plan.name}
                description={plan.description}
                popular={plan.popular}
                price={plan.price}
                services={plan.services}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-flow-row gap-4 py-16 text-center max-w-screen-md mx-auto">
          <h4 className="font-Smooch px-3 text-4xl md:text-6xl">
            Reserva hoy mismo
          </h4>
          <p className="text-2xl text-gray-400 font-light md:px-24">
            Solo cubrimos un evento por día, asegura tu servicio para tu evento.
          </p>

          <p className="text-gray-400 pt-4 italic md:px-36 ">
            Formaliza tu servicio con el 10% y el resto difierelo en un plan de
            pagos a liquidar 2 días antes de tu evento. Aceptamos SPEI, efectivo
            y TC/TD.
          </p>
        </div>

        <div className="grid grid-flow-row gap-5 mb-5">
          <div className="flex items-center justify-center text-center w-full max-w-lg mx-auto">
            <Link
              href={"/fifteens/promocion"}
              className="bg-purple-800 px-5 py-2 text-white rounded-full animate-pulse"
            >
              Ver paquete promocional
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
