import NavbarV2 from '@/app/components/main/NavbarV2'
import { FooterMarketing } from '@/app/components/shared'

export default function NavbarV2TestPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Navbar V2 */}
            <NavbarV2 />

            {/* Contenido de prueba */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-white">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-roboto">
                            NavbarV2 Preview
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 font-roboto">
                            Nueva estructura de menú con visión de empresa plataforma
                        </p>

                        {/* Features destacados */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                                <h3 className="text-lg font-semibold text-white mb-3">🎯 Events</h3>
                                <p className="text-zinc-300 text-sm">Servicios core consolidados con submenu dropdown</p>
                            </div>

                            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                                <h3 className="text-lg font-semibold text-white mb-3">⚙️ Services</h3>
                                <p className="text-zinc-300 text-sm">Innovación tecnológica con badges "Coming Soon"</p>
                            </div>

                            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                                <h3 className="text-lg font-semibold text-white mb-3">🚀 Platform Vision</h3>
                                <p className="text-zinc-300 text-sm">Studio & Platform con timelines claros</p>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h4 className="text-xl font-semibold text-blue-300 mb-3">Características del NavbarV2:</h4>
                            <ul className="text-zinc-300 text-sm space-y-2">
                                <li>✅ Dropdown menus para "Events" y "Services"</li>
                                <li>✅ Status badges (Active, Beta, Coming Soon)</li>
                                <li>✅ Timelines para funcionalidades futuras</li>
                                <li>✅ Iconos distintivos por sección</li>
                                <li>✅ Responsive design optimizado</li>
                                <li>✅ Mensaje de footer actualizado: "Plataforma integral para eventos"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <FooterMarketing />
        </div>
    )
}
