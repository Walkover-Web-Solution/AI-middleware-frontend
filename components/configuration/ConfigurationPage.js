import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import React from 'react';  
import { useConfigurationState } from "@/customHooks/useConfigurationState";
import { ConfigurationProvider } from "./ConfigurationContext";
import SetupView from "./SetupView";
import BridgeVersionDropdown from "./configurationComponent/bridgeVersionDropdown";
import Protected from "../protected";
import VersionDescriptionInput from './configurationComponent/VersionDescriptionInput';

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
    isMobileView
}) => {
    const router = useRouter();
    const view = searchParams?.view || 'config';
    const [currentView, setCurrentView] = useState(view);
    
    const configState = useConfigurationState(params, searchParams);
    const { bridgeType } = configState;
    useEffect(() => {
        if (bridgeType === 'trigger' || bridgeType == 'api' || bridgeType === 'batch') {
            if (currentView === 'chatbot-config' || bridgeType === 'trigger') {
                setCurrentView('config');
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams.version}&view=config`);
            }
        }
    }, [bridgeType, currentView, params.org_id, params.id, searchParams.version, router]);

    const handleNavigation = useCallback((target) => {
        setCurrentView(target);
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams?.version}&view=${target}`);
    }, [params.org_id, params.id, searchParams?.version, router]);

    const renderNeedHelp = useMemo(() => () => {
        return (
            <div className="mb-4 mt-4">
                {!isEmbedUser && <a
                    href="https://techdoc.walkover.in/p?collectionId=inYU67SKiHgW"
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
            <div className="flex flex-col gap-2 relative bg-base-100">
                <BridgeVersionDropdown params={params} searchParams={searchParams} />
                <VersionDescriptionInput 
                    params={params}
                    searchParams={searchParams} 
                    isEmbedUser={isEmbedUser} 
                  />
                {/* {currentView === 'chatbot-config' && bridgeType !== 'chatbot' ? (
                    <ChatbotConfigView params={params} searchParams={searchParams} />
                ) : ( */}
                    <SetupView />
                {/* )} */}
                {renderNeedHelp()}
            </div>
        </ConfigurationProvider>
    );
};

export default Protected(React.memo(ConfigurationPage));
