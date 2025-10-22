import { memo } from 'react';
import AddVariable from "../addVariable";
import AdvancedParameters from "./configurationComponent/advancedParamenter";
import AdvancedConfiguration from "./configurationComponent/advancedConfiguration";
import GptMemory from "./configurationComponent/gptmemory";
import { useConfigurationContext } from './ConfigurationContext';

const AdvancedSection = memo(() => {
    const { 
        params, 
        searchParams, 
        isEmbedUser, 
        hideAdvancedParameters, 
        hideAdvancedConfigurations, 
        bridgeType, 
        modelType 
    } = useConfigurationContext();

    return (
        <>
            <AddVariable params={params} searchParams={searchParams} />
            <AdvancedParameters
                params={params}
                searchParams={searchParams}
                isEmbedUser={isEmbedUser}
                hideAdvancedParameters={hideAdvancedParameters}
            />
            {((isEmbedUser && !hideAdvancedConfigurations) || !isEmbedUser) && (
                <AdvancedConfiguration
                    params={params}
                    searchParams={searchParams}
                    bridgeType={bridgeType}
                    modelType={modelType}
                />
            )}
            <GptMemory params={params} searchParams={searchParams} />
        </>
    );
});

AdvancedSection.displayName = 'AdvancedSection';

export default AdvancedSection;
