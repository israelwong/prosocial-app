import React from "react";
import VideoPlayer from "@/app/ui/main/VideoPlayer";

function Hero() {
  return (
    <div>
      <div
        className="
		mx-auto 
		text-white
		bg-gradient-to-b from-violet-950 to-violet-950/10 
		items-center
		"
      >
        <div className="md:max-w-screen-md mx-auto pt-10">
          <h1
            className="px-8 
					font-Smooch 
					md:text-8xl 
					text-6xl 
					text-violet-200 text-center mb-5"
          >
            Fifteens
          </h1>

          <h1 className="px-8 text-4xl font-bold lg:text-6xl text-center">
            Capturamos <span className="text-violet-500">momentos</span> para
            toda la vida
          </h1>

          <p className="mt-4 text-lg md:text-xl text-gray-200 font-light text-center md:px-20 px-8">
            Cuidamos cada detalle en fotografía y video con la máxima calidad y
            cuidado para entregarte los mejores resultados.
          </p>

          <div className="my-8 drop-shadow-xl ">
            <VideoPlayer
              src={
                "https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/video/hero-30fps.webm?t=2024-09-28T23%3A53%3A21.149Z"
              }
              autoPlay={true}
              muted={true}
              loop={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
