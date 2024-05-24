"use client"

import ChatBotModel from "@/components/chatbot/chatBotModel";
import ChatBotCardHome from "@/components/chatbotHome.js/chatbotCard";
import Protected from "@/components/protected";

export const runtime = 'edge';

function ChatbotPage({ params }) {

    return <div>

        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex  flex-col items-start justify-start">
            <div className="flex w-full justify-start gap-16 items-start">
                <div className="w-full">
                    <ChatBotCardHome params={params} />
                </div>
            </div>
        </div>
        <ChatBotModel orgid={params.org_id} />
    </div>;

}

export default Protected(ChatbotPage);


