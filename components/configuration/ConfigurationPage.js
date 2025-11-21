import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import React from 'react';  
import { useConfigurationState } from "@/customHooks/useConfigurationState";
import { ConfigurationProvider } from "./ConfigurationContext";
import SetupView from "./SetupView";
import BridgeVersionDropdown from "./configurationComponent/bridgeVersionDropdown";
import Protected from "../protected";
import VersionDescriptionInput from './configurationComponent/VersionDescriptionInput';
import { InfoIcon, MessageCircleMoreIcon } from 'lucide-react';
import { openModal, toggleSidebar } from '@/utils/utility';
import ConnectedAgentFlowPanel from './ConnectedAgentFlowPanel';

const ConfigurationPage = ({ 
    params, 
    isEmbedUser, 
    apiKeySectionRef, 
    promptTextAreaRef, 
    searchParams,
    uiState,
    updateUiState,
    promptState,
    setPromptState,
    handleCloseTextAreaFocus,
    savePrompt,
    isMobileView,
    closeHelperButtonLocation,
    bridgeName,
    onViewChange,
}) => {
    const router = useRouter();
    const view = searchParams?.view || 'config';
    const [currentView, setCurrentView] = useState(view);
    
    const configState = useConfigurationState(params, searchParams);
    const { bridgeType } = configState;
    useEffect(() => {
        if (bridgeType === 'trigger' && currentView !== 'config') {
            setCurrentView('config');
            router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams.version}&view=config`);
        }
    }, [bridgeType, currentView, params.org_id, params.id, searchParams.version, router]);

    useEffect(() => {
        const resolvedView = searchParams?.view || 'config';
        if (resolvedView !== currentView) {
            setCurrentView(resolvedView);
        }
    }, [searchParams?.view, currentView]);

    useEffect(() => {
        onViewChange?.(currentView === 'agent-flow');
    }, [currentView, onViewChange]);

    const handleNavigation = useCallback((target) => {
        setCurrentView(target);
        onViewChange?.(target === 'agent-flow');
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams?.version}&view=${target}`);
    }, [params.org_id, params.id, searchParams?.version, router, onViewChange]);

     const renderHelpSection = useMemo(() => () => {
        return (
            <div className="z-very-low mt-4 mb-4 border-t border-base-content/10 border-b-0 ">
                <div className="flex flex-row gap-6 mt-4 items-center">
                    {/* Speak to us */}
                    <button
                        data-cal-namespace="30min"
                        data-cal-link="team/gtwy.ai/ai-consultation"
                        data-cal-origin="https://cal.id"
                        data-cal-config='{"layout":"month_view"}'
                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                    >
                        <span>Speak to us</span>
                        <span>→</span>
                    </button>

                    {/* Help Docs */}
                    {!isEmbedUser && (
                        <a
                            href="https://techdoc.walkover.in/p?collectionId=inYU67SKiHgW"
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>Help Docs</span>
                            <span>→</span>
                        </a>
                    )}

                </div>

            </div>
        );
    }, [isEmbedUser]);

    // Create context value with consolidated state - significantly reduced dependencies
    const contextValue = useMemo(() => ({
        ...configState,
        params,
        searchParams,
        isEmbedUser,
        apiKeySectionRef,
        promptTextAreaRef,
        uiState,
        updateUiState,
        promptState,
        setPromptState,
        handleCloseTextAreaFocus,
        savePrompt,
        isMobileView,
        closeHelperButtonLocation,
        currentView,
        bridgeName,
        switchView: handleNavigation
    }), [
        configState,
        params,
        searchParams,
        isEmbedUser,
        apiKeySectionRef,
        promptTextAreaRef,
        uiState,
        updateUiState,
        promptState,
        setPromptState,
        handleCloseTextAreaFocus,
        savePrompt,
        isMobileView,
        closeHelperButtonLocation,
        currentView,
        bridgeName,
        handleNavigation
    ]);

    return (
        <ConfigurationProvider value={contextValue}>
            <div className="flex flex-col gap-2 relative bg-base-100">
               
                {/* {currentView === 'chatbot-config' && bridgeType !== 'chatbot' ? (
                    <ChatbotConfigView params={params} searchParams={searchParams} />
                ) : ( */}
                    <SetupView />
                {/* )} */}
                {renderHelpSection()}
            </div>
            
            
        </ConfigurationProvider>
    );
};

export default Protected(React.memo(ConfigurationPage));
