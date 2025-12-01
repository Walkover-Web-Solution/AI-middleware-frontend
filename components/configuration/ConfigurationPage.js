import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import React from 'react';
import { useConfigurationState } from "@/customHooks/useConfigurationState";
import { ConfigurationProvider } from "./ConfigurationContext";
import SetupView from "./SetupView";
import Protected from "../protected";
import { Lock } from 'lucide-react';
import { toggleSidebar } from '@/utils/utility';
import GuideSlider from '../sliders/integrationGuideSlider';

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
    closeHelperButtonLocation
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

    const renderHelpSection = useMemo(() => () => {
        return (
            <div className="z-very-low mt-4 mb-4 border-t border-base-content/10 border-b-0 ">
                <div className="flex flex-row gap-6 mt-4 items-center">
                    {/* Speak to us */}
                    {!isEmbedUser && (
                    <>
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
                
                        <a
                            href="https://techdoc.walkover.in/p?collectionId=inYU67SKiHgW"
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>Help Docs</span>
                            <span>→</span>
                        </a>
                    

                     {/* Integration Guide */}
                    
                        <button
                            onClick={() => {
                                // Use setTimeout to ensure the component is rendered before toggling
                                setTimeout(() => toggleSidebar("integration-guide-slider", "right"), 10);
                            }}
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                        >
                            <span>Integration Guide</span>
                            <span>→</span>
                        </button>
                    
                    </>
                    )}
                </div>

            </div>
        );
    }, [isEmbedUser]);
    
    // Detect if viewing published content (read-only mode)
    const isPublished = useMemo(() => {
        if (searchParams?.get) {
            return searchParams.get('isPublished') === 'true';
        } else {
            return searchParams?.isPublished === 'true';
        }
    }, [searchParams]);
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
        switchView: handleNavigation,
        isPublished
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
        isPublished,
        currentView,
        handleNavigation
    ]);


    // Check if viewing published data
    const [bannerState, setBannerState] = useState({ show: isPublished, animating: false });
    const prevIsPublished = useRef(isPublished);

    // Handle banner animation when isPublished changes
    useEffect(() => {
        if (prevIsPublished.current !== isPublished) {
            if (isPublished) {
                // Switching to published - show with slide-in animation
                setBannerState({ show: true, animating: false });
            } else {
                // Switching from published - start slide-out animation
                setBannerState({ show: true, animating: true });
                // Hide banner after animation completes
                setTimeout(() => {
                    setBannerState({ show: false, animating: false });
                }, 300); // Match animation duration
            }
            prevIsPublished.current = isPublished;
        }
    }, [isPublished]);

    return (
        <ConfigurationProvider value={contextValue}>
            <div className="flex flex-col gap-2 relative bg-base-100">
                {/* Published Data Banner - Sticky and close to navbar */}
                {bannerState.show && (
                    <div className={`sticky top-0 z-40 bg-blue-50 dark:bg-slate-800 border-b border-blue-200 dark:border-slate-700 px-4 py-2 ${bannerState.animating ? 'animate-slide-out-to-navbar' : 'animate-slide-in-from-navbar'
                        }`}>
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-blue-700 dark:text-slate-300">
                                This is a <span className="text-blue-800 dark:text-white font-medium">read-only</span> published data.
                            </span>
                        </div>
                    </div>
                )}
                <SetupView />
                {renderHelpSection()}
            </div>
            {!isEmbedUser && <GuideSlider
                params={params}
                bridgeType={bridgeType}
            />}

        </ConfigurationProvider>
    );
};

export default Protected(React.memo(ConfigurationPage));
