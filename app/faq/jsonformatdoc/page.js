'use client'
import { SquareArrowLeft } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { JSONFORMATDATA } from '@/utils/enums'; // Adjust the import path
export const runtime = 'edge';
const JsonFomatDocGuide = () => {
    const router = useRouter();

    return (
        <div className="max-w-[80%] mx-auto p-6 relative">
            <div className='absolute  top-6 '>
                <SquareArrowLeft size={30} onClick={() => router.back()} className="cursor-pointer" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">JSON Format Structure for Function Calling</h1>
                {JSONFORMATDATA.map(({ title, description, json }) => (
                    <div key={title} className="faq-section mb-6 p-4 border border-gray-300 rounded-lg">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-gray-700">{description}</p>
                        <pre className="bg-gray-100 p-3 rounded mt-2">{json}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JsonFomatDocGuide;
