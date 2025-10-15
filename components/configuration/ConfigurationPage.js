import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import React from 'react';

import { useConfigurationState } from "@/customHooks/useConfigurationState";
import { ConfigurationProvider } from "./ConfigurationContext";
import ConfigurationHeader from "./ConfigurationHeader";
import ConfigurationNavigation from "./ConfigurationNavigation";
import SetupView from "./SetupView";
import ChatbotConfigView from "./ChatbotConfigView";
import BridgeVersionDropdown from "./configurationComponent/bridgeVersionDropdown";
import Protected from "../protected";

const ConfigurationPage = ({ 
    params, 
    isEmbedUser, 
    apiKeySectionRef, 
    promptTextAreaRef, 
    searchParams,
    // Consolidated state props
    uiState,
    updateUiState,
    promptState,
    setPromptState,
    handleCloseTextAreaFocus,
    savePrompt,
    isMobileView
}) => {
    const router = useRouter();
    const view = searchParams?.view || 'config';
    const [currentView, setCurrentView] = useState(view);
    
    const configState = useConfigurationState(params, searchParams);
    const { bridgeType, reduxPrompt } = configState;
    useEffect(() => {
        if (bridgeType === 'trigger' || bridgeType == 'api' || bridgeType === 'batch') {
            if (currentView === 'chatbot-config' || bridgeType === 'trigger') {
                setCurrentView('config');
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams.version}&view=config`);
            }
        }
    }, [bridgeType, currentView, params.org_id, params.id, searchParams.version, router]);

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
    const handleNavigation = useCallback((target) => {
        setCurrentView(target);
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams?.version}&view=${target}`);
    }, [params.org_id, params.id, searchParams?.version, router]);

    const renderNeedHelp = useMemo(() => () => {
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
    }, [isEmbedUser]);

    // Create context value with consolidated state - significantly reduced dependencies
    const contextValue = useMemo(() => ({
        ...configState,
        params,
        searchParams,
        isEmbedUser,
        apiKeySectionRef,
        promptTextAreaRef,
        // Consolidated state props
        uiState,
        updateUiState,
        promptState,
        setPromptState,
        handleCloseTextAreaFocus,
        savePrompt,
        isMobileView
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
        isMobileView
    ]);

    return (
        <ConfigurationProvider value={contextValue}>
            <div className="flex flex-col gap-3 relative mt-4 bg-base-100">
                <ConfigurationHeader 
                    params={params} 
                    searchParams={searchParams} 
                    isEmbedUser={isEmbedUser} 
                    showConfigType={configState.showConfigType} 
                />
                <div className="absolute right-0 top-0">
                    <div className="flex items-center">
                        <BridgeVersionDropdown params={params} searchParams={searchParams} />
                        <ConfigurationNavigation 
                            bridgeType={bridgeType} 
                            currentView={currentView} 
                            handleNavigation={handleNavigation} 
                            isEmbedUser={isEmbedUser} 
                            showConfigType={configState.showConfigType} 
                        />
                    </div>
                </div>
                {currentView === 'chatbot-config' ? (
                    <ChatbotConfigView params={params} searchParams={searchParams} />
                ) : (
                    <SetupView />
                )}
                {renderNeedHelp()}
            </div>
        </ConfigurationProvider>
    );
};

export default Protected(React.memo(ConfigurationPage));
