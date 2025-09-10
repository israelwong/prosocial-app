'use client'
import React from 'react'
import { CompactComingSoon } from '@/app/components/shared/announcements'
import { useRouter } from 'next/navigation'

/**
 * Widget para mostrar próximos lanzamientos en el dashboard del admin
 */
export function ComingSoonWidget() {
    const router = useRouter()

    const handleViewAll = () => {
        router.push('/coming-soon')
    }

    return (
        <CompactComingSoon
            className="h-fit"
            maxItems={3}
            showViewAll={true}
            onViewAll={handleViewAll}
        />
    )
}
