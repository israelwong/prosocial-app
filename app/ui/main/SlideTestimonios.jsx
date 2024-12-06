"use client";

import { useEffect } from "react";
import Glide from "@glidejs/glide";
// import Image from "next/image";

function SlideTestimonios() {
  const testimonios = [
    {
      icon: "https://scontent.fmex5-1.fna.fbcdn.net/v/t1.18169-1/11666109_936884579704356_3645265830793144522_n.jpg?stp=dst-jpg_s480x480&_nc_cat=108&ccb=1-7&_nc_sid=e4545e&_nc_ohc=sqF84dgXqFIQ7kNvgHlz59s&_nc_ht=scontent.fmex5-1.fna&oh=00_AYAH7F-HFEYCV0qH4XnRWSG6sx77xBVKhDbZALE7nTstlg&oe=670B0591",
      cliente: "Stephanie Moran",
      msg: "Recomiendo ampliamente su servicio ! Son muy profesionales , puntuales  y realmente los mejores para capturar un momento tan importante en la vida ! El material que te entregan es excelente ! Muchas gracias por todo",
    },
    {
      icon: "https://scontent.fmex26-1.fna.fbcdn.net/v/t1.6435-1/102589567_3042040159212126_3642729847418723217_n.jpg?stp=dst-jpg_s480x480&_nc_cat=105&ccb=1-7&_nc_sid=e4545e&_nc_ohc=QG5u76mI-NYQ7kNvgEU94J6&_nc_ht=scontent.fmex26-1.fna&_nc_gid=AtPhtJp4w9dNAL6qQnSbnU3&oh=00_AYD4y2A196cIhvZLhg5a3zcqdze2tlKT1MtIcWMrQZ7Qew&oe=670AF397",
      cliente: "Adris Escalante",
      msg: "El mejor equipo q pude elegir para recordar por siempre los mejores momentos de mi evento, siempre agradecida con ProSocial por su amabilidad, compromiso, profesionalismo, disponibilidad y paciencia .",
    },
    {
      icon: "https://scontent.fmex36-1.fna.fbcdn.net/v/t39.30808-1/325353396_515139677389497_1870582655871249458_n.jpg?stp=cp0_dst-jpg_s80x80&_nc_cat=106&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=DNtkJXb3vuQQ7kNvgGx-r44&_nc_ht=scontent.fmex36-1.fna&oh=00_AYBWR1ECwnA-4XSenWykIR4HUr3yl2kUwBUFNJYcjABrIw&oe=66E94BC6",
      cliente: "Ashly Neri",
      msg: "Hacen un trabajo increíble! Son súper profesionales y muy atentos a lo que quieres para tu servicio, me encanto, lo recomiendo 100%.",
    },
    {
      icon: "https://scontent.fmex26-1.fna.fbcdn.net/v/t1.6435-1/123617912_3664914573539474_4820613557033731411_n.jpg?stp=cp0_dst-jpg_s80x80&_nc_cat=105&ccb=1-7&_nc_sid=e4545e&_nc_ohc=lioOe9O3J24Q7kNvgGOOgYT&_nc_ht=scontent.fmex26-1.fna&oh=00_AYA47X8e5O5l8eHKQN4mkOiYUNwEE2DDNZsf_lz1HfmmLg&oe=670AEB0D",
      cliente: "Patricia Soriano",
      msg: "Son un excelente equipo de trabajo, muy profesionales y la calidad de su trabajo es de excelencia ... cumplidos en las fechas acordadas y bastante confiables ... ampliamente recomendables ... Isra ... felicidades por el Excel este equipo y la calidad de tus servicios 👏🏼👏🏼👏🏼.",
    },
    {
      icon: "https://scontent.fmex26-1.fna.fbcdn.net/v/t39.30808-1/405316871_2641679539303518_2524030552240724384_n.jpg?stp=cp0_dst-jpg_s80x80&_nc_cat=100&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=IMAc-gt6KQIQ7kNvgHW3KOp&_nc_ht=scontent.fmex26-1.fna&_nc_gid=AjE3VebE17fU0jnMV5rSSxB&oh=00_AYATHykdQmJ1mSwdlkrGUJC049YE8bzS6qLP_uBUy2rijQ&oe=66E93DC3",
      cliente: "Paty Benitez",
      msg: "Excelente servicio muy profesional y con buena disposición para cualquier idea. Súper recomendable!!!",
    },
    {
      icon: "https://scontent.fmex31-1.fna.fbcdn.net/v/t39.30808-1/348553677_988703585457496_6242462569091054843_n.jpg?stp=cp0_dst-jpg_s80x80&_nc_cat=109&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=PiwJnCIT3y8Q7kNvgEuxaAt&_nc_ht=scontent.fmex31-1.fna&_nc_gid=AjE3VebE17fU0jnMV5rSSxB&oh=00_AYAK4TAA2PtgjMiNOhUxfBs1wnL6bB4NaCYpTtzKQQlLXg&oe=66E948B4",
      cliente: "Mara Hernandez ",
      msg: "Tienen un servicio de excelencia y cálidad, me encanta su forma de trabajo y son muy cumplidos en lo que prometen",
    },
    {
      icon: "https://scontent.fmex31-1.fna.fbcdn.net/v/t39.30808-1/274476853_3215450502022732_5516465179225688957_n.jpg?stp=cp0_dst-jpg_s80x80&_nc_cat=109&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=zQoXDMo1CosQ7kNvgHawdyS&_nc_ht=scontent.fmex31-1.fna&_nc_gid=Aa7iZcVFcr3IVNToocaYJbV&oh=00_AYC53lsl67okVHeh33giKrkWC21_FlWZ2Vhj8yL56LPZQQ&oe=66E969C1",
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
                        {/* <Image
                          alt="Testimonios de clientes ProSocial "
                          className="w-16 h-16 rounded-full border-4 border-shite max-w-full shrink-0"
                          src={testimonio.icon}
                        /> */}
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
