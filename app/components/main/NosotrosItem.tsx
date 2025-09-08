import React from 'react';
import { LucideIcon } from 'lucide-react';

// Crea una interfaz
interface Props {
    icon: LucideIcon;
    title: string;
    description: string;
}

function NosotrosItem({ icon: Icon, title, description }: Props) {
    return (
        <div>

            <div className="py-5 bg-zinc-950 p-5 rounded-md border border-violet-900">
                <h5 className="font-semibold text-violet-400 pb-1">
                    <Icon className="inline-block mr-2" /> {title}
                </h5>
                <p className="text-sm font-light text-gray-300">{description}</p>
            </div>

        </div>
    );
}

export default NosotrosItem;