"use client"

import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { getChatBotDetailsAction } from "@/store/action/chatBotAction";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function Page({ params }) {

    const { ChatbotDetails, responseData } = useCustomSelector((state) => ({
        ChatbotDetails: (state?.ChatBot?.ChatBotMap?.[params?.chatbot_id] || {}),
        responseData: state?.responseTypeReducer?.responses?.[params?.org_id]
    }))

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getChatBotDetailsAction(params?.chatbot_id))
    }, [])

    console.log(responseData)
    return <div className="p-4">

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
                                Model : {data?.configuration.model}
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
            <button className="btn btn-outline btn-sm w-fit"><Plus size={16} />Add Bridge</button>
        </div>




    </div>;

}

export default Protected(Page);


