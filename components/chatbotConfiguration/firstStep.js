import { useEffect, useState } from "react";
import { createOrgToken } from "@/config";
import { Copy } from "lucide-react";
import { useDispatch } from "react-redux";
import { useCustomSelector } from "@/customSelector/customSelector";
import CopyButton from "../copyButton/copyButton";

function InputWithCopyButton({ label, placeholder, value, disabled }) {
    const copyToClipboard = () => { navigator.clipboard.writeText(value) };

    return (
        <div className="join form-control w-full max-w-xs">
            <div className="label">
                <span className="label-text">{label}</span>
            </div>
            <div className="flex items-center justify-start">
                <input className="input input-bordered join-item input-sm w-[25rem]" placeholder={placeholder} value={value} disabled={disabled} />
                <button className="btn join-item btn-sm" onClick={copyToClipboard}><Copy size={16} /></button>
            </div>
        </div>
    );
}


export default function PrivateFormSection({ params }) {
    const [showInput, setShowInput] = useState(false);
    const [accessKey, setAccessKey] = useState("");
    const [chatbotId, setChatBotId] = useState("");

    const handleGetAccessKey = async () => {
        try {
            const response = await createOrgToken(params?.org_id);
            setAccessKey(response?.data?.orgAcessToken);
            setShowInput(true);
        } catch (error) {
            console.error("Error fetching access key:", error);
        }
    };
    console.log(chatbotId);
    return (
        <div className="flex flex-col gap-4 bg-white rounded-lg shadow p-4">
            <div>
                <h3 className="text-lg font-semibold">Step 1</h3>
                <p className="text-sm text-gray-600">Generate a JWT token</p>
            </div>
            <div className="join absolute right-5 ">
                <ChatbotDropdown params={params} setChatBotId={(chatbotData) => {
                    setChatBotId(chatbotData?._id)
                }} />
            </div>
            <div className="mockup-code">
            <CopyButton data={`{
    org_id: "${params?.org_id}",
    chatbot_id: "${chatbotId}",
    user_id:  // Add your User Id here,
    variables: {
        // Add your variables here
        }
    }`} />
                <pre data-prefix=">"  className="text-sm p-2 rounded">
                    {`{
    org_id: "${params?.org_id}",
    chatbot_id: "${chatbotId}",
    user_id:  // Add your User Id here,
    variables: {
        // Add your variables here
        }
    }`}
                </pre>
            </div>
            <div className="flex flex-col gap-2">
                {showInput ? (
                    <InputWithCopyButton label="Access Key" placeholder="Access Key" value={accessKey} />
                ) : (
                    <button className="btn btn-primary w-fit btn-sm" onClick={handleGetAccessKey}>
                        Your AccessKey
                    </button>
                )}
            </div>
            <p className="text-sm">
                Generate a JWT token using org_id, chatbot_id, and user_id variables, then sign it with the access key.
            </p>
            <a className="link link-hover text-sm" target="_blank" href="https://viasocket.com/faq/create-jwt-token">
                Learn, How to create JWT token?
            </a>
        </div>
    );
}

function ChatbotDropdown({ params, setChatBotId }) {
    const [selectedChatbot, setSelectedChatbot] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { chatbots } = useCustomSelector((state) => ({
        chatbots: state?.ChatBot?.org?.[params?.org_id] || [],
    }));

    useEffect(() => {
        if (chatbots.length > 0 && !selectedChatbot) {
            handleSelectChatbot(chatbots[0]);
        }
    }, [chatbots]);

    const handleSelectChatbot = (chatbot) => {
        setSelectedChatbot(chatbot);
        setChatBotId(chatbot);
    };

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                >
                    {selectedChatbot ? selectedChatbot.title : 'Select a chatbot'}
                    <svg
                        className="-mr-1 ml-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {chatbots.map((chatbot) => (
                            <a
                                key={chatbot._id}
                                href="#"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={() => handleSelectChatbot(chatbot)}
                            >
                                {chatbot.title}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}