import React from 'react'
import { 
  BrainCircuit, 
  Mic, 
  Bot, 
  LayoutTemplate, 
  FileText, 
  Globe, 
  Plus
} from 'lucide-react'

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-purple-500" />,
    title: "Smart Model Choice",
    description: "Analyzes prompts and settings to recommend the optimal AI model—balancing cost and accuracy to reduce compute expenses by 20–30%."
  },
  {
    icon: <Mic className="w-8 h-8 text-blue-500" />,
    title: "Voice Models",
    description: "Supports end-to-end speech input and output with noise reduction, multi-language transcription, and customizable voice personas."
  },
  {
    icon: <Bot className="w-8 h-8 text-green-500" />,
    title: "Chatbot Deployment",
    description: "Packages AI agents as fully hosted chatbots with one-click deployment, auto-scaling, and built-in analytics."
  },
  {
    icon: <LayoutTemplate className="w-8 h-8 text-yellow-500" />,
    title: "Templates",
    description: "Library of 50+ domain-specific prompt templates with editable fields and usage examples for instant high-quality prompts."
  },
  {
    icon: <FileText className="w-8 h-8 text-pink-500" />,
    title: "File Upload Support",
    description: "Upload documents directly in chat for automatic parsing, data extraction, and contextual responses."
  },
  {
    icon: <Globe className="w-8 h-8 text-indigo-500" />,
    title: "Web Crawling",
    description: "Real-time web crawling fetches, parses, and ranks information from live websites with source citations."
  },
  {
    icon: <Plus className="w-8 h-8 text-gray-500" />,
    title: "And Much More...",
    description: "We're continuously developing new features to enhance your workflow."
  }
]

const RoadMapCards = () => {
  return (
    <div className="max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Roadmap</h1>
        <p className="text-xl text-gray-400">Explore our planned features and development milestones</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-purple-500 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-gray-800">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold ml-4">{feature.title}</h3>
            </div>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoadMapCards