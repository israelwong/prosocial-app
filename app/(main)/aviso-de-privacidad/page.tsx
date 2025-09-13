import React from 'react'
import Image from 'next/image'
import { Shield, Lock, Mail, Phone, Clock, FileText } from 'lucide-react'

export default function AvisoPrivacidad() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Header con gradiente */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
                <div className="relative px-6 py-16 sm:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-lg" />
                                <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-full p-4">
                                    <Image
                                        src="https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg"
                                        width={60}
                                        height={60}
                                        alt="ProSocial"
                                        className="opacity-90"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Título principal */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Shield className="w-8 h-8 text-blue-400" />
                            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                Aviso de Privacidad
                            </h1>
                        </div>

                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            Tu privacidad y la protección de tus datos personales son nuestra prioridad
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="px-6 pb-16">
                <div className="max-w-4xl mx-auto">
                    {/* Introducción */}
                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 mb-8 mt-8">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-3">Responsable del tratamiento</h2>
                                <p className="text-zinc-300 leading-relaxed">
                                    <strong className="text-white">ProSocial</strong>, con domicilio en <em className="text-blue-300">Tecámac, Estado de México</em>, es responsable del tratamiento de los datos personales que usted nos proporcione, en cumplimiento con lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secciones del aviso */}
                    <div className="space-y-8">
                        {/* Datos personales */}
                        <section className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                                Datos personales que recopilamos
                            </h2>
                            <p className="text-zinc-300 mb-4">
                                Los datos personales que recopilamos incluyen:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    'Nombre completo',
                                    'Teléfono',
                                    'Dirección',
                                    'Correo electrónico'
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-zinc-800/30 rounded-lg p-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                        <span className="text-zinc-200">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Finalidad */}
                        <section className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                                Finalidad del tratamiento
                            </h2>
                            <p className="text-zinc-300 leading-relaxed">
                                Los datos recabados serán utilizados exclusivamente para la elaboración del contrato de servicios, así como para el seguimiento y cumplimiento de los acuerdos establecidos.
                            </p>
                        </section>

                        {/* Protección */}
                        <section className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                                Protección y confidencialidad
                            </h2>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                    <Lock className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-zinc-300 leading-relaxed">
                                    Los datos proporcionados serán tratados con estricta confidencialidad y no serán compartidos con terceros bajo ninguna circunstancia. Además, se almacenarán de manera segura utilizando técnicas de encriptación para garantizar su protección.
                                </p>
                            </div>
                        </section>

                        {/* Derechos ARCO */}
                        <section className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                                Derechos ARCO
                            </h2>
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                Usted tiene derecho a <strong className="text-white">Acceder, Rectificar, Cancelar u Oponerse</strong> (derechos ARCO) al uso de sus datos personales. En caso de que al término de nuestro servicio desee que eliminemos sus registros, deberá enviar su solicitud al correo electrónico:
                            </p>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                    <a href="mailto:contacto@prosocial.mx" className="text-blue-300 hover:text-blue-200 font-medium transition-colors">
                                        contacto@prosocial.mx
                                    </a>
                                </div>
                            </div>
                        </section>

                        {/* Cambios */}
                        <section className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                                Modificaciones al aviso
                            </h2>
                            <p className="text-zinc-300 leading-relaxed">
                                Nos reservamos el derecho de realizar modificaciones o actualizaciones a este aviso de privacidad. Dichos cambios serán notificados a través del correo electrónico proporcionado por usted.
                            </p>
                        </section>

                        {/* Contacto */}
                        <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                                Información de contacto
                            </h2>
                            <p className="text-zinc-300 mb-6">
                                Para cualquier duda, comentario o solicitud relacionada con sus datos personales, puede comunicarse con nosotros:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-zinc-800/30 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Phone className="w-5 h-5 text-green-400" />
                                        <span className="text-zinc-300 font-medium">Teléfono</span>
                                    </div>
                                    <a href="tel:5544546582" className="text-white hover:text-green-300 transition-colors">
                                        55 4454 6582
                                    </a>
                                </div>
                                <div className="bg-zinc-800/30 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                        <span className="text-zinc-300 font-medium">Correo</span>
                                    </div>
                                    <a href="mailto:contacto@prosocial.mx" className="text-white hover:text-blue-300 transition-colors">
                                        contacto@prosocial.mx
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-6">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Clock className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm text-zinc-400">Última actualización</span>
                            </div>
                            <p className="text-zinc-300 font-medium">Septiembre 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

