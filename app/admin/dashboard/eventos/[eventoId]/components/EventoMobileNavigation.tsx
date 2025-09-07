'use client'
import React, { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import {
    User,
    Calendar,
    DollarSign,
    MessageSquare,
    CalendarDays
} from 'lucide-react'

interface Props {
    gestionContent: React.ReactNode
    cotizacionesContent: React.ReactNode
    citasContent: React.ReactNode
    seguimientoContent: React.ReactNode
}

type Tab = 'gestion' | 'cotizaciones' | 'citas' | 'seguimiento'

export default function EventoMobileNavigation({
    gestionContent,
    cotizacionesContent,
    citasContent,
    seguimientoContent
}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('gestion')

    const tabs = [
        { id: 'gestion' as Tab, label: 'Gestión', icon: User },
        { id: 'cotizaciones' as Tab, label: 'Cotizaciones', icon: DollarSign },
        { id: 'citas' as Tab, label: 'Citas', icon: CalendarDays },
        { id: 'seguimiento' as Tab, label: 'Seguimiento', icon: MessageSquare }
    ]

    const getContent = () => {
        switch (activeTab) {
            case 'gestion': return gestionContent
            case 'cotizaciones': return cotizacionesContent
            case 'citas': return citasContent
            case 'seguimiento': return seguimientoContent
            default: return gestionContent
        }
    }

    return (
        <div className="lg:hidden">
            {/* Navigation Tabs */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg mb-6">
                <div className="flex">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        const isFirst = index === 0
                        const isLast = index === tabs.length - 1

                        return (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 py-3 px-4
                                    ${isFirst ? 'rounded-l-lg' : ''}
                                    ${isLast ? 'rounded-r-lg' : ''}
                                    ${isActive
                                        ? 'bg-zinc-800 text-zinc-100 border-b-2 border-zinc-400'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }
                                `}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </Button>
                        )
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg">
                {getContent()}
            </div>
        </div>
    )
}
