import { memo } from 'react';
import InputSection from "./InputSection";
import ToolsSection from "./ToolsSection";
import CommonConfigComponents from "./CommonConfigComponents";
import ChatbotConfigSection from "./ChatbotConfigSection";
import { useConfigurationContext } from './ConfigurationContext';
import AdvancedParameters from './configurationComponent/AdvancedParamenter';
import GptMemory from './configurationComponent/Gptmemory';
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
        isPublished,
        isEditor
    } = useConfigurationContext();

    return (
        <>
            <InputSection isPublished={isPublished} isEditor={isEditor} />
            <ToolsSection isPublished={isPublished} isEditor={isEditor} />
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
                isEditor={isEditor}
            />
            <AdvancedParameters
                params={params}
                searchParams={searchParams}
                isEmbedUser={isEmbedUser}
                hideAdvancedParameters={hideAdvancedParameters}
                level={2}
                className="max-w-md"
                isPublished={isPublished}
                isEditor={isEditor}
            />

            <div className="flex gap-4 mt-2 flex-col w-full max-w-md">
            <GptMemory params={params} searchParams={searchParams} isPublished={isPublished} isEditor={isEditor} />
            <ChatbotConfigSection isPublished={isPublished} isEditor={isEditor} />
            <ConfigurationSettingsAccordion isPublished={isPublished} isEditor={isEditor} />
            </div>
        </>
    );
});

NonImageModelConfig.displayName = 'NonImageModelConfig';

export default NonImageModelConfig;
