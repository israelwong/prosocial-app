"use client";
import React, { useState, useEffect } from "react";
import BtnPromocion from "@/app/ui/main/BtnPromocion";
import Link from "next/link";

export default function PaquetesFifteens() {
  const [tabSelected, setTabSelected] = useState(1);
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar el archivo JSON
    fetch("/fifteens_paquetes.json")
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

  const renderServices = (services) => (
    <table className="border-collapse border border-slate-950 md:w-full max-w-screen-sm text-sm md:text-xl overflow-x-hidden">
      <tbody>
        {services.map((service) => (
          <React.Fragment key={service.nombre}>
            <tr className="text-left font-bold">
              <td
                className="border border-slate-700 p-3 text-purple-500"
                colSpan="2"
              >
                {service.nombre}
              </td>
            </tr>
            {service.items.map((item, index) => (
              <tr key={index}>
                <td className="text-left border border-slate-700 p-3 md:font-light">
                  {item.name}
                </td>
                <td className="border border-slate-700 p-3">
                  {item.included ? (
                    <i className="text-pink-500 fas fa-check-circle"></i>
                  ) : (
                    <i className="text-slate-700 fas fa-times-circle"></i>
                  )}
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <section className="max-w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20 md:py-32">
            <p className="text-white text-lg">Cargando paquetes...</p>
          </div>
        ) : (
          <>
            <ul
              className="flex items-center gap-2 pb-5 sticky top-0 bg-black/80 w-full"
              role="tablist"
            >
              {paquetes.map((paquete, index) => (
                <li
                  key={paquete.id}
                  role="presentation"
                  className="flex-grow"
                >
                  <button
                    className={`inline-flex h-12 items-center justify-center md:gap-2 whitespace-nowrap rounded md:px-6 text-sm font-medium transition duration-300 focus-visible:outline-none disabled:cursor-not-allowed w-full ${
                      tabSelected === paquete.id
                        ? "bg-violet-500 text-white hover:bg-violet-600 focus:bg-violet-700 disabled:bg-violet-300"
                        : "stroke-slate-700 text-slate-500 hover:bg-violet-50 hover:stroke-violet-500 hover:text-violet-500 focus:bg-violet-50 focus:stroke-violet-600 focus:text-violet-600 disabled:text-violet-300"
                    }`}
                    id={`tab-label-${paquete.id}`}
                    role="tab"
                    aria-setsize={paquetes.length}
                    aria-posinset={index + 1}
                    tabIndex={tabSelected === paquete.id ? "0" : "-1"}
                    aria-controls={`tab-panel-${paquete.id}`}
                    aria-selected={
                      tabSelected === paquete.id ? "true" : "false"
                    }
                    onClick={() => setTabSelected(paquete.id)}
                  >
                    <span>
                      {paquete.name}{" "}
                      {paquete.popular == 1 ? (
                        <span className="ml-1 text-xs font-light text-white bg-blue-800 py-1 px-2 rounded-full">
                          Más popular
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="py-4">
              {paquetes.map((paquete) => (
                <div
                  key={paquete.id}
                  className={tabSelected === paquete.id ? "" : "hidden"}
                  id={`tab-panel-${paquete.id}`}
                  aria-hidden={tabSelected === paquete.id ? "false" : "true"}
                  role="tabpanel"
                  aria-labelledby={`tab-label-${paquete.id}`}
                  tabIndex="-1"
                >
                  <div className="pb-5">
                    <h2 className="text-4xl md:text-6xl pb-5 font-Bebas-Neue">
                      <span className="text-slate-400 font-abril font-light uppercase text-xl">
                        Desde{" "}
                      </span>
                      ${paquete.price}
                      <span className="text-slate-400 font-abril font-light uppercase text-xl">
                        {" "}
                        MXN
                      </span>
                    </h2>
                  </div>
                  {renderServices(paquete.services)}

                  <div
                    className="grid grid-flow-row gap-4 pt-8 pb-8 border px-8 border-gray-600 
                                    my-8 rounded-md bg-slate-600/30"
                  >
                    <h4 className="font-Smooch px-3 text-4xl md:text-6xl">
                      Reserva hoy mismo
                    </h4>
                    <p className="text-lg text-gray-400 font-light md:px-36">
                      Solo cubrimos un evento por día, asegura tu servicio para
                      tu evento.
                    </p>

                    <div className="flex items-center justify-center text-center w-full max-w-lg mx-auto pt-5">
                      <BtnPromocion
                        title={`Contratar ahora el paquete ${paquete.name}`}
                        id_paquete={paquete.id}
                        id_asunto={2}
                        id_tipo_evento={2}
                      />
                    </div>
                    <p className="text-sm italic">
                      por solo ${paquete.price} MXN
                    </p>

                    <p className="text-sm text-gray-400 pt-4 italic md:px-36 ">
                      Formaliza tu servicio con el 10% y el resto difierelo en
                      un plan de pagos a liquidar 2 días antes de tu evento.
                      Aceptamos SPEI, efectivo y TC/TD.
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
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
