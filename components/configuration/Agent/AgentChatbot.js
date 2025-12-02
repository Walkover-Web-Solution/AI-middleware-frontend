'use client'

export const AgentChatBot = ({ agent, onBack }) => {
    return (    
        <div className="flex flex-col h-full p-6 bg-base-100 rounded-lg shadow-lg border border-base-300">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{agent?.page_config?.url_slugname || 'Agent'}</h2>
                <button
                    onClick={onBack}
                    className="btn btn-sm btn-ghost"
                >
                    Back to Agents
                </button>
            </div>
            <div className="flex-1 border-t border-base-300 pt-4">
                <div className="text-center text-base-content py-8 min-h-[100%]" id='parentChatbot'>
                    {/* This loading spinner will show while the component waits for the script */}
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full" role="status">
                        <span className="sr-only">Loading Chatbot...</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Loading Chatbot...</p>
                </div>
            </div>
        </div>
    );
};