import React from 'react';
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import ModelDropdown from "./configurationComponent/modelDropdown";
import ApiKeyInput from "./configurationComponent/apiKeyInput";
import RecommendedModal from "./configurationComponent/RecommendedModal";
import AdvancedSettingsButton from "./configurationComponent/AdvancedSettingsButton";

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
    hideAdvancedParameters = false
}) => {
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
            />}
            <div className="flex flex-col sm:flex-row gap-2 items-start w-full">
                <div className="w-auto">
                    <ServiceDropdown
                        params={params}
                        apiKeySectionRef={apiKeySectionRef}
                        promptTextAreaRef={promptTextAreaRef}
                        searchParams={searchParams}
                    />
                </div>
                <div className="w-full max-w-xs min-w-xs">
                    <ModelDropdown params={params} searchParams={searchParams} />
                </div>
                {((!showDefaultApikeys && isEmbedUser) || !isEmbedUser) && (
                    <div className="flex items-center gap-2">
                        <ApiKeyInput 
                            apiKeySectionRef={apiKeySectionRef} 
                            params={params} 
                            searchParams={searchParams} 
                            isEmbedUser={isEmbedUser}
                            hideAdvancedParameters={hideAdvancedParameters}
                        />
                        <AdvancedSettingsButton
                            params={params}
                            searchParams={searchParams}
                            isEmbedUser={isEmbedUser}
                            hideAdvancedParameters={hideAdvancedParameters}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default React.memo(CommonConfigComponents);
