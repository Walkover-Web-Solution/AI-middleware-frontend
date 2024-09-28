import { useCustomSelector } from "@/customHooks/customSelector";
import { Bot, Cog } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ChatbotGuide from "../chatbotConfiguration/chatbotGuide";
import ApiGuide from './configurationComponent/ApiGuide';
import ActionList from "./configurationComponent/actionList";
import AdvancedParameters from "./configurationComponent/advancedParamenter";
import ApiKeyInput from "./configurationComponent/apiKeyInput";
import BridgeNameInput from "./configurationComponent/bridgeNameInput";
import BridgeTypeToggle from "./configurationComponent/bridgeTypeToggle";
import EmbedList from "./configurationComponent/embedList";
import InputConfigComponent from "./configurationComponent/inputConfigComponent";
import ModelDropdown from "./configurationComponent/modelDropdown";
import PreEmbedList from "./configurationComponent/preEmbedList";
import ResponseFormatSelector from "./configurationComponent/responseFormatSelector";
import RichTextToggle from "./configurationComponent/richTextToggle";
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import SlugNameInput from "./configurationComponent/slugNameInput";
import AddVariable from "../addVariable";
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";

export default function ConfigurationPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view');
    const [currentView, setCurrentView] = useState(view || 'setup')
    const { bridgeType,is_rich_text} = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.trim()?.toLowerCase() || 'api',
        is_rich_text: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.is_rich_text || false,
    }));

    const handleNavigation = (target) => {
        setCurrentView(target)
        router.push(`/org/${params.org_id}/bridges/configure/${params.id}?view=${target}`);
    };

    return (
        <div className="flex flex-col gap-3 relative">
            <BridgeNameInput params={params} />

            <BridgeTypeToggle params={params} />
            <div className="join absolute right-0 top-0">
                <button
                    onClick={() => handleNavigation('setup')}
                    className={` ${currentView === 'setup' ? "btn-primary" : ""} btn join-item `}
                >
                    { }
                    <Cog size={16} />Setup
                </button>
                <button
                    onClick={() => handleNavigation('guide')}
                    className={` ${currentView === 'guide' ? "btn-primary" : ""} btn join-item `}
                >
                    <Bot size={16} />Guide
                </button>
            </div>
            {
                currentView === 'setup' ?
                    <>
                        {bridgeType === 'chatbot' && <SlugNameInput params={params} />}
                        <PreEmbedList params={params} />
                        <InputConfigComponent params={params} />
                        <EmbedList params={params} />
                        <ServiceDropdown params={params} />
                        <ModelDropdown params={params} />
                        <ApiKeyInput params={params} />
                        {bridgeType === 'chatbot' && <RichTextToggle params={params} />}
                        <AdvancedParameters params={params} />
                        <AddVariable params={params}/>
                        {bridgeType==="chatbot" && is_rich_text && <UserRefernceForRichText params={params}/>}
                        <ActionList params={params} />
                        {bridgeType === 'api' && <ResponseFormatSelector params={params} />}
                    </>
                    :
                    bridgeType === 'api' ?
                        <div className="flex flex-col w-100 overflow-auto gap-3">
                            <h1 className="text-xl font-semibold">API Configuration</h1>
                            <div className="flex flex-col gap-4">
                                <ApiGuide params={params} />
                            </div>
                        </div> :
                        <div className="flex  flex-col w-100 overflow-auto gap-3">
                            <h1 className="text-xl font-semibold">Chatbot Configuration</h1>
                            <div className="flex flex-col gap-4">
                                <ChatbotGuide params={params}/>
                            </div>
                        </div>
            }

        </div>
    );
}
