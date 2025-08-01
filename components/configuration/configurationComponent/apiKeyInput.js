import ApiKeyModal from '@/components/modals/ApiKeyModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useGetAllApiKeyQuery } from '@/store/services/apiKeyApi';
import { useGetBridgeVersionQuery, useUpdateBridgeVersionMutation } from '@/store/services/bridgeApi';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal } from '@/utils/utility';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyInput = ({ params, apiKeySectionRef }) => {
    const dispatch = useDispatch();

    const { bridge_apiKey } = useCustomSelector((state) => {
        const bridgeMap = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version] || {};
        return {
            bridge_apiKey: bridgeMap?.apikey,
        };
    });
    console.log(bridge_apiKey,'bridge_apiKey')
    const {data:{bridge}={}}=useGetBridgeVersionQuery(params.version)
    const currentService=bridge?.service==='openai_response'?'openai':bridge?.service
    const bridgeApikey_object_id=bridge?.apikey_object_id
    console.log(bridge,'versdlkjfdslkfj')
    const {data:apikeyResponse}=useGetAllApiKeyQuery(params.org_id,{
      skip:!params.org_id
    })
    // Extract result array from response
    const apikeydata = apikeyResponse?.result || []
    const [updateBridgeVersion]=useUpdateBridgeVersionMutation();
  console.log(apikeydata,'apikeydatasdfsdf')
    // Memoize filtered API keys
    const filteredApiKeys = useMemo(() => {
        return apikeydata.filter(apiKey =>
            apiKey?.service === currentService
        ) 
    }, [apikeydata, currentService]);
   console.log(filteredApiKeys,'filteredApiKeys')
    const handleDropdownChange = useCallback((e) => {
        const selectedApiKeyId = e.target.value;
        if (selectedApiKeyId === 'add_new') {
            openModal(MODAL_TYPE.API_KEY_MODAL);
        } else {
            const service = bridge?.service === 'openai_response' ? 'openai' : bridge?.service;
            const updated = { [service]: selectedApiKeyId };
            updateBridgeVersion({ bridgeId: params?.id, versionId: params?.version, dataToSend: { apikey_object_id: updated } });
        }
    }, [params.id, params.version, bridge?.service]);

    // Determine the currently selected value
    const selectedValue = useMemo(() => {
        const serviceApiKeyId = typeof bridgeApikey_object_id === 'object'
            ? bridgeApikey_object_id?.[bridge?.service === 'openai_response' ? 'openai' : bridge?.service]
            : bridgeApikey_object_id;
        const currentApiKey = apikeydata.find(apiKey => apiKey?._id === serviceApiKeyId);
        return currentApiKey ? currentApiKey._id : bridge_apiKey || '';
    }, [apikeydata, bridge_apiKey, bridgeApikey_object_id, bridge?.service]);

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };
    const maxChar = 20;

    return (
        <div className="relative form-control max-w-xs text-base-content" ref={apiKeySectionRef}>
            <div className="label">
                <span className="label-text font-medium">Service's API Key</span>
            </div>
            <div className=''>
                <div className='relative'>
                    <select
                        className="select select-bordered select-sm w-full"
                        onChange={handleDropdownChange}
                        maxLength="10"
                        value={selectedValue}
                    >
                        <option value="" disabled>Select API key</option>

                        {/* Display bridge_apiKey if it is not in the filtered API keys */}
                        {!bridgeApikey_object_id && bridge_apiKey && !apikeydata.some(apiKey => apiKey?._id === bridge_apiKey) && (
                            <option
                                maxLength="10"
                                value={bridge_apiKey}>
                                {truncateText(bridge_apiKey, maxChar)}
                            </option>
                        )}
                        {filteredApiKeys.length > 0 ? (
                            filteredApiKeys.map(apiKey => (
                                <option
                                    maxLength="10"
                                    key={apiKey._id} value={apiKey._id}>
                                    {apiKey.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                No API keys available for this service
                            </option>
                        )}
                        <option value="add_new" className="add-new-option">+  Add new API Key </option>
                    </select>
                </div>
            </div>
            <ApiKeyModal params={params} service={currentService} bridgeApikey_object_id={bridgeApikey_object_id} />
        </div>
    );
};

export default ApiKeyInput;