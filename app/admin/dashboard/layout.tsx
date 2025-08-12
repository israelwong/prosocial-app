'use client'
import React from 'react'
import SideBarDashboard from '@/app/admin/dashboard/_components/SideBarDashboard'
import Navbar from '@/app/admin/_components/Navbar'
import { Toaster } from 'sonner'

export default function LayoutDashboard({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className='h-screen flex flex-col'>
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <SideBarDashboard />
                <main className="flex-1 overflow-auto bg-zinc-950">
                    <div className="p-4 lg:p-6">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster
                theme="dark"
                position="top-right"
                richColors
            />
        </div>
    );
}