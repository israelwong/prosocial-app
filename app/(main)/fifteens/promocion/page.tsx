import React from 'react'
import type { Metadata } from "next";
import BtnCerrar from '@/app/ui/main/BtnCerrar';
import TitlePulse from '@/app/ui/main/TitlePulse';
import BtnPromocion from '@/app/ui/main/BtnPromocion';
// import Galeria from '@/app/ui/main/Galeria';
import Testomonios from '@/app/ui/main/Testomonios';

export const metadata: Metadata = {
  title: "Paquete promocional de XV años",
  description: "Paquetes de fotografía y video para XV años",
};

function page() {
  return (
    <div>
      <section>
        <div className="max-w-screen-md mx-auto  px-10">

          <div className="text-center py-8">

            <h1 className="
            text-xl md:text-2xl 
            font-bold 
            font-Bebas-Neue mt-10">
              Paquete promocional
            </h1>

            <h2 className="
            font-Smooch 
            text-6xl md:text-8xl
            text-violet-500">
              Fifteens
            </h2>

          </div>

          <p className="py-2 text-2xl text-slate-600 mb-5">
            <span className="text-white">Sesión previa en foto y video, un increíble cuadro de acrílico 24x36&quot;, cobertura 8 horas de evento en foto, video y dron. Todo listo para descargar en un link permanente de Google Drive</span>.
          </p>

          <div className="grid grid-flow-row gap-4 mb-5">

            <div className="mb-3">
              <TitlePulse
                titulo={"Fotografía de sesión previa"}
              />

              {/* <!-- lista --> */}
              <ul className="list-none text-md font-light text-slate-300">
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Vestido por 2 hrs en locación a elegir.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Sesión con 2 cambios casuales.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Todas las fotografías de la sesión en digital alta resolución.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">12 fotos en retoque fino.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">1 Cuadro de acrílico 24x36&quot; </p>
                </li>
              </ul>
            </div>

            <div>
              <TitlePulse
                titulo={"Cinemática de sesión"}
              />
              <ul className="list-none text-md font-light text-slate-300">
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Producción de video profesonal para tu sesion con estabilizador en piso y dron.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">1 video cinemático de hasta 3 min musicalizado.</p>
                </li>
              </ul>
            </div>

            <div>
              <TitlePulse
                titulo={"Fotografía para evento"}
              />
              <ul className="list-none text-md font-light text-slate-300">
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Hasta 8 horas de servicio profesional dedicado.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">1 Fotógrafo profesional con kit iluminación profesional.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Todas las fotos de tu evento en digital con revelado ligero en alta calidad.</p>
                </li>
              </ul>
            </div>

            <div>
              <TitlePulse
                titulo={"Cinematografía para evento"}
              />
              <ul className="list-none text-md font-light text-slate-300">
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Hasta 8 horas de servicio profesional dedicado.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">1 Camarógrafo profesional con estabilizador y dron para tomas aéreas en momentos clave.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Kit de iluminación profesional.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">Kit de audio profesional.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">1 video extendido de 60 min o más en alta resolución.</p>
                </li>
                <li className="grid grid-cols-12">
                  <span className="flex pt-1 justify-center col-span-1">
                    <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                  </span>
                  <p className="col-span-11">1 video extendido de 60 min o más en alta resolució.</p>
                </li>
              </ul>
            </div>

          </div>

          <div className="bg-slate-900 p-5 rounded-md text-slate-400 mb-5">
            <p>
              Se incluye la edición de 1 <b>video remembranza</b> musicalizado usando hasta 100 fotos con las diferentes etapas de vida de la festejada.
            </p>
          </div>


          <div className="mb-5">
            <h3 className="text-lg">Entregamos tu servicio:</h3>
            <ul className="">

              <li className="grid grid-cols-12">
                <span className="flex pt-1 justify-center col-span-1">
                  <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                </span>
                <p className="col-span-11">20 días hábiles posteriores a tu evento.</p>
              </li>

              <li className="grid grid-cols-12">
                <span className="flex pt-1 justify-center col-span-1">
                  <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                </span>
                <p className="col-span-11">Garantía en las fotos en retoque fino .</p>
              </li>
              <li className="grid grid-cols-12">
                <span className="flex pt-1 justify-center col-span-1">
                  <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                </span>
                <p className="col-span-11">Garantía de edición en tus videos.</p>
              </li>

              <li className="grid grid-cols-12">
                <span className="flex pt-1 justify-center col-span-1">
                  <i className="fas fa-check-circle text-pink-950 text-sm"></i>
                </span>
                <p className="col-span-11">Todos los archivos en digital alta resolución en 1 link permanente de google drive para descargar.</p>
              </li>

            </ul>
          </div>

          <div className="border-4 border-pink-900/50 p-5 rounded-md text-slate-400 mb-5 text-center">
            <div>
              <p className="font-Smooch text-6xl text-pink-500">Reserva ahora</p>

              <p className="pt-2 pb-10 font-bold text-xl md:text-2xl animate-pulse text-pink-800 max-w-sm mx-auto">
                Todos nuestros servicios están garantizados por contrato.
              </p>

              <p className="text-6xl font-Bebas-Neue pb-1">
                $30,000 mxn
              </p>

              <span className="text-slate-600">(Puedes agregar un libro impreso de 24x36&quot; por $5,000 mxn adicionales)</span>

              <div className="flex flex-col items-center justify-center text-center mx-auto mt-5">
                <BtnPromocion
                  title={'¡Quiero este paquete!'}
                  id_paquete={4}
                  id_tipo_evento={2}
                  id_asunto={2}
                />
              </div>

            </div>
            <p className="text-sm text-gray-400 pt-4 italic md:px-36 mb-5">
              Formaliza tu servicio con solo el 10% y el resto difierelo en un plan de pagos a liquidar 2 días antes de tu evento. Aceptamos SPEI, efectivo y TC/TD.
            </p>

          </div>

          <div className="mx-auto text-center mb-10">
            <a href="/fifteens/paquetes" className="text-center text-white underline ">
              Ver todos los paquetes
            </a>
          </div>
        </div>
      </section>

      <section>
        <Testomonios />
      </section>

      {/* <section>
        <Galeria
          ruta={'https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/porfatolio/'}
          num_fotos={52}
          rowHeight={250}
        />
      </section> */}

      <BtnCerrar url={'/fifteens'} />

    </div>
  )
}

export default page
