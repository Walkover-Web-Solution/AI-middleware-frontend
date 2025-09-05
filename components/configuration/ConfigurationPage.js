import { useCustomSelector } from "@/customHooks/customSelector";
import { BotIcon, SettingsIcon, FilterSliderIcon } from "@/components/Icons";
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
import PrebuiltToolsList from "./configurationComponent/prebuiltToolsList";
import ConnectedAgentList from "./configurationComponent/ConnectedAgentList";
import StarterQuestionToggle from "./configurationComponent/starterQuestion";
import Protected from "../protected";
import AdvancedConfiguration from "./configurationComponent/advancedConfiguration";

const ConfigurationPage = ({ params, isEmbedUser, apiKeySectionRef, promptTextAreaRef, searchParams }) => {
    const router = useRouter();
    const view = searchParams?.view || 'config';
    const [currentView, setCurrentView] = useState(view);

    const { bridgeType, modelType, reduxPrompt, modelName, showGuide, showConfigType } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType?.trim()?.toLowerCase() || 'api',
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.type?.toLowerCase(),
        reduxPrompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt,
        modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.model,
        showGuide: state.userDetailsReducer.userDetails.showGuide,
        showConfigType: state.userDetailsReducer.userDetails.showConfigType,
    }));
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

    const renderSetupView = useMemo(() => () => (
        <>
            {bridgeType === 'trigger' && !isEmbedUser && <TriggersList params={params} />}
            {(modelType !== AVAILABLE_MODEL_TYPES.IMAGE && modelType !== AVAILABLE_MODEL_TYPES.EMBEDDING) && (
                <>
                    <PreEmbedList params={params} searchParams={searchParams}/>
                    <InputConfigComponent params={params} searchParams={searchParams} promptTextAreaRef={promptTextAreaRef} />
                    {/* <NewInputConfigComponent params={params} /> */}
                    <EmbedList params={params} searchParams={searchParams}/>
                    <hr className="my-0 p-0 bg-base-200 border-base-300" />
                    <ConnectedAgentList params={params} searchParams={searchParams}/>
                    <hr className="my-0 p-0 bg-base-200 border-base-300" />
                    <KnowledgebaseList params={params} searchParams={searchParams}/>
                    <hr className="my-0 p-0 bg-base-200 border-base-300" />
                    <PrebuiltToolsList params={params} searchParams={searchParams}/>
                </>
            )}

            <ServiceDropdown params={params} searchParams={searchParams} apiKeySectionRef={apiKeySectionRef} promptTextAreaRef={promptTextAreaRef} />
            <ModelDropdown params={params} searchParams={searchParams}/>
            <ApiKeyInput apiKeySectionRef={apiKeySectionRef} params={params} searchParams={searchParams}/>
            <AdvancedParameters params={params} searchParams={searchParams}/>
            
            {modelType !== "image" && modelType !== 'embedding' && (
                <>
                    <AddVariable params={params} searchParams={searchParams}/>
                    <AdvancedConfiguration params={params} searchParams={searchParams} bridgeType={bridgeType} modelType={modelType} />
                    <GptMemory params={params} searchParams={searchParams} />
                </>
            )}
        </>
    ), [bridgeType, modelType, params, modelName]);
    const renderChatbotConfigView = useMemo(() => () => (
        <>

            <UserRefernceForRichText params={params} searchParams={searchParams}/>
            <StarterQuestionToggle params={params} searchParams={searchParams}/>
            <ActionList params={params} searchParams={searchParams}/>
        </>
    ), [bridgeType, modelType, params, modelName]);

    const renderGuideView = useMemo(() => () => {
        const guideComponents = {
            api: <ApiGuide params={params} searchParams={searchParams} modelType={modelType} />,
            batch: <BatchApiGuide params={params} searchParams={searchParams} />,
            chatbot: <ChatbotGuide params={params} searchParams={searchParams} />,
        };

        return (
            <div className="flex flex-col w-100 overflow-auto gap-3">
                {bridgeType === 'chatbot' && <SlugNameInput params={params} searchParams={searchParams} />}
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
        <div className="flex flex-col gap-3 relative mt-4 bg-base-100">
            <div>
                <BridgeNameInput params={params} searchParams={searchParams} />
                <VersionDescriptionInput params={params} searchParams={searchParams} />
            </div>
            {((isEmbedUser && showConfigType) || !isEmbedUser) && <BridgeTypeToggle params={params} searchParams={searchParams} />}
            {<div className="absolute right-0 top-0">
                <div className="flex items-center">
                    <BridgeVersionDropdown params={params} searchParams={searchParams}/>
                    {((isEmbedUser && showConfigType) || !isEmbedUser) && <div className="join group flex">
                        { bridgeType === 'chatbot' && <button
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
            {currentView === 'chatbot-config' && bridgeType === 'chatbot' ? renderChatbotConfigView() : currentView === 'guide' && currentView !== 'trigger' ? renderGuideView() : renderSetupView()}
            {renderNeedHelp()}
        </div>
    );
}

export default Protected(ConfigurationPage);
