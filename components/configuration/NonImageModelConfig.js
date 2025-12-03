import { memo } from 'react';
import InputSection from "./InputSection";
import ToolsSection from "./ToolsSection";
import CommonConfigComponents from "./CommonConfigComponents";
import ChatbotConfigSection from "./ChatbotConfigSection";
import { useConfigurationContext } from './ConfigurationContext';
import AdvancedParameters from './configurationComponent/advancedParamenter';
import GptMemory from './configurationComponent/gptmemory';
import ConfigurationSettingsAccordion from './configurationComponent/ConfigurationSettingsAccordion';

const NonImageModelConfig = memo(() => {
    const { 
        params, 
        searchParams, 
        apiKeySectionRef, 
        promptTextAreaRef, 
        bridgeApiKey, 
        shouldPromptShow, 
        service, 
        showDefaultApikeys, 
        isEmbedUser,
        hideAdvancedParameters,
        isPublished
    } = useConfigurationContext();

    return (
        <>
            <InputSection isPublished={isPublished} />
            <ToolsSection isPublished={isPublished} />
            <CommonConfigComponents
                params={params}
                searchParams={searchParams}
                apiKeySectionRef={apiKeySectionRef}
                promptTextAreaRef={promptTextAreaRef}
                bridgeApiKey={bridgeApiKey}
                shouldPromptShow={shouldPromptShow}
                service={service}
                showDefaultApikeys={showDefaultApikeys}
                isEmbedUser={isEmbedUser}
                hideAdvancedParameters={hideAdvancedParameters}
                isPublished={isPublished}
            />
            <AdvancedParameters
                params={params}
                searchParams={searchParams}
                isEmbedUser={isEmbedUser}
                hideAdvancedParameters={hideAdvancedParameters}
                level={2}
                className="max-w-md"
                isPublished={isPublished}
            />

            <div className="flex gap-4 mt-2 flex-col w-full max-w-md">
            <GptMemory params={params} searchParams={searchParams} isPublished={isPublished} />
            <ChatbotConfigSection isPublished={isPublished} />
            <ConfigurationSettingsAccordion isPublished={isPublished} />
            </div>
        </>
    );
});

NonImageModelConfig.displayName = 'NonImageModelConfig';

export default NonImageModelConfig;
