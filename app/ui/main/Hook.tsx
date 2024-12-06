
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
                    <i className="text-8xl text-pink-900/30 absolute left-0 top-0 -z-10 h-16 fas fa-quote-left"></i>
                </div>
            </div>
        </div>
    );
}

export default Hook;