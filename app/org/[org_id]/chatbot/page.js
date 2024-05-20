"use client"

import ChatBotModel from "@/components/chatbot/chatBotModel";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getAllChatBotAction, getChatBotDetailsAction } from "@/store/action/chatBotAction";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function ChatbotPage({ params }) {

    const dispatch = useDispatch()
    const router = useRouter()
    // const allBridges = useCustomSelector((state) => state.bridgeReducer.org[params.org_id] || []).slice().reverse();
    // const isLoading = useCustomSelector((state) => state.chat.loading);

    const { allChatBot } = useCustomSelector((state) => ({
        allChatBot: (state?.ChatBot?.org?.[params?.org_id] || []),
    }))

    console.log(allChatBot)
    const onClickChatBot = async (id) => {
        console.log(id)
        try {
            const res = await dispatch(getChatBotDetailsAction(id));
            console.log(res);
            router.push(`/org/${params.org_id}/chatbot/${id}`);
        } catch (error) {
            console.error('Failed to fetch chatbot details:', error);
        }
    }

    useEffect(() => {
        dispatch(getAllChatBotAction(params?.org_id))
    }, [])
    return <div>

        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex  flex-col items-start justify-start">
            <div className="flex w-full justify-start gap-16 items-start">
                <div className="w-full">
                    {allChatBot.length === 0 ? (
                        <div className="text-center  w-full h-screen flex justify-center items-center py-10">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-16 h-16 text-blue-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <p className="text-lg font-semibold text-gray-800">Create Your First Bridge</p>
                                <button className="btn  mt-2  mr-3 btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>+ create new bridge</button>

                            </div>
                        </div>

                    ) : (
                        <div className="flex flex-col">
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 lg:grid-cols-4 p-4">
                                {allChatBot.map((item) => (
                                    <div key={item._id} onClick={() => onClickChatBot(item._id)} className="flex flex-col items-center gap-7 rounded-md border cursor-pointer hover:shadow-lg ">
                                        <div className="w-full">
                                            <div className="p-4 flex flex-col justify-between h-[200px] items-start">
                                                <div className="w-full">
                                                    <h1 className="inline-flex items-center gap-2 text-lg font-semibold">
                                                        <Bot />
                                                        {item['title']}
                                                    </h1>
                                                    <p className="text-xs w-full flex items-center gap-2 text-gray-600 line-clamp-5 " >
                                                        {item?.['configuration']?.['prompt'] && <>
                                                            {Array.isArray(item['configuration']['prompt']) ? item['configuration']['prompt'].map((promptItem, index) => (
                                                                <div key={index}>
                                                                    <p>Role: {promptItem.role}</p>
                                                                    <p>Content: {promptItem.content}</p>
                                                                </div>
                                                            ))
                                                                : <p>Prompt : {item['configuration']['prompt']}</p>
                                                            }
                                                        </>}
                                                        {item?.['configuration']?.['input'] && <p className="text-xs">Input : {item['configuration']['input']}</p>}
                                                    </p>
                                                </div>
                                                <div className="  mt-auto">
                                                    <span className="mb-2 mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-900">
                                                        {item['service']}
                                                    </span>
                                                    <span className="mb-2 mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-900">
                                                        {item?.['configuration']?.['model'] || ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                            </div>
                        </div>

                    )}
                </div>

            </div>
        </div>
        <ChatBotModel orgid={params.org_id} />
    </div>;

}

export default Protected(ChatbotPage);


