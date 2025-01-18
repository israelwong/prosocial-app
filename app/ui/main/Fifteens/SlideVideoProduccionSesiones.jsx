"use client";
import { useEffect } from "react";
// import VideoPlayer from "./VideoPlayer";

function SlideVideoProduccionSesiones() {
  useEffect(() => {
    const glideVideoProduccionSesiones = new Glide(
      ".glide-video-produccion-sesiones",
      {
        type: "carousel",
        focusAt: "center",
        perView: 2,
        autoplay: 2000,
        animationDuration: 700,
        gap: 10,
        classes: {
          activeNav: "[&>*]:bg-slate-200",
        },
        breakpoints: {
          1024: {
            perView: 2,
          },
          640: {
            perView: 1.5,
          },
        },
      }
    );

    glideVideoProduccionSesiones.mount();

    return () => {
      glideVideoProduccionSesiones.destroy();
    };
  }, []);

  return (
    <>
      {/*<!-- Component: Carousel with controls outside --> */}
      <div className="glide-video-produccion-sesiones relative w-full h-fit">
        {/*    <!-- Slides --> */}
        {/* <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"> */}
        <div className="overflow-hidden" data-glide-el="track">
          <ul className="whitespace-no-wrap flex-no-wrap [backface-visibility: hidden] [transform-style: preserve-3d] [touch-action: pan-Y] [will-change: transform] relative flex w-full overflow-hidden p-0">
            <li className="text-center">
              {/* <VideoPlayer
                src={"./video/produccion/Dron-low-m.mp4"}
                autoPlay={true}
                muted={true}
                loop={0}
              /> */}
            </li>
            <li className="text-center">
              {/* <VideoPlayer
                src={"./video/produccion/Ronin-low-m.mp4"}
                autoPlay={true}
                muted={true}
                loop={0}
              /> */}
            </li>
          </ul>
        </div>
        {/* </div> */}

        <div
          className="absolute left-0 flex items-center justify-between w-full h-0 px-4 top-1/2 "
          data-glide-el="controls"
        >
          <button
            className="inline-flex items-center justify-center w-8 h-8 transition duration-300 border rounded-full lg:w-12 lg:h-12 text-slate-700 border-slate-700 hover:text-slate-900 hover:border-slate-900 focus-visible:outline-none bg-white"
            data-glide-dir="<"
            aria-label="prev slide"
          >
            <i className="fas fa-long-arrow-alt-left"></i>
          </button>
          <button
            className="inline-flex items-center justify-center w-8 h-8 transition duration-300 border rounded-full lg:w-12 lg:h-12 text-slate-700 border-slate-700 hover:text-slate-900 hover:border-slate-900 focus-visible:outline-none bg-white"
            data-glide-dir=">"
            aria-label="next slide"
          >
            <i className="fas fa-long-arrow-alt-right"></i>
          </button>
        </div>
      </div>
    </>
  );
}

export default SlideVideoProduccionSesiones;
