import { useCustomSelector } from '@/customSelector/customSelector';
import { getAllApikeyAction } from '@/store/action/apiKeyAction';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyInput = ({ params }) => {
    const dispatch = useDispatch();
    const pathName = usePathname();
    const path = pathName?.split('?')[0].split('/');
    const org_id = path[2];
    
    // Dispatch action to fetch API keys
    useEffect(() => {
        dispatch(getAllApikeyAction(org_id));
    }, [dispatch, org_id]);

    // Retrieve necessary state using custom selector
    const { bridge, bridge_apiKey, apikeydata, bridgeApikey_object_id } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
        bridge_apiKey: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.apikey,
        apikeydata: state?.bridgeReducer?.apikeys[org_id] || [],
        bridgeApikey_object_id: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.apikey_object_id,
    }));

    // Memoize filtered API keys
    const filteredApiKeys = useMemo(() => {
        return apikeydata.filter(apiKey => apiKey.service === bridge?.service);
    }, [apikeydata, bridge?.service]);

    // Handle selection change
    const handleDropdownChange = useCallback((e) => {
        const selectedApiKeyId = e.target.value;
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { apikey_object_id: selectedApiKeyId } }));
    }, [dispatch, params.id]);

    
    const selectedValue = useMemo(() => {
        const currentApiKey = apikeydata.find(apiKey => apiKey._id === bridgeApikey_object_id);
        return currentApiKey ? currentApiKey._id : bridge_apiKey || '';
    }, [apikeydata, bridge_apiKey, bridgeApikey_object_id]);

    return (
        <label className="form-control max-w-xs text-base-content">
            <div className="label">
                <span className="label-text">Service's API Key</span>
            </div>
            <div>
                <select
                    className="select select-bordered w-full"
                    onChange={handleDropdownChange}
                    value={selectedValue}
                >
                    <option value="">Select a Service</option>

                    {/* Display bridge_apiKey if it is not in the filtered API keys */}
                    {!bridgeApikey_object_id && bridge_apiKey && !apikeydata.some(apiKey => apiKey._id === bridge_apiKey) && (
                        <option value={bridge_apiKey}>
                            {bridge_apiKey}
                        </option>
                    )}
                    {filteredApiKeys.length > 0 ? (
                        filteredApiKeys.map(apiKey => (
                            <option key={apiKey._id} value={apiKey._id}>
                                {apiKey.name}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>
                            No API keys available for this service
                        </option>
                    )}
                </select>
            </div>
        </label>
    );
};

export default ApiKeyInput;
