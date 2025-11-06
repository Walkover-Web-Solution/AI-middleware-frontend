import { memo } from 'react';
import TriggersList from "./configurationComponent/TriggersList";
import AdvancedParameters from "./configurationComponent/advancedParamenter";
import ConfigurationSettingsAccordion from "./configurationComponent/ConfigurationSettingsAccordion";
import CommonConfigComponents from "./CommonConfigComponents";
import NonImageModelConfig from "./NonImageModelConfig";
import { useConfigurationContext } from './ConfigurationContext';

const SetupView = memo(() => {
    const { 
        bridgeType, 
        modelType, 
        params, 
        searchParams, 
        isEmbedUser, 
        hideAdvancedParameters,
        apiKeySectionRef,
        promptTextAreaRef,
        bridgeApiKey,
        shouldPromptShow,
        service,
        showDefaultApikeys
    } = useConfigurationContext();

    return (
        <>
            {bridgeType === 'trigger' && !isEmbedUser && (
                <TriggersList params={params} />
            )}
            {modelType === "image" ? (
                <>
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
                    <ConfigurationSettingsAccordion />
                </>
            ) : (
                <NonImageModelConfig />
            )}
        </>
    );
});

SetupView.displayName = 'SetupView';

export default SetupView;
