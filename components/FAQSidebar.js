"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FAQSIDEBARLINKS } from "@/utils/enums";

const FAQPage = () => {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-72 bg-gray-800 text-white p-4">
                <div className="mb-6 border-b border-gray-700 pb-4">
                    {/* Logo and Title Container */}
                    <div className="flex items-center gap-2">
                        {/* Logo */}
                        <Image 
                            src="/favicon.ico" 
                            alt="GTWY AI Logo" 
                            width={32}
                            height={32}
                        />
                        
                        {/* Main Title */}
                        <h1 
                            className="text-2xl font-bold text-white mb-2 cursor-pointer hover:text-gray-300 transition-colors"
                            onClick={() => window.location.href = "/"}
                        >
                            GTWY AI
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <h2 className="ml-9 text-lg font-semibold text-gray-300">
                        FAQ Sections
                    </h2>
                </div>
                <nav>
                    <ul className="space-y-2">
                        {FAQSIDEBARLINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`block px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${pathname === link.href ? "bg-gray-700" : ""
                                        }`}
                                >
                                    {link.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content Area - Show default content when no link selected */}
            {pathname === '/faq' && (
                <div className="flex-1">
                    <div className="h-screen overflow-y-auto overflow-x-hidden w-[84vw]">
                        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                            <div className="max-w-7xl mx-auto">
                                {/* Header Section */}
                                <div className="text-center mb-12">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                        How to Use GTWY AI
                                    </h1>
                                    <p className="text-xl text-gray-600">
                                        Your complete guide to getting started with GTWY AI platform
                                    </p>
                                </div>
                    
                                {/* Quick Start Guide */}
                                <div className="mb-16">
                                    <h2 className="text-2xl font-semibold mb-6">Quick Start Guide</h2>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-medium mb-3">1. Create Your Bridge</h3>
                                            <p className="text-gray-600 mb-4">Start by creating a new bridge and selecting your preferred AI model.</p>
                                            <div className="aspect-video bg-gray-100 rounded-lg">
                                                <iframe 
                                                    className="w-full h-full rounded-lg"
                                                    src="https://www.youtube.com/embed/your-video-id"
                                                    title="How to Create a Bridge"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                    
                                        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-medium mb-3">2. Configure Settings</h3>
                                            <p className="text-gray-600 mb-4">Customize your bridge settings and parameters for optimal performance.</p>
                                            <div className="aspect-video bg-gray-100 rounded-lg">
                                                <iframe 
                                                    className="w-full h-full rounded-lg"
                                                    src="https://www.youtube.com/embed/your-video-id"
                                                    title="Configure Your Bridge"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                    
                                        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-medium mb-3">3. Deploy & Integrate</h3>
                                            <p className="text-gray-600 mb-4">Learn how to deploy your bridge and integrate it into your application.</p>
                                            <div className="aspect-video bg-gray-100 rounded-lg">
                                                <iframe 
                                                    className="w-full h-full rounded-lg"
                                                    src="https://www.youtube.com/embed/your-video-id"
                                                    title="Deploy and Integrate"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                    
                                {/* Detailed Guides */}
                                <div className="space-y-12">
                                    <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                        <h2 className="text-2xl font-semibold mb-6">Detailed Configuration Guide</h2>
                                        <div className="prose max-w-none">
                                            <h3>API Configuration</h3>
                                            <p>Learn how to set up and configure your API endpoints for seamless integration:</p>
                                            <ul className="list-disc pl-6">
                                                <li>Setting up authentication</li>
                                                <li>Configuring response formats</li>
                                                <li>Managing API keys</li>
                                                <li>Handling rate limits</li>
                                            </ul>
                                        </div>
                                    </div>
                    
                                    <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                        <h2 className="text-2xl font-semibold mb-6">Chatbot Implementation</h2>
                                        <div className="prose max-w-none">
                                            <p>Follow these steps to implement a chatbot using GTWY AI:</p>
                                            <ol className="list-decimal pl-6">
                                                <li>Choose your preferred AI model</li>
                                                <li>Configure chat parameters</li>
                                                <li>Customize the chat interface</li>
                                                <li>Test and deploy your chatbot</li>
                                            </ol>
                                        </div>
                                    </div>
                    
                                    <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                        <h2 className="text-2xl font-semibold mb-6">Best Practices</h2>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-medium mb-3">Performance Optimization</h3>
                                                <ul className="list-disc pl-6 text-gray-600">
                                                    <li>Cache frequently used responses</li>
                                                    <li>Optimize prompt engineering</li>
                                                    <li>Monitor usage and costs</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium mb-3">Security Guidelines</h3>
                                                <ul className="list-disc pl-6 text-gray-600">
                                                    <li>Secure API key management</li>
                                                    <li>Implement rate limiting</li>
                                                    <li>Regular security audits</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                    
                                {/* Help & Support */}
                                <div className="mt-12 text-center">
                                    <h2 className="text-2xl font-semibold mb-4">Need Additional Help?</h2>
                                    <p className="text-gray-600 mb-6">
                                        Our support team is always here to help you get the most out of GTWY AI.
                                    </p>
                                    <a 
                                        href="mailto:support@gtwy.ai"
                                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Contact Support
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FAQPage;
