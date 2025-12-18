import React from 'react';
import ServiceDropdown from "./configurationComponent/ServiceDropdown";
import ModelDropdown from "./configurationComponent/ModelDropdown";
import ApiKeyInput from "./configurationComponent/ApiKeyInput";
import RecommendedModal from "./configurationComponent/RecommendedModal";
import AdvancedSettingsButton from "./configurationComponent/AdvancedSettingsButton";
import { useConfigurationSelector } from "../../customHooks/useOptimizedSelector";
import { AlertIcon } from '@/components/Icons';

const CommonConfigComponents = ({
    params,
    searchParams,
    apiKeySectionRef,
    promptTextAreaRef,
    bridgeApiKey,
    shouldPromptShow,
    service,
    showDefaultApikeys,
    isEmbedUser,
    hideAdvancedParameters = false,
    isPublished = false
}) => {
    const { bridge } = useConfigurationSelector(params, searchParams);
    return (
        <>
            {!isEmbedUser && <RecommendedModal
                params={params}
                searchParams={searchParams}
                apiKeySectionRef={apiKeySectionRef}
                promptTextAreaRef={promptTextAreaRef}
                bridgeApiKey={bridgeApiKey}
                shouldPromptShow={shouldPromptShow}
                service={service}
                deafultApiKeys={showDefaultApikeys}
                isPublished={isPublished}
            />}
            <div className="flex flex-col sm:flex-row gap-2 items-start w-full max-w-md">
                <div className="w-auto">
                    <ServiceDropdown
                        params={params}
                        apiKeySectionRef={apiKeySectionRef}
                        promptTextAreaRef={promptTextAreaRef}
                        searchParams={searchParams}
                        isPublished={isPublished}
                    />
                </div>
                <div className="flex items-center gap-2 w-full">
                    <div className="w-full">
                        <ModelDropdown isPublished={isPublished} params={params} searchParams={searchParams} />
                    </div>
                    <AdvancedSettingsButton
                        params={params}
                        searchParams={searchParams}
                        isEmbedUser={isEmbedUser}
                        hideAdvancedParameters={hideAdvancedParameters}
                        isPublished={isPublished}
                    />
                </div>
            </div>
            {(!isEmbedUser || (!showDefaultApikeys && isEmbedUser)) && <div className="mt-2 w-full max-w-md">
                <ApiKeyInput
                    apiKeySectionRef={apiKeySectionRef}
                    params={params}
                    searchParams={searchParams}
                    isEmbedUser={isEmbedUser}
                    hideAdvancedParameters={hideAdvancedParameters}
                    isPublished={isPublished}
                />
            </div>}
            {!bridge?.fall_back?.is_enable && (
                <div className="alert alert-warning mb-1 py-2 px-2 max-w-md">
                    <div className="flex items-center gap-2">
                        <AlertIcon size={12} />
                        <span className="text-xs">Enable fallback model from the settings</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default React.memo(CommonConfigComponents);
