import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Bienvenido a ProSocial",
  description: "Fotogafía y video profesional para eventos sociales",
};


export default function Home() {
  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-purple-950/50 to-purple-950/70">

      <div className="">

        <div className="max-w-screen-md mx-auto px-10">
          <Image
            src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
            width={120}
            height={120}
            alt="Logotipo de ProSocial"
            className="h-fit pb-5 text-center mx-auto"
            unoptimized
          />
          <div className="pt-5 pb-10 text-center md:w-2/3 mx-auto px-8">
            <h2 className="
                mx-auto font-Bebas-Neue md:text-4xl text-4xl animate-pulse ">
              Más de 10 años
            </h2>
            <p className="md:text-2xl text-xl">
              presentes en momentos especiales
            </p>

          </div>
        </div>


        <div className="max-w-screen-md mx-auto px-10">

          <div className="flex flex-col items-center gap-5 w-full pb-5">
            <div className="w-full max-w-sm">
              <div className="relative z-10 flex cursor-pointer overflow-hidden rounded-full border border-none p-[1.5px] mx-auto">
                <div className="animate-rotate absolute h-full w-full rounded-full bg-[conic-gradient(#cbd5e1_20deg,transparent_120deg)]"></div>
                <Link href="/fifteens" className="relative z-20 flex w-full items-center justify-center rounded-full bg-purple-950" title="Fifteens">
                  <span className="relative z-50 rounded-full py-4 text-center text-white shadow-2xl md:text-xl text-sm
                        ">
                    XV años
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 w-full">
            <div className="w-full max-w-sm">

              <Link href="/weddings" className="relative z-20 flex w-full items-center justify-center rounded-full bg-purple-950" title="Fifteens">
                <span className="relative z-50 rounded-full py-4 text-center text-white shadow-2xl md:text-xl text-sm
                        ">
                  Bodas
                </span>
              </Link>

            </div>
          </div>

          <p className="
        text-center
        pt-10
        md:w-2/4
        mx-auto
        text-sm
        text-gray-400
        ">
            Todos los derechos reservados ProSocial 2025.
          </p>
          <p className="text-sm text-center text-purple-900">
            Última actualización 01/01/2025.
          </p>
        </div>


      </div>

    </div>
  );
}
