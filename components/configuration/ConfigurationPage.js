import { useCustomSelector } from "@/customHooks/customSelector";
import { Bot, Cog } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import AddVariable from "../addVariable";
import ChatbotGuide from "../chatbotConfiguration/chatbotGuide";
import ApiGuide from './configurationComponent/ApiGuide';
import ActionList from "./configurationComponent/actionList";
import AdvancedParameters from "./configurationComponent/advancedParamenter";
import ApiKeyInput from "./configurationComponent/apiKeyInput";
import BridgeNameInput from "./configurationComponent/bridgeNameInput";
import BridgeTypeToggle from "./configurationComponent/bridgeTypeToggle";
import BridgeVersionDropdown from "./configurationComponent/bridgeVersionDropdown";
import EmbedList from "./configurationComponent/embedList";
import InputConfigComponent from "./configurationComponent/inputConfigComponent";
import ModelDropdown from "./configurationComponent/modelDropdown";
import PreEmbedList from "./configurationComponent/preEmbedList";
import ResponseFormatSelector from "./configurationComponent/responseFormatSelector";
import RichTextToggle from "./configurationComponent/richTextToggle";
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import SlugNameInput from "./configurationComponent/slugNameInput";
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";

export default function ConfigurationPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view');
    const [currentView, setCurrentView] = useState(view || 'setup')
    const { bridgeType, is_rich_text, modelType } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.trim()?.toLowerCase() || 'api',
        is_rich_text: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.is_rich_text || false,
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
    }));

    const handleNavigation = (target) => {
        setCurrentView(target)
        router.push(`/org/${params.org_id}/bridges/configure/${params.id}?version=${params.version}&view=${target}`);
    };

    return (
        <div className="flex flex-col gap-3 relative">
            <BridgeNameInput params={params} />
            <BridgeTypeToggle params={params} />
            <div className="absolute right-0 top-0">
                <div className="flex items-center">
                    <BridgeVersionDropdown params={params} />
                    <div className="join">
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
                </div>
            </div>
            {
                currentView === 'setup' ?
                    <>
                        {bridgeType === 'chatbot' && <SlugNameInput params={params} />}
                        {(modelType == 'chat' || modelType == 'fine-tune') && <PreEmbedList params={params} />}
                        {(modelType == 'chat' || modelType == 'fine-tune') && <InputConfigComponent params={params} />}
                        {(modelType == 'chat' || modelType == 'fine-tune') && <EmbedList params={params} />}
                        <ServiceDropdown params={params} />
                        <ModelDropdown params={params} />
                        <ApiKeyInput params={params} />
                        {bridgeType === 'chatbot' && <RichTextToggle params={params} />}
                        <AdvancedParameters params={params} />
                        {(modelType == 'chat' || modelType == 'fine-tune') && <AddVariable params={params} />}
                        {bridgeType === "chatbot" && is_rich_text && <UserRefernceForRichText params={params} />}
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
                                <ChatbotGuide params={params} />
                            </div>
                        </div>
            }

        </div>
    );
}
