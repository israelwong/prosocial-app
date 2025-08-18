'use client'
import React from 'react'

export default function EventoFooter() {
    return (
        <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Sección principal de contacto */}
                <div className="text-center mb-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        ¿Tienes alguna pregunta?
                    </h3>
                    <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
                        Nuestro equipo de expertos está disponible para ayudarte en cada paso del proceso.
                        Contáctanos cuando gustes.
                    </p>

                    {/* Botones de contacto */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <a
                            href="https://wa.me/5544546582?text=Hola, tengo una pregunta sobre mi evento"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                            </svg>
                            WhatsApp
                        </a>
                        <a
                            href="tel:5544546582"
                            className="inline-flex items-center justify-center gap-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Llamar ahora
                        </a>
                    </div>
                </div>

                {/* Información de contacto adicional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Horarios</h4>
                        <p className="text-zinc-400 text-sm">Lun - Sáb: 9:00 AM - 7:00 PM</p>
                        <p className="text-zinc-400 text-sm">Dom: 10:00 AM - 6:00 PM</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Respuesta rápida</h4>
                        <p className="text-zinc-400 text-sm">WhatsApp: Inmediata</p>
                        <p className="text-zinc-400 text-sm">Llamadas: Hasta 3 timbres</p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Garantía</h4>
                        <p className="text-zinc-400 text-sm">Satisfacción 100%</p>
                        <p className="text-zinc-400 text-sm">Servicio garantizado</p>
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t border-zinc-800 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Logo y texto */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                                <img
                                    src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/logotipo_blanco.svg"
                                    alt="ProSocial"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <div className="text-white font-semibold">ProSocial</div>
                                <div className="text-zinc-400 text-sm">Momentos para toda la vida</div>
                            </div>
                        </div>

                        {/* Redes sociales */}
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <a
                                href="https://www.facebook.com/prosocial.eventos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-zinc-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                title="Síguenos en Facebook"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/prosocial.eventos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-zinc-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                title="Síguenos en Instagram"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="https://wa.me/5544546582"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-zinc-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                title="Contáctanos por WhatsApp"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.tiktok.com/@prosocial.eventos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-zinc-800 hover:bg-black rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                title="Síguenos en TikTok"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.968-1.26-2.06-1.26-3.338v-.322C16.481.313 16.169 0 15.803 0h-3.527c-.366 0-.678.313-.678.678v13.094c0 1.703-1.39 3.094-3.094 3.094s-3.094-1.39-3.094-3.094c0-1.703 1.39-3.094 3.094-3.094.339 0 .672.055.991.162.319.107.599.273.831.492.035.033.074.061.115.084l.041.023c.338.184.588.536.588.963v.018c0 .535-.434.968-.968.968-.311 0-.584-.15-.76-.381a.968.968 0 0 0-.833-.485c-.535 0-.968.434-.968.968 0 .535.434.968.968.968.779 0 1.462-.461 1.771-1.146.129-.287.197-.603.197-.935v-.018c0-.97-.434-1.837-1.115-2.416a3.686 3.686 0 0 0-2.513-.983c-2.035 0-3.688 1.653-3.688 3.688s1.653 3.688 3.688 3.688 3.688-1.653 3.688-3.688V8.318c.649.398 1.415.632 2.24.632.366 0 .678-.313.678-.678 0-.366-.313-.678-.678-.678-.979 0-1.864-.464-2.422-1.183-.275-.353-.463-.77-.544-1.229-.024-.134-.036-.271-.036-.409V.678c0-.366-.313-.678-.678-.678z" />
                                </svg>
                            </a>
                        </div>

                        {/* Copyright */}
                        <div className="text-zinc-500 text-sm text-center md:text-right">
                            <p>&copy; 2025 ProSocial. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
