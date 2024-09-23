import { useCustomSelector } from "@/customHooks/customSelector"
import { addorRemoveBridgeInChatBotAction } from "@/store/action/chatBotAction"
import { BarChart, Bot, Plus, X } from "lucide-react"
import { useState } from "react"
import { useDispatch } from "react-redux"

export default function ChatbotSlider({ params }) {

    const { bridgeData, ChatbotDetails } = useCustomSelector((state) => ({
        bridgeData: state?.bridgeReducer?.org?.[params?.org_id],
        ChatbotDetails: (state?.ChatBot?.ChatBotMap?.[params?.chatbot_id] || {}),
    }))
    const dispatch = useDispatch()

    const handleBridgeSelect = (chatBotId, type) => {
        dispatch(addorRemoveBridgeInChatBotAction(params.org_id, params.chatbot_id, chatBotId, type))
    }

    const [isSliderOpen, setIsSliderOpen] = useState(false)
    const SliderClickHandler = () => {
        setIsSliderOpen(!isSliderOpen)
    }
    return (
        <div>
            {/* <button className="btn btn-outline btn-sm w-fit" onClick={SliderClickHandler} ><Plus size={16} />Add Bridge</button> */}
            {/* {isSliderOpen && <aside className="absolute  right-0 top-0 flex h-full w-1/3 flex-col overflow-y-auto bg-white px-5 py-8 shadow-lg z-10">

                <div className="flex items-center justify-between ">
                    <h1 className='text-xl font-medium flex items-center gap-2'><Bot /> Bridge list</h1>
                    <button className="btn btn-outline btn-circle btn-xs" onClick={SliderClickHandler}><X size={16} /></button>
                </div>
                <div className="mt-6 flex flex-1 flex-col justify-between">
                    <nav className="-mx-3 space-y-6 ">
                        <div className="space-y-3 ">
                            {bridgeData?.map((Bridge, index) => (
                                <a

                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent the default anchor action
                                        // Toggle the checkbox's checked status programmatically
                                        const checkbox = document.getElementById(`Bridge-${Bridge._id}`);
                                        checkbox.click(); // Programmatically click the checkbox
                                        // No need to manually call handleBridgeSelect here since clicking the checkbox will trigger its onClick event
                                    }}
                                    key={index} // Keep the key for list rendering
                                    className={`flex transform items-center justify-between rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700 ${Bridge.bridgeType === 'api' ? " opacity-50 cursor-not-allowed" : ""}`}
                                    href="#"
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className='flex items-center w-full gap-2'>
                                        <BarChart className="h-5 w-5" aria-hidden="true" />
                                        <span className="mx-2 text-sm font-medium truncate">{Bridge?.name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        disabled={Bridge.bridgeType === "api"}
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
            </aside>} */}
        </div>
    )
}

