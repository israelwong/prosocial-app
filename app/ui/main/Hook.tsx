'use client'
import React from 'react';

interface HookProps {
    message: string;
}

function Hook({ message }: HookProps) {

    return (
        <div className="p-5 max-w-screen-md mx-auto">

            <div className="text-left py-10 px-6 border border-pink-900/50 rounded-lg">
                <div className="relative">
                    <blockquote className="p-6 text-white text-3xl font-abril font-bold z-10">
                        {message}
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

export default Hook;