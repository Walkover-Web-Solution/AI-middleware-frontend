'use server';
import { JSONFORMATDATA } from '@/utils/enums';
import React from 'react';

const JsonFomatDocGuide = async () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        JSON Format Structure
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        A guide to structured JSON formats for function calling in AI integrations
                    </p>
                </div>

                {/* JSON Examples Section */}
                <div className="space-y-8">
                    {JSONFORMATDATA.map(({ title, json }) => (
                        <div key={title} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                            </div>
                            <div className="bg-gray-900 p-6">
                                <pre className="text-sm text-gray-300 overflow-x-auto font-mono">
                                    <code>{json}</code>
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JsonFomatDocGuide;