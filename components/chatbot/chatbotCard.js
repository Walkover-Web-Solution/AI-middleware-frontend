import { useCustomSelector } from "@/customSelector/customSelector"
import { ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"



export default function ChatbotCard({ params }) {
    const { ChatbotDetails, responseData } = useCustomSelector((state) => ({
        ChatbotDetails: (state?.ChatBot?.ChatBotMap?.[params?.chatbot_id] || {}),
        responseData: state?.responseTypeReducer?.responses?.[params?.org_id],
    }))

    const router = useRouter()

    return (
        <>
            <p className="text-lg font-semibold">Bridge Used</p>

            <div className="flex flex-wrap gap-2">
                {
                    ChatbotDetails?.bridge?.map((data, index) => {
                        return <div onClick={() => router.push(`/org/${params.org_id}/bridges/configure/${data._id}`)} className="w-[300px] flex max-w-xs flex-col items-start bg-white rounded-md border md:flex-row cursor-pointer hover:shadow-lg">
                            <div className="p-4">
                                <h1 className="inline-flex items-center capitalize text-lg font-semibold">
                                    {data?.name}<ArrowUpRight className="ml-2 h-4 w-4" />
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
            </div>

        </>
    )
}