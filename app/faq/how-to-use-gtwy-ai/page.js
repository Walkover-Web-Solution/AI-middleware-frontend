import React from 'react'

export const metadata = {
  title: "How to use | GTWY AI",
  description: "Comprehensive guide on how to use GTWY AI platform - step-by-step instructions for leveraging our AI middleware and integration services",
  category: 'technology',
  generator: 'GTWY AI',
  keywords: "gtwy ai, ai middleware, ai integration platform, ai chatbot service, openai integration, anthropic api, groq ai, o1 ai, ai automation tools, ai api gateway, large language model integration, llm api, ai software solutions, ai-powered chatbot, ai model deployment, machine learning api, enterprise ai solutions, ai infrastructure, gateway AI, artificial intelligence services, custom ai development, ai orchestration, ai cloud services, multi-ai platform, ai business solutions, ai developer tools, ai framework, gpt integration, ai tools for business, llm deployment, ai model hosting, ai tech stack, ai-powered applications, smart ai assistant, best ai middleware, chatbot development platform, ai-powered automation",
};

const Page = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              How to Use GTWY AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your complete guide to getting started with GTWY AI platform - 
              unleash the power of AI integration
            </p>
          </div>

          {/* Quick Start Guide */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">Quick Start Guide</h2>
            <div className="space-y-8">
              <div className="bg-base-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">1. How to Use GTWY AI</h3>
                <p className="text-gray-700 mb-6 text-lg">Master your agent settings and optimize performance with our comprehensive guide.</p>
                <div className="rounded-xl overflow-hidden" style={{ position: 'relative', boxSizing: 'content-box', maxHeight: '80vh', width: '100%', aspectRatio: '1.935483870967742', padding: '40px 0' }}>
                  <iframe 
                    src="https://video-faq.viasocket.com/embed/cm60d6r5a031w121t2akjkw9y?embed_v=2" 
                    loading="lazy" 
                    title="AI-middleware" 
                    allow="clipboard-write" 
                    frameBorder="0"
                    webkitallowfullscreen="true"
                    mozallowfullscreen="true"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-base-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-4 text-purple-600">2. How to Call a Function</h3>
                <p className="text-gray-700 mb-6 text-lg">Learn to create bridges and harness the power of AI models seamlessly.</p>
                <div className="rounded-xl overflow-hidden" style={{ position: 'relative', boxSizing: 'content-box', maxHeight: '80vh', width: '100%', aspectRatio: '1.7733990147783252', padding: '40px 0' }}>
                  <iframe 
                    src="https://video-faq.viasocket.com/embed/cm6renw7l03f73t4gtod3grda?embed_v=2" 
                    loading="lazy" 
                    title="AI Middleware" 
                    allow="clipboard-write" 
                    frameBorder="0" 
                    webkitallowfullscreen="true" 
                    mozallowfullscreen="true" 
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Guides */}
          <div className="space-y-12">
            <div className="bg-base-100 rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-3xl font-bold mb-8 text-blue-600">Detailed Configuration Guide</h2>
              <div className="prose max-w-none">
                <h3 className="text-2xl mb-4 text-gray-800">API Configuration</h3>
                <p className="text-lg text-gray-700 mb-6">Master the setup and configuration of your API endpoints for seamless integration:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0">
                  <li className="flex items-center space-x-3 text-gray-700">
                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</span>
                    <span>Setting up authentication</span>
                  </li>
                  <li className="flex items-center space-x-3 text-gray-700">
                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</span>
                    <span>Configuring response formats</span>
                  </li>
                  <li className="flex items-center space-x-3 text-gray-700">
                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</span>
                    <span>Managing API keys</span>
                  </li>
                  <li className="flex items-center space-x-3 text-gray-700">
                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">✓</span>
                    <span>Handling rate limits</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-3xl font-bold mb-8 text-purple-600">Chatbot Implementation</h2>
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-6">Follow our step-by-step guide to implement a powerful chatbot using GTWY AI:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    "Choose your preferred AI model",
                    "Configure chat parameters",
                    "Customize the chat interface",
                    "Test and deploy your chatbot"
                  ].map((step, index) => (
                    <div key={index} className="bg-purple-50 p-6 rounded-xl">
                      <div className="text-purple-600 text-2xl font-bold mb-3">{index + 1}</div>
                      <div className="text-gray-800">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Best Practices</h2>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="bg-blue-50 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-6 text-blue-600">Performance Optimization</h3>
                  <ul className="space-y-4">
                    {["Cache frequently used responses", "Optimize prompt engineering", "Monitor usage and costs"].map((item, index) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-700">
                        <span className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-purple-50 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-6 text-purple-600">Security Guidelines</h3>
                  <ul className="space-y-4">
                    {["Secure API key management", "Implement rate limiting", "Regular security audits"].map((item, index) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-700">
                        <span className="h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-600">🔒</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 p-12 rounded-2xl text-white">
            <h2 className="text-3xl font-bold mb-4">Need Additional Help?</h2>
            <p className="text-xl mb-8 opacity-90">
              Our expert support team is ready to help you maximize your GTWY AI experience
            </p>
            <a 
              href="mailto:support@gtwy.ai"
              className="inline-block bg-base-100 text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page