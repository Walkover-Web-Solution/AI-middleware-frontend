"use client"

import ChatbotCard from "@/components/chatbot/chatbotCard";
import ChatbotSlider from "@/components/chatbot/chatbotSlider";
import PrivateFormSection from "@/components/chatbotConfiguration/firstStep";
import FormSection from "@/components/chatbotConfiguration/formSection";
import SecondStep from "@/components/chatbotConfiguration/secondStep";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customHooks/customSelector";
import { getChatBotDetailsAction } from "@/store/action/chatBotAction";
import { PencilIcon } from "@/components/Icons";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const runtime = 'edge';

function Page({ params }) {

    const { ChatbotDetails, bridgeData } = useCustomSelector((state) => ({
        ChatbotDetails: (state?.ChatBot?.ChatBotMap?.[params?.chatbot_id] || {}),
        bridgeData: state?.bridgeReducer?.org?.[params?.org_id]
    }))


    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getChatBotDetailsAction(params?.chatbot_id))
    }, [])


    return <div className=" relative flex w-screen h-[93vh]">


        <div className="flex p-4 w-1/2 flex-col bg-gray-100 gap-4 overflow-y-scroll">
            <label className="input input-bordered flex items-center justify-center gap-2 border-none p-0 outline-0 focus-within:border-none bg-transparent text-3xl focus:outline-none ">
                <PencilIcon size={16} />
                <input type="text" placeholder="Enter Chatbot Name" defaultValue={ChatbotDetails?.title} className=" bg-transparent grow border-none p-0 outline-none focus:border-none flex justify-center items-center focus:outline-none  font-semibold" />
            </label>
            <ChatbotCard params={params} />
            {bridgeData && <ChatbotSlider params={params} />}
        </div>
        <div className="flex  flex-col w-1/2 overflow-auto p-4 gap-4 ">
            <h1 className="text-2xl font-semibold">Chatbot Configuration</h1>
            <div className="flex flex-col gap-4">
                <PrivateFormSection params={params} />
                <FormSection params={params} />
                <SecondStep />
            </div>
        </div>
    </div>

}

export default Protected(Page);


