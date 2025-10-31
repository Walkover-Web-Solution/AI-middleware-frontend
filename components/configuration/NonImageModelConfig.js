import { memo } from 'react';
import InputSection from "./InputSection";
import ToolsSection from "./ToolsSection";
import CommonConfigComponents from "./CommonConfigComponents";
import AdvancedSection from "./AdvancedSection";
import ChatbotConfigSection from "./ChatbotConfigSection";
import { useConfigurationContext } from './ConfigurationContext';

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
        isEmbedUser 
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
            />
            <ChatbotConfigSection />
            <AdvancedSection />
        </>
    );
});

NonImageModelConfig.displayName = 'NonImageModelConfig';

export default NonImageModelConfig;
