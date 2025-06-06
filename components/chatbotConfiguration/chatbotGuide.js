import React, { useState } from 'react'
import PrivateFormSection from './firstStep'
import FormSection from './formSection'
import SecondStep from './secondStep'
import PublicAgentForm from './PublicAgentForm';

function ChatbotGuide({ params }) {
    const [chatbotId, setChatBotId] = useState("");
    return (
        <>
                <div className="bg-base-200 p-4 rounded-md ">
                   <h1>Public Chatbot configuration</h1>
                   <PublicAgentForm params={params}/>
                </div>
                <div className="divider"></div>
                <div className="">
                    <PrivateFormSection params={params} ChooseChatbot={true} setChatBotIdFucntion={setChatBotId}/>
                    <FormSection params={params} chatbotId={chatbotId}/>
                    <SecondStep />
                </div>
        </>

    )
}

export default ChatbotGuide