import { useCustomSelector } from "@/customHooks/customSelector";
import { BotIcon, SettingsIcon, FilterSliderIcon } from "@/components/Icons";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
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
import ConnectedAgentList from "./configurationComponent/ConnectedAgentList";
import StarterQuestionToggle from "./configurationComponent/starterQuestion";
import Protected from "../protected";
import { modelSuggestionApi } from "@/config";

const ConfigurationPage = ({ params, isEmbedUser, apiKeySectionRef, promptTextAreaRef }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'config';
    const [currentView, setCurrentView] = useState(view);
    const [modelRecommendations, setModelRecommendations] = useState(null);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

    const { bridgeType, modelType, reduxPrompt, modelName, showGuide, showConfigType, bridgeApiKey, shouldPromptShow, prompt, bridge_functions, connect_agents, knowbaseVersionData } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
        const service = versionData?.service;
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.trim()?.toLowerCase() || 'api',
            modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
            reduxPrompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt,
            modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.model,
            showGuide: state.userDetailsReducer.userDetails.showGuide,
            showConfigType: state.userDetailsReducer.userDetails.showConfigType,
            bridgeApiKey: versionData?.apikey_object_id?.[
                service === 'openai_response' ? 'openai' : service
            ],
            prompt: versionData?.configuration?.prompt || "",
            shouldPromptShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.system_prompt,
            bridge_functions: versionData?.function_ids || [],
            connect_agents: versionData?.connected_agents || {},
            knowbaseVersionData: versionData?.doc_ids || [],
        };
    });
    const [showConnectAgent, setShowConnectAgent] = useState(Object.keys(connect_agents).length === 0);
    const [showEmbed, setShowEmbed] = useState(bridge_functions.length === 0);
    const [showKnowledgebase, setShowKnowledgebase] = useState(knowbaseVersionData.length === 0);
    const resetBorder = (ref, selector) => {
        if (ref?.current) {
            const element = ref.current.querySelector(selector);
            if (element) {
                element.style.borderColor = "";
            }
        }
    };
    useEffect(() => {
        setShowConnectAgent(Object.keys(connect_agents).length === 0);
        setShowEmbed(bridge_functions.length === 0);
        setShowKnowledgebase(knowbaseVersionData.length === 0);
    }, [connect_agents, bridge_functions, knowbaseVersionData]);
    console.log(showConnectAgent, showEmbed, showKnowledgebase);
    const setErrorBorder = (ref, selector, scrollToView = false) => {
        if (ref?.current) {
            if (scrollToView) {
                ref.current.scrollIntoView({ behavior: 'smooth' });
            }
            setTimeout(() => {
                const element = ref.current.querySelector(selector);
                if (element) {
                    element.focus();
                    element.style.borderColor = "red";
                }
            }, 300);
        }
    };

    useEffect(() => {
        const hasPrompt = prompt !== "";
        const hasApiKey = !!bridgeApiKey;
        if (hasPrompt) {
            resetBorder(promptTextAreaRef, 'textarea');
        }

        if (hasApiKey) {
            resetBorder(apiKeySectionRef, 'select');
        }

    }, [bridgeApiKey, prompt, apiKeySectionRef, promptTextAreaRef]);

    const handleGetRecommendations = useCallback(async () => {
        setIsLoadingRecommendations(true);

        try {
            const currentPrompt = promptTextAreaRef.current?.querySelector('textarea')?.value?.trim() || "";

            if (bridgeApiKey && currentPrompt !== "") {
                const response = await modelSuggestionApi({ versionId: params?.version });
                if (response?.success) {
                    setModelRecommendations({
                        available: {
                            service: response.data.available.service,
                            model: response.data.available.model
                        },
                        unavailable: {
                            service: response.data.unavailable.service,
                            model: response.data.unavailable.model
                        }
                    });
                } else {
                    setModelRecommendations({ error: 'Failed to get model recommendations.' });
                }
            } else {
                if (currentPrompt === "") {
                    setModelRecommendations({ error: 'Prompt is missing. Please enter a prompt' });
                    setErrorBorder(promptTextAreaRef, 'textarea', true);
                } else {
                    setModelRecommendations({ error: 'API key is missing. Please add an API key' });
                    setErrorBorder(apiKeySectionRef, 'select', true);
                }
            }
        } catch (error) {
            console.error('Error fetching recommended model:', error);
            setModelRecommendations({ error: 'Error fetching recommended model' });
        } finally {
            setIsLoadingRecommendations(false);
        }
    }, [bridgeApiKey, params?.version, promptTextAreaRef, apiKeySectionRef]);

    useEffect(() => {
        if (bridgeType === 'trigger' || bridgeType == 'api' || bridgeType === 'batch') {
            if (currentView === 'chatbot-config' || bridgeType === 'trigger') {
                setCurrentView('config');
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${params.version}&view=config`);
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
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${params.version}&view=${target}`);
    };

    const renderNeedHelp = () => {
        return (
            <div className="mb-4 mt-4">
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
    console.log(connect_agents, 'connect_agents')

    const renderSetupView = useMemo(() => () => (
        console.log(showConnectAgent, showEmbed, showKnowledgebase),
        <>

            {bridgeType === 'trigger' && !isEmbedUser && <TriggersList params={params} />}
            {(modelType !== AVAILABLE_MODEL_TYPES.IMAGE && modelType !== AVAILABLE_MODEL_TYPES.EMBEDDING) && (
                <>
                    <PreEmbedList params={params} />
                    <InputConfigComponent params={params} promptTextAreaRef={promptTextAreaRef} />

                    {/* Responsive layout - side by side on desktop, stacked on mobile */}
                    {/* Desktop layout */}
                    {/* Desktop layout */}
                    <div className="hidden md:block my-0">
                        <div className="flex flex-col gap-2">
                            {/* Always rendered lists (only when they have data) */}
                            {[
                                { Component: EmbedList, condition: !showEmbed },
                                { Component: ConnectedAgentList, condition: !showConnectAgent },
                                { Component: KnowledgebaseList, condition: !showKnowledgebase },
                            ].map(({ Component, condition }, index) =>
                                condition ? (
                                    <div key={index} className="pb-2 border-b border-gray-200 last:border-b-0">
                                        <Component params={params} />
                                    </div>
                                ) : null
                            )}

                            {/* Render empty ones side-by-side in a compact grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { Component: EmbedList, condition: showEmbed },
                                    { Component: ConnectedAgentList, condition: showConnectAgent },
                                    { Component: KnowledgebaseList, condition: showKnowledgebase },
                                ].map(({ Component, condition }, index) =>
                                    condition ? (
                                            <Component params={params} />
                                    ) : null
                                )}
                            </div>
                            <hr className="my-4" />


                        </div>
                    </div>


                    {/* Mobile layout */}
                    <div className="block md:hidden">
                        <EmbedList params={params} />
                        <hr className="my-0" />
                        <ConnectedAgentList params={params} />
                        <hr className="my-0" />
                        <KnowledgebaseList params={params} />
                        <hr className="my-0" />
                    </div>

                    <PrebuiltToolsList params={params} />
                </>
            )}
            <div className="flex flex-col gap-3">
                {shouldPromptShow && (
                    <div className="flex flex-col items-start gap-2">
                        <button
                            className="flex items-center gap-2  rounded-md bg-gradient-to-r from-blue-800 to-orange-600 text-sm text-transparent bg-clip-text hover:opacity-80 transition-opacity"
                            onClick={handleGetRecommendations}
                            disabled={isLoadingRecommendations}
                        >
                            {isLoadingRecommendations ? 'Loading...' : 'Get Recommended Model'}
                        </button>

                        {modelRecommendations && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 w-full mb-2">
                                {modelRecommendations.error ? (
                                    <p className="text-red-500 text-sm">{modelRecommendations.error}</p>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-gray-700">
                                            <span className="font-medium">Recommended Provider:</span> {modelRecommendations?.available?.service}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium">Recommended Model:</span> {modelRecommendations?.available?.model}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="w-full">
                        <ModelDropdown params={params} />
                    </div>
                    <div className="w-full">
                        <ServiceDropdown
                            params={params}
                            apiKeySectionRef={apiKeySectionRef}
                            promptTextAreaRef={promptTextAreaRef}
                        />
                    </div>
                    <div className="w-full">
                        <ApiKeyInput apiKeySectionRef={apiKeySectionRef} params={params} />
                    </div>
                </div>
            </div>
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
    ), [bridgeType, modelType, params, modelName, modelRecommendations, isLoadingRecommendations, shouldPromptShow, handleGetRecommendations, showConnectAgent, showEmbed, showKnowledgebase]);

    const renderChatbotConfigView = useMemo(() => () => (
        <>
            <UserRefernceForRichText params={params} />
            <StarterQuestionToggle params={params} />
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
                {bridgeType === 'chatbot' && <SlugNameInput params={params} />}
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
        <div className="flex flex-col gap-3 relative mt-4">
            <div>
                <BridgeNameInput params={params} />
                <VersionDescriptionInput params={params} />
            </div>
            {((isEmbedUser && showConfigType) || !isEmbedUser) && <BridgeTypeToggle params={params} />}
            {<div className="absolute right-0 top-0">
                <div className="flex items-center">
                    <BridgeVersionDropdown params={params} />
                    {((isEmbedUser && showConfigType) || !isEmbedUser) && <div className="join group flex">
                        <button
                            onClick={() => handleNavigation('config')}
                            className={`${currentView === 'config' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
                        >
                            <SettingsIcon size={16} className="shrink-0" />
                            <span className={`${currentView === 'config' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Agent Config</span>
                        </button>
                        {bridgeType === 'chatbot' &&
                            <button
                                onClick={() => handleNavigation('chatbot-config')}
                                className={`${currentView === 'chatbot-config' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
                            >
                                <BotIcon size={16} className="shrink-0" />
                                <span className={`${currentView === 'chatbot-config' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Chatbot Config</span>
                            </button>
                        }
                        {((isEmbedUser && showGuide) || (!isEmbedUser && bridgeType !== 'trigger')) && <button
                            onClick={() => handleNavigation('guide')}
                            className={`${currentView === 'guide' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
                        >
                            <FilterSliderIcon size={16} className="shrink-0" />
                            <span className={`${currentView === 'guide' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Integration Guide</span>
                        </button>}
                    </div>}
                </div>
            </div>}
            {currentView === 'chatbot-config' && bridgeType === 'chatbot' ? renderChatbotConfigView() : currentView === 'guide' && currentView !== 'trigger' ? renderGuideView() : renderSetupView()}
            {renderNeedHelp()}
        </div>
    );
}

export default Protected(ConfigurationPage);