import { useEffect, useState } from "react";
import { createOrgToken } from "@/config";
import { CopyIcon } from "@/components/Icons";
import { useCustomSelector } from "@/customHooks/customSelector";
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
                <button className="btn join-item btn-sm" onClick={copyToClipboard}><CopyIcon size={16} /></button>
            </div>
        </div>
    );
}


export default function PrivateFormSection({ params, ChooseChatbot, setChatBotIdFucntion=null }) {
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
    return (
        <div className="flex flex-col gap-4 bg-white rounded-lg shadow p-4">
            <div>
                <h3 className="text-lg font-semibold">Step 1</h3>
                <p className="text-sm text-gray-600">Generate a JWT token</p>
            </div>
            {ChooseChatbot && <div className="join absolute right-5 ">
                <ChatbotDropdown params={params} setChatBotId={(chatbotData) => {
                    setChatBotId(chatbotData?._id);
                    if(setChatBotIdFucntion){
                        setChatBotIdFucntion(chatbotData?._id)
                    }
                }} />
            </div>}
            <div className="mockup-code">
                <CopyButton data={`{
    "org_id": "${params?.org_id}",
    "chatbot_id": "${params.chatbot_id || chatbotId}",
    "user_id":  "// Add your User Id here",
    "variables": {
        "key": "value"
    }
}`} />
                <pre data-prefix=">" className="text-sm p-2 rounded">
                    {`{
        "org_id": "${params?.org_id}",
        "chatbot_id": "${params.chatbot_id || chatbotId}",
        "user_id":  // Add your User Id here,
        "variables": {
            // Add your variables here: "key": "value"
        }
    }`}
                </pre>
            </div>
            <div className="flex flex-col gap-2">
                {showInput ? (
                    <InputWithCopyButton label="Access Key" placeholder="Access Key" value={accessKey} />
                ) : (
                    <button className="btn btn-primary w-fit btn-sm" onClick={handleGetAccessKey}>
                        Show Access Key
                    </button>
                )}
            </div>
            <p className="text-sm">
                Generate a JWT token using org_id, chatbot_id, and user_id variables, then sign it with the access key.
            </p>
            <a className="link link-hover text-sm text-primary" target="_blank" href="/faq/create-jwt-for-chatbot">
                Learn, How to create JWT token?
            </a>
        </div>
    );
}

function ChatbotDropdown({ params, setChatBotId }) {
    const [selectedChatbot, setSelectedChatbot] = useState(null);

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
        <>
            {/* <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn m-1">{selectedChatbot ? selectedChatbot.title : 'Select a chatbot'}</div>
        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-low w-52 p-2 shadow">
            {chatbots.map((chatbot, index) => (
                <li key={index} onClick={() => handleSelectChatbot(chatbot)}><a>{chatbot.title}</a></li>
            ))}
        </ul>
    </div> */}
        </>
    )
}