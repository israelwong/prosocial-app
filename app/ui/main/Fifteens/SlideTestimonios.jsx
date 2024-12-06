"use client";
import { useEffect } from "react";

function SlideTestimonios() {
  const testimonios = [
    {
      cliente: "Stephanie Moran",
      msg: "Recomiendo ampliamente su servicio ! Son muy profesionales , puntuales  y realmente los mejores para capturar un momento tan importante en la vida ! El material que te entregan es excelente ! Muchas gracias por todo",
    },
    {
      cliente: "Adris Escalante",
      msg: "El mejor equipo q pude elegir para recordar por siempre los mejores momentos de mi evento, siempre agradecida con ProSocial por su amabilidad, compromiso, profesionalismo, disponibilidad y paciencia .",
    },
    {
      cliente: "Ashly Neri",
      msg: "Hacen un trabajo increíble! Son súper profesionales y muy atentos a lo que quieres para tu servicio, me encanto, lo recomiendo 100%.",
    },
    {
      cliente: "Patricia Soriano",
      msg: "Son un excelente equipo de trabajo, muy profesionales y la calidad de su trabajo es de excelencia ... cumplidos en las fechas acordadas y bastante confiables ... ampliamente recomendables ... Isra ... felicidades por el Excel este equipo y la calidad de tus servicios 👏🏼👏🏼👏🏼.",
    },
    {
      cliente: "Paty Benitez",
      msg: "Excelente servicio muy profesional y con buena disposición para cualquier idea. Súper recomendable!!!",
    },
    {
      cliente: "Mara Hernandez ",
      msg: "Tienen un servicio de excelencia y cálidad, me encanta su forma de trabajo y son muy cumplidos en lo que prometen",
    },
    {
      cliente: "Norma Manzo",
      msg: "Gracias prosocial muy satisfecha con su trabajo, excelente equipo  todo de 10 de principio o fin. Fue un placer es algo que vale mucho la pena recuerdos de muy buena calidad!",
    },
    {
      icon: "https://scontent.fmex26-1.fna.fbcdn.net/v/t39.30808-1/426648466_7180668728689571_4866407748798003489_n.jpg?stp=cp0_dst-jpg_s80x80&_nc_cat=105&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=Wmmxl_wEbpUQ7kNvgET5ShS&_nc_ht=scontent.fmex26-1.fna&_nc_gid=Aa7iZcVFcr3IVNToocaYJbV&oh=00_AYB44T55K5L0pJ15O0pRXfNfejJK0EFOl3WLX-rLz6qw6Q&oe=66E9369C",
      cliente: "Elia Gatell",
      msg: "Todos los servicios que ofrecen .  Sus atenciones , su compromiso por hacer su trabajo y darme una satisfacción plena a mi evento  y la actitud  de cada una de sus  integrantes en verdad son  personas que Aman y disfrutan su trabajo . Así ampliamente los recomiendo 👌.",
    },
  ];

  useEffect(() => {
    const glideTestimonios = new Glide(".glide-testimonios", {
      type: "carousel",
      focusAt: "center",
      perView: 3,
      autoplay: 3200,
      animationDuration: 700,
      gap: 15,
      classes: {
        activeNav: "[&>*]:bg-slate-200",
      },
      breakpoints: {
        1024: {
          perView: 2,
        },
        640: {
          perView: 1.2,
        },
      },
    });

    glideTestimonios.mount();

    return () => {
      glideTestimonios.destroy();
    };
  }, []);

  return (
    <>
      {/*<!-- Component: Testimonial carousel --> */}
      <div className="glide-testimonios relative w-full overflow-hidden">
        <div data-glide-el="track">
          <ul className="whitespace-no-wrap flex-no-wrap [backface-visibility: hidden] [transform-style: preserve-3d] [touch-action: pan-Y] [will-change: transform] relative flex w-full overflow-hidden p-0 pb-12">
            {testimonios.map((testimonio, index) => (
              <li key={index}>
                <div className="h-full w-full">
                  <div className="h-full overflow-hidden text-slate-500 border border-slate-500 rounded-md">
                    <div className="relative p-6">
                      <figcaption className="flex items-center gap-4 p-3 text-sm text-slate-500">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold uppercase text-2xl pr-12">
                            {testimonio.cliente}
                          </span>
                        </div>
                      </figcaption>

                      <blockquote className="p-6 text-sm leading-relaxed text-white">
                        <p>{testimonio.msg}</p>
                      </blockquote>
                      <i className="text-6xl opacity-30 absolute left-6 top-32 z-0 h-16 fas fa-quote-left"></i>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default SlideTestimonios;
