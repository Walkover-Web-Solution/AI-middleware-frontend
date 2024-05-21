import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BarChart, Plus, X, Bot } from 'lucide-react';
import { useCustomSelector } from '@/customSelector/customSelector';
import { addorRemoveBridgeInChatBotAction } from '@/store/action/chatBotAction';
import { useDispatch } from 'react-redux';

const ChatBotList = ({ params }) => {
    const router = useRouter();
    const dispatch = useDispatch()
    const { chatbotData, chatBotList } = useCustomSelector((state) => ({
        chatbotData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.chatbotData,
        chatBotList: state?.ChatBot?.org?.[params?.org_id] || []

    }));
    const handleAddChatbotClick = () => {
        setIsSliderOpen(!isSliderOpen);
    };
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const handleChatbotSelect = (chatBotId, type) => {
        dispatch(addorRemoveBridgeInChatBotAction(params.org_id, chatBotId, params.id, type))
    }

    return (
        <div className="form-control">
            <p className='text-xl font-medium'>ChatBot</p>
            <div className='flex flex-wrap gap-4'>
                {chatbotData?.map((chatBot, index) => (
                    <div key={index} onClick={() => router.push(`/org/${params.org_id}/chatbot/${chatBot._id}`)} className="flex max-w-xs flex-col items-center rounded-md border md:flex-row cursor-pointer transform transition duration-150 ease-in-out hover:bg-gray-200">
                        <div>
                            <div className="p-4">
                                <h1 className="inline-flex items-center text-lg font-semibold">
                                    {chatBot.title}<ArrowUpRight className="ml-2 h-4 w-4" />
                                </h1>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="btn btn-outline btn-sm mt-4 w-fit" onClick={handleAddChatbotClick}><Plus size={16} /> Add ChatBot</button>

            {isSliderOpen && <aside className="absolute  right-0 top-0 flex h-full w-1/3 flex-col overflow-y-auto bg-white px-5 py-8 shadow-lg z-10">

                <div className="flex items-center justify-between ">
                    <h1 className='text-xl font-medium flex items-center gap-2'><Bot /> Chat Bot list</h1>
                    <button className="btn btn-outline btn-circle btn-xs" onClick={handleAddChatbotClick}><X size={16} /></button>
                </div>

                <div className="mt-6 flex flex-1 flex-col justify-between">
                    <nav className="-mx-3 space-y-6 ">
                        <div className="space-y-3 ">
                            {chatBotList?.map((chatBot, index) => (
                                <a
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent the default anchor action
                                        // Toggle the checkbox's checked status programmatically
                                        const checkbox = document.getElementById(`chatbot-${chatBot._id}`);
                                        checkbox.click(); // Programmatically click the checkbox
                                        // No need to manually call handleChatbotSelect here since clicking the checkbox will trigger its onClick event
                                    }}
                                    key={index} // Keep the key for list rendering
                                    className="flex transform items-center justify-between rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
                                    href="#"
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className='flex items-center w-full gap-2'>
                                        <BarChart className="h-5 w-5" aria-hidden="true" />
                                        <span className="mx-2 text-sm font-medium truncate">{chatBot?.title}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id={`chatbot-${chatBot._id}`} // Use a unique ID for each checkbox
                                        defaultChecked={chatbotData?.some(e => e._id === chatBot._id)}
                                        className="checkbox"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the checkbox click from bubbling up to the link's onClick
                                            handleChatbotSelect(chatBot._id, e.target.checked ? "add" : "remove");
                                        }}
                                    />
                                </a>
                            ))}
                        </div>
                    </nav>
                </div>
            </aside>}
        </div>
    );
};

export default ChatBotList;