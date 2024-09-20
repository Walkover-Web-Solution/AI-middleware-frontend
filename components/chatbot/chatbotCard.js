import { useCustomSelector } from "@/customHooks/customSelector"
import { ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react";



export default function ChatbotCard({ params }) {
    const { ChatbotDetails } = useCustomSelector((state) => ({
        ChatbotDetails: (state?.ChatBot?.ChatBotMap?.[params?.chatbot_id] || {}),
    }))
    const [checkedCard, setCheckedCard] = useState(null);
    const router = useRouter()

    const checkboxHandler = (e, index, data) => {
        e.stopPropagation();

        if (checkedCard === index) {
            setCheckedCard(null);
            window.closeChatbot()

        } else {
            setCheckedCard(index);
            if (window && typeof window.SendDataToChatbot === 'function') {
                window?.SendDataToChatbot({
                    bridgeName: data?.slugName,
                    threadId: data?.name.replaceAll(" ", ""),
                    variables: {},
                    // parentId: 'parentChatbot',
                    // fullScreen: true
                });
                window.openChatbot()
            }
        }
    }

    return (
        <></>
        // <>
        //     <p className="text-lg font-semibold">Bridge Used</p>

        //     {/* <div className="flex flex-wrap gap-2">
        //         {
        //             ChatbotDetails?.bridge?.slice().sort((a, b) => a.name.localeCompare(b.name)).map((data, index) => {
        //                 return (
        //                     <div
        //                         key={index}  // Added key for list rendering
        //                         onClick={() => router.push(`/org/${params.org_id}/bridges/configure/${data._id}`)}
        //                         className="w-[300px] flex max-w-xs flex-col items-start bg-white rounded-md border md:flex-row cursor-pointer hover:shadow-lg"
        //                     >

        //                         <div className="p-4 w-full truncate">
        //                             <div className="flex items-center justify-between w-full">
        //                                 <h1 className="inline-flex items-center w-full truncate  capitalize text-lg font-semibold">
        //                                     {data?.name}
        //                                 </h1>
        //                                 <input
        //                                     type="checkbox"
        //                                     onClick={(e) => checkboxHandler(e, index, data)}
        //                                     className="checkbox checkbox-sm"
        //                                     checked={checkedCard === index} // Check the card if its index matches the checkedCard state
        //                                 />
        //                                 <ArrowUpRight className="ml-2 h-4 w-4 flex-shrink-0" />
        //                             </div>
        //                             <p className="mt-3 text-sm text-gray-600">
        //                                 Service Used: {data?.service}
        //                             </p>
        //                             <p className="mt-3 text-sm text-gray-600">
        //                                 Model: {data?.configuration?.model}
        //                             </p>
        //                         </div>
        //                     </div>
        //                 )
        //             })
        //         }
        //     </div> */}


        // </>
    )
}