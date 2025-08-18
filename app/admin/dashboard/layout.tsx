'use client'
import React from 'react'
import SideBarDashboard from '@/app/admin/dashboard/components/SideBarDashboard'
import Navbar from '@/app/admin/components/Navbar'
import { Toaster } from 'sonner'

export default function LayoutDashboard({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className='h-screen flex flex-col relative'>
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <SideBarDashboard />
                <main className="flex-1 overflow-auto bg-zinc-950">
                    <div className="p-4 lg:p-6">
                        {children}
                    </div>
                </main>
            </div>
            <div style={{ position: 'absolute', zIndex: 50, top: 0, right: 0, width: '100%' }}>
                <Toaster
                    theme="dark"
                    position="top-right"
                    richColors
                />
            </div>
        </div>
    );
}