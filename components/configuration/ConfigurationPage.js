import { useCustomSelector } from "@/customHooks/customSelector";
import { Bot, Cog, FileSliders } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import SlugNameInput from "./configurationComponent/slugNameInput";
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";
import GptMemory from "./configurationComponent/gptmemory";
import VersionDescriptionInput from "./configurationComponent/VersionDescriptionInput";
import ToolCallCount from "./configurationComponent/toolCallCount";
import { AVAILABLE_MODEL_TYPES, PROMPT_SUPPORTED_REASIONING_MODELS } from "@/utils/enums";
import BatchApiGuide from "./configurationComponent/BatchApiGuide";
import KnowledgebaseList from "./configurationComponent/knowledgebaseList";
import TriggersList from "./configurationComponent/TriggersList";
import AddVariable from "../addVariable";
import PrebuiltToolsList from "./configurationComponent/prebuiltToolsList";

export default function ConfigurationPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'config';
    const [currentView, setCurrentView] = useState(view);

    const { bridgeType, modelType, modelName } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.trim()?.toLowerCase() || 'api',
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
        modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.model,
    }));

    const handleNavigation = (target) => {
        setCurrentView(target);
        router.push(`/org/${params.org_id}/bridges/configure/${params.id}?version=${params.version}&view=${target}`);
    };

    const renderNeedHelp = () => {
        return (
            <div className="mb-4">
                <a
                    href="/faq/how-to-use-gtwy-ai"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Need help? Visit FAQ →
                </a>
            </div>
        );
    };

    const renderSetupView = useMemo(() => () => (
        <>
            {bridgeType === 'trigger' && <TriggersList params={params} />}
            {(modelType !== AVAILABLE_MODEL_TYPES.IMAGE && modelType !== AVAILABLE_MODEL_TYPES.EMBEDDING && (modelType === AVAILABLE_MODEL_TYPES.REASONING
                ? PROMPT_SUPPORTED_REASIONING_MODELS?.includes(modelName)
                : true)) && (
                    <>
                        <PreEmbedList params={params} />
                        <InputConfigComponent params={params} />
                        <EmbedList params={params} />
                        <hr className="my-0 p-0" />
                        <KnowledgebaseList params={params} />
                        <PrebuiltToolsList params={params} />
                    </>
                )}
            <ServiceDropdown params={params} />
            <ModelDropdown params={params} />
            <ApiKeyInput params={params} />
            <AdvancedParameters params={params} />
            {modelType !== "image" && modelType !== 'embedding' && (
                <>
                    <AddVariable params={params} />
                    <GptMemory params={params} />
                    <ToolCallCount params={params} />
                </>
            )}
            {bridgeType === 'api' && modelType !== 'image' && modelType !== 'embedding' && <ResponseFormatSelector params={params} />}
        </>
    ), [bridgeType, modelType, params, modelName]);

    const renderChatbotConfigView = useMemo(() => () => (
        <>
            <SlugNameInput params={params} />
            <UserRefernceForRichText params={params} />
            <ActionList params={params} />
        </>
    ), [bridgeType, modelType, params, modelName]);

    const renderGuideView = useMemo(() => () => {
        const guideComponents = {
            api: <ApiGuide params={params} modelType={modelType} />,
            batch: <BatchApiGuide params={params} />,
            chatbot: <ChatbotGuide params={params} />,
        };

        return (
            <div className="flex flex-col w-100 overflow-auto gap-3">
                <h1 className="text-xl font-semibold">
                    {bridgeType === 'api' ? 'API Configuration' :
                        bridgeType === 'batch' ? 'Batch API Configuration' : 'Chatbot Configuration'}
                </h1>
                <div className="flex flex-col gap-4">
                    {guideComponents[bridgeType]}
                </div>
            </div>
        );
    }, [bridgeType, params, modelType]);

    return (
        <div className="flex flex-col gap-3 relative">
            <div>
                <BridgeNameInput params={params} />
                <VersionDescriptionInput params={params} />
            </div>
            <BridgeTypeToggle params={params} />
            <div className="absolute right-0 top-0">
                <div className="flex items-center">
                    <BridgeVersionDropdown params={params} />
                    <div className="join">
                        <button
                            onClick={() => handleNavigation('config')}
                            className={` ${currentView === 'config' ? "btn-primary" : ""} btn join-item `}
                        >
                            <Cog size={16} /> Config
                        </button>
                        <button
                            onClick={() => handleNavigation('chatbot-config')}
                            className={` ${currentView === 'chatbot-config' ? "btn-primary" : ""} btn join-item `}
                        >
                            <FileSliders size={16} /> Chatbot Config
                        </button>
                        <button
                            onClick={() => handleNavigation('guide')}
                            className={` ${currentView === 'guide' ? "btn-primary" : ""} btn join-item `}
                        >
                            <Bot size={16} /> Guide
                        </button>
                    </div>
                </div>
            </div>
            {currentView === 'chatbot-config' ? renderChatbotConfigView() : currentView === 'guide' ? renderGuideView() : renderSetupView()}
            {renderNeedHelp()}
        </div>
    );
}
