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
        hideAdvancedParameters 
    } = useConfigurationContext();

    return (
        <>
            <InputSection />
            <ToolsSection />
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
            />
            <AdvancedParameters
                params={params}
                searchParams={searchParams}
                isEmbedUser={isEmbedUser}
                hideAdvancedParameters={hideAdvancedParameters}
                level={2}
            />
  
            <GptMemory params={params} searchParams={searchParams} />
            <ChatbotConfigSection />
            <ConfigurationSettingsAccordion />
        </>
    );
});

NonImageModelConfig.displayName = 'NonImageModelConfig';

export default NonImageModelConfig;
