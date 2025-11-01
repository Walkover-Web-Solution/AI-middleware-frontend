import React from 'react';
import ServiceDropdown from "./configurationComponent/serviceDropdown";
import ModelDropdown from "./configurationComponent/modelDropdown";
import ApiKeyInput from "./configurationComponent/apiKeyInput";
import RecommendedModal from "./configurationComponent/RecommendedModal";

const CommonConfigComponents = ({ 
    params, 
    searchParams, 
    apiKeySectionRef, 
    promptTextAreaRef, 
    bridgeApiKey, 
    shouldPromptShow, 
    service, 
    showDefaultApikeys, 
    isEmbedUser 
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 items-start">
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
        </>
    );
};

export default React.memo(CommonConfigComponents);
