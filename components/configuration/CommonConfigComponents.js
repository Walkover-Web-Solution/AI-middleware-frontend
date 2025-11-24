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
    hideAdvancedParameters = false,
    isPublished = false
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
        </>
    );
};

export default React.memo(CommonConfigComponents);
