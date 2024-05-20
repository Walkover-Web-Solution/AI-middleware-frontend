"use client"

import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { addorRemoveBridgeInChatBotAction, getChatBotDetailsAction } from "@/store/action/chatBotAction";
import { BarChart, Bot, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function Page({ params }) {

    const { ChatbotDetails, responseData, bridgeData } = useCustomSelector((state) => ({
        ChatbotDetails: (state?.ChatBot?.ChatBotMap?.[params?.chatbot_id] || {}),
        responseData: state?.responseTypeReducer?.responses?.[params?.org_id],
        bridgeData: state?.bridgeReducer?.org?.[params?.org_id]
    }))
    console.log(bridgeData)
    const [isSliderOpen, setIsSliderOpen] = useState(false)
    const SliderClickHandler = () => {
        setIsSliderOpen(!isSliderOpen)
    }

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getChatBotDetailsAction(params?.chatbot_id))
    }, [])

    const handleBridgeSelect = (chatBotId, type) => {
        dispatch(addorRemoveBridgeInChatBotAction(params.org_id, params.chatbot_id, chatBotId, type))
    }

    console.log(responseData)
    return <div className="p-4 relative h-[93vh]">

        <label className="form-control w-full max-w-xs">
            <input type="text" placeholder="Enter Chatbot Name" defaultValue={ChatbotDetails?.title} className="input w-full border-none p-0 outline-none focus:border-none focus:outline-none max-w-xs text-3xl font-semibold" />
        </label>

        <div className="flex flex-col gap-4">
            <p className="text-lg font-semibold">Bridge Used</p>

            {
                ChatbotDetails?.bridge?.map((data, index) => {
                    return <div className="w-[300px] rounded-md border">

                        <div className="p-4">
                            <h1 className="inline-flex items-center capitalize text-lg font-semibold">
                                {data?.name}
                            </h1>
                            <p className="mt-3 text-sm text-gray-600">
                                Service Used :  {data?.service}
                            </p>
                            <p className="mt-3 text-sm text-gray-600">
                                Model : {data?.configuration?.model}
                            </p>
                            <div className="mt-4">
                                {(data?.responseIds)?.map((responseKey, index) => {
                                    return (
                                        <span className="mb-2 mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-900">
                                            {responseData?.[responseKey]?.description}
                                        </span>
                                    )
                                })}
                            </div>

                        </div>
                    </div>

                })
            }
            <button className="btn btn-outline btn-sm w-fit" onClick={SliderClickHandler} ><Plus size={16} />Add Bridge</button>
            {isSliderOpen && <aside className="absolute  right-0 top-0 flex h-full w-1/3 flex-col overflow-y-auto bg-white px-5 py-8 shadow-lg z-10">
                <h1 className='text-xl font-medium flex items-center gap-2'><Bot /> Bridge list</h1>
                <div className="mt-6 flex flex-1 flex-col justify-between">
                    <nav className="-mx-3 space-y-6 ">
                        <div className="space-y-3 ">
                            {bridgeData?.filter(Bridge => Bridge.bridgeType === "chatbot").map((Bridge, index) => (
                                <a
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent the default anchor action
                                        // Toggle the checkbox's checked status programmatically
                                        const checkbox = document.getElementById(`Bridge-${Bridge._id}`);
                                        checkbox.click(); // Programmatically click the checkbox
                                        // No need to manually call handleBridgeSelect here since clicking the checkbox will trigger its onClick event
                                    }}
                                    key={index} // Keep the key for list rendering
                                    className="flex transform items-center justify-between rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
                                    href="#"
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className='flex items-center w-full gap-2'>
                                        <BarChart className="h-5 w-5" aria-hidden="true" />
                                        <span className="mx-2 text-sm font-medium truncate">{Bridge?.name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id={`Bridge-${Bridge._id}`} // Use a unique ID for each checkbox
                                        defaultChecked={ChatbotDetails.bridge.some(e => e._id === Bridge._id)}
                                        className="checkbox"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the checkbox click from bubbling up to the link's onClick
                                            handleBridgeSelect(Bridge._id, e.target.checked ? "add" : "remove");
                                        }}
                                    />
                                </a>
                            ))}
                        </div>
                    </nav>
                </div>
            </aside>}
        </div>




    </div>;

}

export default Protected(Page);


