import { memo } from 'react';
import AdvancedParameters from "./configurationComponent/AdvancedParamenter";
import CommonConfigComponents from "./CommonConfigComponents";
import NonImageModelConfig from "./NonImageModelConfig";
import ConnectedAgentFlowPanel from "./ConnectedAgentFlowPanel";
import { useConfigurationContext } from './ConfigurationContext';

const SetupView = memo(() => {
    const { 
        modelType, 
        params, 
        searchParams, 
        isEmbedUser, 
        showAdvancedParameters,
        apiKeySectionRef,
        promptTextAreaRef,
        bridgeApiKey,
        shouldPromptShow,
        service,
        showDefaultApikeys,
        currentView,
        isPublished,
        isEditor,
    } = useConfigurationContext();
    // Render agent flow panel when view is 'agent-flow'
    if (currentView === 'agent-flow') {
        return <ConnectedAgentFlowPanel />;
    }


    return (
        <>
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
                        showAdvancedParameters={showAdvancedParameters}
                        isPublished={isPublished}
                        isEditor={isEditor}
                    />
                    <AdvancedParameters 
                        params={params} 
                        searchParams={searchParams} 
                        isEmbedUser={isEmbedUser} 
                        showAdvancedParameters={showAdvancedParameters}
                        isPublished={isPublished}
                        className="max-w-md"
                        level={2}
                        isEditor={isEditor}
                    />
                  
                </>
            ) : (
                <NonImageModelConfig />
            )}
        </>
    );
});

SetupView.displayName = 'SetupView';

export default SetupView;
