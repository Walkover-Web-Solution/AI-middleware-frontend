import { memo } from 'react';
import AddVariable from "../addVariable";
import AdvancedConfiguration from "./configurationComponent/advancedConfiguration";
import { useConfigurationContext } from './ConfigurationContext';

const AdvancedSection = memo(() => {
    const { 
        params, 
        searchParams, 
        isEmbedUser, 
        hideAdvancedConfigurations, 
        bridgeType, 
        modelType 
    } = useConfigurationContext();

    return (
        <>
            <AddVariable params={params} searchParams={searchParams} />
            {((isEmbedUser && !hideAdvancedConfigurations) || !isEmbedUser) && (
                <AdvancedConfiguration
                    params={params}
                    searchParams={searchParams}
                    bridgeType={bridgeType}
                    modelType={modelType}
                />
            )}
        </>
    );
});

AdvancedSection.displayName = 'AdvancedSection';

export default AdvancedSection;
