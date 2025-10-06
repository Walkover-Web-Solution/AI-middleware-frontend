import { useCustomSelector } from "@/customHooks/customSelector";
import { BotIcon, SettingsIcon, FilterSliderIcon, AlertIcon } from "@/components/Icons";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import SlugNameInput from "./configurationComponent/slugNameInput";
import UserRefernceForRichText from "./configurationComponent/userRefernceForRichText";
import GptMemory from "./configurationComponent/gptmemory";
import VersionDescriptionInput from "./configurationComponent/VersionDescriptionInput";
import { AVAILABLE_MODEL_TYPES } from "@/utils/enums";
import BatchApiGuide from "./configurationComponent/BatchApiGuide";
import KnowledgebaseList from "./configurationComponent/knowledgebaseList";
import TriggersList from "./configurationComponent/TriggersList";
import AddVariable from "../addVariable";
import ConnectedAgentList from "./configurationComponent/ConnectedAgentList";
import StarterQuestionToggle from "./configurationComponent/starterQuestion";
import Protected from "../protected";
import AdvancedConfiguration from "./configurationComponent/advancedConfiguration";
import RecommendedModal from "./configurationComponent/RecommendedModal";

const ConfigurationPage = ({ params, isEmbedUser, apiKeySectionRef, promptTextAreaRef, searchParams }) => {
    const router = useRouter();
    const view = searchParams?.view || 'config';
    const [currentView, setCurrentView] = useState(view);
    
    const { bridgeType, modelType, reduxPrompt, modelName, showConfigType, bridgeApiKey, shouldPromptShow, prompt, bridge_functions, connect_agents, knowbaseVersionData, showDefaultApikeys, shouldToolsShow, hideAdvancedParameters, hideAdvancedConfigurations, service ,hidePreTool } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const service = versionData?.service;
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.trim()?.toLowerCase() || 'api',
            modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.type?.toLowerCase(),
            reduxPrompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt,
            modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.model,
            showConfigType: state.userDetailsReducer.userDetails.showConfigType,
            showDefaultApikeys: state.userDetailsReducer.userDetails.addDefaultApiKeys,
            shouldToolsShow: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.tools,
            bridgeApiKey: versionData?.apikey_object_id?.[
                service === 'openai_response' ? 'openai' : service
            ],
            prompt: versionData?.configuration?.prompt || "",
            shouldPromptShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.system_prompt,
            bridge_functions: versionData?.function_ids || [],
            connect_agents: versionData?.connected_agents || {},
            knowbaseVersionData: versionData?.doc_ids || [],
            hideAdvancedParameters: state.userDetailsReducer.userDetails.hideAdvancedParameters,
            hideAdvancedConfigurations: state.userDetailsReducer.userDetails.hideAdvancedConfigurations,
            service: service,
            hidePreTool: state.userDetailsReducer.userDetails.hidePreTool,
        };
    });
    useEffect(() => {
        if (bridgeType === 'trigger' || bridgeType == 'api' || bridgeType === 'batch') {
            if (currentView === 'chatbot-config' || bridgeType === 'trigger') {
                setCurrentView('config');
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams.version}&view=config`);
            }
        }
    }, [bridgeType])

    useEffect(() => {
        const shouldScrollAndFocus = (bridgeType === 'api' || bridgeType === 'chatbot' || bridgeType === 'batch') && reduxPrompt?.trim() === "";
        if (!shouldScrollAndFocus) return;
        const timeoutId = setTimeout(() => {
            const textareaElement = promptTextAreaRef?.current?.querySelector('textarea');
            if (textareaElement) {
                promptTextAreaRef.current.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    textareaElement.focus();
                }, 500);
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [bridgeType, reduxPrompt]);
    const handleNavigation = (target) => {
        setCurrentView(target);
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams?.version}&view=${target}`);
    };

    const renderNeedHelp = () => {
        return (
            <div className="mb-4 mt-4">
                {!isEmbedUser && <a
                    href="/faq/how-to-use-gtwy-ai"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Need help? Visit FAQ →
                </a>}
            </div>
        );
    };

    // Helper function to render common components (ServiceDropdown, ModelDropdown, ApiKeyInput, AdvancedParameters, RecommendedModal)
    const renderCommonComponents = () => (
        <>
            <RecommendedModal 
                params={params} 
                searchParams={searchParams} 
                apiKeySectionRef={apiKeySectionRef} 
                promptTextAreaRef={promptTextAreaRef} 
                bridgeApiKey={bridgeApiKey} 
                shouldPromptShow={shouldPromptShow} 
                service={service} 
                deafultApiKeys={showDefaultApikeys}
            />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-start">
                <div className="w-full min-w-0 md:order-1">
                    <ServiceDropdown
                        params={params}
                        apiKeySectionRef={apiKeySectionRef}
                        promptTextAreaRef={promptTextAreaRef}
                        searchParams={searchParams}
                    />
                </div>
                <div className="w-full min-w-0 md:order-2">
                    <ModelDropdown params={params} searchParams={searchParams} />
                </div>
                {((!showDefaultApikeys && isEmbedUser) || !isEmbedUser) && (
                    <div className="w-full min-w-0 md:order-3">
                        <ApiKeyInput apiKeySectionRef={apiKeySectionRef} params={params} searchParams={searchParams} />
                    </div>
                )}
            </div>
            {((isEmbedUser && !hideAdvancedParameters) || !isEmbedUser) && (
                <AdvancedParameters params={params} searchParams={searchParams} />
            )}
        </>
    );

    // Helper function to render non-image model components
    const renderNonImageComponents = () => (
        <>
        {((!hidePreTool &&isEmbedUser) || !isEmbedUser) &&(
            <PreEmbedList params={params} searchParams={searchParams} />
        )}
            <InputConfigComponent 
                params={params} 
                searchParams={searchParams} 
                promptTextAreaRef={promptTextAreaRef} 
                isEmbedUser={isEmbedUser} 
            />
            {shouldToolsShow ? (
                <>
                    <EmbedList params={params} searchParams={searchParams} />
                    <hr className="my-0 p-0 bg-base-200 border-base-300" />
                    <ConnectedAgentList params={params} searchParams={searchParams} />
                    <hr className="my-0 p-0 bg-base-200 border-base-300" />
                    <KnowledgebaseList params={params} searchParams={searchParams} />
                    <hr className="my-0 p-0 bg-base-200 border-base-300" />
                </>
            ) : (
                <div className="flex items-center gap-2 mt-3 mb-3">
                    <AlertIcon size={18} className="text-warning" />
                    <h2 className="text-center">This model does not support tools</h2>
                </div>
            )}
            {renderCommonComponents()}
            <AddVariable params={params} searchParams={searchParams} />
            {((isEmbedUser && !hideAdvancedConfigurations) || !isEmbedUser) && (
                <AdvancedConfiguration 
                    params={params} 
                    searchParams={searchParams} 
                    bridgeType={bridgeType} 
                    modelType={modelType} 
                />
            )}
            <GptMemory params={params} searchParams={searchParams} />
        </>
    );

    const renderSetupView = useMemo(() => () => (
        <>
            {bridgeType === 'trigger' && !isEmbedUser && <TriggersList params={params} />}
            {modelType === "image" ? (
                renderCommonComponents()
            ) : (
                renderNonImageComponents()
            )}
        </>
    ), [bridgeType, modelType, params, modelName, bridgeApiKey]);

    const renderChatbotConfigView = useMemo(() => () => (
        <>
            <UserRefernceForRichText params={params} searchParams={searchParams} />
            <StarterQuestionToggle params={params} searchParams={searchParams} />
            <ActionList params={params} searchParams={searchParams} />
        </>
    ), [bridgeType, modelType, params, modelName]);

    return (
        <div className="flex flex-col gap-3 relative mt-4 bg-base-100">
            <div>
                <BridgeNameInput params={params} searchParams={searchParams} />
                <VersionDescriptionInput params={params} searchParams={searchParams} />
            </div>
            {((isEmbedUser && showConfigType) || !isEmbedUser) && <BridgeTypeToggle params={params} searchParams={searchParams} />}
            {<div className="absolute right-0 top-0">
                <div className="flex items-center">
                    <BridgeVersionDropdown params={params} searchParams={searchParams} />
                    {((isEmbedUser && showConfigType) || !isEmbedUser) && <div className="join group flex">
                        {bridgeType === 'chatbot' && <button
                            onClick={() => handleNavigation('config')}
                            className={`${currentView === 'config' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
                        >
                            <SettingsIcon size={16} className="shrink-0" />
                            <span className={`${currentView === 'config' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Agent Config</span>
                        </button>}
                        {bridgeType === 'chatbot' &&
                            <button
                                onClick={() => handleNavigation('chatbot-config')}
                                className={`${currentView === 'chatbot-config' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
                            >
                                <BotIcon size={16} className="shrink-0" />
                                <span className={`${currentView === 'chatbot-config' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Chatbot Config</span>
                            </button>
                        }
                        {/* {((isEmbedUser && showGuide) || (!isEmbedUser && bridgeType !== 'trigger')) && <button
                            onClick={() => handleNavigation('guide')}
                            className={`${currentView === 'guide' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
                        >
                            <FilterSliderIcon size={16} className="shrink-0" />
                            <span className={`${currentView === 'guide' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Integration Guide</span>
                        </button>} */}
                    </div>}
                </div>
            </div>}
            {currentView === 'chatbot-config' && bridgeType === 'chatbot' ? renderChatbotConfigView() : renderSetupView()}
            {renderNeedHelp()}
        </div>
    );
}

export default Protected(ConfigurationPage);