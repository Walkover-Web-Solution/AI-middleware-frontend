'use client'
import { useEffect } from "react";

export const AgentChatBot = ({ agent, onBack, agentData }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if(window?.SendDataToChatbot && agent && agentData){
                window?.SendDataToChatbot({
                    bridgeName: agent?.page_config?.url_slugname,
                    threadId: agentData?.user_id,
                    parentId: 'parentChatbot',
                    hideIcon: true,
                    hideCloseButton: true,
                    fullScreen: false,
                })
            }
            if(window?.openChatbot){
                window.openChatbot()
            }
        }, 3000)
        return () => clearTimeout(timer)
    },[agent, agentData])

    return (    
        <div className="flex flex-col h-full p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{agent?.page_config?.url_slugname}</h2>
                <button
                    onClick={onBack}
                    className="btn btn-sm btn-ghost"
                >
                    Back to Agents
                </button>
            </div>
            <div className="flex-1 border-t border-gray-200 pt-4">
                {/* Chat interface would go here */}
                <div className="text-center text-gray-500 py-8 min-h-[100%]" id='parentChatbot'>
                    Chat interface coming soon
                </div>
            </div>
        </div>
    );
};