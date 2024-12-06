import { Check } from 'lucide-react';
import Link from 'next/link';

interface Item {
    name: string;
}

interface Service {
    nombre: string;
    items: Item[];
}

interface ColumnaPaqueteProps {
    id: number;
    name: string;
    description: string;
    price: string;
    services: Service[];
}

function ColumnaPaquete({ id, name, description, price, services }: ColumnaPaqueteProps) {
    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg overflow-hidden text-left border border-gray-600">
            <div className="px-6 pt-6 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-600">
                    {name}
                </h2>
                <div
                    className="pt-2 text-gray-700 text-sm"
                    dangerouslySetInnerHTML={{ __html: description }} // Renderizar HTML enriquecido
                />
                <p className="text-4xl font-bold text-gray-800 mt-4">
                    <span className='font-Bebas-Neue text-6xl'>${price}</span><span className='text-lg font-light'> mxn</span>
                </p>
            </div>

            <div className="p-6 flex-grow">
                <div className="space-y-4">
                    {services.map((service, serviceIdx) => (
                        <div key={serviceIdx}>
                            <h3 className="font-semibold text-gray-700 mb-2">{service.nombre}</h3>
                            <ul className="space-y-2">
                                {service.items.map((item, itemIdx) => (
                                    <li
                                        key={itemIdx}
                                        className="flex items-start text-gray-600"
                                    >
                                        <div className="w-1/12">
                                            <Check className="h-5 w-5 text-pink-500 pr-1" />
                                        </div>
                                        <div className="w-11/12">
                                            {item.name}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-gray-50">
                <div className="flex justify-center items-center w-full max-w-lg mx-auto">
                    <div className="relative z-10 flex cursor-pointer overflow-hidden rounded-full border border-none p-[1.5px]">
                        <div className="animate-rotate absolute h-full w-full rounded-full bg-[conic-gradient(#cbd5e1_20deg,transparent_120deg)]"></div>

                        <Link
                            href={{
                                pathname: '/contacto',
                                query: {
                                    paquete: id,
                                    asunto: 2,
                                    tipo_evento: 2
                                }
                            }}
                            id="btn_promo"
                            title="Promoción"
                            className="relative z-20 flex w-full rounded-full bg-white"
                        >
                            <span
                                className="
                                    relative z-50 rounded-full border border-purple-300 bg-none px-5 py-2
                                    text-center text-purple-700 shadow-4xl 
                                    text-xl
                                "
                            >
                                Quiero este paquete
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ColumnaPaquete;