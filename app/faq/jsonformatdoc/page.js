'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { JSONFORMATDATA } from '@/utils/enums'; 
export const runtime = 'edge';
const JsonFomatDocGuide = () => {
    const router = useRouter();

    return (
        <div className="max-w-[80%] mx-auto p-6 relative">
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">JSON Format Structure for Function Calling</h1>
                {JSONFORMATDATA.map(({ title, json }) => (
                    <div key={title} className="faq-section mb-6 p-4 border border-gray-300 rounded-lg">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <pre className="bg-gray-100 p-3 rounded mt-2">{json}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JsonFomatDocGuide;
