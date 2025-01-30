import { useCustomSelector } from "@/customHooks/customSelector";
import { Bot, Cog } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
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
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import SlugNameInput from "./configurationComponent/slugNameInput";
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";
import GptMemory from "./configurationComponent/gptmemory";
import VersionDescriptionInput from "./configurationComponent/VersionDescriptionInput";
import ToolCallCount from "./configurationComponent/toolCallCount";
import BatchApiGuide from "./configurationComponent/BatchApiGuide";

export default function ConfigurationPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'setup';
    const [currentView, setCurrentView] = useState(view);

    const { bridgeType, modelType } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params.version]?.bridgeType || state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
    }));

    const handleNavigation = (target) => {
        setCurrentView(target);
        router.push(`/org/${params.org_id}/bridges/configure/${params.id}?version=${params.version}&view=${target}`);
    };

    const isImageOrEmbedding = modelType === "image" || modelType === "embedding";

    const renderSetupView = useMemo(() => () => {
        const components = [];

        // Add components in the correct order
        if (bridgeType === 'chatbot') {
            components.push(<SlugNameInput key="slugName" params={params} />);
        }

        if (bridgeType === 'batch') {
            components.push(
                <InputConfigComponent key="inputConfig" params={params} />,
                <ServiceDropdown key="service" params={params} />,
                <ModelDropdown key="model" params={params} />,
                <ApiKeyInput key="apiKey" params={params} />,
                <AdvancedParameters key="advancedParams" params={params} />
            );
        } else {
            if (!isImageOrEmbedding) {
                components.push(
                    <PreEmbedList key="preEmbed" params={params} />,
                    <InputConfigComponent key="inputConfig" params={params} />,
                    <EmbedList key="embed" params={params} />
                );
            }

            components.push(
                <ServiceDropdown key="service" params={params} />,
                <ModelDropdown key="model" params={params} />,
                <ApiKeyInput key="apiKey" params={params} />,
                <AdvancedParameters key="advancedParams" params={params} />
            );

            if (!isImageOrEmbedding) {
                components.push(
                    <AddVariable key="addVariable" params={params} />,
                    <GptMemory key="gptMemory" params={params} />,
                    <UserRefernceForRichText key="userRef" params={params} />,
                    <ToolCallCount key="toolCall" params={params} />,
                    <ActionList key="actionList" params={params} />
                );
            }

            if (bridgeType === 'api' && !isImageOrEmbedding) {
                components.push(<ResponseFormatSelector key="responseFormat" params={params} />);
            }
        }

        return <>{components}</>;
    }, [bridgeType, modelType, params]);

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
            <BridgeNameInput params={params} />
            <VersionDescriptionInput params={params} />
            <BridgeTypeToggle params={params} />
            <div className="absolute right-0 top-0">
                <div className="flex items-center">
                    <BridgeVersionDropdown params={params} />
                    <div className="join">
                        <button
                            onClick={() => handleNavigation('setup')}
                            className={` ${currentView === 'setup' ? "btn-primary" : ""} btn join-item `}
                        >
                            <Cog size={16} /> Setup
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
            {currentView === 'setup' ? renderSetupView() : renderGuideView()}
        </div>
    );
}
