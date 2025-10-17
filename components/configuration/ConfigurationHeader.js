import React from 'react';
import BridgeNameInput from "./configurationComponent/bridgeNameInput";
import VersionDescriptionInput from "./configurationComponent/VersionDescriptionInput";
import BridgeTypeToggle from "./configurationComponent/bridgeTypeToggle";
import BridgeVersionDropdown from "./configurationComponent/bridgeVersionDropdown";

const ConfigurationHeader = ({ 
    params, 
    searchParams, 
    isEmbedUser, 
    showConfigType 
}) => {
    return (
        <div>
            <BridgeNameInput params={params} searchParams={searchParams} />
            <VersionDescriptionInput params={params} searchParams={searchParams} />
            {((isEmbedUser && showConfigType) || !isEmbedUser) && (
                <BridgeTypeToggle params={params} searchParams={searchParams} />
            )}
        </div>
    );
};

export default React.memo(ConfigurationHeader);
