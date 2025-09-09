'use client'
import React from 'react';
import { ArrowRight, Bot } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateUserMetaOnboarding } from '@/store/action/orgAction';

export default function OnboardingPage() {
    const { currentUser } = useCustomSelector((state) => ({
        currentUser: state.userDetailsReducer?.userDetails
    }));
    const dispatch = useDispatch();
    const router = useRouter();
    
    const handleContinue = async () => {
        const updatedOrgDetails = {
            ...currentUser,
            meta: {
                ...currentUser?.meta,
                newUser: "false"
            },
        };
        await dispatch(updateUserMetaOnboarding(currentUser.id, updatedOrgDetails));
        router.push('/org')
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Logo - Top Left */}
                <div className="flex items-center mb-8 sm:mb-12 lg:mb-16">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-2 sm:mr-3">
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold">
                        GTWY AI
                    </h1>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main Heading */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 px-4">
                        Your workspace is ready!
                    </h2>

                    {/* Subtext */}
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-8 sm:mb-10 lg:mb-12 px-4">
                        Get started faster, key concepts of AI automation
                    </p>

                    {/* Video Section */}
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto">
                        <iframe
                            src="https://video-faq.viasocket.com/embed/cm60d6r5a031w121t2akjkw9y?embed_v=2"
                            loading="lazy"
                            title="AI-middleware"
                            allow="clipboard-write"
                            frameBorder="0"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </div>

                    {/* Continue Button */}
                    <div className="text-center px-4">
                        <button
                            onClick={handleContinue}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto text-sm sm:text-base"
                        >
                            <div className="flex items-center justify-center">
                                <span>Start automating</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}