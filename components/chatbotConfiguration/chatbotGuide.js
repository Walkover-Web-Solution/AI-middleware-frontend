import React, { useState } from 'react'
import PrivateFormSection from './firstStep'
import FormSection from './formSection'
import SecondStep from './secondStep'

function ChatbotGuide({ params }) {
    const [chatbotId, setChatBotId] = useState("");
    return (
        <>
            <PrivateFormSection params={params} ChooseChatbot={true} setChatBotIdFucntion={setChatBotId}/>
            <FormSection params={params} chatbotId={chatbotId}/>
            <SecondStep />
        </>
    )
}

export default ChatbotGuide