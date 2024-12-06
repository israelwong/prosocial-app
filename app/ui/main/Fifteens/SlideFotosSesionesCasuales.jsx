"use client";
import { useEffect } from "react";
import Glide from "@glidejs/glide";
import Image from "next/image";

function SlideFotosSesionesCasuales() {
  const imagenes = [
    "/1.jpg",
    "/2.jpg",
    "/3.jpg",
    "/4.jpg",
    "/6.jpg",
    "/7.jpg",
    "/8.jpg",
    "/9.jpg",
    "/10.jpg",
    "/11.jpg",
    "/12.jpg",
    "/13.jpg",
  ];

  useEffect(() => {
    const glideSesionesCasuales = new Glide(".glide-fotos-sesion-casual", {
      type: "carousel",
      focusAt: "center",
      perView: 3,
      autoplay: 3200,
      animationDuration: 700,
      gap: 0,
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

    glideSesionesCasuales.mount();

    // Cleanup function to destroy the Glide instance when the component unmounts
    return () => {
      glideSesionesCasuales.destroy();
    };
  }, []);

  return (
    <>
      {/*<!-- Component: Carousel with controls outside --> */}
      <div className="glide-fotos-sesion-casual relative w-full h-fit">
        {/*    <!-- Slides --> */}
        <div className="overflow-hidden" data-glide-el="track">
          <ul className="whitespace-no-wrap flex-no-wrap [backface-visibility: hidden] [transform-style: preserve-3d] [touch-action: pan-Y] [will-change: transform] relative flex w-full overflow-hidden p-0">
            {imagenes.map((imagen, index) => (
              <li key={index}>
                <Image
                  src={`https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/fofografia/casual/${imagen}`}
                  alt={`Imagen ${index + 1}`}
                  width={500} // Ajusta el ancho según sea necesario
                  height={500} // Ajusta la altura según sea necesario
                  className="m-auto max-h-full w-full max-w-full"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default SlideFotosSesionesCasuales;
