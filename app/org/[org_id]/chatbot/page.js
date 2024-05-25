"use client"

import ChatBotModel from "@/components/chatbot/chatBotModel";
import ChatBotCardHome from "@/components/chatbotHome.js/chatbotCard";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { Bot } from "lucide-react";

function ChatbotPage({ params }) {
    const { allChatBot } = useCustomSelector((state) => ({
        allChatBot: (state?.ChatBot?.org?.[params?.org_id] || []),
    }));

    return <div>
        {allChatBot.length === 0 ? (
            <div className="text-center  w-full h-screen flex justify-center items-center py-10">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Bot color="blue" size={96} />
                    <p className="text-lg font-semibold text-gray-800">Create Your First Chatbot</p>
                    <button className="btn  mt-2  mr-3 btn-primary" onClick={() => document.getElementById('chatBot_model').showModal()}>+ create new chatbot</button>

                </div>
            </div>

        ) : (
            <>
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex  flex-col items-start justify-start">
                    <div className="flex w-full justify-start gap-16 items-start">
                        <div className="w-full">
                            <ChatBotCardHome params={params} />
                        </div>
                    </div>
                </div>
            </>
        )}
        <ChatBotModel orgid={params.org_id} />

    </div>;

}

export default Protected(ChatbotPage);


