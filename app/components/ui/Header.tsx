'use client'
import React from 'react'
import Image from 'next/image'

interface Props {
    asunto: string
}

export default function Header({ asunto }: Props) {
    return (
        <div className='border-b border-dotted border-b-zinc-600 px-5 py-3 bg-zinc-900/90'>
            <div className='max-w-screen-sm flex justify-between items-center font-Bebas-Neue mx-auto'>
                <div className='flex text-2xl text-zinc-300'>
                    <Image className='mr-2' src='https://bgtapcutchryzhzooony.supabase.co/storage/v1/object/public/ProSocial/logos/isotipo_gris.svg' width={20} height={20} alt='Logo' style={{ width: '20px', height: 'auto' }} />
                    ProSocial
                </div>
                <p className='text-2xl uppercase text-zinc-700'>
                    {asunto}
                </p>
            </div>
        </div>
    )
}
