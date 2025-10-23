import React from 'react';
import BridgeTypeToggle from "./configurationComponent/bridgeTypeToggle";

const ConfigurationHeader = ({ 
    params, 
    searchParams, 
    isEmbedUser, 
    showConfigType 
}) => {
    return (
        <div>
            {((isEmbedUser && showConfigType) || !isEmbedUser) && (
                <BridgeTypeToggle params={params} searchParams={searchParams} />
            )}
        </div>
    );
};

export default React.memo(ConfigurationHeader);
